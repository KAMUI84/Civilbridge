import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { protect, requireRole } from "./middlewares/auth.js";
import { csrfGuard } from "./middlewares/csrf.js";
import { httpsRedirect } from "./middlewares/httpsRedirect.js";
import { requestId } from "./middlewares/requestId.js";
import { sanitizeBody } from "./middlewares/sanitize.js";
import { emailService } from "./services/email.service.js";
import prisma from "./config/prisma.js";
import logger from "./config/logger.js";
import { buildRuntimeReport, getHealthStatusCode } from "./config/runtime.js";

// Patch BigInt serialization for Prisma
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// ─── Auth & Core Routes ───────────────────────────────────────────────────────
import authRoutes          from "./modules/auth/auth.routes.js";
import otpRoutes           from "./routes/otp.route.js";
import passwordResetRoutes from "./routes/passwordReset.route.js";
import regionsRoutes       from "./modules/regions/regions.routes.js";
import uploadsRoutes       from "./modules/uploads/uploads.routes.js";

// ─── Feature Module Routes ────────────────────────────────────────────────────
import projectsRoutes      from "./modules/projects/projects.routes.js";
import plansRoutes         from "./modules/plans/plans.routes.js";
import listingsRoutes      from "./modules/listings/listings.routes.js";
import expertsRoutes       from "./modules/experts/experts.routes.js";
import catalogRoutes       from "./modules/catalog/catalog.routes.js";
import estimatorRoutes     from "./modules/estimator/estimator.routes.js";
import estimationRoutes    from "./modules/estimation/estimation.routes.js";
import boqRoutes           from "./modules/boq/boq.routes.js";
import documentsRoutes     from "./modules/documents/documents.routes.js";
import permitsRoutes       from "./modules/permits/permits.routes.js";
import progressRoutes      from "./modules/progress/progress.routes.js";
import reviewsRoutes       from "./modules/reviews/reviews.routes.js";
import profilesRoutes      from "./modules/profiles/profiles.routes.js";
import roiRoutes           from "./modules/roi/roi.routes.js";
import carbonRoutes        from "./modules/carbon/carbon.routes.js";
import paymentsRoutes      from "./modules/payments/payments.routes.js";
import messagesRoutes      from "./modules/messages/messages.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import appointmentsRoutes  from "./modules/appointments/appointments.routes.js";
import tasksRoutes         from "./modules/tasks/tasks.routes.js";
import contactRoutes       from "./modules/support/contact.routes.js";
import upiRoutes           from "./modules/upi/upi.routes.js";

// ─── AI & Budget Routes ───────────────────────────────────────────────────────
import aiRoutes            from "./modules/ai/ai.routes.js";
import budgetAnalysisRoutes from "./routes/budgetAnalysis.route.js";

// ─── Admin Routes ────────────────────────────────────────────────────────────
import adminRoutes  from "./modules/admin/admin.routes.js";
import userRoutes   from "./modules/users/user.routes.js";
import rolesRoutes  from "./modules/roles/roles.routes.js";

const app = express();

// ─── HTTPS redirect (production only) ────────────────────────────────────────
app.use(httpsRedirect);

// ─── X-Request-ID tracing ─────────────────────────────────────────────────────
app.use(requestId);

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "same-site" },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
// In production, accept ONLY the domains listed in ALLOWED_ORIGINS.
// In development, also accept the common Vite dev ports.
const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5179",
];

const PROD_ORIGINS = (process.env.ALLOWED_ORIGINS ?? process.env.FRONTEND_URL ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = process.env.NODE_ENV === "production"
  ? PROD_ORIGINS
  : [...new Set([...DEV_ORIGINS, ...PROD_ORIGINS])];

app.use(cors({
  origin(origin, cb) {
    // Allow server-to-server / curl requests (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`Origin '${origin}' blocked by CORS policy`));
  },
  credentials: true,
}));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({
  limit: "10mb",
  verify: (req, _res, buf) => {
    // Keep raw body for payment webhook signature verification
    if (req.originalUrl?.startsWith("/api/payments/webhook/") ||
        req.originalUrl?.startsWith("/api/v1/payments/webhook/")) {
      req.rawBody = Buffer.from(buf);
    }
  },
}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── Input sanitisation (strips HTML from all req.body strings) ───────────────
app.use(sanitizeBody);

// ─── Request logging ─────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info("incoming request", {
    method:    req.method,
    url:       req.originalUrl,
    requestId: req.requestId,
    ip:        req.ip,
  });
  next();
});

// ─── Global Rate Limiting ─────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            300,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        { message: "Too many requests, please try again later." },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            20,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        { message: "Too many auth attempts. Please try again later." },
});

// ─── Static Uploads ───────────────────────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

// ─── Build the versioned API router ──────────────────────────────────────────
// All routes are registered on `apiRouter`.
// Mounted at BOTH /api (backward compat) and /api/v1 (versioned).
const apiRouter = express.Router();

// Auth routes (strict limiter)
apiRouter.use("/auth",           authLimiter, authRoutes);
apiRouter.use("/otp",            authLimiter, otpRoutes);
apiRouter.use("/password-reset", authLimiter, passwordResetRoutes);

