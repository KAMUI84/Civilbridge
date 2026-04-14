import prisma from "../../config/prisma.js";
import { ALL_USER_ROLES } from "../../constants/roles.js";

const VALID_ROLES = ALL_USER_ROLES;

function forbidden(msg) {
  return Object.assign(new Error(msg), { status: 403 });
}
function notFound(msg) {
  return Object.assign(new Error(msg), { status: 404 });
}
function badRequest(msg) {
  return Object.assign(new Error(msg), { status: 400 });
}

/**
 * Assign a new role to a target user.
 *
 * Guards enforced here (in addition to route-level middleware):
 *  - Role must be a recognised value.
 *  - An admin cannot change their own role.
 *  - Only SUPER_ADMIN can assign the SUPER_ADMIN role.
 *  - Only SUPER_ADMIN can modify a user who already has SUPER_ADMIN role.
 */
export async function assignRole(actingUser, targetUserId, newRole) {
  if (!VALID_ROLES.includes(newRole)) {
    throw badRequest(`Invalid role. Allowed values: ${VALID_ROLES.join(", ")}`);
  }

  if (Number(actingUser.id) === Number(targetUserId)) {
    throw forbidden("Administrators cannot change their own role");
  }

  if (newRole === "SUPER_ADMIN" && actingUser.role !== "SUPER_ADMIN") {
    throw forbidden("Only Super Admin can assign the Super Admin role");
  }

  const target = await prisma.user.findUnique({
    where: { id: Number(targetUserId) },
    select: { id: true, fullName: true, email: true, role: true },
  });

  if (!target) throw notFound("User not found");

  if (target.role === "SUPER_ADMIN" && actingUser.role !== "SUPER_ADMIN") {
    throw forbidden("Cannot modify a Super Admin user");
  }

  const previousRole = target.role;

  const updated = await prisma.user.update({
    where: { id: Number(targetUserId) },
    data:  { role: newRole },
    select: { id: true, fullName: true, email: true, role: true, updatedAt: true },
  });

  await prisma.auditLog.create({
    data: {
      userId:   Number(actingUser.id),
      action:   "ROLE_ASSIGN",
      entityType: "USER",
      entityId: BigInt(targetUserId),
      metaJson: {
        targetUserId: Number(targetUserId),
        previousRole,
        newRole,
        assignedBy: actingUser.email || String(actingUser.id),
      },
    },
  });

  return { user: updated, previousRole };
}

/**
 * Fetch the current role of a user by id.
 */
export async function getUserRole(userId) {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { id: true, fullName: true, role: true },
  });

  if (!user) throw notFound("User not found");
  return user;
}
