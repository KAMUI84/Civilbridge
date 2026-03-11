import { Router } from "express";
import { requireAdmin } from "../../middlewares/roles.js";
import {
    getAdminStats, getUsers, changeUserRole, toggleUserActive,
    getVerificationQueue, approveVerification, rejectVerification,
    getAdminPlans, moderatePlan, getAdminListings, moderateListing,
} from "./admin.controller.js";

const router = Router();

// All routes already protected by protect middleware from app.js
router.use(requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getUsers);
router.put("/users/:id/role", changeUserRole);
router.put("/users/:id/toggle-active", toggleUserActive);
router.get("/verification-queue", getVerificationQueue);
router.post("/verification/:id/approve", approveVerification);
router.post("/verification/:id/reject", rejectVerification);

router.get("/plans", getAdminPlans);
router.put("/plans/:id/moderate", moderatePlan);
router.get("/listings", getAdminListings);
router.put("/listings/:id/moderate", moderateListing);

export default router;
