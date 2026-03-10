import { pool } from "../../config/db.js";

// ─── GET /api/listings ────────────────────────────────────────────────────────
export const getListings = async (req, res) => {
    try {
        const { type, region, min_price, max_price, search, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const params = [];
        let where = "WHERE l.status = 'PUBLISHED'";

        if (type) { where += " AND l.listing_type = ?"; params.push(type); }
        if (region) { where += " AND l.region LIKE ?"; params.push(`%${region}%`); }
        if (min_price) { where += " AND l.price_amount >= ?"; params.push(min_price); }
        if (max_price) { where += " AND l.price_amount <= ?"; params.push(max_price); }
        if (search) {
            where += " AND (l.title LIKE ? OR l.description LIKE ? OR l.district LIKE ?)";
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        const [listings] = await pool.query(
            `SELECT l.id, l.title, l.listing_type, l.region, l.district, l.price_amount,
              l.price_currency, l.size_sqm, l.ownership_type, l.view_count, l.created_at,
              u.full_name as seller_name,
              (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY sort_order LIMIT 1) as thumbnail
       FROM listings l JOIN users u ON l.created_by = u.id
       ${where} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
            [...params, Number(limit), offset]
        );

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) as total FROM listings l ${where}`, params
        );

        res.json({ success: true, listings, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch listings" });
    }
};

// ─── GET /api/listings/:id ────────────────────────────────────────────────────
export const getListingById = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT l.*, u.full_name as seller_name, u.email as seller_email
       FROM listings l JOIN users u ON l.created_by = u.id
       WHERE l.id = ? AND l.status = 'PUBLISHED'`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: "Listing not found" });

        await pool.query("UPDATE listings SET view_count = view_count + 1 WHERE id = ?", [req.params.id]);

        const [images] = await pool.query(
            "SELECT * FROM listing_images WHERE listing_id = ? ORDER BY sort_order",
            [req.params.id]
        );

        res.json({ success: true, listing: { ...rows[0], images } });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch listing" });
    }
};

// ─── POST /api/listings ───────────────────────────────────────────────────────
export const createListing = async (req, res) => {
    try {
        const {
            title, description, listing_type, region, district, sector,
            address_text, size_sqm, price_amount, ownership_type, contact_phone, contact_email,
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO listings (created_by, title, description, listing_type, region, district, sector,
        address_text, size_sqm, price_amount, ownership_type, contact_phone, contact_email, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'DRAFT')`,
            [req.user.id, title, description, listing_type || "LAND",
                region, district, sector, address_text, size_sqm, price_amount, ownership_type, contact_phone, contact_email]
        );

        res.status(201).json({ success: true, id: result.insertId, message: "Listing created as draft" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create listing" });
    }
};

// ─── PUT /api/listings/:id ────────────────────────────────────────────────────
export const updateListing = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT created_by FROM listings WHERE id = ?", [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: "Listing not found" });
        if (rows[0].created_by !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not authorized" });
        }

        const { title, description, region, district, price_amount, size_sqm, contact_phone, status } = req.body;
        await pool.query(
            `UPDATE listings SET title = COALESCE(?,title), description = COALESCE(?,description),
       region = COALESCE(?,region), district = COALESCE(?,district),
       price_amount = COALESCE(?,price_amount), size_sqm = COALESCE(?,size_sqm),
       contact_phone = COALESCE(?,contact_phone), status = COALESCE(?,status)
       WHERE id = ?`,
            [title, description, region, district, price_amount, size_sqm, contact_phone, status, req.params.id]
        );

        res.json({ success: true, message: "Listing updated" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update listing" });
    }
};

// ─── DELETE /api/listings/:id ─────────────────────────────────────────────────
export const deleteListing = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT created_by FROM listings WHERE id = ?", [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: "Listing not found" });
        if (rows[0].created_by !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not authorized" });
        }
        await pool.query("UPDATE listings SET status = 'ARCHIVED' WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: "Listing archived" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete listing" });
    }
};

// ─── GET /api/listings/me ─────────────────────────────────────────────────────
export const getMyListings = async (req, res) => {
    try {
        const [listings] = await pool.query(
            `SELECT l.*, (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY sort_order LIMIT 1) as thumbnail
       FROM listings l WHERE l.created_by = ? ORDER BY l.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, listings });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch your listings" });
    }
};
