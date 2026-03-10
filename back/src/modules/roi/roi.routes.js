import { Router } from "express";
import { calculateROI, getMyROICalculations } from "./roi.controller.js";

const router = Router();

router.post("/calculate", calculateROI);
router.get("/", getMyROICalculations);

export default router;
