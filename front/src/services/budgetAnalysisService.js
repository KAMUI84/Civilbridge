import { api } from './apiClientService.js';

export const budgetAnalysisService = {
  // Analyze budget and get AI recommendations
  async analyzeBudget(budget, regionId, preferences = {}) {
    const response = await api.post('/api/budget/analyze', {
      budget,
      region_id: regionId,
      preferences
    });
    return response;
  },

  // Get standard architectural plans
  async getStandardPlans() {
    const response = await api.get('/api/budget/plans');
    return response;
  },

  // Get market insights for a region
  async getMarketInsights(regionId) {
    const response = await api.get(`/api/budget/insights/${regionId}`);
    return response;
  }
};
