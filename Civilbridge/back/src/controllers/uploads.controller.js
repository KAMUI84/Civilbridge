import multer from 'multer';
import path from 'path';
import { pool } from '../config/db.js';
import { protect } from '../middlewares/auth.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    'image/jpeg': true,
    'image/png': true,
    'image/gif': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'application/vnd.ms-excel': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
    'model/obj': true,
    'model/stl': true,
    'model/3mf': true
  };

  const allowedExtensions = {
    '.jpg': true, '.jpeg': true, '.png': true, '.gif': true,
    '.pdf': true, '.doc': true, '.docx': true, '.xls': true, '.xlsx': true,
    '.obj': true, '.stl': true, '.3mf': true
  };

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes[file.mimetype] && allowedExtensions[ext]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type or extension. Only images, PDFs, documents, and 3D models are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  }
});

export async function uploadPlan(req, res) {
  try {
    const { title, description, category, price = 0, specifications } = req.body;
    const userId = req.user.id;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }

    // Insert into database
    const [result] = await pool.query(
      `INSERT INTO plans (title, description, category, price, specifications, uploaded_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [title, description, category, price, JSON.stringify(specifications || {}), userId]
    );

    const planId = result.insertId;

    // Save file information
    const filePromises = req.files.map(async (file) => {
      await pool.query(
        `INSERT INTO plan_files (plan_id, filename, original_name, file_path, file_size, file_type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [planId, file.filename, file.originalname, file.path, file.size, file.mimetype]
      );
    });

    await Promise.all(filePromises);

    res.status(201).json({
      success: true,
      message: 'Plan uploaded successfully. It will be reviewed before being published.',
      plan_id: planId
    });

  } catch (error) {
    console.error('Upload plan error:', error);
    res.status(500).json({ error: 'Failed to upload plan', message: error.message });
  }
}

export async function uploadMarketplaceListing(req, res) {
  try {
    const { title, description, category, price, contact_info, location } = req.body;
    const userId = req.user.id;

    if (!title || !description || !category || !price || !contact_info) {
      return res.status(400).json({ error: 'Title, description, category, price, and contact info are required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    // Insert into database
    const [result] = await pool.query(
      `INSERT INTO marketplace_listings (title, description, category, price, contact_info, location, seller_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [title, description, category, price, JSON.stringify(contact_info), location, userId]
    );

    const listingId = result.insertId;

    // Save file information
    const filePromises = req.files.map(async (file) => {
      await pool.query(
        `INSERT INTO listing_files (listing_id, filename, original_name, file_path, file_size, file_type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [listingId, file.filename, file.originalname, file.path, file.size, file.mimetype]
      );
    });

    await Promise.all(filePromises);

    res.status(201).json({
      success: true,
      message: 'Marketplace listing uploaded successfully. It will be reviewed before being published.',
      listing_id: listingId
    });

  } catch (error) {
    console.error('Upload marketplace listing error:', error);
    res.status(500).json({ error: 'Failed to upload marketplace listing', message: error.message });
  }
}

export async function getPlans(req, res) {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.full_name as uploader_name, u.email as uploader_email,
             COUNT(pf.id) as file_count,
             COALESCE(
               JSON_ARRAYAGG(
                 IF(pf.id IS NOT NULL,
                    JSON_OBJECT(
                      'id', pf.id,
                      'filename', pf.filename,
                      'original_name', pf.original_name,
                      'file_path', pf.file_path,
                      'file_size', pf.file_size,
                      'file_type', pf.file_type
                    ), NULL)
               ), JSON_ARRAY()
             ) as files
      FROM plans p 
      LEFT JOIN users u ON p.uploaded_by = u.id
      LEFT JOIN plan_files pf ON p.id = pf.plan_id
      WHERE p.status = 'APPROVED'
    `;
    
    const params = [];

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);

    // Parse the JSON files array from MySQL
    const plansWithFiles = rows.map(plan => {
      let parsedFiles = [];
      try {
        parsedFiles = typeof plan.files === 'string' ? JSON.parse(plan.files) : plan.files;
        // Filter out nulls inserted by JSON_ARRAYAGG
        parsedFiles = parsedFiles.filter(f => f !== null);
      } catch (e) {}
      return { ...plan, files: parsedFiles };
    });

    res.json({ plans: plansWithFiles });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans', message: error.message });
  }
}

export async function getMarketplaceListings(req, res) {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT l.*, u.full_name as seller_name, u.email as seller_email,
             COUNT(lf.id) as image_count,
             COALESCE(
               JSON_ARRAYAGG(
                 IF(lf.id IS NOT NULL,
                    JSON_OBJECT(
                      'id', lf.id,
                      'filename', lf.filename,
                      'original_name', lf.original_name,
                      'file_path', lf.file_path,
                      'file_size', lf.file_size,
                      'file_type', lf.file_type
                    ), NULL)
               ), JSON_ARRAY()
             ) as images
      FROM marketplace_listings l 
      LEFT JOIN users u ON l.seller_id = u.id
      LEFT JOIN listing_files lf ON l.id = lf.listing_id
      WHERE l.status = 'APPROVED'
    `;
    
    const params = [];

    if (category) {
      query += ' AND l.category = ?';
      params.push(category);
    }

    query += ' GROUP BY l.id ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);

    // Parse the JSON images array from MySQL
    const listingsWithImages = rows.map(listing => {
      let parsedImages = [];
      try {
        parsedImages = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
        parsedImages = parsedImages.filter(f => f !== null);
      } catch (e) {}
      return { ...listing, images: parsedImages };
    });

    res.json({ listings: listingsWithImages });

  } catch (error) {
    console.error('Get marketplace listings error:', error);
    res.status(500).json({ error: 'Failed to get marketplace listings', message: error.message });
  }
}

export async function getUserUploads(req, res) {
  try {
    const userId = req.user.id;
    const { type = 'all' } = req.query;

    let result = [];

    if (type === 'plans' || type === 'all') {
      const [plans] = await pool.query(
        'SELECT * FROM plans WHERE uploaded_by = ? ORDER BY created_at DESC',
        [userId]
      );
      result.push({ type: 'plans', data: plans });
    }

    if (type === 'listings' || type === 'all') {
      const [listings] = await pool.query(
        'SELECT * FROM marketplace_listings WHERE seller_id = ? ORDER BY created_at DESC',
        [userId]
      );
      result.push({ type: 'listings', data: listings });
    }

    res.json({ uploads: result });

  } catch (error) {
    console.error('Get user uploads error:', error);
    res.status(500).json({ error: 'Failed to get user uploads', message: error.message });
  }
}

// Middleware for handling file uploads
export const uploadPlanFiles = upload.array('files', 5);
export const uploadListingFiles = upload.array('files', 5);
