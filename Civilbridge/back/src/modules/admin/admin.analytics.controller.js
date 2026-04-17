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
import {
  buildBenchmarkSnapshot,
  enrichBenchmarksWithHistory,
} from "./cost-benchmark.service.js";

// Track server start time for uptime calculation
const SERVER_START = Date.now();

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
