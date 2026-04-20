/**
 * Admin Analytics controllers
 * All endpoints require ADMIN or SUPER_ADMIN role (enforced in admin.routes.js).
 *
 * Routes:
 *   GET  /api/v1/admin/analytics              — overview (users, projects, revenue)
 *   GET  /api/v1/admin/analytics/regional     — regional heatmap
 *   GET  /api/v1/admin/analytics/experts      — expert performance
 *   GET  /api/v1/admin/analytics/platform-health — error rate, uptime
 *   POST /api/v1/admin/cost-benchmarks        — upsert cost per sqm benchmark
 *   GET  /api/v1/admin/cost-benchmarks        — list benchmarks
 */

import prisma from "../../config/prisma.js";
import logger from "../../config/logger.js";
import { marketDataService } from "../../services/marketData.service.js";
import {
  buildBenchmarkSnapshot,
  enrichBenchmarksWithHistory,
} from "./cost-benchmark.service.js";

// Track server start time for uptime calculation
const SERVER_START = Date.now();

const VALID_BOQ_CATEGORIES = Object.freeze([
  "FOUNDATION",
  "STRUCTURE",
  "ROOFING",
  "FINISHES",
  "PLUMBING",
  "ELECTRICAL",
  "LABOR",
  "OTHER",
]);

const VALID_MULTIPLIER_SCOPES = Object.freeze([
  "MATERIAL",
  "LABOR",
  "TRANSPORT",
  "OVERALL",
]);

function normalizeEnum(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function normalizeText(value, maxLength, fallback = null) {
  if (value == null || value === "") {
    return fallback;
  }

  return String(value).trim().slice(0, maxLength);
}

function toPositiveNumber(value, fieldName) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }
  return numeric;
}

function toNonNegativeNumber(value, fieldName, fallback = 0) {
  if (value == null || value === "") {
    return fallback;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new Error(`${fieldName} must be zero or greater`);
  }
  return numeric;
}

function toDateOnly(value, fieldName) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }

  return new Date(date.toISOString().slice(0, 10));
}

function buildRegionLookup(regions) {
  const byId = new Map();
  const byName = new Map();

  regions.forEach((region) => {
    const id = Number(region.id);
    const normalizedName = String(region.name || "").trim().toLowerCase();
    byId.set(id, region);
    byName.set(normalizedName, region);
  });

  return { byId, byName };
}

function normalizeCatalogItem(row, index) {
  const category = normalizeEnum(row.category);
  if (!VALID_BOQ_CATEGORIES.includes(category)) {
    throw new Error(
      `catalogItems[${index}].category must be one of ${VALID_BOQ_CATEGORIES.join(", ")}`
    );
  }

  return {
    code: normalizeText(row.code, 60),
    name: normalizeText(row.name, 190),
    category,
    unit: normalizeText(row.unit, 40),
    baseUnitCost: toPositiveNumber(
      row.baseUnitCost ?? row.base_unit_cost,
      `catalogItems[${index}].baseUnitCost`
    ),
    defaultWastagePercent: toNonNegativeNumber(
      row.defaultWastagePercent ?? row.default_wastage_percent,
      `catalogItems[${index}].defaultWastagePercent`
    ),
    isActive: row.isActive == null ? true : Boolean(row.isActive),
  };
}

function normalizeMultiplier(row, index, regionLookup) {
  const scope = normalizeEnum(row.scope);
  if (!VALID_MULTIPLIER_SCOPES.includes(scope)) {
    throw new Error(
      `regionMultipliers[${index}].scope must be one of ${VALID_MULTIPLIER_SCOPES.join(", ")}`
    );
  }

  let region = null;
  if (row.regionId != null && row.regionId !== "") {
    region = regionLookup.byId.get(Number(row.regionId));
  } else if (row.regionName) {
    region = regionLookup.byName.get(String(row.regionName).trim().toLowerCase());
  }

  if (!region) {
    throw new Error(
      `regionMultipliers[${index}] must reference an existing region by regionId or regionName`
    );
  }

  const activeFrom = toDateOnly(row.activeFrom, `regionMultipliers[${index}].activeFrom`);
  const activeTo = row.activeTo
    ? toDateOnly(row.activeTo, `regionMultipliers[${index}].activeTo`)
    : null;

  if (activeTo && activeTo < activeFrom) {
    throw new Error(`regionMultipliers[${index}].activeTo cannot be before activeFrom`);
  }

  return {
    regionId: Number(region.id),
    regionName: region.name,
    scope,
    multiplier: toPositiveNumber(row.multiplier, `regionMultipliers[${index}].multiplier`),
    activeFrom,
    activeTo,
  };
}