// Public routes (no auth required)
apiRouter.use("/support/contact", contactRoutes);
apiRouter.use("/upi", upiRoutes);
apiRouter.use("/regions",  regionsRoutes);
apiRouter.use("/plans",    plansRoutes);
apiRouter.use("/listings", listingsRoutes);
apiRouter.use("/experts",  expertsRoutes);
apiRouter.use("/catalog",  catalogRoutes);
apiRouter.use("/permits",  permitsRoutes);
apiRouter.use("/payments", paymentsRoutes);

// Current user
apiRouter.get("/me", protect, async (req, res) => {
  try {
    const userId = req.user.id; // BigInt, already parsed by auth middleware
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, fullName: true, email: true, phone: true,
        role: true, verificationStatus: true, isActive: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ success: true, user });
  } catch {
    return res.status(500).json({ message: "Failed to fetch current user" });
  }
});

// Protected routes (auth + CSRF)
apiRouter.use("/projects",     protect, csrfGuard, projectsRoutes);
apiRouter.use("/estimator",    protect, csrfGuard, estimatorRoutes);
apiRouter.use("/estimation",   protect, csrfGuard, estimationRoutes);
apiRouter.use("/boq",          protect, csrfGuard, boqRoutes);
apiRouter.use("/documents",    protect, csrfGuard, documentsRoutes);
apiRouter.use("/progress",     protect, csrfGuard, progressRoutes);
apiRouter.use("/profiles",     protect, csrfGuard, profilesRoutes);
apiRouter.use("/reviews",      protect, csrfGuard, reviewsRoutes);
apiRouter.use("/roi",          protect, csrfGuard, roiRoutes);
apiRouter.use("/carbon",       protect, csrfGuard, carbonRoutes);
apiRouter.use("/uploads",      uploadsRoutes);
apiRouter.use("/budget",       protect, csrfGuard, budgetAnalysisRoutes);
apiRouter.use("/messages",     protect, messagesRoutes);
apiRouter.use("/notifications",protect, notificationsRoutes);
apiRouter.use("/appointments", protect, csrfGuard, appointmentsRoutes);
apiRouter.use("/tasks",        protect, csrfGuard, tasksRoutes);

// AI routes handle auth internally (guest chat is public, threads require auth)
apiRouter.use("/ai", aiRoutes);

// User management
apiRouter.use("/users", protect, userRoutes);

// Role assignment
apiRouter.use("/roles", protect, rolesRoutes);

// Admin routes
apiRouter.use("/admin", protect, requireRole(["ADMIN", "SUPER_ADMIN"]), adminRoutes);

// ─── Mount versioned router ───────────────────────────────────────────────────
app.use("/api/v1", apiRouter);  // versioned
app.use("/api",    apiRouter);  // backward compat

// ─── Static / utility endpoints ──────────────────────────────────────────────
app.get("/health", async (req, res) => {
  try {
    const emailStatus = emailService.getStatus();
    const runtime = await buildRuntimeReport({ prisma, emailStatus });

    res.status(getHealthStatusCode(runtime.status)).json({
      status: runtime.status,
      timestamp: runtime.checkedAt,
      requestId: req.requestId,
      uptime: process.uptime(),
      summary: runtime.summary,
      core: runtime.modules.core,
    });
  } catch (error) {
    logger.error("Health check failed", { error: error.message });
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      error: error.message,
    });
  }
});

// ── Dev-only: email service status (not available in production) ──────────────
if (process.env.NODE_ENV !== "production") {
  app.get("/api/email-status", (req, res) => {
    try {
      const emailStatus = emailService.getStatus();
      res.json({ status: "Email service operational", ...emailStatus, timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ status: "Email service error", error: error.message, timestamp: new Date().toISOString() });
    }
  });
}

app.get("/api/runtime-status", protect, requireRole(["SUPER_ADMIN"]), async (req, res) => {
  try {
    const runtime = await buildRuntimeReport({
      prisma,
      emailStatus: emailService.getStatus(),
    });

    res.status(getHealthStatusCode(runtime.status)).json(runtime);
  } catch (error) {
    logger.error("Runtime status failed", { error: error.message, requestId: req.requestId });
    res.status(500).json({
      status: "error",
      message: "Failed to build runtime status",
      error: error.message,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    });
  }
});

// ── Dev-only: send a test email (not available in production) ─────────────────
if (process.env.NODE_ENV !== "production") {
  app.post("/api/test-email", protect, requireRole(["SUPER_ADMIN"]), async (req, res) => {
    try {
      const { to } = req.body;
      if (!to) return res.status(400).json({ status: "Missing required field: to", timestamp: new Date().toISOString() });
      const result = await emailService.sendTestEmail(to);
      res.json({ status: "Test email sent successfully", ...result, timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ status: "Failed to send test email", error: error.message, timestamp: new Date().toISOString() });
    }
  });
}

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the CivilBridge API v1.0" });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", requestId: req.requestId });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  logger.error("unhandled error", {
    message:   err.message,
    status,
    url:       req.originalUrl,
    requestId: req.requestId,
    stack:     process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
  res.status(status).json({
    message:   err.message || "Internal server error",
    requestId: req.requestId,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
