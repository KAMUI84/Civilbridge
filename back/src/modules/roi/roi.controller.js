import { pool } from "../../config/db.js";

// ─── POST /api/roi/calculate ──────────────────────────────────────────────────
export const calculateROI = async (req, res) => {
    try {
        const {
            land_cost = 0,
            construction_cost = 0,
            other_costs = 0,
            projected_value,
            monthly_rental,
            expected_years = 10,
            project_id,
            notes,
            save = false,
        } = req.body;

        const total_investment = Number(land_cost) + Number(construction_cost) + Number(other_costs);
        if (total_investment <= 0) {
            return res.status(400).json({ message: "Total investment must be greater than 0" });
        }

        const capital_gain = Number(projected_value || 0) - total_investment;
        const capital_gain_pct = (capital_gain / total_investment) * 100;

        const annual_rental = Number(monthly_rental || 0) * 12;
        const total_rental_income = annual_rental * Number(expected_years);
        const rental_yield_pct = annual_rental > 0 ? (annual_rental / total_investment) * 100 : 0;

        const total_return = capital_gain + total_rental_income;
        const roi_percent = (total_return / total_investment) * 100;

        const payback_years = rental_yield_pct > 0
            ? (total_investment / annual_rental).toFixed(1)
            : null;

        const result = {
            land_cost: Number(land_cost),
            construction_cost: Number(construction_cost),
            other_costs: Number(other_costs),
            total_investment,
            projected_value: Number(projected_value || 0),
            monthly_rental: Number(monthly_rental || 0),
            expected_years: Number(expected_years),
            capital_gain: Math.round(capital_gain),
            capital_gain_pct: Math.round(capital_gain_pct * 10) / 10,
            annual_rental_income: annual_rental,
            total_rental_income: Math.round(total_rental_income),
            rental_yield_pct: Math.round(rental_yield_pct * 10) / 10,
            total_return: Math.round(total_return),
            roi_percent: Math.round(roi_percent * 10) / 10,
            payback_years: payback_years ? Number(payback_years) : null,
        };

        let savedId = null;
        if (save) {
            const [dbResult] = await pool.query(
                `INSERT INTO roi_calculations
          (user_id, project_id, land_cost, construction_cost, other_costs, total_investment,
           projected_value, monthly_rental, expected_years, roi_percent, payback_years, notes)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    req.user.id, project_id || null,
                    result.land_cost, result.construction_cost, result.other_costs, result.total_investment,
                    result.projected_value, result.monthly_rental, result.expected_years,
                    result.roi_percent, result.payback_years, notes,
                ]
            );
            savedId = dbResult.insertId;
        }

        res.json({ success: true, calculation_id: savedId, analysis: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to calculate ROI" });
    }
};

// ─── GET /api/roi ─────────────────────────────────────────────────────────────
export const getMyROICalculations = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM roi_calculations WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
            [req.user.id]
        );
        res.json({ success: true, calculations: rows });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch ROI calculations" });
    }
};
