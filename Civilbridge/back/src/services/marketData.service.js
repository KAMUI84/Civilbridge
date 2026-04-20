import prisma from "../config/prisma.js";

const AREA_UNITS = new Set([
  "m2",
  "m²",
  "sqm",
  "sq_m",
  "square_meter",
  "square_metre",
  "per_m2",
  "per_sqm",
]);

const LABOR_DAY_UNITS = new Set(["day", "days", "man_day", "manday"]);
const LUMP_SUM_UNITS = new Set(["ls", "lumpsum", "lump_sum", "job"]);

const QUALITY_MULTIPLIERS = Object.freeze({
  simple: 0.9,
  standard: 1,
  premium: 1.2,
});

const LABOR_DAYS_PER_M2 = Object.freeze({
  simple: 0.12,
  standard: 0.18,
  premium: 0.24,
});

const REQUIRED_PRICING_CATEGORIES = Object.freeze([
  "FOUNDATION",
  "STRUCTURE",
  "ROOFING",
  "FINISHES",
  "PLUMBING",
  "ELECTRICAL",
  "LABOR",
]);

const REF_PATTERNS = Object.freeze([
  { key: "cement", match: /cement/i },
  { key: "rebar", match: /rebar|reinforcement|steel/i },
  { key: "sand", match: /sand/i },
  { key: "aggregate", match: /aggregate|gravel|stone/i },
  { key: "skilled_labor", match: /skilled/i },
  { key: "unskilled_labor", match: /unskilled/i },
]);

