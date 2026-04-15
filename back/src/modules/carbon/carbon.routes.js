import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { calculateCarbon, getMyCarbonCalculations } from "./carbon.controller.js";

const router = Router();

router.post("/calculate", protect, calculateCarbon);
router.get("/",           protect, getMyCarbonCalculations);

export default router;
