import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import {
    getListings, getListingById, createListing, updateListing, deleteListing, getMyListings,
} from "./listings.controller.js";

const router = Router();

router.get("/", getListings);
router.get("/me", protect, getMyListings);
router.get("/:id", getListingById);
router.post("/", protect, createListing);
router.put("/:id", protect, updateListing);
router.delete("/:id", protect, deleteListing);

export default router;
