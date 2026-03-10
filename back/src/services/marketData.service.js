import { pool } from '../config/db.js';

class MarketDataService {
  constructor() {
    this.regions = new Map();
    this.materials = new Map();
    this.laborRates = new Map();
    this.initializeData();
  }

  async initializeData() {
    await this.loadRegions();
    await this.loadMaterials();
    await this.loadLaborRates();
  }

  async loadRegions() {
    try {
      const [rows] = await pool.query('SELECT * FROM regions WHERE is_active = 1');
      rows.forEach(region => {
        this.regions.set(region.id, {
          ...region,
          multipliers: JSON.parse(region.multipliers || '{}')
        });
      });
      console.log(`📍 Loaded ${this.regions.size} regions`);
    } catch (error) {
      console.error('Error loading regions:', error);
      // Fallback data for Rwanda regions
      this.addFallbackRegions();
    }
  }

  addFallbackRegions() {
    const fallbackRegions = [
      {
        id: 1,
        name: 'Kigali',
        province: 'Kigali',
        multipliers: {
          materials: 1.0,
          labor: 1.2,
          transport: 1.1,
          permits: 1.0
        }
      },
      {
        id: 2,
        name: 'Northern Province',
        province: 'Northern',
        multipliers: {
          materials: 0.9,
          labor: 0.8,
          transport: 1.3,
          permits: 0.9
        }
      },
      {
        id: 3,
        name: 'Southern Province',
        province: 'Southern',
        multipliers: {
          materials: 0.85,
          labor: 0.7,
          transport: 1.4,
          permits: 0.85
        }
      },
      {
        id: 4,
        name: 'Eastern Province',
        province: 'Eastern',
        multipliers: {
          materials: 0.8,
          labor: 0.75,
          transport: 1.2,
          permits: 0.8
        }
      },
      {
        id: 5,
        name: 'Western Province',
        province: 'Western',
        multipliers: {
          materials: 0.9,
          labor: 0.8,
          transport: 1.5,
          permits: 0.9
        }
      }
    ];

    fallbackRegions.forEach(region => {
      this.regions.set(region.id, region);
    });
    console.log(`📍 Loaded ${fallbackRegions.length} fallback regions`);
  }

