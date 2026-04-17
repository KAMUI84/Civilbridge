import prisma from "../../config/prisma.js";
import { getIO } from "../realtime/socket.js";
import { notify } from "../realtime/notify.js";

function serializeMessage(message) {
  return {
    id: message.id.toString(),
    threadId: message.conversationId.toString(),
    senderId: message.senderId.toString(),
    senderName: message.sender?.fullName ?? null,
    recipientId: message.recipientId.toString(),
    body: message.body,
    status: message.status,
    attachmentUrl: message.attachmentUrl || null,
    attachmentName: message.attachmentName || null,
    attachmentMimeType: message.attachmentMimeType || null,
    attachmentSizeBytes: message.attachmentSizeBytes?.toString?.() || null,
    deliveredAt: message.deliveredAt,
    readAt: message.readAt,
    createdAt: message.createdAt,
  };
}

function serializeThread(thread) {
  return {
    id: thread.id.toString(),
    subject: thread.subject,
    status: thread.status,
    lastMessageAt: thread.lastMessageAt,
    createdAt: thread.createdAt,
    participantOne: thread.participantOne
      ? { id: thread.participantOne.id.toString(), fullName: thread.participantOne.fullName, email: thread.participantOne.email }
      : null,
    participantTwo: thread.participantTwo
      ? { id: thread.participantTwo.id.toString(), fullName: thread.participantTwo.fullName, email: thread.participantTwo.email }
      : null,
    lastMessage: thread.messages?.[0] ? serializeMessage(thread.messages[0]) : null,
  };
}

function emitToThreadAndUsers(threadId, senderId, recipientId, event, payload) {
  try {
    const io = getIO();
    io.to(`thread:${threadId}`).emit(event, payload);
    io.to(`user:${senderId}`).emit(event, payload);
    io.to(`user:${recipientId}`).emit(event, payload);
  } catch {
    // Socket not initialised in tests/import checks
  }
}

function isUserOnline(userId) {
  try {
    const io = getIO();
    return Boolean(io.sockets.adapter.rooms.get(`user:${userId}`)?.size);
  } catch {
    return false;
  }
}

async function emitStatusUpdates(messages, status, timestampField) {
  for (const message of messages) {
    emitToThreadAndUsers(
      message.conversationId.toString(),
      message.senderId.toString(),
      message.recipientId.toString(),
      "message:status",
      {
        messageId: message.id.toString(),
        threadId: message.conversationId.toString(),
        status,
        deliveredAt: timestampField === "deliveredAt" ? message.deliveredAt : message.deliveredAt || null,
        readAt: timestampField === "readAt" ? message.readAt : message.readAt || null,
      },
    );
  }
}

async function markUnreadMessagesAsRead(threadId, userId) {
  const unreadMessages = await prisma.message.findMany({
    where: {
      conversationId: threadId,
      recipientId: userId,
      status: { not: "READ" },
    },
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      recipientId: true,
      deliveredAt: true,
      readAt: true,
    },
  });

  if (!unreadMessages.length) {
    return { unreadMessages, readAt: null };
  }

  const readAt = new Date();
  await prisma.message.updateMany({
    where: { id: { in: unreadMessages.map((message) => message.id) } },
    data: {
      status: "READ",
      deliveredAt: readAt,
      readAt,
    },
  });

  await emitStatusUpdates(
    unreadMessages.map((message) => ({ ...message, deliveredAt: readAt, readAt })),
    "READ",
    "readAt",
  );

  return { unreadMessages, readAt };
}

