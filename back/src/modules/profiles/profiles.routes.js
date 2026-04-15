import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { uploadSingle } from "../../middlewares/upload.js";
import { getMyProfile, updateMyProfile, uploadAvatar, getPublicProfile } from "./profiles.controller.js";

const router = Router();

router.get("/me",          protect, getMyProfile);
router.put("/me",          protect, updateMyProfile);
router.post("/me/avatar",  protect, uploadSingle("avatar"), uploadAvatar);
router.get("/:id",         getPublicProfile);

export default router;
