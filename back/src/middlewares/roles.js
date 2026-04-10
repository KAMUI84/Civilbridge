// Role-based authorization middleware
// SUPER_ADMIN bypasses every role restriction on this platform.
import { ADMIN_ROLES, VERIFIED_ACCOUNT_ROLES, normalizeRoles } from "../constants/roles.js";

export const requireAdmin = (req, res, next) => {
    if (!ADMIN_ROLES.includes(req.user?.role)) {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

export const requireRole = (...roles) => (req, res, next) => {
    const allowedRoles = normalizeRoles(...roles);

    // SUPER_ADMIN is never restricted by role guards.
    if (req.user?.role === "SUPER_ADMIN") return next();

    if (!allowedRoles.includes(req.user?.role)) {
        return res.status(403).json({
            message: `Access restricted to: ${allowedRoles.join(", ")}`,
        });
    }
    next();
};

export const requireVerified = (req, res, next) => {
    // SUPER_ADMIN always passes verification gate.
    if (req.user?.role === "SUPER_ADMIN") return next();

    if (!VERIFIED_ACCOUNT_ROLES.includes(req.user?.role)) {
        return res.status(403).json({ message: "Verified professional or admin account required" });
    }
    next();
};
