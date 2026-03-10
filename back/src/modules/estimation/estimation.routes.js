import { Router } from "express";
import {
    runEstimation,
    checkFeasibility,
    getMyEstimates,
    getEstimateById,
    deleteEstimate,
} from "./estimation.controller.js";

const router = Router();

// All routes already protected by protect middleware from app.js
router.post("/run", runEstimation);
router.post("/feasibility", checkFeasibility);
router.get("/", getMyEstimates);
router.get("/:id", getEstimateById);
router.delete("/:id", deleteEstimate);

export default router;
