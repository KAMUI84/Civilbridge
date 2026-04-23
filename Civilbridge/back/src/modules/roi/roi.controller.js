import prisma from "../../config/prisma.js";

// Carbon emission factors (kg CO2e per unit)
const EMISSION_FACTORS = {
  cement: 0.82, steel: 1.85, timber: 0.3, bricks: 0.24, sand: 0.014, aggregate: 0.012,
  electricity: 0.145, diesel: 2.68, truck: 0.8,
};

// Material densities (kg per m³)
const DENSITIES = {
  cement: 1440, steel: 7850, timber: 600, bricks: 1920, sand: 1600, aggregate: 1750,
};

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
      ? Number((total_investment / annual_rental).toFixed(1))
      : null;

    const break_even_months = payback_years ? Math.round(payback_years * 12) : 0;

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
      payback_years,
      break_even_months,
    };

    let savedId = null;
    if (save) {
      if (!project_id) {
        return res.status(400).json({ message: "project_id is required to save ROI analysis" });
      }

      const saved = await prisma.projectROIReport.upsert({
        where: { projectId: BigInt(project_id) },
        create: {
          projectId: BigInt(project_id),
          expectedRentPerMonth: result.monthly_rental,
          expectedSalePrice: result.projected_value || null,
          maintenancePerYear: null,
          vacancyRatePercent: 0,
          roiPercent: result.roi_percent,
          paybackYears: result.payback_years ?? 0,
          breakEvenMonths: result.break_even_months,
        },
        update: {
          expectedRentPerMonth: result.monthly_rental,
          expectedSalePrice: result.projected_value || null,
          vacancyRatePercent: 0,
          roiPercent: result.roi_percent,
          paybackYears: result.payback_years ?? 0,
          breakEvenMonths: result.break_even_months,
        },
      });
      savedId = saved.id.toString();
    }

    res.json({ success: true, calculation_id: savedId, analysis: result });
  } catch (err) {
    console.error("ROI calculation error:", err);
    res.status(500).json({ message: "Failed to calculate ROI" });
  }
};

// ─── POST /api/roi/carbon ─────────────────────────────────────────────────────
export const calculateCarbon = async (req, res) => {
  try {
    const {
      building_type,
      built_area_m2,
      floors = 1,
      materials,
      construction_months,
      equipment_usage,
      transport_distance,
      project_id,
      save = false,
    } = req.body;

    let totalEmissions = 0;
    const breakdown = {};

    if (materials) {
      const materialEmissions = {};
      for (const [material, quantity] of Object.entries(materials)) {
        const factor = EMISSION_FACTORS[material];
        if (factor) {
          const emissions = quantity * factor;
          materialEmissions[material] = emissions;
          totalEmissions += emissions;
        }
      }
      breakdown.materials = materialEmissions;
    }

    if (!materials && building_type && built_area_m2) {
      const estimates = getBuildingTypeEmissions(building_type, built_area_m2, floors);
      breakdown.materials = estimates.materials;
      totalEmissions += estimates.total;
    }

    if (equipment_usage) {
      const equipmentEmissions = {};
      for (const [equipment, hours] of Object.entries(equipment_usage)) {
        const fuelPerHour = getEquipmentFuelConsumption(equipment);
        const emissions = hours * fuelPerHour * EMISSION_FACTORS.diesel;
        equipmentEmissions[equipment] = emissions;
        totalEmissions += emissions;
      }
      breakdown.equipment = equipmentEmissions;
    }

    if (transport_distance && materials) {
      let totalWeight = 0;
      for (const [material, quantity] of Object.entries(materials)) {
        if (DENSITIES[material]) totalWeight += quantity;
      }
      const transportEmissions = (totalWeight / 1000) * transport_distance * EMISSION_FACTORS.truck;
      breakdown.transport = transportEmissions;
      totalEmissions += transportEmissions;
    }

    if (construction_months && built_area_m2) {
      const monthlyEnergyKWh = built_area_m2 * 15;
      const energyEmissions = monthlyEnergyKWh * construction_months * EMISSION_FACTORS.electricity;
      breakdown.energy = energyEmissions;
      totalEmissions += energyEmissions;
    }

    const carbonIntensity = built_area_m2 > 0 ? totalEmissions / built_area_m2 : 0;
    const benchmark = getBenchmarkEmissions(building_type);
    const comparison = benchmark
      ? {
          benchmark,
          actual: carbonIntensity,
          difference: carbonIntensity - benchmark,
          percent_difference: benchmark > 0 ? ((carbonIntensity - benchmark) / benchmark) * 100 : 0,
        }
      : null;

    const analysis = {
      total_emissions: Math.round(totalEmissions),
      carbon_intensity: Math.round(carbonIntensity * 10) / 10,
      built_area_m2: built_area_m2 || 0,
      building_type: building_type || "Unknown",
      breakdown,
      comparison,
    };

    let savedId = null;
    if (save && project_id) {
      const saved = await prisma.projectCarbonSummary.upsert({
        where: { projectId: BigInt(project_id) },
        create: {
          projectId: BigInt(project_id),
          totalCo2Kg: Math.round(totalEmissions),
          co2PerM2: Math.round(carbonIntensity * 10) / 10,
          transportDistanceKm: transport_distance || null,
          notesJson: { breakdown, building_type },
        },
        update: {
          totalCo2Kg: Math.round(totalEmissions),
          co2PerM2: Math.round(carbonIntensity * 10) / 10,
          transportDistanceKm: transport_distance || null,
          notesJson: { breakdown, building_type },
        },
      });
      savedId = saved.id.toString();
    }

    res.json({ success: true, analysis_id: savedId, analysis });
  } catch (err) {
    console.error("Carbon calculation error:", err);
    res.status(500).json({ message: "Failed to calculate carbon emissions" });
  }
};

