import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { protect, requireRole } from "./middlewares/auth.js";
import { csrfGuard } from "./middlewares/csrf.js";
import emailService from "./services/emailService.js";
import prisma from "./config/prisma.js";

// Patch BigInt serialization for Prisma
BigInt.prototype.toJSON = function () {
  return this.toString();
};

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

// ─── AI & Budget Routes ───────────────────────────────────────────────────────
import aiRoutes from "./modules/ai/ai.routes.js";
import budgetAnalysisRoutes from "./routes/budgetAnalysis.route.js";

// ─── Admin Routes ────────────────────────────────────────────────────────────
import adminRoutes from "./modules/admin/admin.routes.js";

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5179",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── Global Rate Limiting ─────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts. Please try again later." },
});

// ─── Static Uploads ───────────────────────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

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

// AI routes handle auth internally (guest chat is public, threads require auth)
app.use("/api/ai", aiRoutes);

// ─── Admin Routes (auth + admin role enforced inside routes) ──────────────────
app.use("/api/admin", protect, requireRole(["ADMIN"]), adminRoutes);

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "CivilBridge API running", timestamp: new Date().toISOString() });
});

// ─── Email Service Status ───────────────────────────────────────────────────────
app.get("/api/email-status", (req, res) => {
  try {
    const emailStatus = emailService.getStatus();
    res.json({ 
      status: "Email service operational",
      ...emailStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: "Email service error", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ─── Test Email Endpoint ───────────────────────────────────────────────────────
app.post("/api/test-email", async (req, res) => {
  try {
    const { to = 'samuelnizeyimana505@gmail.com' } = req.body;
    const result = await emailService.sendTestEmail(to);
    res.json({ 
      status: "Test email sent successfully",
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: "Failed to send test email", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the CivilBridge API v1.0" });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;