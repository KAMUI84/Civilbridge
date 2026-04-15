import { pool } from "../../config/db.js";

// ─── GET /api/permits ─────────────────────────────────────────────────────────
export const getPermitGuides = async (req, res) => {
    try {
        const { category, region } = req.query;
        const params = [];
        let where = "WHERE is_active = 1";
        if (category) { where += " AND category = ?"; params.push(category); }
        if (region) { where += " AND (region = ? OR region IS NULL)"; params.push(region); }

        const [guides] = await pool.query(
            `SELECT id, title, category, region, description, requirements,
              estimated_cost_rwf, estimated_days, issuing_authority, steps
       FROM permit_guides ${where} ORDER BY category, title`,
            params
        );
        res.json({ success: true, guides });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch permit guides" });
    }
};

// ─── GET /api/permits/:id ─────────────────────────────────────────────────────
export const getPermitGuideById = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM permit_guides WHERE id = ?", [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: "Permit guide not found" });
        res.json({ success: true, guide: rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch permit guide" });
    }
};

// ─── GET /api/permits/checklist ───────────────────────────────────────────────
export const getPermitChecklist = async (req, res) => {
    try {
        const { building_type, region } = req.query;

        // Return a checklist relevant to Rwanda residential construction
        const checklist = [
            {
                step: 1,
                title: "Obtain Land Title Deed",
                authority: "Rwanda Land Management and Use Authority (RLMUA)",
                required: true,
                duration: "Varies",
                documents: ["National ID", "Land purchase agreement"],
            },
            {
                step: 2,
                title: "Engage Licensed Architect",
                authority: "Rwanda Housing Authority (RHA)",
                required: true,
                duration: "2–4 weeks",
                documents: ["Architect's license", "Architectural drawings"],
            },
            {
                step: 3,
                title: "Apply for Building Permit",
                authority: "City of Kigali / District Office",
                required: true,
                duration: "15–30 days",
                documents: [
                    "Completed application form",
                    "Title deed copy",
                    "Architectural plans",
                    "Structural drawings",
                    "Site plan",
                    "Topographic survey",
                    "Environmental assessment (if required)",
                ],
                estimated_cost_rwf: 150000,
            },
            {
                step: 4,
                title: "Environmental Impact Assessment (if > 500m²)",
                authority: "Rwanda Environment Management Authority (REMA)",
                required: building_type === "COMMERCIAL",
                duration: "30–60 days",
                estimated_cost_rwf: 500000,
            },
            {
                step: 5,
                title: "Connect to WASAC (Water & Sanitation)",
                authority: "WASAC",
                required: true,
                duration: "7–14 days",
                estimated_cost_rwf: 80000,
            },
            {
                step: 6,
                title: "Connect to REG (Electricity)",
                authority: "Rwanda Energy Group (REG)",
                required: true,
                duration: "14–30 days",
            },
            {
                step: 7,
                title: "Final Inspection & Occupancy Certificate",
                authority: "City of Kigali / District Office",
                required: true,
                duration: "14–21 days after completion",
                estimated_cost_rwf: 50000,
            },
        ];

        res.json({ success: true, checklist, region: region || "Rwanda" });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch checklist" });
    }
};
