import prisma from "../../config/prisma.js";
import { ALL_USER_ROLES } from "../../constants/roles.js";

function mapVerificationDocument(upload) {
    if (!upload) {
        return null;
    }

    return {
        id: upload.id.toString(),
        url: upload.url,
        filename: upload.filename,
        mimeType: upload.mimeType || null,
        sizeBytes: upload.sizeBytes ? upload.sizeBytes.toString() : null,
        createdAt: upload.createdAt,
    };
}

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const activeUsers = await prisma.user.count({ where: { isActive: true } });
        const verifiedUsers = await prisma.user.count({ where: { verificationStatus: "VERIFIED" } });
        const pendingUsers = await prisma.user.count({ where: { verificationStatus: "PENDING" } });
        const totalProjects = await prisma.project.count();
        const activeProjects = await prisma.project.count({ where: { status: "active" } });

        // Role breakdown
        const roleBreakdown = await prisma.user.groupBy({
            by: ["role"],
            _count: { id: true },
            orderBy: { _count: { id: "desc" } }
        });

        // Recent activity (last 20 audit logs with user info)
        const recentActivity = await prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
                user: {
                    select: { fullName: true, email: true, role: true }
                }
            }
        });

        // New users in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newUsersThisWeek = await prisma.user.count({
            where: { createdAt: { gte: sevenDaysAgo } }
        });

        res.json({
            success: true,
            stats: {
                total_users: totalUsers,
                active_users: activeUsers,
                verified_users: verifiedUsers,
                pending_verification: pendingUsers,
                total_projects: totalProjects,
                active_projects: activeProjects,
                new_users_this_week: newUsersThisWeek,
                role_breakdown: roleBreakdown.map(r => ({
                    role: r.role,
                    count: r._count.id
                }))
            },
            recent_activity: recentActivity,
        });
    } catch (err) {
        console.error("Admin stats err:", err);
        res.status(500).json({ message: "Failed to fetch admin stats" });
    }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
export const getUsers = async (req, res) => {
    try {
        const { search, role, status, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        
        const where = {};

        if (search) {
            where.OR = [
                { fullName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } }
            ];
        }

        if (role && role !== "all") {
            where.role = role;
        }

        if (status && status !== "all") {
            where.verificationStatus = status;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
                verificationStatus: true,
                isActive: true,
                createdAt: true,
                lastLoginAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: Number(limit),
            skip: offset
        });

        const total = await prisma.user.count({ where });

        res.json({
            success: true,
            users,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (err) {
        console.error("Get users err:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

// ─── PUT /api/admin/users/:id/role ────────────────────────────────────────────
export const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = BigInt(req.params.id);
        if (!role) return res.status(400).json({ message: "Role is required" });

        if (!ALL_USER_ROLES.includes(role)) {
            return res.status(400).json({ message: `Invalid role. Must be one of: ${ALL_USER_ROLES.join(", ")}` });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id ?? null,
                action: "ROLE_CHANGE",
                entityType: "USERS",
                entityId: userId,
                metaJson: { new_role: role }
            }
        });

        res.json({ success: true, message: `User role updated to ${role}. Takes effect on next login.` });
    } catch (err) {
        console.error("Change role err:", err);
        res.status(500).json({ message: "Failed to change user role" });
    }
};


// ─── PUT /api/admin/users/:id/activate ───────────────────────────────────────
export const toggleUserActive = async (req, res) => {
    try {
        const { is_active } = req.body;
        await prisma.user.update({
            where: { id: BigInt(req.params.id) },
            data: { isActive: Boolean(is_active) }
        });
        res.json({ success: true, message: `User ${is_active ? "activated" : "deactivated"}` });
    } catch (err) {
        console.error("Toggle user active err:", err);
        res.status(500).json({ message: "Failed to update user status" });
    }
};

// ─── GET /api/admin/verification-queue ───────────────────────────────────────
// Returns users with PENDING verification status (until full expert profile system is built)
export const getVerificationQueue = async (req, res) => {
    try {
        const queue = await prisma.serviceProvider.findMany({
            where: { verificationStatus: "PENDING" },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        role: true,
                        verificationStatus: true,
                        createdAt: true,
                        profile: {
                            select: {
                                id: true,
                                profession: true,
                                companyName: true,
                                bio: true,
                                avatarUrl: true,
                                licenseNumber: true,
                                signatureUrl: true,
                            }
                        }
                    },
                },
                region: { select: { id: true, name: true } },
                _count: { select: { reviews: true } },
            },
            orderBy: { createdAt: "asc" }
        });

        const profileIds = queue
            .map((provider) => provider.user?.profile?.id)
            .filter(Boolean);

        const verificationUploads = profileIds.length
            ? await prisma.upload.findMany({
                where: {
                    entityType: "PROFILE",
                    entityId: { in: profileIds },
                    filename: { startsWith: "verificationDoc-" },
                },
                orderBy: [
                    { entityId: "asc" },
                    { createdAt: "desc" },
                ],
            })
            : [];

        const uploadsByProfileId = new Map();
        for (const upload of verificationUploads) {
            const key = upload.entityId?.toString();
            if (!key || uploadsByProfileId.has(key)) continue;
            uploadsByProfileId.set(key, upload);
        }

        const enrichedQueue = queue.map((provider) => {
            const profileId = provider.user?.profile?.id?.toString();
            return {
                ...provider,
                verificationDocument: profileId ? mapVerificationDocument(uploadsByProfileId.get(profileId)) : null,
            };
        });

        res.json({ success: true, queue: enrichedQueue, total: enrichedQueue.length });
    } catch (err) {
        console.error("Verification queue err:", err);
        res.status(500).json({ message: "Failed to fetch verification queue" });
    }
};

