import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import { createLogger, format, transports } from "winston";
import * as Sentry from "@sentry/node";
import { protect, requireRole } from "./middlewares/auth.js";
import { csrfGuard } from "./middlewares/csrf.js";
import prisma from "./config/prisma.js";
import emailService from "./services/emailService.js";
import { buildRuntimeReport, getHealthStatusCode } from "./config/runtime.js";

// Patch BigInt serialization for Prisma
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// ─── Production Logger Configuration ───────────────────────────────────────
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: "civilbridge-api" },
  transports: [
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console({
    format: format.simple()
  }));
}

// Sentry for error tracking in production
if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}

// ─── Auth & Core Routes ───────────────────────────────────────────────────────
import authRoutes from "./modules/auth/auth.routes.js";
import otpRoutes from "./routes/otp.route.js";
import passwordResetRoutes from "./routes/passwordReset.route.js";
import regionsRoutes from "./routes/regions.route.js";
import uploadsRoutes from "./routes/uploads.route.js";

// ─── Feature Module Routes ────────────────────────────────────────────────────
import projectsRoutes from "./modules/projects/projects.routes.js";
import plansRoutes from "./modules/plans/plans.routes.js";
import listingsRoutes from "./modules/listings/listings.routes.js";
import expertsRoutes from "./modules/experts/experts.routes.js";
import catalogRoutes from "./modules/catalog/catalog.routes.js";
import estimatorRoutes from "./modules/estimator/estimator.routes.js";
import estimationRoutes from "./modules/estimation/estimation.routes.js";
import boqRoutes from "./modules/boq/boq.routes.js";
import documentsRoutes from "./modules/documents/documents.routes.js";
import permitsRoutes from "./modules/permits/permits.routes.js";
import progressRoutes from "./modules/progress/progress.routes.js";
import reviewsRoutes from "./modules/reviews/reviews.routes.js";
import profilesRoutes from "./modules/profiles/profiles.routes.js";
import roiRoutes from "./modules/roi/roi.routes.js";
import carbonRoutes from "./modules/carbon/carbon.routes.js";
import paymentsRoutes from "./modules/payments/payments.routes.js";
import appointmentsRoutes from "./modules/appointments/appointments.routes.js";

// ─── AI & Budget Routes ───────────────────────────────────────────────────────
import aiRoutes from "./modules/ai/ai.routes.js";
import budgetAnalysisRoutes from "./routes/budgetAnalysis.route.js";

// ─── Admin Routes ────────────────────────────────────────────────────────────
import adminRoutes from "./modules/admin/admin.routes.js";

const app = express();

// ─── Trust Proxy (for production behind reverse proxy) ───────────────────────
app.set("trust proxy", 1);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", process.env.CDN_URL].filter(Boolean),
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN?.split(",")].flat().filter(Boolean),
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// ─── CORS (Production Configuration) ───────────────────────────────────────────
const corsOrigins = process.env.CORS_ORIGIN?.split(",") || [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5179",
];

app.use(cors({
  origin: corsOrigins,
  credentials: process.env.CORS_CREDENTIALS === "true",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
}));

// ─── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ─── Request Logging ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined", { stream: { write: message => logger.info(message.trim()) } }));
} else {
  app.use(morgan("dev"));
}

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ 
  limit: process.env.UPLOAD_MAX_SIZE || "10mb",
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: process.env.UPLOAD_MAX_SIZE || "10mb" }));
app.use(cookieParser());

