import { marketDataService } from "../../services/marketData.service.js";

export class PricingConfigurationError extends Error {
  constructor(message, readiness) {
    super(message);
    this.name = "PricingConfigurationError";
    this.code = "PRICING_CONFIGURATION_REQUIRED";
    this.statusCode = 409;
    this.readiness = readiness;
  }
}

const LEGACY_SECTION_RATES = Object.freeze({
  FOUNDATION: {
    label: "Substructure & Foundation",
    cost_per_m2: { simple: 65000, standard: 90000, premium: 120000 },
    materials_pct: 0.6,
    labor_pct: 0.35,
    equipment_pct: 0.05,
  },
  STRUCTURE: {
    label: "Structure & Walls",
    cost_per_m2: { simple: 130000, standard: 160000, premium: 210000 },
    materials_pct: 0.58,
    labor_pct: 0.32,
    equipment_pct: 0.1,
  },
  ROOFING: {
    label: "Roofing",
    cost_per_m2: { simple: 25000, standard: 40000, premium: 60000 },
    materials_pct: 0.55,
    labor_pct: 0.4,
    equipment_pct: 0.05,
  },
  FINISHES: {
    label: "Finishes",
    cost_per_m2: { simple: 20000, standard: 35000, premium: 55000 },
    materials_pct: 0.6,
    labor_pct: 0.35,
    equipment_pct: 0.05,
  },
  PLUMBING: {
    label: "Plumbing & Sanitary",
    cost_per_m2: { simple: 12000, standard: 20000, premium: 35000 },
    materials_pct: 0.55,
    labor_pct: 0.4,
    equipment_pct: 0.05,
  },
  ELECTRICAL: {
    label: "Electrical Works",
    cost_per_m2: { simple: 10000, standard: 18000, premium: 30000 },
    materials_pct: 0.5,
    labor_pct: 0.45,
    equipment_pct: 0.05,
  },
  OTHER: {
    label: "External & Other Works",
    cost_per_m2: { simple: 8000, standard: 15000, premium: 25000 },
    materials_pct: 0.55,
    labor_pct: 0.35,
    equipment_pct: 0.1,
  },
});

const BUILDING_TYPES = Object.freeze({
  SIMPLE: {
    label: "Simple/Budget",
    description: "Basic construction, cement blocks, corrugated iron roof",
  },
  STANDARD: {
    label: "Standard",
    description: "Standard construction, tiled roof, plastered walls",
  },
  PREMIUM: {
    label: "Premium/Modern",
    description: "High-spec construction, quality finishes, modern design",
  },
});

function getLegacySectionEstimate(section, totalArea, quality, materialMult, laborMult) {
  const rate = LEGACY_SECTION_RATES[section];
  if (!rate) {
    return null;
  }

  const baseCostPerM2 = rate.cost_per_m2[quality] || rate.cost_per_m2.standard;
  const totalCost = baseCostPerM2 * totalArea;
  const materialsAmt = totalCost * rate.materials_pct * materialMult;
  const laborAmt = totalCost * rate.labor_pct * laborMult;
  const equipmentAmt = totalCost * rate.equipment_pct;
  const sectionTotal = materialsAmt + laborAmt + equipmentAmt;

  return {
    section,
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
    pricing_source: "legacy_fallback",
  };
}

function getCatalogDrivenSections(totalArea, regionId, quality) {
  const sectionOrder = [
    "FOUNDATION",
    "STRUCTURE",
    "ROOFING",
    "FINISHES",
    "PLUMBING",
    "ELECTRICAL",
    "LABOR",
    "OTHER",
  ];

  const sections = [];
  const reviewFlags = [];

  sectionOrder.forEach((section) => {
    const estimate = marketDataService.estimateCategoryFromCatalog(
      section,
      totalArea,
      regionId,
      { quality }
    );

    if (!estimate) {
      return;
    }

    if (estimate.skippedItems.length) {
      reviewFlags.push({
        section,
        reason: "Some pricing rows were skipped because their units do not support automatic takeoff yet.",
        skippedItems: estimate.skippedItems,
      });
    }

    sections.push({
      section,
      label: section.charAt(0) + section.slice(1).toLowerCase(),
      items: estimate.items,
      section_total: Math.round(estimate.total),
      pricing_source: "catalog",
    });
  });

  return { sections, reviewFlags };
}