export async function listThreads(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit ?? "20", 10));
    const skip = (page - 1) * limit;

    const where = {
      OR: [{ participantOneId: userId }, { participantTwoId: userId }],
    };

    const [threads, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastMessageAt: "desc" },
        include: {
          participantOne: { select: { id: true, fullName: true, email: true } },
          participantTwo: { select: { id: true, fullName: true, email: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { sender: { select: { fullName: true } } },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    res.json({
      success: true,
      data: threads.map(serializeThread),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[Messages] listThreads:", err);
    res.status(500).json({ message: "Failed to fetch threads" });
  }
}

export async function createThread(req, res) {
  try {
    const meId = BigInt(req.user.id);
    const { participantId, subject } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: "participantId is required" });
    }

    const otherId = BigInt(participantId);
    if (meId === otherId) {
      return res.status(400).json({ message: "Cannot create a thread with yourself" });
    }

    const other = await prisma.user.findUnique({
      where: { id: otherId },
      select: { id: true, fullName: true },
    });

    if (!other) {
      return res.status(404).json({ message: "Participant not found" });
    }

    const participantOneId = meId < otherId ? meId : otherId;
    const participantTwoId = meId < otherId ? otherId : meId;

    const thread = await prisma.conversation.upsert({
      where: { participantOneId_participantTwoId: { participantOneId, participantTwoId } },
      update: subject ? { subject } : {},
      create: {
        participantOneId,
        participantTwoId,
        createdById: meId,
        subject: subject ?? null,
      },
      include: {
        participantOne: { select: { id: true, fullName: true, email: true } },
        participantTwo: { select: { id: true, fullName: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data: serializeThread(thread) });
  } catch (err) {
    console.error("[Messages] createThread:", err);
    res.status(500).json({ message: "Failed to create thread" });
  }
}

export async function getThreadMessages(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const threadId = BigInt(req.params.threadId);
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit ?? "30", 10));
    const skip = (page - 1) * limit;

    const thread = await prisma.conversation.findFirst({
      where: {
        id: threadId,
        OR: [{ participantOneId: userId }, { participantTwoId: userId }],
      },
    });

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: threadId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { sender: { select: { id: true, fullName: true } } },
      }),
      prisma.message.count({ where: { conversationId: threadId } }),
    ]);

    const { unreadMessages, readAt } = await markUnreadMessagesAsRead(threadId, userId);
    const unreadIds = new Set(unreadMessages.map((message) => message.id.toString()));

    res.json({
      success: true,
      data: messages.map((message) => serializeMessage(
        unreadIds.has(message.id.toString())
          ? { ...message, status: "READ", deliveredAt: readAt, readAt }
          : message,
      )),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[Messages] getThreadMessages:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
}

export async function sendMessage(req, res) {
  try {
    const senderId = BigInt(req.user.id);
    const threadId = BigInt(req.params.threadId);
    const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";
    const file = req.file;

    if (!body && !file) {
      return res.status(400).json({ message: "Message body or attachment is required" });
    }

    const thread = await prisma.conversation.findFirst({
      where: {
        id: threadId,
        OR: [{ participantOneId: senderId }, { participantTwoId: senderId }],
      },
      include: {
        participantOne: { select: { id: true, fullName: true } },
        participantTwo: { select: { id: true, fullName: true } },
      },
    });

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    const recipientId = thread.participantOneId === senderId ? thread.participantTwoId : thread.participantOneId;
    const senderRecord = thread.participantOneId === senderId ? thread.participantOne : thread.participantTwo;
    const deliveredAt = isUserOnline(recipientId.toString()) ? new Date() : null;
    const status = deliveredAt ? "DELIVERED" : "SENT";

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: threadId,
          senderId,
          recipientId,
          body,
          attachmentUrl: file ? `/uploads/${file.filename}` : null,
          attachmentName: file?.originalname || null,
          attachmentMimeType: file?.mimetype || null,
          attachmentSizeBytes: file?.size ? BigInt(file.size) : null,
          status,
          deliveredAt,
        },
        include: { sender: { select: { id: true, fullName: true } } },
      }),
      prisma.conversation.update({
        where: { id: threadId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    const serialized = serializeMessage(message);
    const payload = {
      ...serialized,
      createdAt: message.createdAt.toISOString(),
      deliveredAt: message.deliveredAt?.toISOString?.() || null,
      readAt: message.readAt?.toISOString?.() || null,
    };

    emitToThreadAndUsers(threadId.toString(), senderId.toString(), recipientId.toString(), "message:new", payload);

    if (status === "DELIVERED") {
      emitToThreadAndUsers(threadId.toString(), senderId.toString(), recipientId.toString(), "message:status", {
        messageId: serialized.id,
        threadId: threadId.toString(),
        status,
        deliveredAt: payload.deliveredAt,
        readAt: null,
      });
    }

    await notify({
      userId: recipientId.toString(),
      type: "NEW_MESSAGE",
      title: `New message from ${senderRecord?.fullName ?? "someone"}`,
      body: body || file?.originalname || "Sent an attachment",
      actionUrl: `/dashboard/messages`,
      payloadJson: { threadId: threadId.toString(), senderId: senderId.toString() },
      event: "notification:new",
    });

    res.status(201).json({ success: true, data: serialized });
  } catch (err) {
    console.error("[Messages] sendMessage:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
}

export async function markThreadRead(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const threadId = BigInt(req.params.threadId);

    const thread = await prisma.conversation.findFirst({
      where: {
        id: threadId,
        OR: [{ participantOneId: userId }, { participantTwoId: userId }],
      },
      select: { id: true },
    });

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    const { unreadMessages, readAt } = await markUnreadMessagesAsRead(threadId, userId);

    res.json({
      success: true,
      data: {
        threadId: threadId.toString(),
        updatedCount: unreadMessages.length,
        readAt: readAt?.toISOString?.() || null,
      },
    });
  } catch (err) {
    console.error("[Messages] markThreadRead:", err);
    res.status(500).json({ message: "Failed to update read status" });
  }
}
