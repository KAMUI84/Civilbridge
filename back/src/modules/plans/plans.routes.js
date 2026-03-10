import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { getPlans, getPlanById, createPlan, updatePlan, getMyPlans } from "./plans.controller.js";

const router = Router();

router.get("/", getPlans);
router.get("/me", protect, getMyPlans);
router.get("/:id", getPlanById);
router.post("/", protect, createPlan);
router.put("/:id", protect, updatePlan);

export default router;