function assertPricingReadiness(strictPricing) {
  const readiness = marketDataService.getPricingReadiness();

  if (strictPricing && !readiness.ready) {
    throw new PricingConfigurationError(
      "Team-managed pricing is incomplete. Upload catalog items and regional multipliers before generating estimates.",
      readiness
    );
  }

  return readiness;
}

export function generateBOQ({
  area_sqm,
  floors = 1,
  building_quality,
  regionId,
  strictPricing = marketDataService.isStrictPricingEnabled(),
}) {
  const quality = String(building_quality || "standard").toLowerCase();
  const totalArea = Number(area_sqm) * Number(floors);
  const readiness = assertPricingReadiness(strictPricing);
  const materialMult = marketDataService.getRegionalMultiplier(regionId, "materials");
  const laborMult = marketDataService.getRegionalMultiplier(regionId, "labor");
  const transportMult = marketDataService.getRegionalMultiplier(regionId, "transport");
  const permitMult = marketDataService.getRegionalMultiplier(regionId, "overall");

  let sections = [];
  const reviewFlags = [];
  let pricingSource = "legacy_fallback";

  if (marketDataService.hasActiveCatalogPricing()) {
    const catalogResult = getCatalogDrivenSections(totalArea, regionId, quality);
    if (catalogResult.sections.length) {
      sections = catalogResult.sections;
      reviewFlags.push(...catalogResult.reviewFlags);
      pricingSource = "catalog";
    }
  }

  if (!sections.length) {
    sections = Object.keys(LEGACY_SECTION_RATES)
      .map((section) =>
        getLegacySectionEstimate(section, totalArea, quality, materialMult, laborMult)
      )
      .filter(Boolean);

    reviewFlags.push({
      section: "PRICING",
      reason:
        "Live catalog pricing is incomplete, so the estimator used the internal fallback model. Populate cost_catalog_items to switch to team-managed prices.",
    });
  }

  const constructionSubtotal = sections.reduce(
    (sum, section) => sum + Number(section.section_total || 0),
    0
  );
  const transportCost = constructionSubtotal * 0.05 * transportMult;
  const permitCost = constructionSubtotal * 0.03 * permitMult;
  const provisionalCost = constructionSubtotal * 0.02;
  const contingency = constructionSubtotal * 0.1;
  const prelimsTotal = transportCost + permitCost + provisionalCost;
  const grandTotal = constructionSubtotal + prelimsTotal + contingency;

  return {
    building_quality:
      BUILDING_TYPES[quality.toUpperCase()]?.label || BUILDING_TYPES.STANDARD.label,
    area_sqm: Number(area_sqm),
    floors: Number(floors),
    total_area_m2: totalArea,
    pricing_source: pricingSource,
    pricing_readiness: readiness,
    review_flags: reviewFlags,
    region_multipliers: {
      materials: materialMult,
      labor: laborMult,
      transport: transportMult,
      permits: permitMult,
    },
    sections,
    summary: {
      construction_subtotal: Math.round(constructionSubtotal),
      transport: Math.round(transportCost),
      permits: Math.round(permitCost),
      provisional_sums: Math.round(provisionalCost),
      contingency_10pct: Math.round(contingency),
      grand_total: Math.round(grandTotal),
      cost_per_m2: totalArea > 0 ? Math.round(grandTotal / totalArea) : 0,
    },
  };
}

export function checkBudgetFeasibility(
  budget,
  area_sqm,
  floors,
  regionId,
  options = {}
) {
  const qualities = ["simple", "standard", "premium"];
  const results = {};
  const strictPricing =
    options.strictPricing ?? marketDataService.isStrictPricingEnabled();

  for (const quality of qualities) {
    const boq = generateBOQ({
      area_sqm,
      floors,
      building_quality: quality,
      regionId,
      strictPricing,
    });
    const cost = boq.summary.grand_total;

    results[quality] = {
      label: BUILDING_TYPES[quality.toUpperCase()].label,
      description: BUILDING_TYPES[quality.toUpperCase()].description,
      estimated_cost: cost,
      within_budget: budget >= cost,
      budget_gap: budget - cost,
      budget_utilization_pct: budget > 0 ? Math.round((cost / budget) * 100) : 0,
      pricing_source: boq.pricing_source,
    };
  }

  return results;
}
