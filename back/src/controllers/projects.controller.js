import { pool } from '../config/db.js';

export async function getUserProjects(req, res) {
  try {
    const userId = req.user.id;
    
    const [rows] = await pool.query(
      `SELECT p.*, r.name as region_name 
       FROM projects p 
       LEFT JOIN regions r ON p.region_id = r.id 
       WHERE p.owner_id = ? 
       ORDER BY p.created_at DESC`,
      [userId]
    );

    return res.json({ projects: rows });
  } catch (error) {
    console.error('Error getting user projects:', error);
    return res.status(500).json({ 
      error: 'Failed to get projects',
      message: error.message 
    });
  }
}

export async function createProject(req, res) {
  try {
    const userId = req.user.id;
    const { title, description, region_id, budget_amount, start_date, target_end_date } = req.body;

    if (!title || !region_id) {
      return res.status(400).json({ 
        error: 'Title and region are required' 
      });
    }

    const [result] = await pool.query(
      `INSERT INTO projects 
       (owner_id, title, description, region_id, budget_amount, start_date, target_end_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'planning')`,
      [userId, title, description, region_id, budget_amount, start_date, target_end_date]
    );

    return res.json({ 
      success: true, 
      project_id: result.insertId,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ 
      error: 'Failed to create project',
      message: error.message 
    });
  }
}

export async function getProjectById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT p.*, r.name as region_name 
       FROM projects p 
       LEFT JOIN regions r ON p.region_id = r.id 
       WHERE p.id = ? AND p.owner_id = ?`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({ project: rows[0] });
  } catch (error) {
    console.error('Error getting project:', error);
    return res.status(500).json({ 
      error: 'Failed to get project',
      message: error.message 
    });
  }
}

export async function updateProject(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, region_id, budget_amount, start_date, target_end_date, status } = req.body;

    // Check if project belongs to user
    const [projectRows] = await pool.query(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?',
      [id, userId]
    );

    if (projectRows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update project
    await pool.query(
      `UPDATE projects SET 
       title = ?, description = ?, region_id = ?, budget_amount = ?, 
       start_date = ?, target_end_date = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, description, region_id, budget_amount, start_date, target_end_date, status, id]
    );

    return res.json({ 
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ 
      error: 'Failed to update project',
      message: error.message 
    });
  }
}

export async function deleteProject(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if project belongs to user
    const [projectRows] = await pool.query(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?',
      [id, userId]
    );

    if (projectRows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete related records first (estimates, documents, etc.)
    await pool.query('DELETE FROM estimates WHERE project_id = ?', [id]);
    await pool.query('DELETE FROM project_documents WHERE project_id = ?', [id]);
    
    // Delete project
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);

    return res.json({ 
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ 
      error: 'Failed to delete project',
      message: error.message 
    });
  }
}
