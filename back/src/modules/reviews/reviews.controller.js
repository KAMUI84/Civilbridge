import { pool } from "../../config/db.js";

// ─── POST /api/reviews ────────────────────────────────────────────────────────
export const createReview = async (req, res) => {
    try {
        const { expert_id, rating, title, content, project_id } = req.body;
        const reviewer_id = req.user.id;

        if (!expert_id || !rating) {
            return res.status(400).json({ message: "expert_id and rating are required" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Prevent self-review
        const [expert] = await pool.query("SELECT user_id FROM expert_profiles WHERE id = ?", [expert_id]);
        if (!expert.length) return res.status(404).json({ message: "Expert not found" });
        if (expert[0].user_id === reviewer_id) {
            return res.status(400).json({ message: "You cannot review yourself" });
        }

        const [result] = await pool.query(
            "INSERT INTO reviews (reviewer_id, expert_id, project_id, rating, title, content) VALUES (?,?,?,?,?,?)",
            [reviewer_id, expert_id, project_id || null, rating, title, content]
        );

        // Update expert rating average
        const [[avgRow]] = await pool.query(
            "SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE expert_id = ?",
            [expert_id]
        );
        await pool.query(
            "UPDATE expert_profiles SET rating_avg = ?, rating_count = ? WHERE id = ?",
            [parseFloat(avgRow.avg_rating).toFixed(2), avgRow.total, expert_id]
        );

        res.status(201).json({ success: true, id: result.insertId, message: "Review submitted" });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "You have already reviewed this expert" });
        }
        console.error(err);
        res.status(500).json({ message: "Failed to submit review" });
    }
};

// ─── GET /api/reviews/expert/:id ──────────────────────────────────────────────
export const getExpertReviews = async (req, res) => {
    try {
        const [reviews] = await pool.query(
            `SELECT r.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r JOIN users u ON r.reviewer_id = u.id
       WHERE r.expert_id = ?
       ORDER BY r.created_at DESC`,
            [req.params.id]
        );
        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch reviews" });
    }
};

// ─── DELETE /api/reviews/:id ──────────────────────────────────────────────────
export const deleteReview = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT reviewer_id, expert_id FROM reviews WHERE id = ?", [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: "Review not found" });
        if (rows[0].reviewer_id !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not authorized" });
        }
        await pool.query("DELETE FROM reviews WHERE id = ?", [req.params.id]);

        // Recalculate rating
        const [[avgRow]] = await pool.query(
            "SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE expert_id = ?",
            [rows[0].expert_id]
        );
        await pool.query(
            "UPDATE expert_profiles SET rating_avg = ?, rating_count = ? WHERE id = ?",
            [parseFloat(avgRow.avg_rating || 0).toFixed(2), avgRow.total, rows[0].expert_id]
        );

        res.json({ success: true, message: "Review deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete review" });
    }
};
