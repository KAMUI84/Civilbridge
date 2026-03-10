import { Router } from "express";
import { calculateCarbon, getMyCarbonCalculations } from "./carbon.controller.js";

const router = Router();

router.post("/calculate", calculateCarbon);
router.get("/", getMyCarbonCalculations);

export default router;
