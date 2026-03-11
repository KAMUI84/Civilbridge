import prisma from "../config/prisma.js";

export async function protectOwnership(user, entityId, entity) {
  const userId = BigInt(user.id);
  let record;

  switch (entity) {
    case "listing":
      record = await prisma.listing.findUnique({ where: { id: entityId }, select: { ownerUserId: true } });
      if (!record || record.ownerUserId !== userId && user.role !== "ADMIN") {
        const err = new Error("Not authorized");
        err.status = 403;
        throw err;
      }
      break;
    case "plan":
      record = await prisma.plan.findUnique({ where: { id: entityId }, select: { createdByUserId: true } });
      if (!record || record.createdByUserId !== userId && user.role !== "ADMIN") {
        const err = new Error("Not authorized");
        err.status = 403;
        throw err;
      }
      break;
    case "project":
      record = await prisma.project.findUnique({ where: { id: entityId }, select: { userId: true } });
      if (!record || record.userId !== userId && user.role !== "ADMIN") {
        const err = new Error("Not authorized");
        err.status = 403;
        throw err;
      }
      break;
    default:
      const err = new Error("Invalid entity type");
      err.status = 400;
      throw err;
  }
}
