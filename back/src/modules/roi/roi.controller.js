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
            const saved = await prisma.rOIAnalysis.create({
                data: {
                    userId: BigInt(req.user.id),
                    projectId: project_id ? BigInt(project_id) : null,
                    landCost: result.land_cost,
                    constructionCost: result.construction_cost,
                    otherCosts: result.other_costs,
                    totalInvestment: result.total_investment,
                    projectedValue: result.projected_value,
                    monthlyRental: result.monthly_rental,
                    expectedYears: result.expected_years,
                    roiPercent: result.roi_percent,
                    paybackYears: result.payback_years,
                    notes: notes || null,
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

// ─── POST /api/roi/carbon ───────────────────────────────────────────────────
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
            save = false,
        } = req.body;

        let totalEmissions = 0;
        const breakdown = {};

        // Calculate material emissions
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

        // Estimate emissions based on building type and area if no materials provided
        if (!materials && building_type && built_area_m2) {
            const estimates = getBuildingTypeEmissions(building_type, built_area_m2, floors);
            breakdown.materials = estimates.materials;
            totalEmissions += estimates.total;
        }

        // Construction equipment emissions
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

        // Transport emissions
        if (transport_distance && materials) {
            let totalWeight = 0;
            for (const [material, quantity] of Object.entries(materials)) {
                const density = DENSITIES[material];
                if (density) {
                    totalWeight += quantity;
                }
            }
            const transportEmissions = (totalWeight / 1000) * transport_distance * EMISSION_FACTORS.truck;
            breakdown.transport = transportEmissions;
            totalEmissions += transportEmissions;
        }

        // Energy consumption during construction
        if (construction_months && built_area_m2) {
            const monthlyEnergyKWh = built_area_m2 * 15;
            const totalEnergyKWh = monthlyEnergyKWh * construction_months;
            const energyEmissions = totalEnergyKWh * EMISSION_FACTORS.electricity;
            breakdown.energy = energyEmissions;
            totalEmissions += energyEmissions;
        }

        const carbonIntensity = built_area_m2 > 0 ? totalEmissions / built_area_m2 : 0;
        const benchmark = getBenchmarkEmissions(building_type);
        const comparison = benchmark ? {
            benchmark,
            actual: carbonIntensity,
            difference: carbonIntensity - benchmark,
            percent_difference: benchmark > 0 ? ((carbonIntensity - benchmark) / benchmark) * 100 : 0,
        } : null;

        const analysis = {
            total_emissions: Math.round(totalEmissions),
            carbon_intensity: Math.round(carbonIntensity * 10) / 10,
            built_area_m2: built_area_m2 || 0,
            building_type: building_type || 'Unknown',
            breakdown,
            comparison,
        };

        let savedId = null;
        if (save) {
            const saved = await prisma.carbonAnalysis.create({
                data: {
                    userId: BigInt(req.user.id),
                    buildingType: building_type || null,
                    builtAreaM2: built_area_m2 || 0,
                    totalEmissions: Math.round(totalEmissions),
                    carbonIntensity: Math.round(carbonIntensity * 10) / 10,
                    breakdown: JSON.stringify(breakdown),
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
        const calculations = await prisma.rOIAnalysis.findMany({
            where: { userId: BigInt(req.user.id) },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        res.json({ success: true, calculations });
    } catch (err) {
        console.error("Get ROI history error:", err);
        res.status(500).json({ message: "Failed to fetch ROI calculations" });
    }
};

// ─── GET /api/roi/carbon ─────────────────────────────────────────────────────
export const getMyCarbonAnalyses = async (req, res) => {
    try {
        const analyses = await prisma.carbonAnalysis.findMany({
            where: { userId: BigInt(req.user.id) },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        res.json({ success: true, analyses });
    } catch (err) {
        console.error("Get carbon history error:", err);
        res.status(500).json({ message: "Failed to fetch carbon analyses" });
    }
};

// Helper functions
function getBuildingTypeEmissions(type, area, floors) {
    const baseEmissionsPerM2 = {
        residential: 300, commercial: 400, industrial: 500, mixed: 350,
    };
    const base = baseEmissionsPerM2[type] || 350;
    const total = base * area * (1 + (floors - 1) * 0.1);
    const materials = {
        cement: total * 0.3, steel: total * 0.2, timber: total * 0.1,
        bricks: total * 0.15, sand: total * 0.15, aggregate: total * 0.1,
    };
    return { materials, total };
}

function getEquipmentFuelConsumption(equipment) {
    const consumption = {
        excavator: 15, bulldozer: 18, crane: 12, concrete_mixer: 3, generator: 8,
    };
    return consumption[equipment] || 5;
}

function getBenchmarkEmissions(type) {
    const benchmarks = {
        residential: 350, commercial: 450, industrial: 550, mixed: 400,
    };
    return benchmarks[type];
}