function normalizeBenchmark(row, index) {
  const province = normalizeText(row.province, 120);
  const district = normalizeText(row.district, 120, "") ?? "";
  const buildingType = normalizeText(row.buildingType, 60);
  const minCostPerM2 = toPositiveNumber(
    row.minCostPerM2 ?? row.min_cost_per_m2,
    `costBenchmarks[${index}].minCostPerM2`
  );
  const maxCostPerM2 = toPositiveNumber(
    row.maxCostPerM2 ?? row.max_cost_per_m2,
    `costBenchmarks[${index}].maxCostPerM2`
  );

  if (!province || !buildingType) {
    throw new Error(
      `costBenchmarks[${index}] requires province and buildingType`
    );
  }

  if (minCostPerM2 > maxCostPerM2) {
    throw new Error(`costBenchmarks[${index}].minCostPerM2 must be less than or equal to maxCostPerM2`);
  }

  return {
    province,
    district,
    buildingType,
    minCostPerM2,
    maxCostPerM2,
    currency: normalizeText(row.currency, 20, "RWF") || "RWF",
    notes: normalizeText(row.notes, 255),
  };
}

// ─── GET /api/v1/admin/analytics ────────────────────────────────────────────
export async function getAnalyticsOverview(req, res) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsersThisWeek,
      newUsersThisMonth,
      verifiedUsers,
      roleBreakdown,
      totalProjects,
      projectsByStatus,
      projectsByType,
      revenueByProvider,
      revenueTotal,
      transactionsByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.project.count(),
      prisma.project.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.project.groupBy({
        by: ["projectType"],
        _count: { id: true },
      }),
      prisma.transaction.groupBy({
        by: ["provider"],
        _sum:   { amount: true },
        _count: { id: true },
        where:  { status: "CONFIRMED" },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: "CONFIRMED" },
      }),
      prisma.transaction.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      users: {
        total:          totalUsers,
        active:         activeUsers,
        verified:       verifiedUsers,
        newThisWeek:    newUsersThisWeek,
        newThisMonth:   newUsersThisMonth,
        byRole:         roleBreakdown.map((r) => ({ role: r.role, count: r._count.id })),
      },
      projects: {
        total:    totalProjects,
        byStatus: projectsByStatus.map((s) => ({ status: s.status, count: s._count.id })),
        byType:   projectsByType.map((t) => ({ type: t.projectType, count: t._count.id })),
      },
      revenue: {
        totalConfirmedRWF: revenueTotal._sum.amount ?? 0,
        byProvider:        revenueByProvider.map((p) => ({
          provider:   p.provider,
          total:      p._sum.amount ?? 0,
          txCount:    p._count.id,
        })),
        byStatus: transactionsByStatus.map((s) => ({ status: s.status, count: s._count.id })),
      },
    });
  } catch (err) {
    logger.error("Analytics overview error", { err: err.message });
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
}

// ─── GET /api/v1/admin/analytics/regional ───────────────────────────────────
export async function getRegionalAnalytics(req, res) {
  try {
    const [regions, projectsByRegion, usersByRegion] = await Promise.all([
      prisma.region.findMany({ select: { id: true, name: true } }),
      prisma.project.groupBy({
        by: ["regionId"],
        _count: { id: true },
      }),
      prisma.user.groupBy({
        by: ["regionId"],
        _count: { id: true },
        where: { regionId: { not: null } },
      }),
    ]);

    // Build a lookup map
    const regionMap = Object.fromEntries(regions.map((r) => [r.id.toString(), r.name]));

    const merge = (byRegion, countKey) =>
      byRegion.map((row) => {
        const rid = row.regionId?.toString() ?? "null";
        return {
          regionId:   rid,
          regionName: regionMap[rid] ?? "Unknown",
          count:      row._count.id,
        };
      });

    res.json({
      success: true,
      generatedAt:    new Date().toISOString(),
      projectsByRegion: merge(projectsByRegion),
      usersByRegion:    merge(usersByRegion),
    });
  } catch (err) {
    logger.error("Regional analytics error", { err: err.message });
    res.status(500).json({ message: "Failed to fetch regional analytics" });
  }
}

