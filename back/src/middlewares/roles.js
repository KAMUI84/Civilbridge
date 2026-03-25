// Role-based authorization middleware

export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

export const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
        return res.status(403).json({
            message: `Access restricted to: ${roles.join(", ")}`,
        });
    }
    next();
};

export const requireVerified = (req, res, next) => {
    if (!["SUPER_ADMIN", "ADMIN", "ENGINEER"].includes(req.user?.role)) {
        return res.status(403).json({ message: "Verified professional or admin account required" });
    }
    next();
};
