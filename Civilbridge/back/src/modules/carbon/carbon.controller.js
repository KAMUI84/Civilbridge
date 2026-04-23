import prisma from "../../config/prisma.js";

// CO2 emission factors (kg CO2 per unit) — construction industry averages
const CO2_FACTORS = {
  cement_bag: 35.0,
  steel_meter: 2.8,
  sand_m3: 8.5,
  aggregate_m3: 9.5,
  brick_1000: 320,
  timber_m3: 30,
  transport_km_per_ton: 0.18,
  electricity_kwh: 0.55,
  skilled_labor_day: 2.4,
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
      save = false,
    } = req.body;

    if (!area_sqm) {
      return res.status(400).json({ message: "area_sqm is required" });
    }

    const totalArea = Number(area_sqm) * Number(floors);

    const quantities = {
      cement_bags: totalArea * 0.18 * (building_quality === "premium" ? 1.3 : 1),
      steel_meters: totalArea * 10,
      sand_m3: totalArea * 0.45,
      aggregate_m3: totalArea * 0.35,
      bricks_1000: totalArea * 0.65,
    };

    const materials_co2 = {
      cement: quantities.cement_bags * CO2_FACTORS.cement_bag,
      steel: quantities.steel_meters * CO2_FACTORS.steel_meter,
      sand: quantities.sand_m3 * CO2_FACTORS.sand_m3,
      aggregate: quantities.aggregate_m3 * CO2_FACTORS.aggregate_m3,
      bricks: quantities.bricks_1000 * CO2_FACTORS.brick_1000,
    };
    const materials_total = Object.values(materials_co2).reduce((a, b) => a + b, 0);

    const total_weight_tons = totalArea * 0.8;
    const transport_co2 = total_weight_tons * Number(transport_distance_km) * CO2_FACTORS.transport_km_per_ton;

    const labor_days = totalArea * 17;
    const labor_co2 = labor_days * CO2_FACTORS.skilled_labor_day;

    const total_co2 = materials_total + transport_co2 + labor_co2;

    const breakdown = {
      materials: Object.entries(materials_co2).map(([k, v]) => ({ item: k, co2_kg: Math.round(v) })),
      transport_co2_kg: Math.round(transport_co2),
      labor_co2_kg: Math.round(labor_co2),
    };

    const offset_suggestions = [
      "Plant 200+ trees on or near the property (1 tree absorbs ~22kg CO2/year)",
      "Use compressed stabilized earth blocks instead of fired bricks — saves ~30%",
      "Source materials locally (within 30km) to reduce transport emissions",
      "Install solar panels to offset operational carbon over 20 years",
    ];

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
      offset_suggestions,
    };

    let savedId = null;
    if (save && project_id) {
      const co2PerM2 = totalArea > 0 ? total_co2 / totalArea : 0;

      const saved = await prisma.projectCarbonSummary.upsert({
        where: { projectId: BigInt(project_id) },
        create: {
          projectId: BigInt(project_id),
          totalCo2Kg: Math.round(total_co2),
          co2PerM2: Math.round(co2PerM2 * 100) / 100,
          transportDistanceKm: Number(transport_distance_km),
          notesJson: { breakdown, offset_suggestions },
        },
        update: {
          totalCo2Kg: Math.round(total_co2),
          co2PerM2: Math.round(co2PerM2 * 100) / 100,
          transportDistanceKm: Number(transport_distance_km),
          notesJson: { breakdown, offset_suggestions },
        },
      });
      savedId = saved.id.toString();
    } else if (save && !project_id) {
      return res.status(400).json({ message: "project_id is required to save carbon analysis" });
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
    const summaries = await prisma.projectCarbonSummary.findMany({
      where: { project: { userId: BigInt(req.user.id) } },
      include: { project: { select: { projectName: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const calculations = summaries.map(s => ({
      id: s.id.toString(),
      project_id: s.projectId.toString(),
      project_name: s.project?.projectName || null,
      total_co2_kg: Number(s.totalCo2Kg),
      co2_per_m2: Number(s.co2PerM2),
      transport_distance_km: s.transportDistanceKm ? Number(s.transportDistanceKm) : null,
      created_at: s.createdAt,
    }));

    res.json({ success: true, calculations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch carbon calculations" });
  }
};
