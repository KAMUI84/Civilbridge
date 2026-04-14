import { Router } from "express";
import { protect, requireRole } from "../../middlewares/auth.js";
import { csrfGuard } from "../../middlewares/csrf.js";
import {
  airtelWebhookHandler,
  initiatePaymentHandler,
  invoiceHandler,
  mtnWebhookHandler,
  paymentHistoryHandler,
  pollPaymentStatusHandler,
  refundPaymentHandler,
  releaseMilestonePaymentHandler,
  stripeWebhookHandler,
} from "./payments.controller.js";
import { MILESTONE_APPROVER_ROLES, REFUND_ADMIN_ROLES } from "./payments.constants.js";

const router = Router();

router.post("/webhook/mtn", mtnWebhookHandler);
router.post("/webhook/airtel", airtelWebhookHandler);
router.post("/webhook/stripe", stripeWebhookHandler);

router.post("/initiate", protect, csrfGuard, initiatePaymentHandler);
router.get("/history", protect, paymentHistoryHandler);
router.get("/invoice/:transactionId", protect, invoiceHandler);
router.get("/status/:transactionId", protect, pollPaymentStatusHandler);
router.post(
  "/:transactionId/release",
  protect,
  csrfGuard,
  requireRole(MILESTONE_APPROVER_ROLES),
  releaseMilestonePaymentHandler,
);
router.post(
  "/:transactionId/refund",
  protect,
  csrfGuard,
  requireRole(REFUND_ADMIN_ROLES),
  refundPaymentHandler,
);

export default router;
