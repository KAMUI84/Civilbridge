import { pool } from "../../config/db.js";

// ─── GET /api/experts ─────────────────────────────────────────────────────────
export const getExperts = async (req, res) => {
    try {
        const { role, region, search, verified, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const params = [];

        let where = "WHERE u.is_active = 1";
        if (verified !== "false") {
            where += " AND ep.verified_at IS NOT NULL";
        }
        if (role) {
            where += " AND u.profession = ?";
            params.push(role);
        }
        if (region) {
            where += " AND (ep.region = ? OR u.region = ?)";
            params.push(region, region);
        }
        if (search) {
            where += " AND (u.full_name LIKE ? OR ep.headline LIKE ? OR ep.skills LIKE ? OR ep.company LIKE ?)";
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }

        const [experts] = await pool.query(
            `SELECT 
        ep.id, ep.user_id, ep.headline, ep.bio, ep.experience_years,
        ep.skills, ep.company, ep.region, ep.specialization,
        ep.rating_avg, ep.rating_count, ep.projects_completed,
        ep.verified_at, ep.website_url, ep.phone,
        u.full_name, u.email, u.profession, u.avatar_url, u.region as user_region
       FROM expert_profiles ep
       JOIN users u ON ep.user_id = u.id
       ${where}
       ORDER BY ep.verified_at IS NOT NULL DESC, ep.rating_avg DESC, ep.rating_count DESC
       LIMIT ? OFFSET ?`,
            [...params, Number(limit), offset]
        );

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) as total FROM expert_profiles ep JOIN users u ON ep.user_id = u.id ${where}`,
            params
        );

        res.json({ success: true, experts, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch experts" });
    }
};

// ─── GET /api/experts/:id ─────────────────────────────────────────────────────
export const getExpertById = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT ep.*, u.full_name, u.email, u.profession, u.avatar_url, u.region as user_region, u.created_at as member_since
       FROM expert_profiles ep
       JOIN users u ON ep.user_id = u.id
       WHERE ep.id = ? AND u.is_active = 1`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: "Expert not found" });

        // Get recent reviews
        const [reviews] = await pool.query(
            `SELECT r.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r JOIN users u ON r.reviewer_id = u.id
       WHERE r.expert_id = ?
       ORDER BY r.created_at DESC LIMIT 10`,
            [rows[0].id]
        );

        res.json({ success: true, expert: { ...rows[0], reviews } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch expert" });
    }
};

// ─── POST /api/experts/apply ──────────────────────────────────────────────────
export const applyAsExpert = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            headline, bio, experience_years, skills, company,
            license_id, region, specialization, website_url, phone,
        } = req.body;

        const [existing] = await pool.query(
            "SELECT id FROM expert_profiles WHERE user_id = ?",
            [userId]
        );
        if (existing.length) {
            return res.status(400).json({ message: "You already have an expert profile" });
        }

        const [result] = await pool.query(
            `INSERT INTO expert_profiles (user_id, headline, bio, experience_years, skills, company, license_id, region, specialization, website_url, phone)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [userId, headline, bio, experience_years, skills, company, license_id, region, specialization, website_url, phone]
        );

        // Update user verification status to PENDING
        await pool.query(
            "UPDATE users SET verification_status = 'PENDING' WHERE id = ?",
            [userId]
        );

        res.status(201).json({ success: true, id: result.insertId, message: "Expert application submitted. Awaiting admin verification." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to submit expert application" });
    }
};

// ─── PUT /api/experts/profile ─────────────────────────────────────────────────
export const updateExpertProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { headline, bio, experience_years, skills, company, region, specialization, website_url, phone } = req.body;
        await pool.query(
            `UPDATE expert_profiles SET
        headline = COALESCE(?, headline),
        bio = COALESCE(?, bio),
        experience_years = COALESCE(?, experience_years),
        skills = COALESCE(?, skills),
        company = COALESCE(?, company),
        region = COALESCE(?, region),
        specialization = COALESCE(?, specialization),
        website_url = COALESCE(?, website_url),
        phone = COALESCE(?, phone)
       WHERE user_id = ?`,
            [headline, bio, experience_years, skills, company, region, specialization, website_url, phone, userId]
        );
        res.json({ success: true, message: "Profile updated" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update profile" });
    }
};
