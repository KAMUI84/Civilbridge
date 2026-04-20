import { pool } from "../../config/db.js";
import {
    generateBOQ,
    checkBudgetFeasibility,
    PricingConfigurationError,
} from "./estimation.engine.js";
import { aiBudgetAnalysisService } from "../../services/aiBudgetAnalysis.service.js";
import { marketDataService } from "../../services/marketData.service.js";

function handleEstimationError(err, res, fallbackMessage) {
    if (err instanceof PricingConfigurationError) {
        return res.status(err.statusCode || 409).json({
            success: false,
            code: err.code,
            message: err.message,
            pricing_readiness: err.readiness,
        });
    }

    console.error(err);
    return res.status(500).json({ message: fallbackMessage });
}

// ─── POST /api/estimation/run ─────────────────────────────────────────────────
export const runEstimation = async (req, res) => {
    try {
        await marketDataService.ensureReady();
        const {
            title, area_sqm, floors = 1, building_quality = "standard",
            region_id = 1, project_id, plan_id, save = false,
        } = req.body;

        if (!area_sqm) {
            return res.status(400).json({ message: "area_sqm is required" });
        }

        const boq = generateBOQ({ area_sqm, floors, building_quality, regionId: region_id });

        let savedId = null;
        if (save) {
            const [result] = await pool.query(
                `INSERT INTO estimates (created_by, project_id, plan_id, title, region_id, building_type, area_sqm, floors,
          subtotal, contingency, total)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    req.user.id, project_id || null, plan_id || null,
                    title || `Estimate - ${area_sqm}m²`,
                    region_id, building_quality, area_sqm, floors,
                    boq.summary.construction_subtotal,
                    boq.summary.contingency_10pct,
                    boq.summary.grand_total,
                ]
            );
            savedId = result.insertId;

            // Save BOQ items
            for (const section of boq.sections) {
                for (const item of section.items) {
                    await pool.query(
                        `INSERT INTO boq_items (estimate_id, section, description, unit, quantity, unit_rate, amount)
             VALUES (?,?,?,?,?,?,?)`,
                        [savedId, section.label, item.description, item.unit, item.quantity, item.unit_rate, item.amount]
                    );
                }
            }
        }

        res.json({
            success: true,
            estimate_id: savedId,
            boq,
            message: save ? "Estimation saved" : "Estimation calculated (not saved)",
        });
    } catch (err) {
        return handleEstimationError(err, res, "Failed to run estimation");
    }
};

// ─── POST /api/estimation/feasibility ────────────────────────────────────────
export const checkFeasibility = async (req, res) => {
    try {
        await marketDataService.ensureReady();
        const { budget, area_sqm, floors = 1, region_id = 1, location } = req.body;
        if (!budget || !area_sqm) {
            return res.status(400).json({ message: "budget and area_sqm are required" });
        }

        const feasibility = checkBudgetFeasibility(Number(budget), Number(area_sqm), Number(floors), region_id);

        // Also get AI recommendations
        let aiResult = null;
        try {
            aiResult = await aiBudgetAnalysisService.analyzeBudget(Number(budget), region_id, {
                area_sqm: Number(area_sqm), floors: Number(floors), location,
            });
        } catch (e) {
            console.error("AI analysis failed:", e.message);
        }

        res.json({
            success: true,
            budget,
            area_sqm: Number(area_sqm),
            floors: Number(floors),
            feasibility_matrix: feasibility,
            ai_analysis: aiResult,
        });
    } catch (err) {
        return handleEstimationError(err, res, "Failed to check feasibility");
    }
};

// ─── GET /api/estimation ──────────────────────────────────────────────────────
export const getMyEstimates = async (req, res) => {
    try {
        const [estimates] = await pool.query(
            `SELECT e.id, e.title, e.area_sqm, e.floors, e.building_type, e.total, e.currency, e.created_at,
              r.name as region_name
       FROM estimates e
       LEFT JOIN regions r ON e.region_id = r.id
       WHERE e.created_by = ?
       ORDER BY e.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, estimates });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch estimates" });
    }
};

// ─── GET /api/estimation/:id ──────────────────────────────────────────────────
export const getEstimateById = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM estimates WHERE id = ? AND created_by = ?",
            [req.params.id, req.user.id]
        );
        if (!rows.length) return res.status(404).json({ message: "Estimate not found" });

        const [items] = await pool.query(
            "SELECT * FROM boq_items WHERE estimate_id = ? ORDER BY sort_order, section",
            [req.params.id]
        );

        res.json({ success: true, estimate: { ...rows[0], boq_items: items } });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch estimate" });
    }
};

// ─── DELETE /api/estimation/:id ───────────────────────────────────────────────
export const deleteEstimate = async (req, res) => {
    try {
        await pool.query("DELETE FROM estimates WHERE id = ? AND created_by = ?", [req.params.id, req.user.id]);
        res.json({ success: true, message: "Estimate deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete estimate" });
    }
};
