import prisma from "../config/prisma.js";

/**
 * Throw a 403 if the requesting user does not own the given entity.
 *
 * SUPER_ADMIN bypasses all ownership checks.
 * ADMIN bypasses project ownership checks.
 *
 * Supported entity types:
 *   "project"  — checks Project.creatorId
 *
 * @param {object} user       - req.user (id, role)
 * @param {number|string} entityId
 * @param {string} entity     - "project"
 */
export async function protectOwnership(user, entityId, entity, options = {}) {
  // SUPER_ADMIN can access any resource without restriction.
  if (user.role === "SUPER_ADMIN") return;

  const id = Number(entityId);
  const userId = Number(user.id);
  const allowMembers = options.allowMembers === true;

  switch (entity) {
    case "project": {
      // ADMIN may view or modify any project.
      if (user.role === "ADMIN") return;

      const record = await prisma.project.findUnique({
        where:  { id },
        select: {
          userId: true,
          members: allowMembers ? { select: { userId: true } } : false,
        },
      });

      if (!record) {
        const err = new Error("Project not found");
        err.status = 404;
        throw err;
      }

      const isOwner = Number(record.userId) === userId;
      const isMember = allowMembers
        ? record.members.some((member) => Number(member.userId) === userId)
        : false;

      if (!isOwner && !isMember) {
        const err = new Error("Not authorized: you do not own this project");
        err.status = 403;
        throw err;
      }
      break;
    }

    default: {
      const err = new Error(`Unknown entity type: "${entity}"`);
      err.status = 400;
      throw err;
    }
  }
}
