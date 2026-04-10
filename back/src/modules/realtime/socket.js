/**
 * Socket.io server — CivilBridge real-time layer
 *
 * ═══════════════════════════════════════════════════════════════════════
 * SOCKET EVENT CATALOGUE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ── CLIENT → SERVER ─────────────────────────────────────────────────────
 *
 * "thread:join"
 *   Join a message-thread room so new messages are pushed to the client.
 *   payload: { threadId: string }
 *
 * "thread:leave"
 *   Leave a message-thread room.
 *   payload: { threadId: string }
 *
 * "typing:start"
 *   Broadcast "user is typing" to everyone else in the thread room.
 *   payload: { threadId: string }
 *
 * "typing:stop"
 *   Broadcast "user stopped typing".
 *   payload: { threadId: string }
 *
 * ── SERVER → CLIENT ─────────────────────────────────────────────────────
 *
 * "notification:new"
 *   Fired whenever a persisted notification is created for the user.
 *   Sent to room  user:<userId>
 *   payload: {
 *     id:          string,        // BigInt serialised as string
 *     type:        string,        // e.g. "ENGINEER_ASSIGNED"
 *     title:       string,
 *     body:        string,
 *     actionUrl:   string | null,
 *     payloadJson: object | null,
 *     createdAt:   string         // ISO timestamp
 *   }
 *
 * "message:new"
 *   Fired when a message is sent in a thread.
 *   Sent to room  user:<recipientId>  AND  thread:<threadId>
 *   payload: {
 *     id:         string,
 *     threadId:   string,
 *     senderId:   string,
 *     senderName: string,
 *     body:       string,
 *     createdAt:  string
 *   }
 *
 * "engineer:assigned"
 *   Fired when an engineer is assigned to a project.
 *   Sent to room  user:<clientId>  AND  user:<engineerId>
 *   payload: {
 *     projectId:    string,
 *     projectName:  string,
 *     engineerId:   string,
 *     engineerName: string,
 *     assignedAt:   string
 *   }
 *
 * "plan:approved"
 *   Fired when a plan is approved by an admin/engineer.
 *   Sent to room  user:<ownerId>
 *   payload: {
 *     projectId:  string,
 *     planId:     string,
 *     approvedBy: string,
 *     approvedAt: string,
 *     message:    string | null
 *   }
 *
 * "plan:rejected"
 *   Fired when a plan is rejected.
 *   Sent to room  user:<ownerId>
 *   payload: {
 *     projectId:  string,
 *     planId:     string,
 *     rejectedBy: string,
 *     rejectedAt: string,
 *     reason:     string
 *   }
 *
 * "payment:confirmed"
 *   Fired when a payment transaction reaches CONFIRMED status.
 *   Sent to room  user:<userId>
 *   payload: {
 *     transactionId: string,
 *     amount:        number,
 *     currency:      string,
 *     provider:      string,
 *     serviceType:   string,
 *     confirmedAt:   string
 *   }
 *
 * "typing:start"  (server re-broadcast)
 *   Forwarded to other members of thread:<threadId>
 *   payload: { threadId: string, userId: string }
 *
 * "typing:stop"   (server re-broadcast)
 *   payload: { threadId: string, userId: string }
 * ═══════════════════════════════════════════════════════════════════════
 */

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma.js";

/** @type {import("socket.io").Server | null} */
let io = null;

const CORS_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5179",
  ...(process.env.ALLOWED_ORIGINS ?? process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  process.env.FRONTEND_URL,
].filter(Boolean);

function emitMessageStatusUpdate(message) {
  if (!io) return;

  const payload = {
    messageId: message.id.toString(),
    threadId: message.conversationId.toString(),
    status: message.status,
    deliveredAt: message.deliveredAt?.toISOString?.() || null,
    readAt: message.readAt?.toISOString?.() || null,
  };

  io.to(`thread:${message.conversationId.toString()}`).emit("message:status", payload);
  io.to(`user:${message.senderId.toString()}`).emit("message:status", payload);
  io.to(`user:${message.recipientId.toString()}`).emit("message:status", payload);
}

