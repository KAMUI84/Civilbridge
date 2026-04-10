import { pool } from "../../config/db.js";
import { generateBoqPdfExport } from "./boq.export.service.js";

// ─── GET /api/boq/:estimate_id ────────────────────────────────────────────────
export const getBOQ = async (req, res) => {
    try {
        const { estimate_id } = req.params;

        // Verify the estimate belongs to this user
        const [est] = await pool.query(
            "SELECT id, title, total FROM estimates WHERE id = ? AND created_by = ?",
            [estimate_id, req.user.id]
        );
        if (!est.length) return res.status(404).json({ message: "Estimate not found" });

        const [items] = await pool.query(
            "SELECT * FROM boq_items WHERE estimate_id = ? ORDER BY sort_order, section",
            [estimate_id]
        );

        res.json({ success: true, estimate: est[0], items });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch BOQ" });
    }
};

// ─── POST /api/boq/:estimate_id/items ─────────────────────────────────────────
export const addBOQItem = async (req, res) => {
    try {
        const { section, description, unit, quantity, unit_rate, catalog_item_id } = req.body;
        const amount = quantity * unit_rate;

        const [result] = await pool.query(
            `INSERT INTO boq_items (estimate_id, section, description, unit, quantity, unit_rate, amount, catalog_item_id)
       VALUES (?,?,?,?,?,?,?,?)`,
            [req.params.estimate_id, section, description, unit, quantity, unit_rate, amount, catalog_item_id || null]
        );

        // Recalculate estimate total
        await recalcEstimateTotal(req.params.estimate_id);

        res.status(201).json({ success: true, id: result.insertId, message: "Item added" });
    } catch (err) {
        res.status(500).json({ message: "Failed to add BOQ item" });
    }
};

// ─── PUT /api/boq/items/:id ────────────────────────────────────────────────────
export const updateBOQItem = async (req, res) => {
    try {
        const { description, unit, quantity, unit_rate, section } = req.body;
        const amount = quantity && unit_rate ? quantity * unit_rate : undefined;

        await pool.query(
            `UPDATE boq_items SET
        description = COALESCE(?,description),
        unit = COALESCE(?,unit),
        quantity = COALESCE(?,quantity),
        unit_rate = COALESCE(?,unit_rate),
        amount = COALESCE(?,amount),
        section = COALESCE(?,section)
       WHERE id = ?`,
            [description, unit, quantity, unit_rate, amount, section, req.params.id]
        );

        const [item] = await pool.query("SELECT estimate_id FROM boq_items WHERE id = ?", [req.params.id]);
        if (item.length) await recalcEstimateTotal(item[0].estimate_id);

        res.json({ success: true, message: "Item updated" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update BOQ item" });
    }
};

// ─── DELETE /api/boq/items/:id ─────────────────────────────────────────────────
export const deleteBOQItem = async (req, res) => {
    try {
        const [item] = await pool.query("SELECT estimate_id FROM boq_items WHERE id = ?", [req.params.id]);
        await pool.query("DELETE FROM boq_items WHERE id = ?", [req.params.id]);
        if (item.length) await recalcEstimateTotal(item[0].estimate_id);
        res.json({ success: true, message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete BOQ item" });
    }
};

export const exportProjectBOQPdf = async (req, res) => {
    try {
        const result = await generateBoqPdfExport({
            projectId: req.params.projectId,
            actor: req.user,
            approveDocument: req.body?.approveDocument === true,
            reviewNotes: req.body?.reviewNotes || null,
        });

        res.json({
            success: true,
            document: result.document,
            signedUrl: result.signedUrl,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message || "Failed to export BOQ PDF" });
    }
};

async function recalcEstimateTotal(estimateId) {
    const [[{ subtotal }]] = await pool.query(
        "SELECT COALESCE(SUM(amount),0) as subtotal FROM boq_items WHERE estimate_id = ?",
        [estimateId]
    );
    const [[est]] = await pool.query("SELECT contingency_pct FROM estimates WHERE id = ?", [estimateId]);
    const contingency = subtotal * ((est?.contingency_pct || 10) / 100);
    await pool.query(
        "UPDATE estimates SET subtotal = ?, contingency = ?, total = ? WHERE id = ?",
        [subtotal, contingency, subtotal + contingency, estimateId]
    );
}
