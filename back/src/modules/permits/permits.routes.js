import { Router } from "express";
import { getPermitGuides, getPermitGuideById, getPermitChecklist } from "./permits.controller.js";

const router = Router();

router.get("/", getPermitGuides);
router.get("/checklist", getPermitChecklist);
router.get("/:id", getPermitGuideById);

export default router;
