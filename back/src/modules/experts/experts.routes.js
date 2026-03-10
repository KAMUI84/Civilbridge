import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { getExperts, getExpertById, applyAsExpert, updateExpertProfile } from "./experts.controller.js";

const router = Router();

router.get("/", getExperts);
router.get("/:id", getExpertById);
router.post("/apply", protect, applyAsExpert);
router.put("/profile", protect, updateExpertProfile);

export default router;
