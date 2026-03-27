import { pool } from "../../config/db.js";

// ─── GET /api/documents?project_id= ──────────────────────────────────────────
export const getDocuments = async (req, res) => {
    try {
        const { project_id, entity_type } = req.query;
        const params = [req.user.id];
        let where = "WHERE u.uploaded_by = ?";

        if (project_id) {
            where += " AND u.entity_id = ? AND u.entity_type = 'PROJECT'";
            params.push(project_id);
        }
        if (entity_type) {
            where += " AND u.entity_type = ?";
            params.push(entity_type);
        }

        const [docs] = await pool.query(
            `SELECT u.id, u.entity_type, u.entity_id, u.file_type, u.mime_type,
              u.original_name, u.filename, u.url, u.size_bytes, u.created_at
       FROM uploads u ${where} ORDER BY u.created_at DESC`,
            params
        );

        res.json({ success: true, documents: docs });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch documents" });
    }
};

// ─── DELETE /api/documents/:id ────────────────────────────────────────────────
export const deleteDocument = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT uploaded_by FROM uploads WHERE id = ?",
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: "Document not found" });
        if (rows[0].uploaded_by !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not authorized" });
        }
        await pool.query("DELETE FROM uploads WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: "Document deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete document" });
    }
};

// ─── GET /api/documents/:id/download ─────────────────────────────────────────
export const downloadDocument = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, uploaded_by, url, original_name FROM uploads WHERE id = ?",
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: "Document not found" });

        // Prevent IDOR: only the uploader (or ADMIN) can download.
        if (rows[0].uploaded_by !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json({ success: true, url: rows[0].url, filename: rows[0].original_name });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch document" });
    }
};
