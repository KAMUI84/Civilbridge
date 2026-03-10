import { pool } from '../config/db.js';

export async function getAllRegions(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM regions WHERE is_active = 1 ORDER BY name'
    );

    return res.json({ regions: rows });
  } catch (error) {
    console.error('Error loading regions from database:', error);
    
    // Return fallback regions if database fails
    const fallbackRegions = [
      { id: 1, name: 'Kigali', province: 'Kigali', is_active: 1 },
      { id: 2, name: 'Northern Province', province: 'Northern', is_active: 1 },
      { id: 3, name: 'Southern Province', province: 'Southern', is_active: 1 },
      { id: 4, name: 'Eastern Province', province: 'Eastern', is_active: 1 },
      { id: 5, name: 'Western Province', province: 'Western', is_active: 1 }
    ];
    
    return res.json({ regions: fallbackRegions });
  }
}

export async function getRegionById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM regions WHERE id = ? AND is_active = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }

    return res.json({ region: rows[0] });
  } catch (error) {
    console.error('Error getting region:', error);
    
    // Return fallback region if database fails
    const fallbackRegions = {
      1: { id: 1, name: 'Kigali', province: 'Kigali', is_active: 1 },
      2: { id: 2, name: 'Northern Province', province: 'Northern', is_active: 1 },
      3: { id: 3, name: 'Southern Province', province: 'Southern', is_active: 1 },
      4: { id: 4, name: 'Eastern Province', province: 'Eastern', is_active: 1 },
      5: { id: 5, name: 'Western Province', province: 'Western', is_active: 1 }
    };
    
    const region = fallbackRegions[id];
    if (region) {
      return res.json({ region });
    }
    
    return res.status(404).json({ error: 'Region not found' });
  }
}
