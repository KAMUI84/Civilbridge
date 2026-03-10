import { pool } from "../../config/db.js";

// ─── GET /api/projects/user ───────────────────────────────────────────────────
export const getUserProjects = async (req, res) => {
    try {
        const [projects] = await pool.query(
            `SELECT p.id, p.title, p.description, p.status, p.region, p.land_size_sqm,
              p.building_type, p.budget_amount, p.spent_amount, p.progress_percent,
              p.start_date, p.target_end_date, p.created_at,
              (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as team_size,
              (SELECT COUNT(*) FROM project_milestones WHERE project_id = p.id) as milestone_count
       FROM projects p
       WHERE p.owner_id = ?
       ORDER BY p.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, projects });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch projects" });
    }
};

// ─── POST /api/projects ───────────────────────────────────────────────────────
export const createProject = async (req, res) => {
    try {
        const {
            title, description, region, land_size_sqm, building_type,
            budget_amount, start_date, target_end_date,
        } = req.body;

        if (!title) return res.status(400).json({ message: "Project title is required" });

        const [result] = await pool.query(
            `INSERT INTO projects (owner_id, title, description, region, land_size_sqm, building_type,
         budget_amount, start_date, target_end_date)
       VALUES (?,?,?,?,?,?,?,?,?)`,
            [req.user.id, title, description, region, land_size_sqm, building_type,
                budget_amount, start_date || null, target_end_date || null]
        );

        // Add owner as member
        await pool.query(
            "INSERT INTO project_members (project_id, user_id, member_role) VALUES (?,?,?)",
            [result.insertId, req.user.id, "OWNER"]
        );

        res.status(201).json({ success: true, id: result.insertId, message: "Project created" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create project" });
    }
};

// ─── GET /api/projects/:id ────────────────────────────────────────────────────
export const getProjectById = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.*, u.full_name as owner_name
       FROM projects p JOIN users u ON p.owner_id = u.id
       WHERE p.id = ? AND p.owner_id = ?`,
            [req.params.id, req.user.id]
        );
        if (!rows.length) return res.status(404).json({ message: "Project not found" });

        const [members] = await pool.query(
            `SELECT pm.*, u.full_name, u.email, u.profession, u.avatar_url
       FROM project_members pm JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?`,
            [req.params.id]
        );

        const [milestones] = await pool.query(
            "SELECT * FROM project_milestones WHERE project_id = ? ORDER BY sort_order",
            [req.params.id]
        );

        const [documents] = await pool.query(
            "SELECT * FROM uploads WHERE entity_type = 'PROJECT' AND entity_id = ? ORDER BY created_at DESC",
            [req.params.id]
        );

        res.json({ success: true, project: { ...rows[0], members, milestones, documents } });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch project" });
    }
};

// ─── PUT /api/projects/:id ────────────────────────────────────────────────────
export const updateProject = async (req, res) => {
    try {
        const { title, description, region, budget_amount, spent_amount, status, start_date, target_end_date } = req.body;
        await pool.query(
            `UPDATE projects SET
        title = COALESCE(?,title), description = COALESCE(?,description),
        region = COALESCE(?,region), budget_amount = COALESCE(?,budget_amount),
        spent_amount = COALESCE(?,spent_amount), status = COALESCE(?,status),
        start_date = COALESCE(?,start_date), target_end_date = COALESCE(?,target_end_date)
       WHERE id = ? AND owner_id = ?`,
            [title, description, region, budget_amount, spent_amount, status,
                start_date, target_end_date, req.params.id, req.user.id]
        );
        res.json({ success: true, message: "Project updated" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update project" });
    }
};

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────
export const deleteProject = async (req, res) => {
    try {
        await pool.query(
            "UPDATE projects SET status = 'ARCHIVED' WHERE id = ? AND owner_id = ?",
            [req.params.id, req.user.id]
        );
        res.json({ success: true, message: "Project archived" });
    } catch (err) {
        res.status(500).json({ message: "Failed to archive project" });
    }
};

// ─── POST /api/projects/:id/members ───────────────────────────────────────────
export const addProjectMember = async (req, res) => {
    try {
        const { user_id, member_role = "VIEWER" } = req.body;
        await pool.query(
            "INSERT INTO project_members (project_id, user_id, member_role) VALUES (?,?,?) ON DUPLICATE KEY UPDATE member_role = ?",
            [req.params.id, user_id, member_role, member_role]
        );
        res.status(201).json({ success: true, message: "Member added" });
    } catch (err) {
        res.status(500).json({ message: "Failed to add member" });
    }
};