async function userCanAccessThread(userId, threadId) {
  if (!threadId) return false;

  const thread = await prisma.conversation.findFirst({
    where: {
      id: BigInt(threadId),
      OR: [{ participantOneId: BigInt(userId) }, { participantTwoId: BigInt(userId) }],
    },
    select: { id: true },
  });

  return Boolean(thread);
}

async function deliverPendingMessages(userId) {
  const deliveredAt = new Date();
  const pendingMessages = await prisma.message.findMany({
    where: {
      recipientId: BigInt(userId),
      status: "SENT",
    },
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      recipientId: true,
      status: true,
      deliveredAt: true,
      readAt: true,
    },
  });

  if (!pendingMessages.length) return;

  await prisma.message.updateMany({
    where: { id: { in: pendingMessages.map((message) => message.id) } },
    data: {
      status: "DELIVERED",
      deliveredAt,
    },
  });

  pendingMessages.forEach((message) =>
    emitMessageStatusUpdate({
      ...message,
      status: "DELIVERED",
      deliveredAt,
    }),
  );
}

/**
 * Parse the JWT token from the socket handshake.
 * Accepts:
 *   - socket.handshake.auth.token  (preferred — frontend sends in auth object)
 *   - cookie header  "token=<value>"
 */
function extractToken(socket) {
  if (socket.handshake.auth?.token) return socket.handshake.auth.token;

  const cookieHeader = socket.handshake.headers?.cookie ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Initialise Socket.io and attach it to the given HTTP server.
 * Call this once from server.js before httpServer.listen().
 *
 * @param {import("http").Server} httpServer
 * @returns {import("socket.io").Server}
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGINS,
      credentials: true,
    },
    // Allow both websocket and long-polling transports
    transports: ["websocket", "polling"],
  });

  // ── JWT authentication middleware ─────────────────────────────────────
  io.use((socket, next) => {
    const token = extractToken(socket);
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role, email, ... }
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  // ── Connection handler ────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const userId = String(socket.user.id);

    // Every authenticated user joins their personal room
    socket.join(`user:${userId}`);
    console.log(`[Socket] user:${userId} connected (socket ${socket.id})`);
    deliverPendingMessages(userId).catch((error) => {
      console.error(`[Socket] failed to mark pending deliveries for user:${userId}`, error);
    });

    // ── Thread room management ──────────────────────────────────────────
    socket.on("thread:join", async ({ threadId } = {}) => {
      if (!threadId) return;
      const authorized = await userCanAccessThread(userId, threadId).catch(() => false);
      if (!authorized) return;
      socket.join(`thread:${threadId}`);
    });

    socket.on("thread:leave", async ({ threadId } = {}) => {
      if (!threadId) return;
      const authorized = await userCanAccessThread(userId, threadId).catch(() => false);
      if (!authorized) return;
      socket.leave(`thread:${threadId}`);
    });

    // ── Typing indicators ───────────────────────────────────────────────
    socket.on("typing:start", async ({ threadId } = {}) => {
      if (!threadId) return;
      const authorized = await userCanAccessThread(userId, threadId).catch(() => false);
      if (!authorized) return;
      socket.to(`thread:${threadId}`).emit("typing:start", { threadId, userId });
    });

    socket.on("typing:stop", async ({ threadId } = {}) => {
      if (!threadId) return;
      const authorized = await userCanAccessThread(userId, threadId).catch(() => false);
      if (!authorized) return;
      socket.to(`thread:${threadId}`).emit("typing:stop", { threadId, userId });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] user:${userId} disconnected — ${reason}`);
    });
  });

  return io;
}

/**
 * Return the active Socket.io server instance.
 * Import this from any module that needs to emit events.
 *
 * @returns {import("socket.io").Server}
 */
export function getIO() {
  if (!io) throw new Error("[Socket] Socket.io has not been initialised yet");
  return io;
}
