import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import {
    runEstimation,
    checkFeasibility,
    getMyEstimates,
    getEstimateById,
    deleteEstimate,
} from "./estimation.controller.js";

const router = Router();

router.post("/run",         protect, runEstimation);
router.post("/feasibility", protect, checkFeasibility);
router.get("/",             protect, getMyEstimates);
router.get("/:id",          protect, getEstimateById);
router.delete("/:id",       protect, deleteEstimate);

export default router;