// ─── GET /api/roi ─────────────────────────────────────────────────────────────
export const getMyROICalculations = async (req, res) => {
  try {
    const reports = await prisma.projectROIReport.findMany({
      where: { project: { userId: BigInt(req.user.id) } },
      include: { project: { select: { projectName: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const calculations = reports.map(r => ({
      id: r.id.toString(),
      project_id: r.projectId.toString(),
      project_name: r.project?.projectName || null,
      expected_rent_per_month: r.expectedRentPerMonth ? Number(r.expectedRentPerMonth) : null,
      expected_sale_price: r.expectedSalePrice ? Number(r.expectedSalePrice) : null,
      roi_percent: Number(r.roiPercent),
      payback_years: Number(r.paybackYears),
      break_even_months: r.breakEvenMonths,
      created_at: r.createdAt,
    }));

    res.json({ success: true, calculations });
  } catch (err) {
    console.error("Get ROI history error:", err);
    res.status(500).json({ message: "Failed to fetch ROI calculations" });
  }
};

// ─── GET /api/roi/carbon ─────────────────────────────────────────────────────
export const getMyCarbonAnalyses = async (req, res) => {
  try {
    const summaries = await prisma.projectCarbonSummary.findMany({
      where: { project: { userId: BigInt(req.user.id) } },
      include: { project: { select: { projectName: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const analyses = summaries.map(s => ({
      id: s.id.toString(),
      project_id: s.projectId.toString(),
      project_name: s.project?.projectName || null,
      total_co2_kg: Number(s.totalCo2Kg),
      co2_per_m2: Number(s.co2PerM2),
      created_at: s.createdAt,
    }));

    res.json({ success: true, analyses });
  } catch (err) {
    console.error("Get carbon history error:", err);
    res.status(500).json({ message: "Failed to fetch carbon analyses" });
  }
};

function getBuildingTypeEmissions(type, area, floors) {
  const baseEmissionsPerM2 = { residential: 300, commercial: 400, industrial: 500, mixed: 350 };
  const base = baseEmissionsPerM2[type] || 350;
  const total = base * area * (1 + (floors - 1) * 0.1);
  const materials = {
    cement: total * 0.3, steel: total * 0.2, timber: total * 0.1,
    bricks: total * 0.15, sand: total * 0.15, aggregate: total * 0.1,
  };
  return { materials, total };
}

function getEquipmentFuelConsumption(equipment) {
  const consumption = { excavator: 15, bulldozer: 18, crane: 12, concrete_mixer: 3, generator: 8 };
  return consumption[equipment] || 5;
}

function getBenchmarkEmissions(type) {
  const benchmarks = { residential: 350, commercial: 450, industrial: 550, mixed: 400 };
  return benchmarks[type];
}
