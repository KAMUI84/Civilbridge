import { pool } from "../../config/db.js";

// CO2 emission factors (kg CO2 per unit) — construction industry averages
const CO2_FACTORS = {
    cement_bag: 35.0,        // per 50kg bag
    steel_meter: 2.8,        // per meter of 12mm rebar
    sand_m3: 8.5,            // per m³
    aggregate_m3: 9.5,       // per m³
    brick_1000: 320,         // per 1000 bricks
    timber_m3: 30,           // per m³ (net, accounting for carbon storage)
    transport_km_per_ton: 0.18, // per km per ton transported
    electricity_kwh: 0.55,   // per kWh (Rwanda grid)
    skilled_labor_day: 2.4,  // indirect per labor day
};

// ─── POST /api/carbon/calculate ───────────────────────────────────────────────
export const calculateCarbon = async (req, res) => {
    try {
        const {
            area_sqm,
            floors = 1,
            building_quality = "standard",
            transport_distance_km = 50,
            project_id,
            estimate_id,
            save = false,
        } = req.body;

        if (!area_sqm) {
            return res.status(400).json({ message: "area_sqm is required" });
        }

        const totalArea = Number(area_sqm) * Number(floors);

        // Quantity estimations per m² (rough calculation factors)
        const quantities = {
            cement_bags: totalArea * 0.18 * (building_quality === "premium" ? 1.3 : 1),
            steel_meters: totalArea * 10,
            sand_m3: totalArea * 0.45,
            aggregate_m3: totalArea * 0.35,
            bricks_1000: totalArea * 0.65,
        };

        // Materials CO2
        const materials_co2 = {
            cement: quantities.cement_bags * CO2_FACTORS.cement_bag,
            steel: quantities.steel_meters * CO2_FACTORS.steel_meter,
            sand: quantities.sand_m3 * CO2_FACTORS.sand_m3,
            aggregate: quantities.aggregate_m3 * CO2_FACTORS.aggregate_m3,
            bricks: quantities.bricks_1000 * CO2_FACTORS.brick_1000,
        };
        const materials_total = Object.values(materials_co2).reduce((a, b) => a + b, 0);

        // Transport CO2 (materials weigh ~800kg per m²)
        const total_weight_tons = totalArea * 0.8;
        const transport_co2 = total_weight_tons * Number(transport_distance_km) * CO2_FACTORS.transport_km_per_ton;

        // Labor CO2
        const labor_days = totalArea * 17;
        const labor_co2 = labor_days * CO2_FACTORS.skilled_labor_day;

        const total_co2 = materials_total + transport_co2 + labor_co2;

        const breakdown = {
            materials: Object.entries(materials_co2).map(([k, v]) => ({
                item: k,
                co2_kg: Math.round(v),
            })),
            transport_co2_kg: Math.round(transport_co2),
            labor_co2_kg: Math.round(labor_co2),
        };

        const result = {
            area_sqm: Number(area_sqm),
            floors: Number(floors),
            total_area_m2: totalArea,
            materials_co2_kg: Math.round(materials_total),
            transport_co2_kg: Math.round(transport_co2),
            labor_co2_kg: Math.round(labor_co2),
            total_co2_kg: Math.round(total_co2),
            total_co2_tonnes: Math.round(total_co2 / 10) / 100,
            co2_per_m2: Math.round(total_co2 / totalArea),
            breakdown,
            offset_suggestions: [
                "Plant 200+ trees on or near the property (1 tree absorbs ~22kg CO2/year)",
                "Use compressed stabilized earth blocks instead of fired bricks — saves ~30%",
                "Source materials locally (within 30km) to reduce transport emissions",
                "Install solar panels to offset operational carbon over 20 years",
            ],
        };

        let savedId = null;
        if (save) {
            const [dbResult] = await pool.query(
                `INSERT INTO carbon_footprints
          (project_id, estimate_id, calculated_by, total_co2_kg, materials_co2_kg, transport_co2_kg, labor_co2_kg, breakdown, offset_suggestions)
         VALUES (?,?,?,?,?,?,?,?,?)`,
                [
                    project_id || null, estimate_id || null, req.user.id,
                    result.total_co2_kg, result.materials_co2_kg, result.transport_co2_kg, result.labor_co2_kg,
                    JSON.stringify(breakdown), JSON.stringify(result.offset_suggestions),
                ]
            );
            savedId = dbResult.insertId;
        }

        res.json({ success: true, calculation_id: savedId, carbon_analysis: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to calculate carbon footprint" });
    }
};

// ─── GET /api/carbon ──────────────────────────────────────────────────────────
export const getMyCarbonCalculations = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM carbon_footprints WHERE calculated_by = ? ORDER BY created_at DESC LIMIT 10",
            [req.user.id]
        );
        res.json({ success: true, calculations: rows });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch carbon calculations" });
    }
};