// ─── POST /api/admin/verification/:id/approve ────────────────────────────────
export const approveVerification = async (req, res) => {
    try {
        const userId = BigInt(req.params.id);
        const notes = req.body?.notes || null;
        const provider = await prisma.serviceProvider.findUnique({
            where: { userId: BigInt(userId) },
            select: { id: true },
        });

        await prisma.user.update({
            where: { id: userId },
            data: { verificationStatus: "VERIFIED" }
        });

        if (provider) {
            await prisma.serviceProvider.update({
                where: { id: provider.id },
                data: {
                    verificationStatus: "VERIFIED",
                    verificationNotes: notes,
                    verifiedAt: new Date(),
                    rejectedAt: null,
                },
            });
        }

        await prisma.auditLog.create({
            data: {
                userId: req.user.id ?? null,
                action: "VERIFY_USER",
                entityType: "USERS",
                entityId: userId,
                metaJson: { approvedBy: req.user.id, notes }
            }
        });

        res.json({ success: true, message: "User verified successfully" });
    } catch (err) {
        console.error("Approve verification err:", err);
        res.status(500).json({ message: "Failed to approve verification" });
    }
};

// ─── POST /api/admin/verification/:id/reject ─────────────────────────────────
export const rejectVerification = async (req, res) => {
    try {
        const { reason } = req.body;
        const userId = BigInt(req.params.id);
        const provider = await prisma.serviceProvider.findUnique({
            where: { userId: BigInt(userId) },
            select: { id: true },
        });

        await prisma.user.update({
            where: { id: userId },
            data: { verificationStatus: "REJECTED" }
        });

        if (provider) {
            await prisma.serviceProvider.update({
                where: { id: provider.id },
                data: {
                    verificationStatus: "REJECTED",
                    verificationNotes: reason || "No reason given",
                    rejectedAt: new Date(),
                },
            });
        }

        await prisma.auditLog.create({
            data: {
                userId: req.user.id ?? null,
                action: "REJECT_USER",
                entityType: "USERS",
                entityId: userId,
                metaJson: { reason: reason || "No reason given", rejectedBy: req.user.id }
            }
        });

        res.json({ success: true, message: "User verification rejected" });
    } catch (err) {
        console.error("Reject verification err:", err);
        res.status(500).json({ message: "Failed to reject verification" });
    }
};

// ─── Moderate plans/listings ──────────────────────────────────────────────────
// NOTE: Plan and Listing models are not yet in the current Prisma schema.
// These stubs return 501 until those models are added.

export const getAdminPlans = async (_req, res) => {
    res.status(501).json({
        success: false,
        message: "Plan management not yet implemented. Add the Plan model to prisma/schema.prisma first.",
        todo: "Add Plan model to schema, run prisma migrate, then update this controller."
    });
};

export const moderatePlan = async (_req, res) => {
    res.status(501).json({
        success: false,
        message: "Plan moderation not yet implemented.",
    });
};

export const getAdminListings = async (_req, res) => {
    res.status(501).json({
        success: false,
        message: "Listing management not yet implemented. Add the Listing model to prisma/schema.prisma first.",
        todo: "Add Listing model to schema, run prisma migrate, then update this controller."
    });
};

export const moderateListing = async (_req, res) => {
    res.status(501).json({
        success: false,
        message: "Listing moderation not yet implemented.",
    });
};
