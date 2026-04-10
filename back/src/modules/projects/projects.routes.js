import { Router } from 'express';
import { protect } from '../../middlewares/auth.js';
import { uploadMultiple } from '../../middlewares/upload.js';
import { requireEngineerAssignmentPaymentIfNeeded } from '../payments/payment-guard.middleware.js';
import {
  getUserProjects, createProject, getProjectById, updateProject, deleteProject, addProjectMember,
  uploadDocuments, deleteDocument, addPermit, updatePermit, deletePermit,
  addProgress, updateProgress, deleteProgress,
} from './projects.controller.js';

const router = Router();

// Protected: all routes require authentication
router.get('/user', protect, getUserProjects);
router.post('/', protect, createProject);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/members', protect, requireEngineerAssignmentPaymentIfNeeded(), addProjectMember);

// Documents
router.post('/:id/documents', protect, uploadMultiple('documents', 5), uploadDocuments);
router.delete('/documents/:docId', protect, deleteDocument);

// Permits
router.post('/:id/permits', protect, addPermit);
router.put('/permits/:permitId', protect, updatePermit);
router.delete('/permits/:permitId', protect, deletePermit);

// Progress
router.post('/:id/progress', protect, addProgress);
router.put('/progress/:progressId', protect, updateProgress);
router.delete('/progress/:progressId', protect, deleteProgress);

export default router;
