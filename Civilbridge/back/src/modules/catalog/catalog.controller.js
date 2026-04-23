import prisma from "../../config/prisma.js";

const VALID_CATEGORIES = new Set([
  "FOUNDATION", "STRUCTURE", "ROOFING", "FINISHES",
  "PLUMBING", "ELECTRICAL", "LABOR", "OTHER",
]);

function toCategory(raw) {
  if (!raw) return "OTHER";
  const up = String(raw).toUpperCase();
  const aliases = { MATERIALS: "OTHER", CIVIL: "FOUNDATION", MECHANICAL: "PLUMBING" };
  return VALID_CATEGORIES.has(up) ? up : (aliases[up] || "OTHER");
}

function serializeItem(item) {
  return {
    id: item.id.toString(),
    code: item.code,
    name: item.name,
    category: item.category,
    unit: item.unit,
    base_price_rwf: Number(item.baseUnitCost),
    baseUnitCost: Number(item.baseUnitCost),
    defaultWastagePercent: Number(item.defaultWastagePercent ?? 0),
    is_active: item.isActive,
    last_updated_at: item.updatedAt,
  };
}

// ─── GET /api/catalog ─────────────────────────────────────────────────────────
export const getCatalogItems = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { isActive: true };
    if (category) where.category = toCategory(category);
    if (search) where.name = { contains: search };

    const [items, total] = await prisma.$transaction([
      prisma.costCatalogItem.findMany({
        where,
        orderBy: [{ category: "asc" }, { name: "asc" }],
        skip,
        take: Number(limit),
      }),
      prisma.costCatalogItem.count({ where }),
    ]);

    res.json({
      success: true,
      items: items.map(serializeItem),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch catalog items" });
  }
};

// ─── GET /api/catalog/categories ─────────────────────────────────────────────
export const getCatalogCategories = async (req, res) => {
  try {
    const groups = await prisma.costCatalogItem.groupBy({
      by: ["category"],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { category: "asc" },
    });
    res.json({
      success: true,
      categories: groups.map(g => ({ category: g.category, count: g._count.id })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// ─── GET /api/catalog/:id ─────────────────────────────────────────────────────
export const getCatalogItemById = async (req, res) => {
  try {
    const item = await prisma.costCatalogItem.findFirst({
      where: { id: BigInt(req.params.id), isActive: true },
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ success: true, item: serializeItem(item) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch item" });
  }
};

// ─── POST /api/catalog (admin only) ──────────────────────────────────────────
export const createCatalogItem = async (req, res) => {
  try {
    const { name, category, unit, base_price_rwf, baseUnitCost, code } = req.body;
    const cost = base_price_rwf ?? baseUnitCost;

    if (!name || !unit || cost === undefined || cost === null) {
      return res.status(400).json({ message: "name, unit, and base_price_rwf are required" });
    }

    const itemCode = code || `CAT-${Date.now()}`;
    const item = await prisma.costCatalogItem.create({
      data: { code: itemCode, name, category: toCategory(category), unit, baseUnitCost: Number(cost) },
    });

    res.status(201).json({ success: true, id: item.id.toString(), message: "Item created" });
  } catch (err) {
    console.error(err);
    if (err.code === "P2002") return res.status(400).json({ message: "Item code already exists" });
    res.status(500).json({ message: "Failed to create catalog item" });
  }
};

// ─── PUT /api/catalog/:id (admin only) ───────────────────────────────────────
export const updateCatalogItem = async (req, res) => {
  try {
    const { name, category, unit, base_price_rwf, baseUnitCost, is_active } = req.body;
    const cost = base_price_rwf ?? baseUnitCost;

    const data = {};
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = toCategory(category);
    if (unit !== undefined) data.unit = unit;
    if (cost !== undefined) data.baseUnitCost = Number(cost);
    if (is_active !== undefined) data.isActive = Boolean(is_active);

    await prisma.costCatalogItem.update({ where: { id: BigInt(req.params.id) }, data });
    res.json({ success: true, message: "Item updated" });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") return res.status(404).json({ message: "Item not found" });
    res.status(500).json({ message: "Failed to update item" });
  }
};
