import { Router } from "express";
import { requireAdmin } from "../../middlewares/roles.js";
import {
  getAdminStats,
  getUsers,
  changeUserRole,
  toggleUserActive,
  getVerificationQueue,
  approveVerification,
  rejectVerification,
  getAdminPlans,
  moderatePlan,
  getAdminListings,
  moderateListing,
} from "./admin.controller.js";
import {
  getAnalyticsOverview,
  getRegionalAnalytics,
  getExpertAnalytics,
  getPlatformHealth,
  getPricingReadiness,
  getPricingImportTemplate,
  importPricingData,
  upsertCostBenchmark,
  listCostBenchmarks,
} from "./admin.analytics.controller.js";

const router = Router();

router.use(requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getUsers);
router.put("/users/:id/role", changeUserRole);
router.put("/users/:id/toggle-active", toggleUserActive);
router.get("/verification-queue", getVerificationQueue);
router.post("/verification/:id/approve", approveVerification);
router.post("/verification/:id/reject", rejectVerification);

router.get("/plans", getAdminPlans);
router.put("/plans/:id/moderate", moderatePlan);
router.get("/listings", getAdminListings);
router.put("/listings/:id/moderate", moderateListing);

router.get("/analytics", getAnalyticsOverview);
router.get("/analytics/regional", getRegionalAnalytics);
router.get("/analytics/experts", getExpertAnalytics);
router.get("/analytics/platform-health", getPlatformHealth);

router.get("/pricing/readiness", getPricingReadiness);
router.get("/pricing/template", getPricingImportTemplate);
router.post("/pricing/import", importPricingData);

router.get("/cost-benchmarks", listCostBenchmarks);
router.post("/cost-benchmarks", upsertCostBenchmark);

export default router;
