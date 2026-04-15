import { Router } from "express";
import { protect, requireRole } from "../../middlewares/auth.js";
import { uploadMultiple } from "../../middlewares/upload.js";
import { requirePlanDownloadPayment } from "../payments/payment-guard.middleware.js";
import {
  approvePlan,
  createPlan,
  createPlanRequest,
  deletePlan,
  downloadPlan,
  getAllPlanRequests,
  updatePlanRequest,
  getMyPlanRequests,
  getMyPlans,
  getPlanById,
  getPlans,
  updatePlan,
  uploadPlanAssets,
} from "./plans.controller.js";

const router = Router();

const planPublisherRoles = ["ENGINEER", "ADMIN", "SUPER_ADMIN"];

router.get("/", getPlans);
router.get("/me", protect, getMyPlans);
router.get("/requests/mine", protect, getMyPlanRequests);
router.get("/:id/download", protect, requirePlanDownloadPayment, downloadPlan);
router.get("/:id", getPlanById);
router.post("/", protect, requireRole(planPublisherRoles), uploadMultiple("assets", 10), createPlan);
router.post("/:id/requests", protect, createPlanRequest);
router.put("/:id", protect, requireRole(planPublisherRoles), uploadMultiple("assets", 5), updatePlan);
router.delete("/:id", protect, requireRole(planPublisherRoles), deletePlan);
router.post("/:id/assets", protect, requireRole(planPublisherRoles), uploadMultiple("assets", 5), uploadPlanAssets);
router.patch("/:id/approve", protect, requireRole(["ADMIN"]), approvePlan);
router.get("/requests/all", protect, requireRole(["ADMIN", "SUPER_ADMIN"]), getAllPlanRequests);
router.patch("/requests/:requestId/status", protect, requireRole(["ADMIN", "SUPER_ADMIN"]), updatePlanRequest);

export default router;
