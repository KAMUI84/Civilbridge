import { Router } from "express";
import { protect, requireRole } from "../../middlewares/auth.js";
import { uploadMultiple } from "../../middlewares/upload.js";
import {
  getPlans, getPlanById, createPlan, updatePlan, deletePlan, getMyPlans,
  uploadPlanAssets, approvePlan,
} from "./plans.controller.js";

const router = Router();

const profRoles = ["ENGINEER", "CONTRACTOR", "ARCHITECT", "ADMIN"];

router.get("/", getPlans);
router.get("/me", protect, getMyPlans);
router.get("/:id", getPlanById);
router.post("/", protect, requireRole(profRoles), uploadMultiple("assets", 10), createPlan);
router.put("/:id", protect, requireRole(profRoles), uploadMultiple("assets", 5), updatePlan);
router.delete("/:id", protect, requireRole(profRoles), deletePlan);
router.post("/:id/assets", protect, requireRole(profRoles), uploadMultiple("assets", 5), uploadPlanAssets);
router.patch("/:id/approve", protect, requireRole(["ADMIN"]), approvePlan);

export default router;
