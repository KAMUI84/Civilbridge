import { pool } from "../../config/db.js";

// ─── GET /api/plans ───────────────────────────────────────────────────────────
export const getPlans = async (req, res) => {
    try {
        const { category, min_area, max_area, bedrooms, search, featured, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const params = [];
        let where = "WHERE p.status = 'PUBLISHED'";

        if (category) { where += " AND p.category = ?"; params.push(category); }
        if (bedrooms) { where += " AND p.bedrooms = ?"; params.push(bedrooms); }
        if (min_area) { where += " AND p.area_sqm >= ?"; params.push(min_area); }
        if (max_area) { where += " AND p.area_sqm <= ?"; params.push(max_area); }
        if (featured === "true") { where += " AND p.is_featured = 1"; }
        if (search) {
            where += " AND (p.title LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)";
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        const [plans] = await pool.query(
            `SELECT p.id, p.title, p.category, p.style, p.bedrooms, p.bathrooms, p.floors,
              p.area_sqm, p.estimated_cost_min, p.estimated_cost_max, p.currency,
              p.tags, p.view_count, p.download_count, p.is_featured, p.created_at,
              u.full_name as author_name,
              (SELECT url FROM plan_images WHERE plan_id = p.id AND image_type = 'render' ORDER BY sort_order LIMIT 1) as thumbnail
       FROM plans p JOIN users u ON p.created_by = u.id
       ${where} ORDER BY p.is_featured DESC, p.view_count DESC LIMIT ? OFFSET ?`,
            [...params, Number(limit), offset]
        );

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) as total FROM plans p ${where}`, params
        );

        res.json({ success: true, plans, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch plans" });
    }
};

// ─── GET /api/plans/:id ───────────────────────────────────────────────────────
export const getPlanById = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.*, u.full_name as author_name, u.email as author_email
       FROM plans p JOIN users u ON p.created_by = u.id
       WHERE p.id = ? AND p.status = 'PUBLISHED'`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: "Plan not found" });

        await pool.query("UPDATE plans SET view_count = view_count + 1 WHERE id = ?", [req.params.id]);

        const [images] = await pool.query(
            "SELECT * FROM plan_images WHERE plan_id = ? ORDER BY sort_order",
            [req.params.id]
        );

        res.json({ success: true, plan: { ...rows[0], images } });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch plan" });
    }
};

// ─── POST /api/plans ──────────────────────────────────────────────────────────
export const createPlan = async (req, res) => {
    try {
        const {
            title, description, category, style, bedrooms, bathrooms, floors, area_sqm,
            estimated_cost_min, estimated_cost_max, tags,
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO plans (created_by, title, description, category, style, bedrooms, bathrooms, floors,
        area_sqm, estimated_cost_min, estimated_cost_max, tags, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'DRAFT')`,
            [req.user.id, title, description, category || "RESIDENTIAL", style,
                bedrooms, bathrooms, floors, area_sqm, estimated_cost_min, estimated_cost_max, tags]
        );

        res.status(201).json({ success: true, id: result.insertId, message: "Plan created as draft" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create plan" });
    }
};

// ─── PUT /api/plans/:id ───────────────────────────────────────────────────────
export const updatePlan = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT created_by FROM plans WHERE id = ?", [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: "Plan not found" });
        if (rows[0].created_by !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not authorized" });
        }

        const { title, description, status, category, bedrooms, bathrooms, floors, area_sqm, estimated_cost_min, estimated_cost_max } = req.body;
        await pool.query(
            `UPDATE plans SET
       title = COALESCE(?,title), description = COALESCE(?,description),
       status = COALESCE(?,status), category = COALESCE(?,category),
       bedrooms = COALESCE(?,bedrooms), bathrooms = COALESCE(?,bathrooms),
       floors = COALESCE(?,floors), area_sqm = COALESCE(?,area_sqm),
       estimated_cost_min = COALESCE(?,estimated_cost_min), estimated_cost_max = COALESCE(?,estimated_cost_max)
       WHERE id = ?`,
            [title, description, status, category, bedrooms, bathrooms, floors, area_sqm,
                estimated_cost_min, estimated_cost_max, req.params.id]
        );
        res.json({ success: true, message: "Plan updated" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update plan" });
    }
};

// ─── GET /api/plans/me ────────────────────────────────────────────────────────
export const getMyPlans = async (req, res) => {
    try {
        const [plans] = await pool.query(
            `SELECT p.*, (SELECT url FROM plan_images WHERE plan_id = p.id ORDER BY sort_order LIMIT 1) as thumbnail
       FROM plans p WHERE p.created_by = ? ORDER BY p.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, plans });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch your plans" });
    }
};
