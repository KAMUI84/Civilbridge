import prisma from "../../config/prisma.js";

// ─── GET /api/notifications ───────────────────────────────────────────────────
/**
 * List notifications for the current user.
 * Supports ?page, ?limit, ?status (UNREAD | READ | ARCHIVED)
 */
export async function listNotifications(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const page   = Math.max(1, parseInt(req.query.page  ?? "1",  10));
    const limit  = Math.min(50, parseInt(req.query.limit ?? "20", 10));
    const skip   = (page - 1) * limit;
    const { status } = req.query;

    const where = {
      userId,
      ...(status ? { status } : {}),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, status: "UNREAD" } }),
    ]);

    res.json({
      success: true,
      data: notifications.map((n) => ({
        ...n,
        id:     n.id.toString(),
        userId: n.userId.toString(),
      })),
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[Notifications] listNotifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
}

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
/**
 * Mark a single notification as READ.
 */
export async function markRead(req, res) {
  try {
    const userId         = BigInt(req.user.id);
    const notificationId = BigInt(req.params.id);

    const existing = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (existing.status === "READ") {
      return res.json({ success: true, message: "Already marked as read" });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data:  { status: "READ", readAt: new Date() },
    });

    res.json({
      success: true,
      data: { ...updated, id: updated.id.toString(), userId: updated.userId.toString() },
    });
  } catch (err) {
    console.error("[Notifications] markRead:", err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
}

// ─── PATCH /api/notifications/read-all ───────────────────────────────────────
/**
 * Mark all UNREAD notifications for the current user as READ.
 */
export async function markAllRead(req, res) {
  try {
    const userId = BigInt(req.user.id);

    const { count } = await prisma.notification.updateMany({
      where: { userId, status: "UNREAD" },
      data:  { status: "READ", readAt: new Date() },
    });

    res.json({ success: true, updated: count });
  } catch (err) {
    console.error("[Notifications] markAllRead:", err);
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
}