// ─── GET /api/v1/admin/analytics/experts ────────────────────────────────────
export async function getExpertAnalytics(req, res) {
  try {
    const [
      totalExperts,
      verifiedExperts,
      expertsByType,
      topRated,
      appointmentStats,
    ] = await Promise.all([
      prisma.serviceProvider.count(),
      prisma.serviceProvider.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.serviceProvider.groupBy({
        by: ["providerType"],
        _count:  { id: true },
        _avg:    { avgRating: true },
      }),
      prisma.serviceProvider.findMany({
        where:   { verificationStatus: "VERIFIED" },
        orderBy: { avgRating: "desc" },
        take:    10,
        include: {
          user:    { select: { fullName: true, email: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.appointment.groupBy({
        by:    ["status"],
        _count: { id: true },
      }),
    ]);

    const totalAppointments = appointmentStats.reduce((s, a) => s + a._count.id, 0);
    const completedRow       = appointmentStats.find((a) => a.status === "COMPLETED");
    const completionRate     = totalAppointments
      ? ((completedRow?._count.id ?? 0) / totalAppointments * 100).toFixed(1)
      : 0;

    const approvalRate = totalExperts
      ? ((verifiedExperts / totalExperts) * 100).toFixed(1)
      : 0;

    res.json({
      success:     true,
      generatedAt: new Date().toISOString(),
      totals: {
        total:        totalExperts,
        verified:     verifiedExperts,
        approvalRate: `${approvalRate}%`,
      },
      byType: expertsByType.map((t) => ({
        type:       t.providerType,
        count:      t._count.id,
        avgRating:  Number(t._avg.avgRating ?? 0).toFixed(2),
      })),
      appointments: {
        total:          totalAppointments,
        completionRate: `${completionRate}%`,
        byStatus:       appointmentStats.map((a) => ({ status: a.status, count: a._count.id })),
      },
      topRatedExperts: topRated.map((e) => ({
        id:          e.id.toString(),
        name:        e.user?.fullName ?? "—",
        email:       e.user?.email   ?? "—",
        type:        e.providerType,
        avgRating:   Number(e.avgRating).toFixed(2),
        reviewCount: e.reviews.length,
      })),
    });
  } catch (err) {
    logger.error("Expert analytics error", { err: err.message });
    res.status(500).json({ message: "Failed to fetch expert analytics" });
  }
}

// ─── GET /api/v1/admin/analytics/platform-health ───────────────────────────
export async function getPlatformHealth(req, res) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo  = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      recentAuditLogs,
      txSuccessCount,
      txFailCount,
      txTotalCount,
      activeUsers24h,
    ] = await Promise.all([
      prisma.auditLog.findMany({
        where:   { createdAt: { gte: oneHourAgo } },
        orderBy: { createdAt: "desc" },
        take:    50,
        select:  { action: true, createdAt: true, entityType: true },
      }),
      prisma.transaction.count({ where: { status: "CONFIRMED", createdAt: { gte: oneDayAgo } } }),
      prisma.transaction.count({ where: { status: "FAILED",    createdAt: { gte: oneDayAgo } } }),
      prisma.transaction.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.user.count({ where: { lastLoginAt: { gte: oneDayAgo } } }),
    ]);

    const uptimeSeconds = Math.floor((Date.now() - SERVER_START) / 1000);
    const uptimeDays    = (uptimeSeconds / 86400).toFixed(2);

    const txSuccessRate = txTotalCount
      ? ((txSuccessCount / txTotalCount) * 100).toFixed(1)
      : "N/A";

    res.json({
      success:     true,
      generatedAt: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        days:    uptimeDays,
      },
      transactions24h: {
        total:       txTotalCount,
        succeeded:   txSuccessCount,
        failed:      txFailCount,
        successRate: `${txSuccessRate}%`,
      },
      activeUsers24h,
      recentAuditActivity: {
        last60min:   recentAuditLogs.length,
        actions:     recentAuditLogs.slice(0, 10),
      },
      node: {
        version:   process.version,
        memoryMB:  (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1),
        pid:       process.pid,
      },
    });
  } catch (err) {
    logger.error("Platform health error", { err: err.message });
    res.status(500).json({ message: "Failed to fetch platform health" });
  }
}

// ─── POST /api/v1/admin/cost-benchmarks ────────────────────────────────────
/**
 * Upsert a cost-per-sqm benchmark for a Province/District + building type.
 * Body: { province, district?, buildingType, minCostPerM2, maxCostPerM2, currency?, notes? }
 */
export async function upsertCostBenchmark(req, res) {
  try {
    const adminId = BigInt(req.user.id);
    const {
      province,
      district   = null,
      buildingType,
      minCostPerM2,
      maxCostPerM2,
      currency   = "RWF",
      notes      = null,
    } = req.body;

    if (!province || !buildingType || minCostPerM2 == null || maxCostPerM2 == null) {
      return res.status(400).json({
        message: "province, buildingType, minCostPerM2, and maxCostPerM2 are required",
      });
    }

    if (Number(minCostPerM2) > Number(maxCostPerM2)) {
      return res.status(400).json({ message: "minCostPerM2 must be ≤ maxCostPerM2" });
    }

    const existing = await prisma.costBenchmark.findUnique({
      where: {
        province_district_buildingType: {
          province,
          district: district ?? "",
          buildingType,
        },
      },
    });

    const benchmark = await prisma.costBenchmark.upsert({
      where: {
        province_district_buildingType: {
          province,
          district:    district ?? "",
          buildingType,
        },
      },
      update: {
        minCostPerM2: Number(minCostPerM2),
        maxCostPerM2: Number(maxCostPerM2),
        currency,
        notes,
        updatedById: adminId,
      },
      create: {
        province,
        district:    district ?? "",
        buildingType,
        minCostPerM2: Number(minCostPerM2),
        maxCostPerM2: Number(maxCostPerM2),
        currency,
        notes,
        updatedById: adminId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId:     adminId,
        action:     "COST_BENCHMARK_UPSERT",
        entityType: "cost_benchmark",
        entityId:   benchmark.id,
        metaJson:   {
          province,
          district,
          buildingType,
          previousRange: existing
            ? {
                minCostPerM2: Number(existing.minCostPerM2),
                maxCostPerM2: Number(existing.maxCostPerM2),
                currency: existing.currency,
              }
            : null,
          currentRange: {
            minCostPerM2: Number(benchmark.minCostPerM2),
            maxCostPerM2: Number(benchmark.maxCostPerM2),
            currency: benchmark.currency,
          },
        },
      },
    });

    const snapshot = await buildBenchmarkSnapshot(benchmark);
    res.status(201).json({ success: true, data: snapshot });
  } catch (err) {
    logger.error("Upsert cost benchmark error", { err: err.message });
    res.status(500).json({ message: "Failed to save cost benchmark" });
  }
}

// ─── GET /api/v1/admin/cost-benchmarks ─────────────────────────────────────
export async function listCostBenchmarks(req, res) {
  try {
    const { province, buildingType } = req.query;
    const where = {};
    if (province)     where.province     = { contains: String(province).slice(0, 120) };
    if (buildingType) where.buildingType = String(buildingType).slice(0, 60);

    const benchmarks = await prisma.costBenchmark.findMany({
      where,
      orderBy: [{ province: "asc" }, { district: "asc" }, { buildingType: "asc" }],
      include: {
        updatedBy: { select: { fullName: true } },
      },
    });

    const enriched = await enrichBenchmarksWithHistory(benchmarks);
    res.json({ success: true, data: enriched });
  } catch (err) {
    logger.error("List cost benchmarks error", { err: err.message });
    res.status(500).json({ message: "Failed to fetch cost benchmarks" });
  }
}

// GET /api/v1/admin/pricing/readiness
export async function getPricingReadiness(req, res) {
  try {
    await marketDataService.ensureReady();

    const [regions, benchmarkCount] = await Promise.all([
      prisma.region.findMany({
        select: { id: true, name: true, country: true, currency: true },
        orderBy: { id: "asc" },
      }),
      prisma.costBenchmark.count(),
    ]);

    res.json({
      success: true,
      data: {
        ...marketDataService.getPricingReadiness(),
        costBenchmarkCount: benchmarkCount,
        regions: regions.map((region) => ({
          id: Number(region.id),
          name: region.name,
          country: region.country,
          currency: region.currency,
        })),
      },
    });
  } catch (err) {
    logger.error("Pricing readiness error", { err: err.message });
    res.status(500).json({ message: "Failed to fetch pricing readiness" });
  }
}

// GET /api/v1/admin/pricing/template
export async function getPricingImportTemplate(req, res) {
  try {
    const regions = await prisma.region.findMany({
      select: { id: true, name: true, country: true, currency: true },
      orderBy: { id: "asc" },
    });

    res.json({
      success: true,
      data: {
        format: "json",
        notes: [
          "Upload only live prices your team wants the AI and estimator to follow.",
          "Set replaceExisting=true only when you want the included sections in this payload to become the new source of truth.",
          "Use dryRun=true first to validate a payload before saving it.",
        ],
        allowedCategories: VALID_BOQ_CATEGORIES,
        allowedMultiplierScopes: VALID_MULTIPLIER_SCOPES,
        regions: regions.map((region) => ({
          id: Number(region.id),
          name: region.name,
          country: region.country,
          currency: region.currency,
        })),
        examplePayload: {
          replaceExisting: false,
          dryRun: true,
          catalogItems: [
            {
              code: "CEMENT_50KG",
              name: "Cement 50kg bag",
              category: "FOUNDATION",
              unit: "bag",
              baseUnitCost: 9800,
              defaultWastagePercent: 2.5,
              isActive: true,
            },
          ],
          regionMultipliers: [
            {
              regionId: 1,
              scope: "MATERIAL",
              multiplier: 1.08,
              activeFrom: "2026-04-18",
            },
          ],
          costBenchmarks: [
            {
              province: "Kigali",
              district: "Gasabo",
              buildingType: "RESIDENTIAL",
              minCostPerM2: 320000,
              maxCostPerM2: 480000,
              currency: "RWF",
              notes: "Team baseline benchmark",
            },
          ],
        },
      },
    });
  } catch (err) {
    logger.error("Pricing template error", { err: err.message });
    res.status(500).json({ message: "Failed to fetch pricing import template" });
  }
}

// POST /api/v1/admin/pricing/import
export async function importPricingData(req, res) {
  try {
    const adminId = BigInt(req.user.id);
    const {
      replaceExisting = false,
      dryRun = false,
      catalogItems = [],
      regionMultipliers = [],
      costBenchmarks = [],
    } = req.body || {};

    if (!Array.isArray(catalogItems) || !Array.isArray(regionMultipliers) || !Array.isArray(costBenchmarks)) {
      return res.status(400).json({
        message: "catalogItems, regionMultipliers, and costBenchmarks must be arrays",
      });
    }

    if (!catalogItems.length && !regionMultipliers.length && !costBenchmarks.length) {
      return res.status(400).json({
        message: "Provide at least one catalog item, region multiplier, or cost benchmark to import",
      });
    }

    const regions = await prisma.region.findMany({
      select: { id: true, name: true, country: true, currency: true },
      orderBy: { id: "asc" },
    });
    const regionLookup = buildRegionLookup(regions);

    const normalizedCatalogItems = catalogItems.map((row, index) => {
      const item = normalizeCatalogItem(row, index);
      if (!item.code || !item.name || !item.unit) {
        throw new Error(`catalogItems[${index}] requires code, name, and unit`);
      }
      return item;
    });
    const normalizedMultipliers = regionMultipliers.map((row, index) =>
      normalizeMultiplier(row, index, regionLookup)
    );
    const normalizedBenchmarks = costBenchmarks.map((row, index) =>
      normalizeBenchmark(row, index)
    );

    if (dryRun) {
      return res.json({
        success: true,
        dryRun: true,
        message: "Pricing import payload is valid",
        data: {
          replaceExisting: Boolean(replaceExisting),
          catalogItems: normalizedCatalogItems.length,
          regionMultipliers: normalizedMultipliers.length,
          costBenchmarks: normalizedBenchmarks.length,
          categories: Array.from(new Set(normalizedCatalogItems.map((item) => item.category))),
          regions: Array.from(new Set(normalizedMultipliers.map((item) => item.regionName))),
        },
      });
    }

    await prisma.$transaction(async (tx) => {
      if (replaceExisting && normalizedCatalogItems.length) {
        await tx.costCatalogItem.updateMany({
          data: { isActive: false },
        });
      }

      if (replaceExisting && normalizedMultipliers.length) {
        await tx.regionMultiplier.deleteMany({});
      }

      if (replaceExisting && normalizedBenchmarks.length) {
        await tx.costBenchmark.deleteMany({});
      }

      for (const item of normalizedCatalogItems) {
        await tx.costCatalogItem.upsert({
          where: { code: item.code },
          update: {
            name: item.name,
            category: item.category,
            unit: item.unit,
            baseUnitCost: item.baseUnitCost,
            defaultWastagePercent: item.defaultWastagePercent,
            isActive: item.isActive,
          },
          create: {
            code: item.code,
            name: item.name,
            category: item.category,
            unit: item.unit,
            baseUnitCost: item.baseUnitCost,
            defaultWastagePercent: item.defaultWastagePercent,
            isActive: item.isActive,
          },
        });
      }

      for (const multiplier of normalizedMultipliers) {
        if (!replaceExisting) {
          await tx.regionMultiplier.deleteMany({
            where: {
              regionId: BigInt(multiplier.regionId),
              scope: multiplier.scope,
              activeFrom: multiplier.activeFrom,
            },
          });
        }

        await tx.regionMultiplier.create({
          data: {
            regionId: BigInt(multiplier.regionId),
            scope: multiplier.scope,
            multiplier: multiplier.multiplier,
            activeFrom: multiplier.activeFrom,
            activeTo: multiplier.activeTo,
          },
        });
      }

      for (const benchmark of normalizedBenchmarks) {
        await tx.costBenchmark.upsert({
          where: {
            province_district_buildingType: {
              province: benchmark.province,
              district: benchmark.district,
              buildingType: benchmark.buildingType,
            },
          },
          update: {
            minCostPerM2: benchmark.minCostPerM2,
            maxCostPerM2: benchmark.maxCostPerM2,
            currency: benchmark.currency,
            notes: benchmark.notes,
            updatedById: adminId,
          },
          create: {
            province: benchmark.province,
            district: benchmark.district,
            buildingType: benchmark.buildingType,
            minCostPerM2: benchmark.minCostPerM2,
            maxCostPerM2: benchmark.maxCostPerM2,
            currency: benchmark.currency,
            notes: benchmark.notes,
            updatedById: adminId,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "PRICING_IMPORT",
          entityType: "pricing_catalog",
          metaJson: {
            replaceExisting: Boolean(replaceExisting),
            catalogItemCount: normalizedCatalogItems.length,
            regionMultiplierCount: normalizedMultipliers.length,
            costBenchmarkCount: normalizedBenchmarks.length,
            importedCategories: Array.from(
              new Set(normalizedCatalogItems.map((item) => item.category))
            ),
            importedRegions: Array.from(
              new Set(normalizedMultipliers.map((item) => item.regionName))
            ),
          },
        },
      });
    });

    await marketDataService.refresh();

    res.status(201).json({
      success: true,
      message: "Pricing data imported successfully",
      data: {
        replaceExisting: Boolean(replaceExisting),
        catalogItems: normalizedCatalogItems.length,
        regionMultipliers: normalizedMultipliers.length,
        costBenchmarks: normalizedBenchmarks.length,
        readiness: marketDataService.getPricingReadiness(),
      },
    });
  } catch (err) {
    logger.error("Pricing import error", { err: err.message });
    res.status(400).json({ message: err.message || "Failed to import pricing data" });
  }
}
