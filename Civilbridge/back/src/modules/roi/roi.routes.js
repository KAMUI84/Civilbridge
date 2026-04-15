import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { calculateROI, calculateCarbon, getMyROICalculations, getMyCarbonAnalyses } from "./roi.controller.js";

const router = Router();

// ROI routes
router.post("/calculate", protect, calculateROI);
router.get("/", protect, getMyROICalculations);

// Carbon analysis routes
router.post("/carbon", protect, calculateCarbon);
router.get("/carbon", protect, getMyCarbonAnalyses);

export default router;
