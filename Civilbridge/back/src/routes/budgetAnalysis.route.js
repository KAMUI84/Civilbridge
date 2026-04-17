import { Router } from 'express';
import { analyzeBudget, getStandardPlans, getMarketInsights } from '../controllers/budgetAnalysis.controller.js';

const router = Router();

// Analyze budget and get recommendations
router.post('/analyze', analyzeBudget);

// Get standard architectural plans
router.get('/plans', getStandardPlans);

// Get market insights for a region
router.get('/insights/:region_id', getMarketInsights);

export default router;
