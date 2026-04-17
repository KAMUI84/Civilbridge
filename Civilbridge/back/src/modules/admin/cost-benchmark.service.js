import prisma from "../../config/prisma.js";

const BUILDING_TYPE_ALIASES = [
  { match: /apartment|flat|multi[-\s]?family/i, value: "APARTMENT" },
  { match: /commercial|office|shop|retail|mall/i, value: "COMMERCIAL" },
  { match: /industrial|warehouse|factory/i, value: "INDUSTRIAL" },
  { match: /hospital|clinic|medical/i, value: "HOSPITAL" },
  { match: /school|classroom|institution|campus/i, value: "SCHOOL" },
  { match: /mixed[-\s]?use/i, value: "MIXED_USE" },
  { match: /house|home|villa|residential|bedroom/i, value: "RESIDENTIAL" },
];

function toNumber(value) {
  // Handle Prisma Decimal by converting via String first to preserve precision
  const stringValue = value?.toString ? value.toString() : String(value);
  const numeric = Number(stringValue);
  return Number.isFinite(numeric) ? numeric : null;
}

function toDecimalSafe(value) {
  // Preserve full precision for financial values by returning string representation
  if (value === null || value === undefined) return null;
  const stringValue = value?.toString ? value.toString() : String(value);
  const numeric = Number(stringValue);
  if (!Number.isFinite(numeric)) return null;
  // Return as number but ensure it's been properly parsed
  return numeric;
}

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function midpoint(minValue, maxValue) {
  const min = toNumber(minValue);
  const max = toNumber(maxValue);
  if (min === null || max === null) {
    return null;
  }

  return (min + max) / 2;
}

function pickRange(meta) {
  if (!meta || typeof meta !== "object") {
    return null;
  }

  const current = meta.currentRange || meta.newRange || null;
  if (current) {
    return {
      minCostPerM2: toDecimalSafe(current.minCostPerM2),
      maxCostPerM2: toDecimalSafe(current.maxCostPerM2),
      currency: current.currency || meta.currency || "RWF",
    };
  }

  if (meta.minCostPerM2 != null && meta.maxCostPerM2 != null) {
    return {
      minCostPerM2: toDecimalSafe(meta.minCostPerM2),
      maxCostPerM2: toDecimalSafe(meta.maxCostPerM2),
      currency: meta.currency || "RWF",
    };
  }

  return null;
}

function buildHistorySeries(logs, benchmark) {
  const entries = logs
    .map((log) => {
      const range = pickRange(log.metaJson);
      if (!range || range.minCostPerM2 === null || range.maxCostPerM2 === null) {
        return null;
      }

      return {
        recordedAt: log.createdAt,
        minCostPerM2: range.minCostPerM2,
        maxCostPerM2: range.maxCostPerM2,
        midpoint: midpoint(range.minCostPerM2, range.maxCostPerM2),
        currency: range.currency || benchmark.currency || "RWF",
      };
    })
    .filter(Boolean)
    .sort((left, right) => new Date(left.recordedAt) - new Date(right.recordedAt));

  const safeMinCost = toDecimalSafe(benchmark.minCostPerM2);
  const safeMaxCost = toDecimalSafe(benchmark.maxCostPerM2);
  const currentMidpoint = midpoint(safeMinCost, safeMaxCost);
  const hasCurrent = entries.some(
    (entry) =>
      entry.minCostPerM2 === safeMinCost &&
      entry.maxCostPerM2 === safeMaxCost,
  );

  if (!hasCurrent && currentMidpoint !== null) {
    entries.push({
      recordedAt: benchmark.updatedAt || benchmark.createdAt,
      minCostPerM2: safeMinCost,
      maxCostPerM2: safeMaxCost,
      midpoint: currentMidpoint,
      currency: benchmark.currency || "RWF",
    });
  }

  return entries.sort((left, right) => new Date(left.recordedAt) - new Date(right.recordedAt));
}

export function normalizeBuildingType(projectType) {
  const value = asString(projectType);
  if (!value) {
    return "";
  }

  const alias = BUILDING_TYPE_ALIASES.find((entry) => entry.match.test(value));
  return alias?.value || value.toUpperCase().replace(/\s+/g, "_");
}

