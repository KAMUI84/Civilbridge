import { Router } from 'express';
import { getAllRegions, getRegionById } from '../controllers/regions.controller.js';

const router = Router();

// Get all regions
router.get('/', getAllRegions);

// Get specific region
router.get('/:id', getRegionById);

export default router;
