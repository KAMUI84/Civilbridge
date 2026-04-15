import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/roles.js";
import {
  getCatalog, getCatalogItem, createCatalogItem, updateCatalogItem, deleteCatalogItem,
  getEstimates, getEstimateById, createEstimate, updateEstimate, deleteEstimate,
  addItemToEstimate, updateEstimateItem, deleteEstimateItem,
} from "./estimator.controller.js";

const router = Router();

// Public catalog routes
router.get("/catalog", getCatalog);
router.get("/catalog/:id", getCatalogItem);

// Admin-only catalog management — protect then requireAdmin
router.post("/catalog",    protect, requireAdmin, createCatalogItem);
router.put("/catalog/:id", protect, requireAdmin, updateCatalogItem);
router.delete("/catalog/:id", protect, requireAdmin, deleteCatalogItem);

// Protected estimate routes
router.get("/estimates", protect, getEstimates);
router.get("/estimates/:id", protect, getEstimateById);
router.post("/estimates", protect, createEstimate);
router.put("/estimates/:id", protect, updateEstimate);
router.delete("/estimates/:id", protect, deleteEstimate);

// Estimate items
router.post("/estimates/:id/items", protect, addItemToEstimate);
router.put("/estimates/items/:itemId", protect, updateEstimateItem);
router.delete("/estimates/items/:itemId", protect, deleteEstimateItem);

export default router;
