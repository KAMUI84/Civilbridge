import { pool } from "../../config/db.js";

// ─── GET /api/catalog ─────────────────────────────────────────────────────────
export const getCatalogItems = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 50 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const params = [];
        let where = "WHERE is_active = 1";

        if (category) {
            where += " AND category = ?";
            params.push(category);
        }
        if (search) {
            where += " AND name LIKE ?";
            params.push(`%${search}%`);
        }

        const [items] = await pool.query(
            `SELECT id, name, category, unit, base_price_rwf, specifications, supplier_name, last_updated_at
       FROM catalog_items ${where}
       ORDER BY category, name
       LIMIT ? OFFSET ?`,
            [...params, Number(limit), offset]
        );

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) as total FROM catalog_items ${where}`,
            params
        );

        res.json({ success: true, items, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch catalog items" });
    }
};

// ─── GET /api/catalog/:id ─────────────────────────────────────────────────────
export const getCatalogItemById = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM catalog_items WHERE id = ? AND is_active = 1",
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: "Item not found" });
        res.json({ success: true, item: rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch item" });
    }
};

// ─── POST /api/catalog (admin only) ──────────────────────────────────────────
export const createCatalogItem = async (req, res) => {
    try {
        const { name, category, unit, base_price_rwf, specifications, supplier_name } = req.body;
        const [result] = await pool.query(
            "INSERT INTO catalog_items (name, category, unit, base_price_rwf, specifications, supplier_name) VALUES (?,?,?,?,?,?)",
            [name, category || "materials", unit, base_price_rwf, JSON.stringify(specifications || {}), supplier_name]
        );
        res.status(201).json({ success: true, id: result.insertId, message: "Item created" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create catalog item" });
    }
};

// ─── PUT /api/catalog/:id (admin only) ───────────────────────────────────────
export const updateCatalogItem = async (req, res) => {
    try {
        const { name, category, unit, base_price_rwf, specifications, supplier_name, is_active } = req.body;
        await pool.query(
            `UPDATE catalog_items SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        unit = COALESCE(?, unit),
        base_price_rwf = COALESCE(?, base_price_rwf),
        specifications = COALESCE(?, specifications),
        supplier_name = COALESCE(?, supplier_name),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
            [name, category, unit, base_price_rwf,
                specifications ? JSON.stringify(specifications) : null,
                supplier_name, is_active, req.params.id]
        );
        res.json({ success: true, message: "Item updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update item" });
    }
};

// ─── GET /api/catalog/categories ─────────────────────────────────────────────
export const getCatalogCategories = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT DISTINCT category, COUNT(*) as count FROM catalog_items WHERE is_active = 1 GROUP BY category"
        );
        res.json({ success: true, categories: rows });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch categories" });
    }
};
