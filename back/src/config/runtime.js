import { isCloudinaryConfigured } from "../modules/documents/cloudinary.storage.js";

function hasEnv(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildOrigins() {
  const explicitOrigins = [
    ...splitCsv(process.env.ALLOWED_ORIGINS),
    ...splitCsv(process.env.CORS_ORIGIN),
  ];

  if (process.env.FRONTEND_URL) {
    explicitOrigins.push(process.env.FRONTEND_URL.trim());
  }

  return Array.from(new Set(explicitOrigins.filter(Boolean)));
}

function buildCoreStatus(databaseConnected) {
  const frontendUrl = process.env.FRONTEND_URL || null;
  const appBaseUrl = process.env.APP_BASE_URL || frontendUrl || null;
  const origins = buildOrigins();

  return {
    databaseUrlConfigured: hasEnv("DATABASE_URL"),
    directDatabaseUrlConfigured: hasEnv("DIRECT_DATABASE_URL"),
    databaseConnected,
    jwtConfigured: hasEnv("JWT_SECRET"),
    accessTokenTtl: process.env.JWT_EXPIRES_IN || "15m",
    refreshTokenTtl: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    frontendUrl,
    appBaseUrl,
    allowedOriginsConfigured: origins.length > 0,
    allowedOrigins: origins,
    corsCredentials: process.env.CORS_CREDENTIALS === "true",
  };
}

function buildAiStatus() {
  return {
    defaultProvider: process.env.AI_DEFAULT_PROVIDER || "gemini",
    geminiConfigured: hasEnv("GEMINI_API_KEY"),
    geminiModel: process.env.GEMINI_MODEL || process.env.GEMINI_STRUCTURED_MODEL || "gemini-2.5-flash",
    geminiVisionModel: process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash",
    claudeConfigured: hasEnv("ANTHROPIC_API_KEY"),
    claudeModel: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
    routing: {
      analyzePlanPdf: process.env.AI_ANALYZE_PLAN_PDF_PROVIDER || "claude",
      analyzePlanImage: process.env.AI_ANALYZE_PLAN_IMAGE_PROVIDER || "gemini",
      generatePlan: process.env.AI_GENERATE_PLAN_PROVIDER || "gemini",
      estimate: process.env.AI_ESTIMATE_PROVIDER || "gemini",
      budgetAnalysis: process.env.AI_BUDGET_ANALYSIS_PROVIDER || "gemini",
      feasibility: process.env.AI_FEASIBILITY_PROVIDER || "gemini",
    },
  };
}

function buildEmailStatus(emailStatus) {
  return {
    queueMode: emailStatus?.queueMode || (hasEnv("REDIS_URL") ? "bullmq" : "memory"),
    queueName: emailStatus?.queueName || process.env.EMAIL_QUEUE_NAME || "civilbridge-email",
    redisConfigured: emailStatus?.redisConfigured ?? hasEnv("REDIS_URL"),
    smtpConfigured: emailStatus?.smtpConfigured ?? (hasEnv("EMAIL_USER") && hasEnv("EMAIL_PASS")),
    senderConfigured: hasEnv("EMAIL_FROM"),
    schedulerEnabled: process.env.ENABLE_APPOINTMENT_REMINDER_SCHEDULER !== "false",
    reminderIntervalMs: Number(process.env.APPOINTMENT_REMINDER_INTERVAL_MS || 5 * 60 * 1000),
  };
}

function buildStorageStatus() {
  return {
    cloudinaryConfigured: isCloudinaryConfigured(),
    cloudinaryFolder: process.env.CLOUDINARY_PDF_FOLDER || "civilbridge/pdfs",
    uploadMaxSize: process.env.UPLOAD_MAX_SIZE || "10mb",
    cdnConfigured: hasEnv("CDN_URL"),
  };
}

function buildPaymentsStatus() {
  return {
    stripeConfigured: hasEnv("STRIPE_SECRET_KEY") && hasEnv("STRIPE_WEBHOOK_SECRET"),
    mtnConfigured:
      hasEnv("MTN_MOMO_API_USER") &&
      hasEnv("MTN_MOMO_API_KEY") &&
      hasEnv("MTN_MOMO_SUBSCRIPTION_KEY"),
    airtelConfigured: hasEnv("AIRTEL_RW_CLIENT_ID") && hasEnv("AIRTEL_RW_CLIENT_SECRET"),
  };
}

function buildOperationsStatus() {
  return {
    nodeEnv: process.env.NODE_ENV || "development",
    logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
    sentryConfigured: hasEnv("SENTRY_DSN"),
    clusterModeEnabled: process.env.CLUSTER_MODE !== "false",
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
    rateLimitSkipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === "true",
  };
}

function buildBlockersAndWarnings(modules) {
  const blockers = [];
  const warnings = [];

  if (!modules.core.databaseUrlConfigured) {
    blockers.push("DATABASE_URL is not configured.");
  }

  if (!modules.core.jwtConfigured) {
    blockers.push("JWT_SECRET is not configured.");
  }

  if (modules.core.databaseConnected === false) {
    blockers.push("Database connectivity check failed.");
  }

  if (!modules.core.appBaseUrl) {
    warnings.push("APP_BASE_URL or FRONTEND_URL is not configured; links in emails and receipts may be wrong.");
  }

  if (!modules.core.allowedOriginsConfigured) {
    warnings.push("ALLOWED_ORIGINS/CORS_ORIGIN is not configured; production browser access may need tighter CORS settings.");
  }

  if (!modules.ai.geminiConfigured && !modules.ai.claudeConfigured) {
    warnings.push("No AI provider API key is configured.");
  } else {
    if (modules.ai.defaultProvider === "gemini" && !modules.ai.geminiConfigured) {
      warnings.push("Gemini is the default AI provider but GEMINI_API_KEY is missing.");
    }

    if (modules.ai.routing.analyzePlanPdf === "claude" && !modules.ai.claudeConfigured) {
      warnings.push("Claude is selected for PDF plan analysis but ANTHROPIC_API_KEY is missing.");
    }
  }

  if (!modules.email.redisConfigured) {
    warnings.push("REDIS_URL is not configured; email delivery is using the in-memory queue fallback.");
  }

  if (!modules.email.smtpConfigured) {
    warnings.push("EMAIL_USER/EMAIL_PASS are not configured; outbound mail will use temporary Ethereal accounts.");
  }

  if (!modules.storage.cloudinaryConfigured) {
    warnings.push("Cloudinary is not configured; PDF upload/signing flows will not work.");
  }

  if (!modules.payments.stripeConfigured && !modules.payments.mtnConfigured && !modules.payments.airtelConfigured) {
    warnings.push("No payment provider is fully configured.");
  }

  if (modules.operations.nodeEnv === "production" && !modules.operations.sentryConfigured) {
    warnings.push("SENTRY_DSN is not configured for production error monitoring.");
  }

  return { blockers, warnings };
}

export async function buildRuntimeReport({ prisma = null, emailStatus = null } = {}) {
  let databaseConnected = null;

  if (prisma) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseConnected = true;
    } catch {
      databaseConnected = false;
    }
  }

  const modules = {
    core: buildCoreStatus(databaseConnected),
    ai: buildAiStatus(),
    email: buildEmailStatus(emailStatus),
    storage: buildStorageStatus(),
    payments: buildPaymentsStatus(),
    operations: buildOperationsStatus(),
  };

  const { blockers, warnings } = buildBlockersAndWarnings(modules);

  return {
    status: blockers.length ? "unhealthy" : warnings.length ? "degraded" : "healthy",
    checkedAt: new Date().toISOString(),
    summary: {
      blockers: blockers.length,
      warnings: warnings.length,
    },
    blockers,
    warnings,
    modules,
  };
}

export function getHealthStatusCode(status) {
  return status === "unhealthy" ? 503 : 200;
}
