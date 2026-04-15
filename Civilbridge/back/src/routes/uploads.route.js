import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { 
  uploadPlanFiles, 
  uploadListingFiles, 
  uploadPlan, 
  uploadMarketplaceListing, 
  getPlans, 
  getMarketplaceListings, 
  getUserUploads 
} from '../controllers/uploads.controller.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Upload endpoints
router.post('/plans', uploadPlanFiles, uploadPlan);
router.post('/marketplace', uploadListingFiles, uploadMarketplaceListing);

// Get endpoints
router.get('/plans', getPlans);
router.get('/marketplace', getMarketplaceListings);
router.get('/my-uploads', getUserUploads);

export default router;
