import prisma from "../config/prisma.js";
import { ADMIN_ROLES } from "../constants/roles.js";

const BASIC_PERMISSIONS = ["BROWSE_PUBLIC", "LOGIN_ACCESS"];
const COLLABORATION_PERMISSIONS = ["COMMUNICATE_CLIENTS", "UPLOAD_FILES"];
const OWN_PROJECT_PERMISSIONS = [
  "CREATE_PROJECT",
  "EDIT_OWN_PROJECT",
  "DELETE_OWN_PROJECT",
  "VIEW_OWN_PROJECT",
];

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    "MANAGE_USERS",
    "ASSIGN_ROLES",
    "CREATE_PROJECT",
    "EDIT_OWN_PROJECT",
    "EDIT_ANY_PROJECT",
    "DELETE_OWN_PROJECT",
    "DELETE_ANY_PROJECT",
    "VIEW_OWN_PROJECT",
    "VIEW_ANY_PROJECT",
    "APPROVE_REQUESTS",
    "MODERATE_CONTENT",
    "VIEW_ANALYTICS",
    "VIEW_REPORTS",
    "GENERATE_REPORTS",
    "SYSTEM_SETTINGS",
    "MANAGE_API_KEYS",
    "VIEW_LOGS",
    "MANAGE_TRANSACTIONS",
    "VIEW_PAYMENT_HISTORY",
    ...COLLABORATION_PERMISSIONS,
    ...BASIC_PERMISSIONS,
  ],
  ADMIN: [
    "MANAGE_USERS",
    "ASSIGN_ROLES",
    "CREATE_PROJECT",
    "EDIT_ANY_PROJECT",
    "DELETE_ANY_PROJECT",
    "VIEW_ANY_PROJECT",
    "APPROVE_REQUESTS",
    "MODERATE_CONTENT",
    "VIEW_ANALYTICS",
    "VIEW_REPORTS",
    ...COLLABORATION_PERMISSIONS,
    ...BASIC_PERMISSIONS,
  ],
  PROFESSIONAL: [...OWN_PROJECT_PERMISSIONS, ...COLLABORATION_PERMISSIONS, ...BASIC_PERMISSIONS],
  ENGINEER: [...OWN_PROJECT_PERMISSIONS, ...COLLABORATION_PERMISSIONS, ...BASIC_PERMISSIONS],
  ARCHITECT: [...OWN_PROJECT_PERMISSIONS, ...COLLABORATION_PERMISSIONS, ...BASIC_PERMISSIONS],
  CONTRACTOR: [...OWN_PROJECT_PERMISSIONS, ...COLLABORATION_PERMISSIONS, ...BASIC_PERMISSIONS],
  SUPPLIER: ["VIEW_OWN_PROJECT", ...COLLABORATION_PERMISSIONS, ...BASIC_PERMISSIONS],
  CLIENT: [...OWN_PROJECT_PERMISSIONS, ...COLLABORATION_PERMISSIONS, "VIEW_PAYMENT_HISTORY", ...BASIC_PERMISSIONS],
  HOME_BUILDER: [...OWN_PROJECT_PERMISSIONS, ...COLLABORATION_PERMISSIONS, "VIEW_PAYMENT_HISTORY", ...BASIC_PERMISSIONS],
  VIEWER: [...BASIC_PERMISSIONS],
  AUDITOR: ["VIEW_ANY_PROJECT", "VIEW_REPORTS", "VIEW_ANALYTICS", "VIEW_LOGS", ...BASIC_PERMISSIONS],
  FINANCE: ["MANAGE_TRANSACTIONS", "VIEW_PAYMENT_HISTORY", "GENERATE_REPORTS", "VIEW_ANALYTICS", ...BASIC_PERMISSIONS],
  STUDENT: [...BASIC_PERMISSIONS],
};

export async function hasPermission(userId, permission) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return false;
    }

    return (ROLE_PERMISSIONS[user.role] || []).includes(permission);
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}

export async function hasAnyPermission(userId, permissions) {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission)) {
      return true;
    }
  }
  return false;
}

export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (req.user?.role === "SUPER_ADMIN") return next();

      const authorized = await hasPermission(userId, permission);

      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          required: permission,
        });
      }

      req.user = { ...req.user, permission };
      next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      res.status(500).json({
        success: false,
        message: "Permission check failed",
      });
    }
  };
};

export const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (req.user?.role === "SUPER_ADMIN") return next();

      const authorized = await hasAnyPermission(userId, permissions);

      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          required: permissions,
        });
      }

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      res.status(500).json({
        success: false,
        message: "Permission check failed",
      });
    }
  };
};

export const requireOwnershipOrAdmin = (resourceIdParam = "id", resourceType = "project") => {
  return async (req, res, next) => {
    try {
      const userId = Number(req.user?.id);
      const resourceId = Number(req.params[resourceIdParam]);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (ADMIN_ROLES.includes(req.user?.role)) {
        return next();
      }

      let isOwner = false;

      switch (resourceType) {
        case "project": {
          const project = await prisma.project.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          });
          isOwner = Number(project?.userId) === userId;
          break;
        }
        case "user":
          isOwner = resourceId === userId;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid resource type",
          });
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You can only access your own resources",
        });
      }

      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      res.status(500).json({
        success: false,
        message: "Ownership check failed",
      });
    }
  };
};

export async function getUserPermissions(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return [];
    }

    return ROLE_PERMISSIONS[user.role] || [];
  } catch (error) {
    console.error("Get user permissions error:", error);
    return [];
  }
}

export async function initializeRolePermissions() {
  try {
    console.log("Initializing RBAC permissions...");

    await prisma.rolePermission.deleteMany({});

    let createdMappings = 0;

    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      for (const permission of permissions) {
        let permRec = await prisma.permission.findUnique({ where: { name: permission } });
        if (!permRec) {
          permRec = await prisma.permission.create({ data: { name: permission } });
        }

        await prisma.rolePermission.create({
          data: { role, permissionId: permRec.id },
        });

        createdMappings += 1;
      }
    }

    console.log(`Initialized ${createdMappings} role permissions`);
  } catch (error) {
    console.error("Failed to initialize permissions:", error);
  }
}