  async loadMaterials() {
    try {
      const [rows] = await pool.query('SELECT * FROM catalog_items WHERE is_active = 1');
      rows.forEach(material => {
        this.materials.set(material.id, {
          ...material,
          specifications: JSON.parse(material.specifications || '{}')
        });
      });
      console.log(`🧱 Loaded ${this.materials.size} materials`);
    } catch (error) {
      console.error('Error loading materials:', error);
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('🧱 catalog_items table does not exist, using fallback materials');
      }
      // Fallback common materials
      this.addFallbackMaterials();
    }
  }

  addFallbackMaterials() {
    const fallbackMaterials = [
      {
        id: 1,
        name: 'Cement (50kg bag)',
        category: 'materials',
        unit: 'bag',
        base_price_rwf: 8500,
        specifications: { strength: '42.5R', weight: '50kg' }
      },
      {
        id: 2,
        name: 'Steel Reinforcement (12mm)',
        category: 'materials',
        unit: 'meter',
        base_price_rwf: 3500,
        specifications: { diameter: '12mm', grade: 'S500' }
      },
      {
        id: 3,
        name: 'Sand (per m³)',
        category: 'materials',
        unit: 'm³',
        base_price_rwf: 25000,
        specifications: { type: 'river sand', quality: 'coarse' }
      },
      {
        id: 4,
        name: 'Aggregate (per m³)',
        category: 'materials',
        unit: 'm³',
        base_price_rwf: 28000,
        specifications: { type: 'crushed stone', size: '20mm' }
      },
      {
        id: 5,
        name: 'Skilled Labor (per day)',
        category: 'labor',
        unit: 'day',
        base_price_rwf: 8000,
        specifications: { skill_level: 'skilled', hours: 8 }
      },
      {
        id: 6,
        name: 'Unskilled Labor (per day)',
        category: 'labor',
        unit: 'day',
        base_price_rwf: 4000,
        specifications: { skill_level: 'unskilled', hours: 8 }
      }
    ];

    fallbackMaterials.forEach(material => {
      this.materials.set(material.id, material);
    });
  }

  async loadLaborRates() {
    try {
      const [rows] = await pool.query('SELECT * FROM labor_rates WHERE is_active = 1');
      rows.forEach(rate => {
        this.laborRates.set(`${rate.region_id}_${rate.skill_level}`, rate);
      });
      console.log(`👷 Loaded ${this.laborRates.size} labor rates`);
    } catch (error) {
      console.error('Error loading labor rates:', error);
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('👷 labor_rates table does not exist, using default rates');
      }
      // Use default labor rates from material data
    }
  }

  getRegionalMultiplier(regionId, costType) {
    const region = this.regions.get(regionId);
    if (!region || !region.multipliers) {
      return 1.0; // Default multiplier
    }
    return region.multipliers[costType] || 1.0;
  }

  getAdjustedPrice(materialId, regionId, quantity = 1) {
    const material = this.materials.get(materialId);
    if (!material) return 0;

    const basePrice = material.base_price_rwf;
    let multiplier = 1.0;

    if (material.category === 'materials') {
      multiplier = this.getRegionalMultiplier(regionId, 'materials');
    } else if (material.category === 'labor') {
      multiplier = this.getRegionalMultiplier(regionId, 'labor');
    }

    return basePrice * multiplier * quantity;
  }

  async getMaterialsByCategory(category) {
    const materials = Array.from(this.materials.values())
      .filter(material => material.category === category);
    
    return materials.map(material => ({
      id: material.id,
      name: material.name,
      unit: material.unit,
      base_price_rwf: material.base_price_rwf,
      specifications: material.specifications
    }));
  }

  async calculateRegionalCosts(regionId, materials) {
    const costs = {};
    
    for (const material of materials) {
      const materialId = material.id;
      const quantity = material.quantity || 1;
      const adjustedPrice = this.getAdjustedPrice(materialId, regionId, quantity);
      
      costs[materialId] = {
        name: this.materials.get(materialId)?.name || 'Unknown',
        unit_price: this.getAdjustedPrice(materialId, regionId, 1),
        quantity,
        total_cost: adjustedPrice
      };
    }
    
    return costs;
  }

  async getMarketTrends(regionId, category = null) {
    try {
      let query = `
        SELECT 
          DATE(created_at) as date,
          AVG(base_price_rwf) as avg_price,
          COUNT(*) as data_points
        FROM catalog_items 
        WHERE is_active = 1
      `;
      
      const params = [];
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      
      query += ' GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30';
      
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error getting market trends:', error);
      return [];
    }
  }

  async updateMaterialPrice(materialId, newPrice, regionId = null) {
    try {
      if (regionId) {
        // Update regional price multiplier
        const material = this.materials.get(materialId);
        const basePrice = material.base_price_rwf;
        const multiplier = newPrice / basePrice;
        
        await pool.query(
          'UPDATE regions SET multipliers = JSON_SET(multipliers, ?, ?) WHERE id = ?',
          [`$.materials`, multiplier, regionId]
        );
      } else {
        // Update base price
        await pool.query(
          'UPDATE catalog_items SET base_price_rwf = ? WHERE id = ?',
          [newPrice, materialId]
        );
      }
      
      // Refresh data
      await this.loadMaterials();
      return true;
    } catch (error) {
      console.error('Error updating material price:', error);
      return false;
    }
  }

  getRegionInfo(regionId) {
    return this.regions.get(regionId);
  }

  getAllRegions() {
    return Array.from(this.regions.values());
  }

  getAllMaterials() {
    return Array.from(this.materials.values());
  }
}

export const marketDataService = new MarketDataService();
