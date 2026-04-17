import { ai, MODEL } from '../ai/genaiclient.js';
import { marketDataService } from './marketData.service.js';
import { pool } from '../config/db.js';

class AIBudgetAnalysisService {
  constructor() {
    this.standardPlans = new Map();
    this.initializeStandardPlans();
  }

  initializeStandardPlans() {
    // Standard architectural plans for Rwanda
    this.standardPlans.set('small_house', {
      name: 'Small Residential House',
      min_budget: 5000000, // 5M RWF
      max_budget: 15000000, // 15M RWF
      size_range: { min: 40, max: 120 }, // sq meters
      bedrooms: { min: 2, max: 3 },
      bathrooms: { min: 1, max: 2 },
      construction_time: { min: 3, max: 6 }, // months
      base_materials: [
        { id: 1, quantity_per_m2: 0.15 }, // Cement bags per m2
        { id: 2, quantity_per_m2: 8 }, // Steel rebar meters per m2
        { id: 3, quantity_per_m2: 0.4 }, // Sand m3 per m2
        { id: 4, quantity_per_m2: 0.3 }, // Aggregate m3 per m2
      ],
      labor_days_per_m2: 15
    });

    this.standardPlans.set('medium_house', {
      name: 'Medium Residential House',
      min_budget: 15000000, // 15M RWF
      max_budget: 35000000, // 35M RWF
      size_range: { min: 120, max: 250 },
      bedrooms: { min: 3, max: 4 },
      bathrooms: { min: 2, max: 3 },
      construction_time: { min: 6, max: 9 },
      base_materials: [
        { id: 1, quantity_per_m2: 0.18 },
        { id: 2, quantity_per_m2: 10 },
        { id: 3, quantity_per_m2: 0.45 },
        { id: 4, quantity_per_m2: 0.35 },
      ],
      labor_days_per_m2: 18
    });

    this.standardPlans.set('large_house', {
      name: 'Large Residential House',
      min_budget: 35000000, // 35M RWF
      max_budget: 70000000, // 70M RWF
      size_range: { min: 250, max: 400 },
      bedrooms: { min: 4, max: 6 },
      bathrooms: { min: 3, max: 4 },
      construction_time: { min: 9, max: 12 },
      base_materials: [
        { id: 1, quantity_per_m2: 0.2 },
        { id: 2, quantity_per_m2: 12 },
        { id: 3, quantity_per_m2: 0.5 },
        { id: 4, quantity_per_m2: 0.4 },
      ],
      labor_days_per_m2: 20
    });
  }

  async analyzeBudget(budget, regionId, preferences = {}) {
    try {
      // Get regional cost adjustments
      const region = marketDataService.getRegionInfo(regionId);
      const materialMultiplier = marketDataService.getRegionalMultiplier(regionId, 'materials');
      const laborMultiplier = marketDataService.getRegionalMultiplier(regionId, 'labor');

      // Find suitable plans
      const suitablePlans = this.findSuitablePlans(budget, materialMultiplier, laborMultiplier);
      
      if (suitablePlans.length === 0) {
        return {
          success: false,
          message: 'Budget is too low for standard construction plans',
          suggestions: this.getLowBudgetSuggestions(budget, regionId)
        };
      }

      // Generate AI recommendations
      const aiRecommendations = await this.generateAIRecommendations(
        budget, 
        region, 
        suitablePlans, 
        preferences
      );

      // Calculate detailed cost breakdown
      const detailedAnalysis = await this.calculateDetailedCosts(
        suitablePlans[0], 
        budget, 
        regionId
      );

      return {
        success: true,
        budget,
        region: region?.name || 'Unknown',
        recommendations: aiRecommendations,
        suitable_plans: suitablePlans,
        detailed_analysis: detailedAnalysis,
        market_insights: await this.getMarketInsights(regionId)
      };

    } catch (error) {
      console.error('Budget analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze budget',
        message: error.message
      };
    }
  }

  findSuitablePlans(budget, materialMultiplier, laborMultiplier) {
    const suitable = [];

    for (const [key, plan] of this.standardPlans) {
      // Adjust budget ranges for regional costs
      const adjustedMin = plan.min_budget * Math.max(materialMultiplier, laborMultiplier);
      const adjustedMax = plan.max_budget * Math.max(materialMultiplier, laborMultiplier);

      if (budget >= adjustedMin && budget <= adjustedMax * 1.2) {
        suitable.push({
          key,
          ...plan,
          adjusted_min_budget: adjustedMin,
          adjusted_max_budget: adjustedMax,
          affordability_score: this.calculateAffordabilityScore(budget, adjustedMin, adjustedMax)
        });
      }
    }

    return suitable.sort((a, b) => b.affordability_score - a.affordability_score);
  }