// ─── Global Rate Limiting (Production Limits) ─────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === "true",
  message: { message: "Too many requests, please try again later." },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, path: ${req.path}`);
    res.status(429).json({ message: "Too many requests, please try again later." });
  },
});
app.use(globalLimiter);

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: { message: "Too many auth attempts. Please try again later." },
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ message: "Too many auth attempts. Please try again later." });
  },
});

// ─── Static Uploads (with caching headers) ───────────────────────────────────
app.use("/uploads", express.static("uploads", {
  maxAge: "1y",
  etag: true,
  lastModified: true,
}));

// ─── CDN Support ─────────────────────────────────────────────────────────────
if (process.env.CDN_URL) {
  app.use((req, res, next) => {
    if (req.path.startsWith("/uploads/")) {
      res.setHeader("X-CDN-URL", `${process.env.CDN_URL}${req.path}`);
    }
    next();
  });
}

// ─── Health Check (Enhanced) ───────────────────────────────────────────────────
app.get("/health", async (req, res) => {
  try {
    const runtime = await buildRuntimeReport({
      prisma,
      emailStatus: emailService.getStatus(),
    });

    const health = {
      status: runtime.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      summary: runtime.summary,
      core: runtime.modules.core,
    };

    if (runtime.blockers.length) {
      health.blockers = runtime.blockers;
    }

    if (runtime.warnings.length) {
      health.warnings = runtime.warnings;
    }

    const statusCode = getHealthStatusCode(health.status);
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({ status: "unhealthy", error: error.message });
  }
});

// ─── Metrics Endpoint (for monitoring) ─────────────────────────────────────────
app.get("/metrics", (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    activeHandles: process._getActiveHandles().length,
    activeRequests: process._getActiveRequests().length,
  };
  res.json(metrics);
});

// ─── Auth Routes (with strict limiter) ───────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/otp", authLimiter, otpRoutes);
app.use("/api/password-reset", authLimiter, passwordResetRoutes);

// ─── Public Routes (no auth required) ────────────────────────────────────────
app.use("/api/regions", regionsRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/experts", expertsRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/permits", permitsRoutes);
app.use("/api/payments", paymentsRoutes);

// ─── Current User ──────────────────────────────────────────────────────────
app.get("/api/me", protect, async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        verificationStatus: true,
        isActive: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch current user" });
  }
});

// ─── Protected Routes (auth required) ────────────────────────────────────────
app.use("/api/projects", protect, csrfGuard, projectsRoutes);
app.use("/api/estimator", protect, csrfGuard, estimatorRoutes);
app.use("/api/estimation", protect, csrfGuard, estimationRoutes);
app.use("/api/boq", protect, csrfGuard, boqRoutes);
app.use("/api/documents", protect, csrfGuard, documentsRoutes);
app.use("/api/progress", protect, csrfGuard, progressRoutes);
app.use("/api/profiles", protect, csrfGuard, profilesRoutes);
app.use("/api/reviews", protect, csrfGuard, reviewsRoutes);
app.use("/api/roi", protect, csrfGuard, roiRoutes);
app.use("/api/carbon", protect, csrfGuard, carbonRoutes);
app.use("/api/uploads", protect, csrfGuard, uploadsRoutes);
app.use("/api/budget", protect, csrfGuard, budgetAnalysisRoutes);
app.use("/api/appointments", protect, csrfGuard, appointmentsRoutes);

// AI routes handle auth internally (guest chat is public, threads require auth)
app.use("/api/ai", aiRoutes);

// ─── Admin Routes (auth + admin role enforced inside routes) ──────────────────
app.use("/api/admin", protect, requireRole(["ADMIN", "SUPER_ADMIN"]), adminRoutes);

// ─── Root Endpoint ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to the CivilBridge API v1.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/email-status", (req, res) => {
  try {
    const emailStatus = emailService.getStatus();
    res.json({ status: "Email service operational", ...emailStatus, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: "Email service error", error: error.message, timestamp: new Date().toISOString() });
  }
});

app.get("/api/runtime-status", protect, requireRole(["SUPER_ADMIN"]), async (req, res) => {
  try {
    const runtime = await buildRuntimeReport({
      prisma,
      emailStatus: emailService.getStatus(),
    });

    res.status(getHealthStatusCode(runtime.status)).json(runtime);
  } catch (error) {
    logger.error("Runtime status failed:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to build runtime status",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: "Route not found" });
});

// ─── Global Error Handler (Production) ───────────────────────────────────────────
app.use((err, req, res, next) => {
  // Log error
  logger.error("Unhandled error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Send to Sentry in production
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";
  const statusCode = err.status || 500;
  
  res.status(statusCode).json({
    message: isDevelopment ? err.message : "Internal server error",
    ...(isDevelopment && { stack: err.stack }),
    ...(statusCode === 429 && { retryAfter: err.retryAfter }),
  });
});

export default app;
