import { Router } from "express";
import { requireAdmin } from "../../middlewares/roles.js";
import { assignRoleHandler, getUserRoleHandler } from "./roles.controller.js";

const router = Router();

// protect is applied at the app.js mount point (/api/roles).
// requireAdmin here enforces ADMIN or SUPER_ADMIN for all role management actions.
router.use(requireAdmin);

router.post("/assign", assignRoleHandler);
router.get("/:userId", getUserRoleHandler);

export default router;
