import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const protect = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token)
      return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
};

export const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Forbidden: No role assigned" });
      }
      
      // Bypass permission check for SUPER_ADMIN completely
      if (req.user.role === 'SUPER_ADMIN') {
        return next();
      }
      
      const rolePerm = await prisma.rolePermission.findFirst({
        where: {
          role: req.user.role,
          permission: { name: permissionName }
        }
      });

      if (!rolePerm) {
        return res.status(403).json({ message: `Forbidden: Missing permission '${permissionName}'` });
      }
      
      next();
    } catch (err) {
      console.error("Permission check error:", err);
      res.status(500).json({ message: "Internal server error during authorization" });
    }
  };
};