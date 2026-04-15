import { Router } from "express";
import { protect, requireRole } from "../../middlewares/auth.js";
import { uploadMultiple } from "../../middlewares/upload.js";
import {
    getListings, getListingById, createListing, updateListing, deleteListing, getMyListings, getMyLeadRequests,
    getAllLeadRequests, updateLeadRequest,
    uploadListingImages, moderateListing, inquireListing,
} from "./listings.controller.js";

const router = Router();
const listingPublisherRoles = ["ADMIN", "SUPER_ADMIN"];

router.get("/", getListings);
router.get("/me", protect, getMyListings);
router.get("/requests/mine", protect, getMyLeadRequests);
router.get("/requests/all", protect, requireRole(["ADMIN", "SUPER_ADMIN"]), getAllLeadRequests);
router.patch("/requests/:requestId/status", protect, requireRole(["ADMIN", "SUPER_ADMIN"]), updateLeadRequest);
router.get("/:id", getListingById);
router.post("/", protect, requireRole(listingPublisherRoles), uploadMultiple("images", 10), createListing);
router.put("/:id", protect, requireRole(listingPublisherRoles), uploadMultiple("images", 5), updateListing);
router.delete("/:id", protect, requireRole(listingPublisherRoles), deleteListing);
router.post("/:id/images", protect, requireRole(listingPublisherRoles), uploadMultiple("images", 5), uploadListingImages);
router.post("/:id/inquire", inquireListing);
router.patch("/:id/moderate", protect, requireRole(["ADMIN"]), moderateListing);

export default router;
