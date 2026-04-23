import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import {
  uploadPlanFiles,
  uploadListingFiles,
  uploadPlan,
  uploadMarketplaceListing,
  getPlans,
  getMarketplaceListings,
  getUserUploads,
} from "./uploads.controller.js";

const router = Router();

router.post("/plans", protect, uploadPlanFiles, uploadPlan);
router.post("/marketplace", protect, uploadListingFiles, uploadMarketplaceListing);
router.get("/plans", getPlans);
router.get("/marketplace", getMarketplaceListings);
router.get("/my-uploads", protect, getUserUploads);

export default router;
