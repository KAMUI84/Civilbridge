import { Router } from "express";
import { getProjectProgress, createMilestone, updateMilestone, deleteMilestone } from "./progress.controller.js";

const router = Router();

router.get("/:project_id", getProjectProgress);
router.post("/:project_id/milestones", createMilestone);
router.put("/milestones/:id", updateMilestone);
router.delete("/milestones/:id", deleteMilestone);

export default router;