function toNumber(value, fallback = 0) {
  const numeric = Number(value?.toString ? value.toString() : value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeUnit(unit) {
  return String(unit || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizeScope(scope) {
  const value = String(scope || "")
    .trim()
    .toUpperCase();

  if (["MATERIAL", "MATERIALS"].includes(value)) return "MATERIAL";
  if (["LABOR", "LABOUR"].includes(value)) return "LABOR";
  if (["TRANSPORT", "LOGISTICS"].includes(value)) return "TRANSPORT";
  if (["OVERALL", "GENERAL", "PERMITS", "PERMIT"].includes(value)) return "OVERALL";
  return value || "OVERALL";
}

function activeToday(multiplier) {
  const today = new Date();
  const activeFrom = multiplier.activeFrom ? new Date(multiplier.activeFrom) : null;
  const activeTo = multiplier.activeTo ? new Date(multiplier.activeTo) : null;

  if (activeFrom && activeFrom > today) return false;
  if (activeTo && activeTo < today) return false;
  return true;
}

function getQualityMultiplier(buildingQuality) {
  const quality = String(buildingQuality || "standard").trim().toLowerCase();
  return QUALITY_MULTIPLIERS[quality] || QUALITY_MULTIPLIERS.standard;
}

function getLaborDaysPerM2(buildingQuality) {
  const quality = String(buildingQuality || "standard").trim().toLowerCase();
  return LABOR_DAYS_PER_M2[quality] || LABOR_DAYS_PER_M2.standard;
}

function buildCatalogAlias(item) {
  const raw = `${item.code || ""} ${item.name || ""}`;
  const hit = REF_PATTERNS.find((entry) => entry.match.test(raw));
  return hit?.key || "";
}

class MarketDataService {
  constructor() {
    this.regions = new Map();
    this.materials = new Map();
    this.materialsByCode = new Map();
    this.materialsByAlias = new Map();
    this.laborRates = new Map();
    this.liveRegionSummary = {
      count: 0,
      activeMultiplierCount: 0,
      loadedAt: null,
    };
    this.liveCatalogSummary = {
      count: 0,
      byCategory: {},
      loadedAt: null,
    };

    this.addFallbackRegions();
    this.addFallbackMaterials();
    this.rebuildLaborRates();

    this.ready = this.initializeData();
  }

  async initializeData() {
    try {
      await Promise.all([this.loadRegions(), this.loadMaterials()]);
    } catch (error) {
      console.error("Error initializing market data from database:", error);
    }
  }

  async refresh() {
    await this.initializeData();
  }

  async ensureReady() {
    await this.ready;
  }

  async loadRegions() {
    try {
      const rows = await prisma.region.findMany({
        include: {
          multipliers: true,
        },
        orderBy: { id: "asc" },
      });

      const activeMultiplierCount = rows.reduce(
        (count, region) => count + region.multipliers.filter(activeToday).length,
        0
      );
      this.liveRegionSummary = {
        count: rows.length,
        activeMultiplierCount,
        loadedAt: new Date().toISOString(),
      };

      if (!rows.length) {
        console.warn("No live regions found; keeping fallback region data.");
        return;
      }

      this.regions.clear();
      rows.forEach((region) => {
        const multipliers = {
          material: 1,
          labor: 1,
          transport: 1,
          overall: 1,
        };

        region.multipliers
          .filter(activeToday)
          .sort((left, right) => new Date(right.activeFrom) - new Date(left.activeFrom))
          .forEach((entry) => {
            const scope = normalizeScope(entry.scope).toLowerCase();
            if (!(scope in multipliers)) {
              return;
            }
            if (multipliers[scope] === 1) {
              multipliers[scope] = toNumber(entry.multiplier, 1);
            }
          });

        this.regions.set(Number(region.id), {
          id: Number(region.id),
          name: region.name,
          province: region.name,
          country: region.country,
          currency: region.currency,
          multipliers,
        });
      });
    } catch (error) {
      console.error("Error loading regions:", error);
    }
  }

  addFallbackRegions() {
    const fallbackRegions = [
      {
        id: 1,
        name: "Kigali",
        province: "Kigali",
        country: "Rwanda",
        currency: "RWF",
        multipliers: { material: 1.0, labor: 1.2, transport: 1.1, overall: 1.0 },
      },
      {
        id: 2,
        name: "Northern",
        province: "Northern",
        country: "Rwanda",
        currency: "RWF",
        multipliers: { material: 0.9, labor: 0.8, transport: 1.3, overall: 0.95 },
      },
      {
        id: 3,
        name: "Southern",
        province: "Southern",
        country: "Rwanda",
        currency: "RWF",
        multipliers: { material: 0.85, labor: 0.7, transport: 1.4, overall: 0.92 },
      },
      {
        id: 4,
        name: "Eastern",
        province: "Eastern",
        country: "Rwanda",
        currency: "RWF",
        multipliers: { material: 0.8, labor: 0.75, transport: 1.2, overall: 0.9 },
      },
      {
        id: 5,
        name: "Western",
        province: "Western",
        country: "Rwanda",
        currency: "RWF",
        multipliers: { material: 0.9, labor: 0.8, transport: 1.5, overall: 0.96 },
      },
    ];

    fallbackRegions.forEach((region) => {
      this.regions.set(region.id, region);
    });
  }

  async loadMaterials() {
    try {
      const rows = await prisma.costCatalogItem.findMany({
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { code: "asc" }],
      });

      const byCategory = rows.reduce((accumulator, item) => {
        const category = String(item.category || "").toUpperCase();
        accumulator[category] = (accumulator[category] || 0) + 1;
        return accumulator;
      }, {});
      this.liveCatalogSummary = {
        count: rows.length,
        byCategory,
        loadedAt: new Date().toISOString(),
      };

      if (!rows.length) {
        console.warn("No live pricing catalog rows found; keeping fallback catalog data.");
        return;
      }

      this.materials.clear();
      this.materialsByCode.clear();
      this.materialsByAlias.clear();

      rows.forEach((item) => {
        const normalized = {
          id: Number(item.id),
          code: item.code,
          name: item.name,
          category: item.category,
          unit: item.unit,
          normalizedUnit: normalizeUnit(item.unit),
          base_unit_cost: toNumber(item.baseUnitCost),
          base_price_rwf: toNumber(item.baseUnitCost),
          default_wastage_percent: toNumber(item.defaultWastagePercent),
          is_active: Boolean(item.isActive),
          created_at: item.createdAt,
          updated_at: item.updatedAt,
        };

        this.materials.set(normalized.id, normalized);
        this.materialsByCode.set(String(normalized.code).toLowerCase(), normalized);

        const alias = buildCatalogAlias(normalized);
        if (alias && !this.materialsByAlias.has(alias)) {
          this.materialsByAlias.set(alias, normalized);
        }
      });

      this.rebuildLaborRates();
    } catch (error) {
      console.error("Error loading pricing catalog:", error);
    }
  }

  addFallbackMaterials() {
    const fallbackMaterials = [
      {
        id: 1,
        code: "CEMENT_BAG_50KG",
        name: "Cement (50kg bag)",
        category: "FOUNDATION",
        unit: "bag",
        normalizedUnit: "bag",
        base_unit_cost: 8500,
        base_price_rwf: 8500,
        default_wastage_percent: 0,
        is_active: true,
      },
      {
        id: 2,
        code: "REBAR_12MM",
        name: "Steel Reinforcement (12mm)",
        category: "STRUCTURE",
        unit: "meter",
        normalizedUnit: "meter",
        base_unit_cost: 3500,
        base_price_rwf: 3500,
        default_wastage_percent: 0,
        is_active: true,
      },
      {
        id: 3,
        code: "SAND_M3",
        name: "Sand (per m3)",
        category: "FOUNDATION",
        unit: "m3",
        normalizedUnit: "m3",
        base_unit_cost: 25000,
        base_price_rwf: 25000,
        default_wastage_percent: 0,
        is_active: true,
      },
      {
        id: 4,
        code: "AGGREGATE_M3",
        name: "Aggregate (per m3)",
        category: "FOUNDATION",
        unit: "m3",
        normalizedUnit: "m3",
        base_unit_cost: 28000,
        base_price_rwf: 28000,
        default_wastage_percent: 0,
        is_active: true,
      },
      {
        id: 5,
        code: "SKILLED_LABOR_DAY",
        name: "Skilled Labor (per day)",
        category: "LABOR",
        unit: "day",
        normalizedUnit: "day",
        base_unit_cost: 8000,
        base_price_rwf: 8000,
        default_wastage_percent: 0,
        is_active: true,
      },
      {
        id: 6,
        code: "UNSKILLED_LABOR_DAY",
        name: "Unskilled Labor (per day)",
        category: "LABOR",
        unit: "day",
        normalizedUnit: "day",
        base_unit_cost: 4000,
        base_price_rwf: 4000,
        default_wastage_percent: 0,
        is_active: true,
      },
    ];

    fallbackMaterials.forEach((item) => {
      this.materials.set(item.id, item);
      this.materialsByCode.set(item.code.toLowerCase(), item);

      const alias = buildCatalogAlias(item);
      if (alias && !this.materialsByAlias.has(alias)) {
        this.materialsByAlias.set(alias, item);
      }
    });
  }

  rebuildLaborRates() {
    this.laborRates.clear();

    Array.from(this.materials.values())
      .filter((item) => item.category === "LABOR")
      .forEach((labor) => {
        const key = buildCatalogAlias(labor) || labor.code?.toLowerCase() || String(labor.id);
        this.laborRates.set(key, {
          itemId: labor.id,
          daily_rate: labor.base_unit_cost,
          hourly_rate: labor.base_unit_cost / 8,
        });
      });
  }

  resolveCatalogItem(ref, options = {}) {
    const category = options.category ? String(options.category).toUpperCase() : "";

    if (typeof ref === "number" && this.materials.has(ref)) {
      const byId = this.materials.get(ref);
      return !category || byId.category === category ? byId : null;
    }

    const needle = String(ref || "").trim().toLowerCase();
    if (!needle) {
      return null;
    }

    const exactCode = this.materialsByCode.get(needle);
    if (exactCode && (!category || exactCode.category === category)) {
      return exactCode;
    }

    const exactAlias = this.materialsByAlias.get(needle);
    if (exactAlias && (!category || exactAlias.category === category)) {
      return exactAlias;
    }

    const patternAlias = REF_PATTERNS.find((entry) => entry.match.test(needle))?.key;
    if (patternAlias) {
      const aliasHit = this.materialsByAlias.get(patternAlias);
      if (aliasHit && (!category || aliasHit.category === category)) {
        return aliasHit;
      }
    }

    return Array.from(this.materials.values()).find((item) => {
      if (category && item.category !== category) return false;
      const haystack = `${item.code} ${item.name}`.toLowerCase();
      return haystack.includes(needle);
    }) || null;
  }

  getCatalogItemsByCategory(category) {
    const target = String(category || "").toUpperCase();
    return Array.from(this.materials.values()).filter((item) => item.category === target);
  }

  hasActiveCatalogPricing(minCategories = 4) {
    const categories = new Set(
      Array.from(this.materials.values())
        .filter((item) => AREA_UNITS.has(item.normalizedUnit) || item.category === "LABOR")
        .map((item) => item.category)
    );

    return categories.size >= minCategories;
  }

  isStrictPricingEnabled() {
    return String(process.env.PRICING_STRICT_MODE || "true").toLowerCase() !== "false";
  }

  getPricingReadiness() {
    const byCategory = this.liveCatalogSummary.byCategory || {};
    const availableCategories = Object.keys(byCategory).filter((category) => byCategory[category] > 0);
    const missingRequiredCategories = REQUIRED_PRICING_CATEGORIES.filter(
      (category) => !byCategory[category]
    );

    return {
      strictMode: this.isStrictPricingEnabled(),
      ready: missingRequiredCategories.length === 0 && this.liveCatalogSummary.count > 0,
      requiredCategories: REQUIRED_PRICING_CATEGORIES,
      availableCategories,
      missingRequiredCategories,
      liveCatalogItemCount: this.liveCatalogSummary.count,
      liveCatalogItemsByCategory: byCategory,
      liveRegionCount: this.liveRegionSummary.count,
      activeRegionMultiplierCount: this.liveRegionSummary.activeMultiplierCount,
      lastCatalogLoadAt: this.liveCatalogSummary.loadedAt,
      lastRegionLoadAt: this.liveRegionSummary.loadedAt,
    };
  }

  getRegionalMultiplier(regionId, scope) {
    const region = this.regions.get(Number(regionId));
    if (!region?.multipliers) {
      return 1;
    }

    const normalized = normalizeScope(scope).toLowerCase();
    return region.multipliers[normalized] ?? 1;
  }

  getAdjustedUnitPrice(ref, regionId, scope = null) {
    const item = typeof ref === "object" ? ref : this.resolveCatalogItem(ref);
    if (!item) {
      return 0;
    }

    const normalizedScope = normalizeScope(scope || (item.category === "LABOR" ? "LABOR" : "MATERIAL"));
    const directMultiplier = this.getRegionalMultiplier(regionId, normalizedScope);
    const overallMultiplier = this.getRegionalMultiplier(regionId, "OVERALL");

    return item.base_unit_cost * directMultiplier * overallMultiplier;
  }

  getAdjustedPrice(ref, regionId, quantity = 1, scope = null) {
    return this.getAdjustedUnitPrice(ref, regionId, scope) * Number(quantity || 0);
  }

  estimateCategoryFromCatalog(category, totalArea, regionId, options = {}) {
    const buildingQuality = options.building_quality || options.quality || "standard";
    const qualityMultiplier = getQualityMultiplier(buildingQuality);
    const laborDaysPerM2 = getLaborDaysPerM2(buildingQuality);
    const catalogItems = this.getCatalogItemsByCategory(category);

    const supportedItems = [];
    const skippedItems = [];

    catalogItems.forEach((item) => {
      let quantity = null;

      if (AREA_UNITS.has(item.normalizedUnit)) {
        quantity = totalArea;
      } else if (item.category === "LABOR" && LABOR_DAY_UNITS.has(item.normalizedUnit)) {
        quantity = totalArea * laborDaysPerM2;
      } else if (LUMP_SUM_UNITS.has(item.normalizedUnit)) {
        quantity = 1;
      }

      if (!quantity) {
        skippedItems.push({
          code: item.code,
          name: item.name,
          unit: item.unit,
          reason: "Unsupported unit for automatic quantity takeoff",
        });
        return;
      }

      const wastageMultiplier = 1 + (item.default_wastage_percent || 0) / 100;
      const unitRate = this.getAdjustedUnitPrice(
        item,
        regionId,
        item.category === "LABOR" ? "LABOR" : "MATERIAL"
      ) * qualityMultiplier;
      const lineTotal = unitRate * quantity * wastageMultiplier;

      supportedItems.push({
        code: item.code,
        description: item.name,
        unit: item.unit,
        quantity: Number(quantity.toFixed(2)),
        unit_rate: Math.round(unitRate),
        amount: Math.round(lineTotal),
      });
    });

    if (!supportedItems.length) {
      return null;
    }

    return {
      items: supportedItems,
      skippedItems,
      total: supportedItems.reduce((sum, item) => sum + item.amount, 0),
    };
  }

  async getMaterialsByCategory(category) {
    return this.getCatalogItemsByCategory(category).map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      unit: item.unit,
      base_price_rwf: item.base_price_rwf,
      specifications: {
        category: item.category,
        wastage_percent: item.default_wastage_percent,
      },
    }));
  }

  async calculateRegionalCosts(regionId, materials) {
    const costs = {};

    for (const material of materials) {
      const ref = material.ref ?? material.id ?? material.code ?? material.name;
      const quantity = Number(material.quantity || 1);
      const catalogItem = this.resolveCatalogItem(ref);
      const adjustedPrice = this.getAdjustedPrice(ref, regionId, quantity);

      costs[String(ref)] = {
        name: catalogItem?.name || "Unknown",
        unit_price: this.getAdjustedPrice(ref, regionId, 1),
        quantity,
        total_cost: adjustedPrice,
      };
    }

    return costs;
  }

  async getMarketTrends(regionId, category = null) {
    const scope = String(category || "").trim().toLowerCase();
    let items = Array.from(this.materials.values());

    if (scope === "labor") {
      items = items.filter((item) => item.category === "LABOR");
    } else if (scope === "materials") {
      items = items.filter((item) => item.category !== "LABOR");
    } else if (scope) {
      items = items.filter((item) => item.category.toLowerCase() === scope);
    }

    if (!items.length) {
      return [];
    }

    const average = items.reduce(
      (sum, item) => sum + this.getAdjustedUnitPrice(item, regionId),
      0
    ) / items.length;

    return [
      {
        date: new Date().toISOString().slice(0, 10),
        avg_price: Number(average.toFixed(2)),
        data_points: items.length,
      },
    ];
  }

  async updateMaterialPrice(materialRef, newPrice) {
    try {
      const item = this.resolveCatalogItem(materialRef);
      if (!item) {
        return false;
      }

      await prisma.costCatalogItem.update({
        where: { id: BigInt(item.id) },
        data: { baseUnitCost: Number(newPrice) },
      });

      await this.loadMaterials();
      return true;
    } catch (error) {
      console.error("Error updating material price:", error);
      return false;
    }
  }

  getRegionInfo(regionId) {
    return this.regions.get(Number(regionId)) || null;
  }

  getAllRegions() {
    return Array.from(this.regions.values());
  }

  getAllMaterials() {
    return Array.from(this.materials.values());
  }
}

export const marketDataService = new MarketDataService();
