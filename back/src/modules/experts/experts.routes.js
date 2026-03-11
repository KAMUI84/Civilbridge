import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { uploadSingle } from "../../middlewares/upload.js";
import {
  getExperts, getExpertById, applyAsExpert, updateExpertProfile,
  createReview, updateReview, deleteReview,
} from "./experts.controller.js";

const router = Router();

router.get("/", getExperts);
router.get("/:id", getExpertById);
router.post("/apply", protect, uploadSingle("verificationDoc"), applyAsExpert);
router.put("/profile", protect, uploadSingle("avatar"), updateExpertProfile);
router.post("/:id/reviews", protect, createReview);
router.put("/reviews/:reviewId", protect, updateReview);
router.delete("/reviews/:reviewId", protect, deleteReview);

export default router;
