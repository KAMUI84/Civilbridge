import { pool } from "../../config/db.js";

// ─── GET /api/progress/:project_id ────────────────────────────────────────────
export const getProjectProgress = async (req, res) => {
    try {
        const { project_id } = req.params;

        // Verify user owns or is a member of this project
        const [access] = await pool.query(
            `SELECT p.id, p.progress_percent FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
       WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)`,
            [req.user.id, project_id, req.user.id, req.user.id]
        );
        if (!access.length) return res.status(403).json({ message: "Access denied" });

        const [milestones] = await pool.query(
            "SELECT * FROM project_milestones WHERE project_id = ? ORDER BY sort_order, planned_date",
            [project_id]
        );

        const completed = milestones.filter(m => m.status === "COMPLETED").length;
        const total = milestones.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        res.json({ success: true, progress_percent: progress, milestones, completed, total });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch progress" });
    }
};

// ─── POST /api/progress/:project_id/milestones ────────────────────────────────
export const createMilestone = async (req, res) => {
    try {
        const { title, description, phase, planned_date, cost_estimate, sort_order } = req.body;

        // Verify user owns or is a member of the project before creating.
        const project_id = req.params.project_id;
        const [access] = await pool.query(
            `SELECT p.id
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
       WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)`,
            [req.user.id, project_id, req.user.id, req.user.id]
        );
        if (!access.length) return res.status(403).json({ message: "Access denied" });

        const [result] = await pool.query(
            `INSERT INTO project_milestones (project_id, title, description, phase, planned_date, cost_estimate, sort_order)
       VALUES (?,?,?,?,?,?,?)`,
            [project_id, title, description, phase || "PLANNING", planned_date, cost_estimate, sort_order || 0]
        );

        res.status(201).json({ success: true, id: result.insertId, message: "Milestone created" });
    } catch (err) {
        res.status(500).json({ message: "Failed to create milestone" });
    }
};

// ─── PUT /api/progress/milestones/:id ─────────────────────────────────────────
export const updateMilestone = async (req, res) => {
    try {
        const { title, status, completed_date, cost_actual, description, phase, planned_date } = req.body;

        // Fetch milestone's project and verify access before updating.
        const [[ms]] = await pool.query("SELECT project_id FROM project_milestones WHERE id = ?", [req.params.id]);
        if (!ms) return res.status(404).json({ message: "Milestone not found" });

        const [access] = await pool.query(
            `SELECT p.id
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
       WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)`,
            [req.user.id, ms.project_id, req.user.id, req.user.id]
        );
        if (!access.length) return res.status(403).json({ message: "Access denied" });

        await pool.query(
            `UPDATE project_milestones SET
        title = COALESCE(?,title),
        status = COALESCE(?,status),
        completed_date = COALESCE(?,completed_date),
        cost_actual = COALESCE(?,cost_actual),
        description = COALESCE(?,description),
        phase = COALESCE(?,phase),
        planned_date = COALESCE(?,planned_date)
       WHERE id = ?`,
            [title, status, completed_date, cost_actual, description, phase, planned_date, req.params.id]
        );

        // Update project progress_percent
        const [[pct]] = await pool.query(
            `SELECT ROUND(COUNT(CASE WHEN status='COMPLETED' THEN 1 END) * 100.0 / NULLIF(COUNT(*),0)) as pct
         FROM project_milestones WHERE project_id = ?`,
            [ms.project_id]
        );
        await pool.query("UPDATE projects SET progress_percent = ? WHERE id = ?", [pct.pct || 0, ms.project_id]);

        res.json({ success: true, message: "Milestone updated" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update milestone" });
    }
};

// ─── DELETE /api/progress/milestones/:id ──────────────────────────────────────
export const deleteMilestone = async (req, res) => {
    try {
        // Fetch milestone's project and verify access before deleting.
        const [[ms]] = await pool.query("SELECT project_id FROM project_milestones WHERE id = ?", [req.params.id]);
        if (!ms) return res.status(404).json({ message: "Milestone not found" });

        const [access] = await pool.query(
            `SELECT p.id
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
       WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)`,
            [req.user.id, ms.project_id, req.user.id, req.user.id]
        );
        if (!access.length) return res.status(403).json({ message: "Access denied" });

        await pool.query("DELETE FROM project_milestones WHERE id = ?", [req.params.id]);

        // Recompute progress after deletion.
        const [[pct]] = await pool.query(
            `SELECT ROUND(COUNT(CASE WHEN status='COMPLETED' THEN 1 END) * 100.0 / NULLIF(COUNT(*),0)) as pct
         FROM project_milestones WHERE project_id = ?`,
            [ms.project_id]
        );
        await pool.query("UPDATE projects SET progress_percent = ? WHERE id = ?", [pct.pct || 0, ms.project_id]);

        res.json({ success: true, message: "Milestone deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete milestone" });
    }
};
