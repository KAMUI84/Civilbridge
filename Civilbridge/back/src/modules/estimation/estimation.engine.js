import { pool } from "../../config/db.js";
import { marketDataService } from "../../services/marketData.service.js";

/**
 * CivilBridge Estimation Engine
 * Generates full BOQ (Bill of Quantities) for a construction project.
 * Based on Rwanda market rates and regional multipliers.
 */

// ─── Construction Cost Rates per m² ──────────────────────────────────────────
const CONSTRUCTION_RATES = {
    FOUNDATION: {
        label: "Substructure & Foundation",
        cost_per_m2: { simple: 45000, standard: 65000, premium: 90000 },
        materials_pct: 0.60,
        labor_pct: 0.35,
        equipment_pct: 0.05,
    },
    STRUCTURE: {
        label: "Superstructure (Columns, Beams, Slabs)",
        cost_per_m2: { simple: 80000, standard: 110000, premium: 150000 },
        materials_pct: 0.55,
        labor_pct: 0.35,
        equipment_pct: 0.10,
    },
    MASONRY: {
        label: "Masonry (Walls, Partitions)",
        cost_per_m2: { simple: 35000, standard: 50000, premium: 65000 },
        materials_pct: 0.65,
        labor_pct: 0.30,
        equipment_pct: 0.05,
    },
    ROOFING: {
        label: "Roofing",
        cost_per_m2: { simple: 25000, standard: 40000, premium: 60000 },
        materials_pct: 0.55,
        labor_pct: 0.40,
        equipment_pct: 0.05,
    },
    FINISHING: {
        label: "Internal Finishes (Plaster, Tiles, Paint)",
        cost_per_m2: { simple: 20000, standard: 35000, premium: 55000 },
        materials_pct: 0.60,
        labor_pct: 0.35,
        equipment_pct: 0.05,
    },
    PLUMBING: {
        label: "Plumbing & Sanitary",
        cost_per_m2: { simple: 12000, standard: 20000, premium: 35000 },
        materials_pct: 0.55,
        labor_pct: 0.40,
        equipment_pct: 0.05,
    },
    ELECTRICAL: {
        label: "Electrical Works",
        cost_per_m2: { simple: 10000, standard: 18000, premium: 30000 },
        materials_pct: 0.50,
        labor_pct: 0.45,
        equipment_pct: 0.05,
    },
    EXTERNAL: {
        label: "External Works (Compound, Gate, Drainage)",
        cost_per_m2: { simple: 8000, standard: 15000, premium: 25000 },
        materials_pct: 0.55,
        labor_pct: 0.35,
        equipment_pct: 0.10,
    },
};

// ─── Building type descriptions ───────────────────────────────────────────────
const BUILDING_TYPES = {
    SIMPLE: { label: "Simple/Budget", description: "Basic construction, cement blocks, corrugated iron roof" },
    STANDARD: { label: "Standard", description: "Standard construction, tiled roof, plastered walls" },
    PREMIUM: { label: "Premium/Modern", description: "High-spec construction, quality finishes, modern design" },
};

// ─── Core Estimation Function ─────────────────────────────────────────────────
export function generateBOQ({ area_sqm, floors = 1, building_quality, regionId }) {
    const quality = building_quality?.toLowerCase() || "standard";
    const totalArea = Number(area_sqm) * Number(floors);
    const materialMult = marketDataService.getRegionalMultiplier(regionId, "materials");
    const laborMult = marketDataService.getRegionalMultiplier(regionId, "labor");
    const transportMult = marketDataService.getRegionalMultiplier(regionId, "transport");
    const permitMult = marketDataService.getRegionalMultiplier(regionId, "permits");

    const sections = [];
    let subtotal = 0;

    for (const [key, rate] of Object.entries(CONSTRUCTION_RATES)) {
        const baseCostPerM2 = rate.cost_per_m2[quality] || rate.cost_per_m2.standard;
        const totalCost = baseCostPerM2 * totalArea;

        const materialsAmt = totalCost * rate.materials_pct * materialMult;
        const laborAmt = totalCost * rate.labor_pct * laborMult;
        const equipmentAmt = totalCost * rate.equipment_pct;

        const sectionTotal = materialsAmt + laborAmt + equipmentAmt;
        subtotal += sectionTotal;

        sections.push({
            section: key,
            label: rate.label,
            items: [
                {
                    description: "Materials",
                    unit: "lumpsum",
                    quantity: 1,
                    unit_rate: Math.round(materialsAmt),
                    amount: Math.round(materialsAmt),
                },
                {
                    description: "Labour",
                    unit: "lumpsum",
                    quantity: 1,
                    unit_rate: Math.round(laborAmt),
                    amount: Math.round(laborAmt),
                },
                {
                    description: "Equipment/Machinery",
                    unit: "lumpsum",
                    quantity: 1,
                    unit_rate: Math.round(equipmentAmt),
                    amount: Math.round(equipmentAmt),
                },
            ],
            section_total: Math.round(sectionTotal),
        });
    }

    const transportCost = subtotal * 0.05 * transportMult;
    const permitCost = subtotal * 0.03 * permitMult;
    const provisioncost = subtotal * 0.02;
    const contingency = subtotal * 0.10;

    const prelimsTotal = transportCost + permitCost + provisioncost;
    const grandTotal = subtotal + prelimsTotal + contingency;

    return {
        building_quality: BUILDING_TYPES[quality.toUpperCase()]?.label || "Standard",
        area_sqm: Number(area_sqm),
        floors: Number(floors),
        total_area_m2: totalArea,
        region_multipliers: { materials: materialMult, labor: laborMult, transport: transportMult, permits: permitMult },
        sections,
        summary: {
            construction_subtotal: Math.round(subtotal),
            transport: Math.round(transportCost),
            permits: Math.round(permitCost),
            provisional_sums: Math.round(provisioncost),
            contingency_10pct: Math.round(contingency),
            grand_total: Math.round(grandTotal),
            cost_per_m2: Math.round(grandTotal / totalArea),
        },
    };
}

// ─── Budget Feasibility Check ─────────────────────────────────────────────────
export function checkBudgetFeasibility(budget, area_sqm, floors, regionId) {
    const qualities = ["simple", "standard", "premium"];
    const results = {};

    for (const quality of qualities) {
        const boq = generateBOQ({ area_sqm, floors, building_quality: quality, regionId });
        const cost = boq.summary.grand_total;
        results[quality] = {
            label: BUILDING_TYPES[quality.toUpperCase()].label,
            description: BUILDING_TYPES[quality.toUpperCase()].description,
            estimated_cost: cost,
            within_budget: budget >= cost,
            budget_gap: budget - cost,
            budget_utilization_pct: Math.round((cost / budget) * 100),
        };
    }

    return results;
}
