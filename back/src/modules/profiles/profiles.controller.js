import { pool } from "../../config/db.js";

// ─── GET /api/profiles/me ─────────────────────────────────────────────────────
export const getMyProfile = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.phone, u.region, u.profession,
              u.avatar_url, u.bio, u.verification_status, u.created_at,
              r.name as role,
              ep.id as expert_profile_id, ep.headline, ep.rating_avg, ep.rating_count,
              ep.experience_years, ep.skills, ep.company, ep.verified_at
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN expert_profiles ep ON ep.user_id = u.id
       WHERE u.id = ?`,
            [req.user.id]
        );
        if (!rows.length) return res.status(404).json({ message: "User not found" });
        res.json({ success: true, profile: rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};

// ─── PUT /api/profiles/me ─────────────────────────────────────────────────────
export const updateMyProfile = async (req, res) => {
    try {
        const { full_name, phone, region, profession, bio } = req.body;
        await pool.query(
            `UPDATE users SET
        full_name = COALESCE(?,full_name),
        phone = COALESCE(?,phone),
        region = COALESCE(?,region),
        profession = COALESCE(?,profession),
        bio = COALESCE(?,bio)
       WHERE id = ?`,
            [full_name, phone, region, profession, bio, req.user.id]
        );
        res.json({ success: true, message: "Profile updated" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update profile" });
    }
};

// ─── GET /api/profiles/:id ────────────────────────────────────────────────────
export const getPublicProfile = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT u.id, u.full_name, u.region, u.profession, u.avatar_url, u.bio, u.created_at,
              r.name as role,
              ep.headline, ep.experience_years, ep.skills, ep.company, ep.rating_avg,
              ep.rating_count, ep.projects_completed, ep.verified_at
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN expert_profiles ep ON ep.user_id = u.id
       WHERE u.id = ? AND u.is_active = 1`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: "User not found" });
        res.json({ success: true, profile: rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};
