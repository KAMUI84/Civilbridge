// User Management Routes with RBAC
import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUserRole, 
  updateUserStatus, 
  createUser, 
  deleteUser, 
  getCurrentUserPermissions,
  requirePermission 
} from './user.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes (you'll need to add this)
// router.use(authMiddleware);

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin/Super Admin only)
 * @access  Private (Requires MANAGE_USERS permission)
 */
router.get('/', requirePermission('MANAGE_USERS'), getAllUsers);

/**
 * @route   GET /api/users/me/permissions
 * @desc    Get current user's permissions
 * @access  Private
 */
router.get('/me/permissions', getCurrentUserPermissions);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin/Super Admin or own profile)
 * @access  Private
 */
router.get('/:id', requirePermission('MANAGE_USERS'), getUserById);

/**
 * @route   POST /api/users
 * @desc    Create new user (Admin/Super Admin only)
 * @access  Private (Requires MANAGE_USERS permission)
 */
router.post('/', requirePermission('MANAGE_USERS'), createUser);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (Admin/Super Admin only)
 * @access  Private (Requires ASSIGN_ROLES permission)
 */
router.put('/:id/role', requirePermission('ASSIGN_ROLES'), updateUserRole);

/**
 * @route   PUT /api/users/:id/status
 * @desc    Update user status (Admin/Super Admin only)
 * @access  Private (Requires MANAGE_USERS permission)
 */
router.put('/:id/status', requirePermission('MANAGE_USERS'), updateUserStatus);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Super Admin only)
 * @access  Private (Requires MANAGE_USERS permission)
 */
router.delete('/:id', requirePermission('MANAGE_USERS'), deleteUser);

export default router;
