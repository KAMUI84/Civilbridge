import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/roles.js";
import {
    getCatalogItems,
    getCatalogItemById,
    createCatalogItem,
    updateCatalogItem,
    getCatalogCategories,
} from "./catalog.controller.js";

const router = Router();

router.get("/", getCatalogItems);
router.get("/categories", getCatalogCategories);
router.get("/:id", getCatalogItemById);
router.post("/", protect, requireAdmin, createCatalogItem);
router.put("/:id", protect, requireAdmin, updateCatalogItem);

export default router;
