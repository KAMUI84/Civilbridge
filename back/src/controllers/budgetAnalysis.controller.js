import { aiBudgetAnalysisService } from '../services/aiBudgetAnalysis.service.js';

export async function analyzeBudget(req, res) {
  try {
    const { budget, region_id, preferences = {} } = req.body;
    
    if (!budget || !region_id) {
      return res.status(400).json({ 
        error: 'Budget and region_id are required' 
      });
    }

    if (budget < 1000000) {
      return res.status(400).json({ 
        error: 'Budget is too low for meaningful analysis (minimum 1M RWF)' 
      });
    }

    const analysis = await aiBudgetAnalysisService.analyzeBudget(
      Number(budget), 
      Number(region_id), 
      preferences
    );

    return res.json(analysis);
  } catch (error) {
    console.error('Budget analysis error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze budget',
      message: error.message 
    });
  }
}

export async function getStandardPlans(req, res) {
  try {
    const plans = aiBudgetAnalysisService.getStandardPlans();
    return res.json({ plans });
  } catch (error) {
    console.error('Error getting standard plans:', error);
    return res.status(500).json({ 
      error: 'Failed to get standard plans' 
    });
  }
}

export async function getMarketInsights(req, res) {
  try {
    const { region_id } = req.params;
    
    if (!region_id) {
      return res.status(400).json({ 
        error: 'Region ID is required' 
      });
    }

    const insights = await aiBudgetAnalysisService.getMarketInsights(Number(region_id));
    return res.json(insights);
  } catch (error) {
    console.error('Error getting market insights:', error);
    return res.status(500).json({ 
      error: 'Failed to get market insights' 
    });
  }
}
