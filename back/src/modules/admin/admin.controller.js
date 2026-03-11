import prisma from "../../config/prisma.js";

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
export const getAdminStats = async (req, res) => {
    try {
        const users = await prisma.user.count();
        const verifiedPros = await prisma.serviceProvider.count({
            where: { verificationStatus: "VERIFIED" }
        });
        const pendingPros = await prisma.serviceProvider.count({
            where: { verificationStatus: "PENDING" }
        });
        const plans = await prisma.plan.count();
        const listings = await prisma.listing.count();
        const projects = await prisma.project.count();
        
        const recentActivity = await prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 20
        });

        res.json({
            success: true,
            stats: {
                total_users: users,
                verified_professionals: verifiedPros,
                pending_verification: pendingPros,
                total_plans: plans,
                total_listings: listings,
                total_projects: projects,
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
        const { search, role, status, page = 1, limit = 50 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        
        const where = {};

        if (search) {
            where.OR = [
                { fullName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } }
            ];
        }

        if (role) {
            where.role = role;
        }

        if (status) {
            where.verificationStatus = status;
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                region: true
            },
            orderBy: { createdAt: "desc" },
            take: Number(limit),
            skip: offset
        });

        const total = await prisma.user.count({ where });

        res.json({ success: true, users, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error("Get users err:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

// ─── PUT /api/admin/users/:id/role ────────────────────────────────────────────
export const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) return res.status(400).json({ message: "Role is required" });

        await prisma.user.update({
            where: { id: BigInt(req.params.id) },
            data: { role: role }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: "ROLE_CHANGE",
                entityType: "USERS",
                entityId: BigInt(req.params.id),
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
export const getVerificationQueue = async (req, res) => {
    try {
        const queue = await prisma.serviceProvider.findMany({
            where: { verificationStatus: "PENDING" },
            include: {
                user: true
            },
            orderBy: { createdAt: "asc" }
        });
        
        res.json({ success: true, queue });
    } catch (err) {
        console.error("Verification queue err:", err);
        res.status(500).json({ message: "Failed to fetch verification queue" });
    }
};

// ─── POST /api/admin/verification/:id/approve ────────────────────────────────
export const approveVerification = async (req, res) => {
    try {
        const sp = await prisma.serviceProvider.update({
            where: { id: BigInt(req.params.id) },
            data: { verificationStatus: "VERIFIED" }
        });

        await prisma.user.update({
            where: { id: sp.userId },
            data: { verificationStatus: "VERIFIED", role: sp.providerType } // Optionally update their role based on type
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: "VERIFY_EXPERT",
                entityType: "EXPERT_PROFILES",
                entityId: BigInt(req.params.id)
            }
        });

        res.json({ success: true, message: "Expert verified successfully" });
    } catch (err) {
        console.error("Approve varification err:", err);
        res.status(500).json({ message: "Failed to approve verification" });
    }
};

// ─── POST /api/admin/verification/:id/reject ─────────────────────────────────
export const rejectVerification = async (req, res) => {
    try {
        const { reason } = req.body;
        const sp = await prisma.serviceProvider.update({
            where: { id: BigInt(req.params.id) },
            data: { verificationStatus: "REJECTED" }
        });

        await prisma.user.update({
            where: { id: sp.userId },
            data: { verificationStatus: "UNVERIFIED" }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: "REJECT_EXPERT",
                entityType: "EXPERT_PROFILES",
                entityId: BigInt(req.params.id),
                metaJson: { reason }
            }
        });

        res.json({ success: true, message: "Verification rejected" });
    } catch (err) {
        console.error("Reject varification err:", err);
        res.status(500).json({ message: "Failed to reject verification" });
    }
};

// ─── Moderate plans/listings ──────────────────────────────────────────────────
export const getAdminPlans = async (req, res) => {
    try {
        const plans = await prisma.plan.findMany({
            include: { author: { select: { fullName: true, email: true } } },
            orderBy: { createdAt: "desc" }
        });
        res.json({ success: true, plans });
    } catch (err) {
        console.error("Get admin plans err:", err);
        res.status(500).json({ message: "Failed to fetch plans" });
    }
};

export const moderatePlan = async (req, res) => {
    try {
        const { action } = req.body; 
        
        // Prisma Plan Model has 'isVerified' boolean
        await prisma.plan.update({
            where: { id: BigInt(req.params.id) },
            data: { isVerified: action === "PUBLISHED" ? true : false }
        });

        res.json({ success: true, message: `Plan moderation updated to ${action}` });
    } catch (err) {
        console.error("Moderate plan err:", err);
        res.status(500).json({ message: "Failed to moderate plan" });
    }
};

export const getAdminListings = async (req, res) => {
    try {
        const listings = await prisma.listing.findMany({
            include: { agent: { select: { fullName: true, email: true } }, location: true },
            orderBy: { createdAt: "desc" }
        });
        res.json({ success: true, listings });
    } catch (err) {
        console.error("Get admin listings err:", err);
        res.status(500).json({ message: "Failed to fetch listings" });
    }
};

export const moderateListing = async (req, res) => {
    try {
        const { action } = req.body; // e.g. 'ACTIVE', 'INACTIVE'
        await prisma.listing.update({
            where: { id: BigInt(req.params.id) },
            data: { status: action }
        });
        
        res.json({ success: true, message: `Listing moderation updated to ${action}` });
    } catch (err) {
        console.error("Moderate listing err:", err);
        res.status(500).json({ message: "Failed to moderate listing" });
    }
};
