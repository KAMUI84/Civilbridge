import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { requireBoqExportPayment } from "../payments/payment-guard.middleware.js";
import { getBOQ, addBOQItem, updateBOQItem, deleteBOQItem, exportProjectBOQPdf } from "./boq.controller.js";

const router = Router();

router.get("/:estimate_id",       protect, requireBoqExportPayment, getBOQ);
router.post("/project/:projectId/export", protect, exportProjectBOQPdf);
router.post("/:estimate_id/items", protect, addBOQItem);
router.put("/items/:id",           protect, updateBOQItem);
router.delete("/items/:id",        protect, deleteBOQItem);

export default router;
