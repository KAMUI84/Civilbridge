import { Router } from "express";
import { getAllRegions, getRegionById } from "./regions.controller.js";

const router = Router();

router.get("/", getAllRegions);
router.get("/:id", getRegionById);

export default router;