  calculateAffordabilityScore(budget, minBudget, maxBudget) {
    if (budget < minBudget) return 0;
    if (budget > maxBudget) return 1;
    
    const range = maxBudget - minBudget;
    const position = (budget - minBudget) / range;
    return Math.round(position * 100) / 100;
  }

  async generateAIRecommendations(budget, region, plans, preferences) {
    const context = `
You are a construction expert for Rwanda. Analyze this budget situation:

Budget: ${budget.toLocaleString()} RWF
Region: ${region?.name || 'Kigali'}
Regional multipliers: ${JSON.stringify(region?.multipliers || {})}

Available Plans:
${plans.map(p => `
- ${p.name}: ${p.min_budget.toLocaleString()} - ${p.max_budget.toLocaleString()} RWF
  Size: ${p.size_range.min}-${p.size_range.max}m²
  Bedrooms: ${p.bedrooms.min}-${p.bedrooms.max}
  Construction time: ${p.construction_time.min}-${p.construction_time.max} months
`).join('\n')}

User Preferences: ${JSON.stringify(preferences)}

Provide specific recommendations including:
1. Best plan choice and why
2. Potential cost optimizations
3. Regional considerations
4. Construction timeline recommendations
5. Risk factors to consider
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: context }] }]
      });

      const text = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        recommendation: text,
        confidence: this.calculateRecommendationConfidence(budget, plans),
        key_insights: this.extractKeyInsights(text)
      };
    } catch (error) {
      console.error('AI recommendation error:', error);
      return {
        recommendation: 'AI service temporarily unavailable. Using standard recommendations.',
        confidence: 0.5,
        key_insights: ['Budget analysis based on regional data only']
      };
    }
  }

  calculateRecommendationConfidence(budget, plans) {
    if (plans.length === 0) return 0;
    if (plans.length === 1) {
      const plan = plans[0];
      const score = plan.affordability_score;
      return score > 0.5 ? 0.8 : 0.6;
    }
    return 0.9; // Multiple good options
  }

  extractKeyInsights(text) {
    const insights = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes('budget') || line.includes('cost') || line.includes('recommend')) {
        insights.push(line.trim());
      }
    }
    
    return insights.slice(0, 5); // Top 5 insights
  }

  async calculateDetailedCosts(plan, budget, regionId) {
    const region = marketDataService.getRegionInfo(regionId);
    const materialMultiplier = marketDataService.getRegionalMultiplier(regionId, 'materials');
    const laborMultiplier = marketDataService.getRegionalMultiplier(regionId, 'labor');

    // Estimate optimal size for the budget
    const estimatedSize = this.estimateOptimalSize(plan, budget, materialMultiplier, laborMultiplier);
    
    // Calculate material costs
    const materialCosts = await this.calculateMaterialCosts(plan, estimatedSize, regionId);
    
    // Calculate labor costs
    const laborCosts = await this.calculateLaborCosts(plan, estimatedSize, regionId);
    
    // Add other costs (permits, transport, etc.)
    const otherCosts = this.calculateOtherCosts(materialCosts.total, laborCosts.total, regionId);

    const totalCost = materialCosts.total + laborCosts.total + otherCosts.total;
    const remainingBudget = budget - totalCost;

    return {
      estimated_size_m2: estimatedSize,
      material_costs: materialCosts,
      labor_costs: laborCosts,
      other_costs: otherCosts,
      total_cost: totalCost,
      remaining_budget: remainingBudget,
      budget_utilization: (totalCost / budget) * 100,
      feasibility_score: remainingBudget > 0 ? 'feasible' : 'tight'
    };
  }

  estimateOptimalSize(plan, budget, materialMultiplier, laborMultiplier) {
    // Estimate maximum size within budget
    const avgCostPerM2 = (plan.min_budget + plan.max_budget) / 2 / 
                        ((plan.size_range.min + plan.size_range.max) / 2) * 
                        Math.max(materialMultiplier, laborMultiplier);
    
    return Math.floor(budget / avgCostPerM2);
  }

  async calculateMaterialCosts(plan, size, regionId) {
    const breakdown = {};
    let total = 0;

    for (const material of plan.base_materials) {
      const quantity = material.quantity_per_m2 * size;
      const unitPrice = marketDataService.getAdjustedPrice(material.id, regionId, 1);
      const materialTotal = unitPrice * quantity;
      
      breakdown[material.id] = {
        name: (await marketDataService.materials.get(material.id))?.name || 'Unknown',
        quantity,
        unit_price: unitPrice,
        total: materialTotal
      };
      
      total += materialTotal;
    }

    return { breakdown, total };
  }

  async calculateLaborCosts(plan, size, regionId) {
    const totalLaborDays = size * plan.labor_days_per_m2;
    
    // Mix of skilled and unskilled labor (70% skilled, 30% unskilled)
    const skilledDays = totalLaborDays * 0.7;
    const unskilledDays = totalLaborDays * 0.3;

    const skilledCost = marketDataService.getAdjustedPrice(5, regionId, skilledDays); // ID 5: skilled labor
    const unskilledCost = marketDataService.getAdjustedPrice(6, regionId, unskilledDays); // ID 6: unskilled labor

    return {
      breakdown: {
        skilled: { days: skilledDays, unit_price: marketDataService.getAdjustedPrice(5, regionId, 1), total: skilledCost },
        unskilled: { days: unskilledDays, unit_price: marketDataService.getAdjustedPrice(6, regionId, 1), total: unskilledCost }
      },
      total: skilledCost + unskilledCost
    };
  }

  calculateOtherCosts(materialCost, laborCost, regionId) {
    const transportMultiplier = marketDataService.getRegionalMultiplier(regionId, 'transport');
    const permitMultiplier = marketDataService.getRegionalMultiplier(regionId, 'permits');

    const transportCost = (materialCost * 0.05) * transportMultiplier; // 5% of material cost
    const permitCost = (materialCost + laborCost) * 0.03 * permitMultiplier; // 3% of total
    const contingencyCost = (materialCost + laborCost) * 0.1; // 10% contingency

    return {
      breakdown: {
        transport: transportCost,
        permits: permitCost,
        contingency: contingencyCost
      },
      total: transportCost + permitCost + contingencyCost
    };
  }

  async getMarketInsights(regionId) {
    try {
      const materialTrends = await marketDataService.getMarketTrends(regionId, 'materials');
      const laborTrends = await marketDataService.getMarketTrends(regionId, 'labor');
      
      return {
        material_trends: materialTrends.slice(0, 7), // Last 7 days
        labor_trends: laborTrends.slice(0, 7),
        current_market_conditions: await this.assessMarketConditions(regionId)
      };
    } catch (error) {
      console.error('Error getting market insights:', error);
      return {
        material_trends: [],
        labor_trends: [],
        current_market_conditions: 'Stable'
      };
    }
  }

  async assessMarketConditions(regionId) {
    // Simple market condition assessment based on recent price trends
    try {
      const trends = await marketDataService.getMarketTrends(regionId);
      
      if (trends.length < 2) return 'Insufficient data';
      
      const latest = trends[0].avg_price;
      const previous = trends[1].avg_price;
      const change = ((latest - previous) / previous) * 100;
      
      if (change > 5) return 'Rising prices';
      if (change < -5) return 'Falling prices';
      return 'Stable';
    } catch (error) {
      return 'Unknown';
    }
  }

  getLowBudgetSuggestions(budget, regionId) {
    const suggestions = [
      {
        title: 'Incremental Construction',
        description: 'Start with foundation and basic structure, complete in phases',
        estimated_saving: '30-40%'
      },
      {
        title: 'Alternative Materials',
        description: 'Consider compressed stabilized earth blocks or local alternatives',
        estimated_saving: '20-30%'
      },
      {
        title: 'Reduce Size',
        description: 'Start with smaller footprint and expand later',
        estimated_saving: '15-25%'
      },
      {
        title: 'DIY Components',
        description: 'Handle some non-structural work yourself',
        estimated_saving: '10-15%'
      }
    ];

    return suggestions.filter(s => budget >= 3000000); // Minimum viable budget
  }

  getStandardPlans() {
    return Array.from(this.standardPlans.entries()).map(([key, plan]) => ({
      key,
      ...plan
    }));
  }
}

export const aiBudgetAnalysisService = new AIBudgetAnalysisService();
