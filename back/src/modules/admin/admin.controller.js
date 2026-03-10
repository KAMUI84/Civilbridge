import { pool } from "../../config/db.js";

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
export const getAdminStats = async (req, res) => {
    try {
        const [[users]] = await pool.query("SELECT COUNT(*) as total FROM users");
        const [[verifiedPros]] = await pool.query("SELECT COUNT(*) as total FROM expert_profiles WHERE verified_at IS NOT NULL");
        const [[pendingPros]] = await pool.query("SELECT COUNT(*) as total FROM expert_profiles WHERE verified_at IS NULL");
        const [[plans]] = await pool.query("SELECT COUNT(*) as total FROM plans");
        const [[listings]] = await pool.query("SELECT COUNT(*) as total FROM listings");
        const [[projects]] = await pool.query("SELECT COUNT(*) as total FROM projects");
        const [recentActivity] = await pool.query(
            "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20"
        );

        res.json({
            success: true,
            stats: {
                total_users: users.total,
                verified_professionals: verifiedPros.total,
                pending_verification: pendingPros.total,
                total_plans: plans.total,
                total_listings: listings.total,
                total_projects: projects.total,
            },
            recent_activity: recentActivity,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch admin stats" });
    }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
export const getUsers = async (req, res) => {
    try {
        const { search, role, status, page = 1, limit = 50 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const params = [];
        let where = "WHERE 1=1";

        if (search) {
            where += " AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
            const s = `%${search}%`;
            params.push(s, s, s);
        }
        if (role) { where += " AND r.name = ?"; params.push(role); }
        if (status) { where += " AND u.verification_status = ?"; params.push(status); }

        const [users] = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.phone, u.region, u.verification_status,
              u.is_active, u.created_at, u.last_login_at, r.name as role
       FROM users u JOIN roles r ON u.role_id = r.id
       ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
            [...params, Number(limit), offset]
        );

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) as total FROM users u JOIN roles r ON u.role_id = r.id ${where}`,
            params
        );

        res.json({ success: true, users, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

// ─── PUT /api/admin/users/:id/role ────────────────────────────────────────────
export const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) return res.status(400).json({ message: "Role is required" });

        const [[roleRow]] = await pool.query("SELECT id FROM roles WHERE name = ?", [role]);
        if (!roleRow) return res.status(400).json({ message: "Invalid role" });

        await pool.query("UPDATE users SET role_id = ? WHERE id = ?", [roleRow.id, req.params.id]);

        await pool.query(
            "INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, meta) VALUES (?,?,?,?,?)",
            [req.user.id, "ROLE_CHANGE", "USERS", req.params.id, JSON.stringify({ new_role: role })]
        );

        res.json({ success: true, message: `User role updated to ${role}. Takes effect on next login.` });
    } catch (err) {
        res.status(500).json({ message: "Failed to change user role" });
    }
};

// ─── PUT /api/admin/users/:id/activate ───────────────────────────────────────
export const toggleUserActive = async (req, res) => {
    try {
        const { is_active } = req.body;
        await pool.query("UPDATE users SET is_active = ? WHERE id = ?", [is_active ? 1 : 0, req.params.id]);
        res.json({ success: true, message: `User ${is_active ? "activated" : "deactivated"}` });
    } catch (err) {
        res.status(500).json({ message: "Failed to update user status" });
    }
};

// ─── GET /api/admin/verification-queue ───────────────────────────────────────
export const getVerificationQueue = async (req, res) => {
    try {
        const [queue] = await pool.query(
            `SELECT ep.id, ep.headline, ep.bio, ep.license_id, ep.experience_years, ep.skills, ep.company,
              ep.specialization, ep.created_at as applied_at,
              u.full_name, u.email, u.phone, u.profession, u.region, u.verification_status
       FROM expert_profiles ep JOIN users u ON ep.user_id = u.id
       WHERE ep.verified_at IS NULL
       ORDER BY ep.created_at ASC`
        );
        res.json({ success: true, queue });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch verification queue" });
    }
};

// ─── POST /api/admin/verification/:id/approve ────────────────────────────────
export const approveVerification = async (req, res) => {
    try {
        await pool.query(
            "UPDATE expert_profiles SET verified_by_admin = ?, verified_at = NOW() WHERE id = ?",
            [req.user.id, req.params.id]
        );
        const [[ep]] = await pool.query("SELECT user_id FROM expert_profiles WHERE id = ?", [req.params.id]);
        await pool.query(
            "UPDATE users SET verification_status = 'VERIFIED' WHERE id = ?",
            [ep.user_id]
        );
        await pool.query(
            "INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id) VALUES (?,?,?,?)",
            [req.user.id, "VERIFY_EXPERT", "EXPERT_PROFILES", req.params.id]
        );
        res.json({ success: true, message: "Expert verified successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to approve verification" });
    }
};

// ─── POST /api/admin/verification/:id/reject ─────────────────────────────────
export const rejectVerification = async (req, res) => {
    try {
        const { reason } = req.body;
        const [[ep]] = await pool.query("SELECT user_id FROM expert_profiles WHERE id = ?", [req.params.id]);
        await pool.query(
            "UPDATE users SET verification_status = 'UNVERIFIED' WHERE id = ?",
            [ep.user_id]
        );
        await pool.query(
            "INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, meta) VALUES (?,?,?,?,?)",
            [req.user.id, "REJECT_EXPERT", "EXPERT_PROFILES", req.params.id, JSON.stringify({ reason })]
        );
        res.json({ success: true, message: "Verification rejected" });
    } catch (err) {
        res.status(500).json({ message: "Failed to reject verification" });
    }
};

// ─── Moderate plans/listings ──────────────────────────────────────────────────
export const moderatePlan = async (req, res) => {
    try {
        const { action, reason } = req.body; // action: 'PUBLISHED' | 'REJECTED'
        await pool.query(
            "UPDATE plans SET status = ?, moderated_by = ?, rejected_reason = ? WHERE id = ?",
            [action, req.user.id, reason || null, req.params.id]
        );
        res.json({ success: true, message: `Plan ${action.toLowerCase()}` });
    } catch (err) {
        res.status(500).json({ message: "Failed to moderate plan" });
    }
};

export const moderateListing = async (req, res) => {
    try {
        const { action, reason } = req.body;
        await pool.query(
            "UPDATE listings SET status = ?, moderated_by = ?, rejected_reason = ? WHERE id = ?",
            [action, req.user.id, reason || null, req.params.id]
        );
        res.json({ success: true, message: `Listing ${action.toLowerCase()}` });
    } catch (err) {
        res.status(500).json({ message: "Failed to moderate listing" });
    }
};
