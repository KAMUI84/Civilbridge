import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { getMyProfile, updateMyProfile, getPublicProfile } from "./profiles.controller.js";

const router = Router();

router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.get("/:id", getPublicProfile);

export default router;
