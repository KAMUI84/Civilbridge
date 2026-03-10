import { Router } from 'express';
import { protect } from '../../middlewares/auth.js';
import { 
  getUserProjects, 
  createProject, 
  getProjectById, 
  updateProject, 
  deleteProject 
} from '../../controllers/projects.controller.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Get user's projects
router.get('/user', getUserProjects);

// Create new project
router.post('/', createProject);

// Get specific project
router.get('/:id', getProjectById);

// Update project
router.put('/:id', updateProject);

// Delete project
router.delete('/:id', deleteProject);

export default router;