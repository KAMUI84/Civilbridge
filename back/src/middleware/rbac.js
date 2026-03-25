// RBAC Middleware - Role-Based Access Control
import prisma from "../config/prisma.js";

// Permission matrix for each role
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    // User Management
    'MANAGE_USERS', 'ASSIGN_ROLES',
    // Project Management
    'CREATE_PROJECT', 'EDIT_OWN_PROJECT', 'EDIT_ANY_PROJECT', 
    'DELETE_OWN_PROJECT', 'DELETE_ANY_PROJECT', 'VIEW_OWN_PROJECT', 'VIEW_ANY_PROJECT',
    // Content Management
    'APPROVE_REQUESTS', 'MODERATE_CONTENT',
    // Analytics & Reports
    'VIEW_ANALYTICS', 'VIEW_REPORTS', 'GENERATE_REPORTS',
    // System Management
    'SYSTEM_SETTINGS', 'MANAGE_API_KEYS', 'VIEW_LOGS',
    // Financial
    'MANAGE_TRANSACTIONS', 'VIEW_PAYMENT_HISTORY',
    // Communication
    'COMMUNICATE_CLIENTS', 'UPLOAD_FILES',
    // Basic Operations
    'BROWSE_PUBLIC', 'LOGIN_ACCESS'
  ],
  
  ADMIN: [
    // User Management (except Super Admin)
    'MANAGE_USERS',
    // Project Management
    'CREATE_PROJECT', 'EDIT_ANY_PROJECT', 'DELETE_ANY_PROJECT', 'VIEW_ANY_PROJECT',
    // Content Management
    'APPROVE_REQUESTS', 'MODERATE_CONTENT',
    // Analytics & Reports
    'VIEW_ANALYTICS', 'VIEW_REPORTS',
    // Communication
    'COMMUNICATE_CLIENTS', 'UPLOAD_FILES',
    // Basic Operations
    'BROWSE_PUBLIC', 'LOGIN_ACCESS'
  ],
  
  ENGINEER: [
    // Project Management (own projects)
    'CREATE_PROJECT', 'EDIT_OWN_PROJECT', 'DELETE_OWN_PROJECT', 'VIEW_OWN_PROJECT',
    // Communication
    'COMMUNICATE_CLIENTS', 'UPLOAD_FILES',
    // Basic Operations
    'BROWSE_PUBLIC', 'LOGIN_ACCESS'
  ],
  
  CLIENT: [
    // Project Management (own projects)
    'CREATE_PROJECT', 'EDIT_OWN_PROJECT', 'DELETE_OWN_PROJECT', 'VIEW_OWN_PROJECT',
    // Communication
    'COMMUNICATE_CLIENTS', 'UPLOAD_FILES',
    // Basic Operations
    'BROWSE_PUBLIC', 'LOGIN_ACCESS'
  ],
  
  VIEWER: [
    // Basic Operations only
    'BROWSE_PUBLIC', 'LOGIN_ACCESS'
  ],
  
  AUDITOR: [
    // Read-only access to most things
    'VIEW_ANY_PROJECT', 'VIEW_REPORTS', 'VIEW_ANALYTICS', 'VIEW_LOGS',
    // Basic Operations
    'BROWSE_PUBLIC', 'LOGIN_ACCESS'
  ],
  
  FINANCE: [
    // Financial permissions
    'MANAGE_TRANSACTIONS', 'VIEW_PAYMENT_HISTORY', 'GENERATE_REPORTS',
    // Basic Operations
    'BROWSE_PUBLIC', 'LOGIN_ACCESS'
  ]
};

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId, permission) {
  try {
    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true }
    });
    
    if (!user || !user.isActive) {
      return false;
    }
    
    // Check if role has permission
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
    
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Check if a user has any of the specified permissions
 */
export async function hasAnyPermission(userId, permissions) {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Middleware to require specific permission
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Get user from JWT token or session
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      // Check permission
      const authorized = await hasPermission(userId, permission);
      
      if (!authorized) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions',
          required: permission 
        });
      }
      
      // Add user info to request for downstream use
      req.user = { ...req.user, permission };
      next();
      
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Permission check failed' 
      });
    }
  };
};

/**
 * Middleware to require any of multiple permissions
 */
export const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const authorized = await hasAnyPermission(userId, permissions);
      
      if (!authorized) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions',
          required: permissions 
        });
      }
      
      next();
      
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Permission check failed' 
      });
    }
  };
};

/**
 * Middleware to check ownership or admin access
 */
export const requireOwnershipOrAdmin = (resourceIdParam = 'id', resourceType = 'project') => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const resourceId = parseInt(req.params[resourceIdParam]);
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      // Check if user is admin or super admin
      const isAdmin = await hasAnyPermission(userId, ['MANAGE_USERS', 'EDIT_ANY_PROJECT']);
      
      if (isAdmin) {
        return next(); // Admins can access any resource
      }
      
      // Check ownership based on resource type
      let isOwner = false;
      
      switch (resourceType) {
        case 'project':
          const project = await prisma.project.findUnique({
            where: { id: resourceId },
            select: { creatorId: true }
          });
          isOwner = project?.creatorId === userId;
          break;
          
        case 'user':
          isOwner = resourceId === userId;
          break;
          
        default:
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid resource type' 
          });
      }
      
      if (!isOwner) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied: You can only access your own resources' 
        });
      }
      
      next();
      
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Ownership check failed' 
      });
    }
  };
};

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true }
    });
    
    if (!user || !user.isActive) {
      return [];
    }
    
    return ROLE_PERMISSIONS[user.role] || [];
    
  } catch (error) {
    console.error('Get user permissions error:', error);
    return [];
  }
}

/**
 * Initialize role permissions in database
 */
export async function initializeRolePermissions() {
  try {
    console.log('🔐 Initializing RBAC permissions...');
    
    // Clear existing permissions
    await prisma.rolePermission.deleteMany({});
    
    // Insert all role permissions
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      for (const permission of permissions) {
        let permRec = await prisma.permission.findUnique({ where: { name: permission } });
        if (!permRec) {
          permRec = await prisma.permission.create({ data: { name: permission } });
        }
        await prisma.rolePermission.create({
          data: { role, permissionId: permRec.id }
        });
      }
    }
    
    console.log(`✅ Initialized ${permissionsToInsert.length} role permissions`);
    
  } catch (error) {
    console.error('❌ Failed to initialize permissions:', error);
  }
}
