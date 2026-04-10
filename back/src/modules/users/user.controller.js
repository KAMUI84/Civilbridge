// User Management Controller - Role Assignment and Management
import prisma from "../../config/prisma.js";
import { hasPermission, requirePermission, requireOwnershipOrAdmin, getUserPermissions } from "../../middleware/rbac.core.js";
import { ALL_USER_ROLES } from "../../constants/roles.js";
import { hashPassword } from "../../utils/password.js";

/**
 * Get all users (Admin/Super Admin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }
    if (role) {
      where.role = role;
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          verificationStatus: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        verificationStatus: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user' 
    });
  }
};

/**
 * Update user role (Admin/Super Admin only)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // 🔒 SECURITY VALIDATIONS
    
    // 1. Validate role
    if (role && !ALL_USER_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }
    
    // 2. Prevent self-role changes (security critical)
    if (parseInt(id) === req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot change your own role - security violation' 
      });
    }
    
    // 3. Only SUPER_ADMIN can assign SUPER_ADMIN role
    if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only Super Admin can assign Super Admin role' 
      });
    }
    
    // 4. Prevent non-super-admins from modifying super-admins
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { role: true }
    });
    
    if (targetUser?.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot modify Super Admin users' 
      });
    }
    
    // 5. Get current user for audit
    const current = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { role: true }
    });
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "ROLE_CHANGE",
        entityType: "USER",
        entityId: BigInt(id),
        metaJson: {
          targetUserId: parseInt(id),
          oldRole: current?.role || null,
          newRole: role,
          changedBy: req.user.email || req.user.id,
          timestamp: new Date().toISOString()
        }
      }
    });
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
    
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user role' 
    });
  }
};

/**
 * Update user status (activate/deactivate)
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    // Prevent user from deactivating themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot change your own status' 
      });
    }
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        updatedAt: true
      }
    });
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
        entityType: "USER",
        entityId: BigInt(id),
        metaJson: { targetUserId: parseInt(id) }
      }
    });
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
    
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status' 
    });
  }
};

/**
 * Create user (Admin/Super Admin only)
 */
export const createUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role = 'CLIENT' } = req.body;

    if (!ALL_USER_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role provided'
      });
    }
    
    // Validate required fields
    if (!fullName || (!email && !phone) || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name, email/phone, and password are required' 
      });
    }
    
    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      }
    });
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or phone already exists' 
      });
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        fullName,
        email: email || null,
        phone: phone || null,
        passwordHash,
        role,
        verificationStatus: 'VERIFIED'
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        verificationStatus: true,
        createdAt: true
      }
    });
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "USER_CREATED",
        entityType: "USER",
        entityId: BigInt(user.id),
        metaJson: { createdUserId: user.id }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user' 
    });
  }
};

/**
 * Delete user (Super Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent user from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Soft delete (deactivate) instead of hard delete
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { 
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}`, // Make email unique
        phone: user.phone ? `deleted_${Date.now()}_${user.phone}` : null
      }
    });
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "USER_DELETED",
        entityType: "USER",
        entityId: BigInt(id),
        metaJson: { deletedUserId: parseInt(id) }
      }
    });
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user' 
    });
  }
};

/**
 * Get current user permissions
 */
export const getCurrentUserPermissions = async (req, res) => {
  try {
    const permissions = await getUserPermissions(req.user.id);
    
    res.json({
      success: true,
      data: {
        userId: req.user.id,
        role: req.user.role,
        permissions
      }
    });
    
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch permissions' 
    });
  }
};

// Export middleware for use in routes
export { requirePermission, requireOwnershipOrAdmin };
