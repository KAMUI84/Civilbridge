/**
 * notify() — persist a Notification record and immediately push it
 * to the target user's socket room.
 *
 * Usage (any module):
 *   import { notify } from "../realtime/notify.js";
 *
 *   await notify({
 *     userId:      projectOwnerId,
 *     type:        "ENGINEER_ASSIGNED",
 *     title:       "Engineer assigned to your project",
 *     body:        `${engineer.fullName} has been assigned.`,
 *     actionUrl:   `/projects/${projectId}`,
 *     payloadJson: { projectId, engineerId },
 *     event:       "engineer:assigned",          // optional: custom socket event name
 *     eventPayload: { projectId, engineerName }, // optional: override socket payload
 *   });
 *
 * If the socket server is not yet initialised (e.g. in tests) the emit
 * is silently skipped but the DB record is still saved.
 */

import prisma from "../../config/prisma.js";
import { getIO } from "./socket.js";

/**
 * @param {object} opts
 * @param {string|bigint|number} opts.userId
 * @param {string} opts.type       - Short identifier, e.g. "PLAN_APPROVED"
 * @param {string} opts.title
 * @param {string} opts.body
 * @param {string} [opts.actionUrl]
 * @param {object} [opts.payloadJson]
 * @param {string} [opts.event]         - Socket event name (default: "notification:new")
 * @param {object} [opts.eventPayload]  - Socket payload (default: notification record)
 * @returns {Promise<object>} The created Notification record
 */
export async function notify({
  userId,
  type,
  title,
  body,
  actionUrl = null,
  payloadJson = null,
  event = "notification:new",
  eventPayload = null,
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: BigInt(userId),
      type,
      title,
      body,
      actionUrl,
      payloadJson: payloadJson ?? undefined,
    },
  });

  const socketPayload = eventPayload ?? {
    id:          notification.id.toString(),
    type:        notification.type,
    title:       notification.title,
    body:        notification.body,
    actionUrl:   notification.actionUrl,
    payloadJson: notification.payloadJson,
    createdAt:   notification.createdAt.toISOString(),
  };

  try {
    getIO().to(`user:${userId}`).emit(event, socketPayload);
  } catch {
    // Socket.io not yet initialised — skip emit, notification is already persisted
  }

  return notification;
}
