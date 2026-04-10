// User Management Routes with RBAC
import express from 'express';
import { protect } from '../../middlewares/auth.js';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  createUser,
  deleteUser,
  getCurrentUserPermissions,
  requirePermission,
} from './user.controller.js';

const router = express.Router();

// Every route in this file requires a valid session first (protect),
// then the relevant permission check second.
router.use(protect);

router.get('/',                protect, requirePermission('MANAGE_USERS'), getAllUsers);
router.get('/me/permissions',  protect, getCurrentUserPermissions);
router.get('/:id',             protect, requirePermission('MANAGE_USERS'), getUserById);
router.post('/',               protect, requirePermission('MANAGE_USERS'), createUser);
router.put('/:id/role',        protect, requirePermission('ASSIGN_ROLES'), updateUserRole);
router.put('/:id/status',      protect, requirePermission('MANAGE_USERS'), updateUserStatus);
router.delete('/:id',          protect, requirePermission('MANAGE_USERS'), deleteUser);

export default router;
