import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { getProjectProgress, createMilestone, updateMilestone, deleteMilestone } from "./progress.controller.js";

const router = Router();

router.get("/:project_id",          protect, getProjectProgress);
router.post("/:project_id/milestones", protect, createMilestone);
router.put("/milestones/:id",        protect, updateMilestone);
router.delete("/milestones/:id",     protect, deleteMilestone);

export default router;
