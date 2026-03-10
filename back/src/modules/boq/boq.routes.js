import { Router } from "express";
import { getBOQ, addBOQItem, updateBOQItem, deleteBOQItem } from "./boq.controller.js";

const router = Router();

// All routes already protected from app.js
router.get("/:estimate_id", getBOQ);
router.post("/:estimate_id/items", addBOQItem);
router.put("/items/:id", updateBOQItem);
router.delete("/items/:id", deleteBOQItem);

export default router;