export function calculateBenchmarkVolatility(historyEntries = []) {
  const midpoints = historyEntries
    .map((entry) => toNumber(entry.midpoint))
    .filter((entry) => entry !== null);

  if (midpoints.length < 2) {
    return {
      status: "INSUFFICIENT_HISTORY",
      label: "History building",
      changePercent: null,
      spreadPercent: null,
    };
  }

  const first = midpoints[0];
  const latest = midpoints[midpoints.length - 1];
  const average = midpoints.reduce((sum, value) => sum + value, 0) / midpoints.length;
  const min = Math.min(...midpoints);
  const max = Math.max(...midpoints);
  const changePercent = first ? ((latest - first) / first) * 100 : 0;
  const spreadPercent = average ? ((max - min) / average) * 100 : 0;

  if (spreadPercent >= 18 || Math.abs(changePercent) >= 15) {
    return {
      status: "HIGH",
      label: "High volatility",
      changePercent,
      spreadPercent,
    };
  }

  if (spreadPercent >= 8 || Math.abs(changePercent) >= 6) {
    return {
      status: "MODERATE",
      label: "Moderate movement",
      changePercent,
      spreadPercent,
    };
  }

  return {
    status: "STABLE",
    label: "Stable range",
    changePercent,
    spreadPercent,
  };
}

export async function getCostBenchmarkHistory(benchmark) {
  if (!benchmark?.id) {
    return [];
  }

  // Safely convert ID to BigInt for Prisma query
  let benchmarkId;
  try {
    benchmarkId = typeof benchmark.id === "bigint" ? benchmark.id : BigInt(benchmark.id);
  } catch {
    // If conversion fails, return empty history
    return [];
  }

  const logs = await prisma.auditLog.findMany({
    where: {
      entityType: "cost_benchmark",
      entityId: benchmarkId,
      action: "COST_BENCHMARK_UPSERT",
    },
    orderBy: { createdAt: "asc" },
  });

  return buildHistorySeries(logs, benchmark);
}

export async function buildBenchmarkSnapshot(benchmark) {
  if (!benchmark) {
    return null;
  }

  const history = await getCostBenchmarkHistory(benchmark);
  const volatility = calculateBenchmarkVolatility(history);

  // Safely convert BigInt ID to string
  const idString = benchmark.id?.toString ? benchmark.id.toString() : String(benchmark.id);

  return {
    id: idString,
    province: benchmark.province,
    district: benchmark.district || "",
    buildingType: benchmark.buildingType,
    currency: benchmark.currency || "RWF",
    minCostPerM2: toDecimalSafe(benchmark.minCostPerM2),
    maxCostPerM2: toDecimalSafe(benchmark.maxCostPerM2),
    midpointCostPerM2: midpoint(
      toDecimalSafe(benchmark.minCostPerM2),
      toDecimalSafe(benchmark.maxCostPerM2)
    ),
    notes: benchmark.notes || "",
    updatedAt: benchmark.updatedAt,
    updatedBy: benchmark.updatedBy?.fullName || "",
    history: history.slice(-6),
    volatility,
  };
}

function scoreBenchmarkCandidate(benchmark, locationText, buildingType) {
  let score = 0;
  const province = asString(benchmark.province).toLowerCase();
  const district = asString(benchmark.district).toLowerCase();
  const targetLocation = asString(locationText).toLowerCase();
  const targetType = asString(buildingType).toUpperCase();
  const benchmarkType = asString(benchmark.buildingType).toUpperCase();

  if (targetType && benchmarkType === targetType) {
    score += 6;
  } else if (targetType && benchmarkType.includes(targetType)) {
    score += 4;
  }

  if (district && targetLocation.includes(district)) {
    score += 5;
  }

  if (province && targetLocation.includes(province)) {
    score += 3;
  }

  if (!district) {
    score += 1;
  }

  return score;
}

export async function findBestCostBenchmark({ location, projectType }) {
  const normalizedType = normalizeBuildingType(projectType);
  const benchmarks = await prisma.costBenchmark.findMany({
    include: {
      updatedBy: { select: { fullName: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 100,
  });

  if (!benchmarks.length) {
    return null;
  }

  const bestMatch = benchmarks
    .map((benchmark) => ({
      benchmark,
      score: scoreBenchmarkCandidate(benchmark, location, normalizedType),
    }))
    .sort((left, right) => right.score - left.score)[0];

  if (!bestMatch || bestMatch.score <= 0) {
    return null;
  }

  return buildBenchmarkSnapshot(bestMatch.benchmark);
}

export async function enrichBenchmarksWithHistory(benchmarks = []) {
  return Promise.all(benchmarks.map((benchmark) => buildBenchmarkSnapshot(benchmark)));
}
