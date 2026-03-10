import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { protect } from "./middlewares/auth.js";

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

// ─── Protected Routes (auth required) ────────────────────────────────────────
app.use("/api/projects", protect, projectsRoutes);
app.use("/api/estimation", protect, estimationRoutes);
app.use("/api/boq", protect, boqRoutes);
app.use("/api/documents", protect, documentsRoutes);
app.use("/api/progress", protect, progressRoutes);
app.use("/api/profiles", protect, profilesRoutes);
app.use("/api/reviews", protect, reviewsRoutes);
app.use("/api/roi", protect, roiRoutes);
app.use("/api/carbon", protect, carbonRoutes);
app.use("/api/uploads", protect, uploadsRoutes);
app.use("/api/budget", protect, budgetAnalysisRoutes);

// AI routes handle auth internally (guest chat is public, threads require auth)
app.use("/api/ai", aiRoutes);

// ─── Admin Routes (auth + admin role enforced inside routes) ──────────────────
app.use("/api/admin", protect, adminRoutes);

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "CivilBridge API running", timestamp: new Date().toISOString() });
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