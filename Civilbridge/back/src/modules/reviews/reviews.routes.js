import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { createReview, getExpertReviews, deleteReview } from "./reviews.controller.js";

const router = Router();

router.get("/expert/:id", getExpertReviews);
router.post("/", protect, createReview);
router.delete("/:id", protect, deleteReview);

export default router;
