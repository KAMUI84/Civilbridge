import { Router } from "express";
import { protect, requireRole } from "../../middlewares/auth.js";
import { uploadMultiple } from "../../middlewares/upload.js";
import {
    getListings, getListingById, createListing, updateListing, deleteListing, getMyListings,
    uploadListingImages, moderateListing,
} from "./listings.controller.js";

const router = Router();

router.get("/", getListings);
router.get("/me", protect, getMyListings);
router.get("/:id", getListingById);
router.post("/", protect, uploadMultiple("images", 10), createListing);
router.put("/:id", protect, uploadMultiple("images", 5), updateListing);
router.delete("/:id", protect, deleteListing);
router.post("/:id/images", protect, uploadMultiple("images", 5), uploadListingImages);
router.patch("/:id/moderate", protect, requireRole(["ADMIN"]), moderateListing);

export default router;
