import { ensureConfirmedPayment } from "./payments.service.js";

function resolveReferenceValue(req, resolveReference) {
  if (typeof resolveReference === "function") return resolveReference(req);
  if (typeof resolveReference === "string") {
    return (
      req.params?.[resolveReference] ??
      req.query?.[resolveReference] ??
      req.body?.[resolveReference] ??
      null
    );
  }
  return null;
}

export function requireConfirmedPayment({ serviceType, resolveReference }) {
  return async (req, res, next) => {
    try {
      const serviceReference = resolveReferenceValue(req, resolveReference);
      if (!serviceReference) {
        return res.status(400).json({ message: "Missing service reference for payment guard" });
      }

      const transaction = await ensureConfirmedPayment({
        userId: req.user.id,
        serviceType,
        serviceReference,
      });

      req.paymentTransaction = transaction;
      next();
    } catch (error) {
      const status = error.status || 402;
      res.status(status).json({
        message: error.message || "Payment confirmation is required before accessing this service",
      });
    }
  };
}

export const requirePlanDownloadPayment = requireConfirmedPayment({
  serviceType: "PLAN_DOWNLOAD",
  resolveReference: (req) => req.params.planId || req.params.id || req.query.planId || req.body?.planId,
});

export const requireBoqExportPayment = requireConfirmedPayment({
  serviceType: "BOQ_EXPORT",
  resolveReference: (req) =>
    req.params.estimateId || req.params.id || req.query.estimateId || req.body?.estimateId,
});

export const requireEngineerAssignmentPayment = requireConfirmedPayment({
  serviceType: "ENGINEER_ASSIGNMENT",
  resolveReference: (req) =>
    req.params.projectId || req.params.id || req.query.projectId || req.body?.projectId,
});

const ENGINEER_ASSIGNMENT_ROLES = new Set([
  "ENGINEER",
  "PROFESSIONAL",
  "ARCHITECT",
  "CONTRACTOR",
]);

export function requireEngineerAssignmentPaymentIfNeeded() {
  return async (req, res, next) => {
    const requestedRole = String(req.body?.role || req.body?.memberRole || "VIEWER").toUpperCase();

    if (!ENGINEER_ASSIGNMENT_ROLES.has(requestedRole)) {
      return next();
    }

    return requireEngineerAssignmentPayment(req, res, next);
  };
}
