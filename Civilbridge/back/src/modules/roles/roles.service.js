import prisma from "../../config/prisma.js";
import { ALL_USER_ROLES } from "../../constants/roles.js";

const VALID_ROLES = ALL_USER_ROLES;
const PUBLIC_EXPERT_ROLE_TO_PROVIDER_TYPE = {
  ENGINEER: "ENGINEER",
  ARCHITECT: "ARCHITECT",
  CONTRACTOR: "CONTRACTOR",
  SUPPLIER: "SUPPLIER",
};

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
export async function assignRole(actingUser, targetUserId, newRole, publishExpertNow = false) {
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
    select: { id: true, fullName: true, email: true, role: true, regionId: true, verificationStatus: true },
  });

  if (!target) throw notFound("User not found");

  if (target.role === "SUPER_ADMIN" && actingUser.role !== "SUPER_ADMIN") {
    throw forbidden("Cannot modify a Super Admin user");
  }

  const previousRole = target.role;

  const nextProviderType = PUBLIC_EXPERT_ROLE_TO_PROVIDER_TYPE[newRole];
  const previousProviderType = PUBLIC_EXPERT_ROLE_TO_PROVIDER_TYPE[previousRole];
  const shouldManagePublicExpert = Boolean(nextProviderType);
  const shouldHideExistingExpert = !nextProviderType && Boolean(previousProviderType);
  const providerVerificationStatus = publishExpertNow ? "VERIFIED" : "PENDING";
  const providerVerificationNote = publishExpertNow
    ? "Published from admin role approval flow."
    : "Held from public expert directory until admin publishes.";

  const updated = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: Number(targetUserId) },
      data: {
        role: newRole,
        ...(shouldManagePublicExpert
          ? { verificationStatus: publishExpertNow ? "VERIFIED" : "PENDING" }
          : {}),
      },
      select: { id: true, fullName: true, email: true, role: true, verificationStatus: true, updatedAt: true },
    });

    if (shouldManagePublicExpert) {
      await tx.serviceProvider.upsert({
        where: { userId: BigInt(targetUserId) },
        update: {
          providerType: nextProviderType,
          businessName: target.fullName || target.email || `CivilBridge ${newRole}`,
          regionId: target.regionId ?? undefined,
          verificationStatus: providerVerificationStatus,
          verificationNotes: providerVerificationNote,
          verifiedAt: publishExpertNow ? new Date() : null,
          rejectedAt: null,
        },
        create: {
          userId: BigInt(targetUserId),
          providerType: nextProviderType,
          businessName: target.fullName || target.email || `CivilBridge ${newRole}`,
          regionId: target.regionId ?? null,
          verificationStatus: providerVerificationStatus,
          verificationNotes: providerVerificationNote,
          verifiedAt: publishExpertNow ? new Date() : null,
        },
      });
    } else if (shouldHideExistingExpert) {
      await tx.serviceProvider.updateMany({
        where: { userId: BigInt(targetUserId) },
        data: {
          verificationStatus: "PENDING",
          verificationNotes: "Hidden from public expert directory because the user role changed.",
          verifiedAt: null,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: Number(actingUser.id),
        action: "ROLE_ASSIGN",
        entityType: "USER",
        entityId: BigInt(targetUserId),
        metaJson: {
          targetUserId: Number(targetUserId),
          previousRole,
          newRole,
          publishExpertNow: shouldManagePublicExpert ? Boolean(publishExpertNow) : null,
          assignedBy: actingUser.email || String(actingUser.id),
        },
      },
    });

    return updatedUser;
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
