import { Router } from 'express';
import {
  getUserProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
} from './projects.controller.js';

const router = Router();

// All routes require authentication (applied via app.js)
router.get('/user', getUserProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addProjectMember);

export default router;
