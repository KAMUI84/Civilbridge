import { Router } from "express";
import { requireAdmin } from "../../middlewares/roles.js";
import {
  getAdminStats, getUsers, changeUserRole, toggleUserActive,
  getVerificationQueue, approveVerification, rejectVerification,
  getAdminPlans, moderatePlan, getAdminListings, moderateListing,
} from "./admin.controller.js";
import {
  getAnalyticsOverview,
  getRegionalAnalytics,
  getExpertAnalytics,
  getPlatformHealth,
  upsertCostBenchmark,
  listCostBenchmarks,
} from "./admin.analytics.controller.js";

const router = Router();

// All routes already protected by protect + requireRole(["ADMIN","SUPER_ADMIN"]) from app.js
router.use(requireAdmin);

// ─── Existing stats & user management ────────────────────────────────────────
router.get("/stats",                       getAdminStats);
router.get("/users",                       getUsers);
router.put("/users/:id/role",              changeUserRole);
router.put("/users/:id/toggle-active",     toggleUserActive);
router.get("/verification-queue",          getVerificationQueue);
router.post("/verification/:id/approve",   approveVerification);
router.post("/verification/:id/reject",    rejectVerification);

router.get("/plans",                       getAdminPlans);
router.put("/plans/:id/moderate",          moderatePlan);
router.get("/listings",                    getAdminListings);
router.put("/listings/:id/moderate",       moderateListing);

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get("/analytics",                   getAnalyticsOverview);
router.get("/analytics/regional",          getRegionalAnalytics);
router.get("/analytics/experts",           getExpertAnalytics);
router.get("/analytics/platform-health",   getPlatformHealth);

// ─── Cost Benchmarks ─────────────────────────────────────────────────────────
router.get("/cost-benchmarks",             listCostBenchmarks);
router.post("/cost-benchmarks",            upsertCostBenchmark);

export default router;
