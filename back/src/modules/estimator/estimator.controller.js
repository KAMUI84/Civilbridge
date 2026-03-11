import prisma from "../../config/prisma.js";
import { protectOwnership } from "../../utils/ownership.js";

// Public: get catalog with filters
export async function getCatalog(req, res) {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const where = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { unit: { contains: search } },
      ];
    }

    const items = await prisma.catalogItem.findMany({
      where,
      include: {
        supplier: { select: { name: true, region: true } },
      },
      orderBy: { name: "asc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.catalogItem.count({ where });

    res.json({ items, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch catalog" });
  }
}

// Public: get catalog item by id
export async function getCatalogItem(req, res) {
  try {
    const item = await prisma.catalogItem.findUnique({
      where: { id: BigInt(req.params.id) },
      include: {
        supplier: { select: { name: true, region: true, contact: true } },
      },
    });

    if (!item) return res.status(404).json({ message: "Catalog item not found" });

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch catalog item" });
  }
}

// Protected: create catalog item (admin)
export async function createCatalogItem(req, res) {
  try {
    const { name, description, category, unit, unitPrice, supplierId, specifications } = req.body;

    const item = await prisma.catalogItem.create({
      data: {
        name,
        description,
        category,
        unit,
        unitPrice: Number(unitPrice),
        supplierId: supplierId ? BigInt(supplierId) : null,
        specifications,
      },
    });

    res.status(201).json({ message: "Catalog item created", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create catalog item" });
  }
}

// Protected: update catalog item (admin)
export async function updateCatalogItem(req, res) {
  try {
    const { name, description, category, unit, unitPrice, supplierId, specifications } = req.body;

    const item = await prisma.catalogItem.update({
      where: { id: BigInt(req.params.id) },
      data: {
        name,
        description,
        category,
        unit,
        unitPrice: unitPrice ? Number(unitPrice) : undefined,
        supplierId: supplierId ? BigInt(supplierId) : null,
        specifications,
      },
    });

    res.json({ message: "Catalog item updated", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update catalog item" });
  }
}

// Protected: delete catalog item (admin)
export async function deleteCatalogItem(req, res) {
  try {
    await prisma.catalogItem.delete({ where: { id: BigInt(req.params.id) } });
    res.json({ message: "Catalog item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete catalog item" });
  }
}

// Protected: get user's estimates
export async function getEstimates(req, res) {
  try {
    const estimates = await prisma.estimate.findMany({
      where: { createdBy: BigInt(req.user.id) },
      include: {
        project: { select: { title: true } },
        items: {
          include: {
            catalogItem: { select: { name: true, unit: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(estimates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch estimates" });
  }
}

// Protected: get estimate by id
export async function getEstimateById(req, res) {
  try {
    const estimateId = BigInt(req.params.id);
    await protectOwnership(req.user, estimateId, "estimate");

    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
      include: {
        project: { select: { title: true } },
        items: {
          include: {
            catalogItem: true,
          },
        },
      },
    });

    if (!estimate) return res.status(404).json({ message: "Estimate not found" });

    res.json(estimate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch estimate" });
  }
}

// Protected: create estimate
export async function createEstimate(req, res) {
  try {
    const { title, projectId, notes } = req.body;
    const createdBy = BigInt(req.user.id);

    const estimate = await prisma.estimate.create({
      data: {
        title,
        projectId: projectId ? BigInt(projectId) : null,
        notes,
        createdBy,
      },
    });

    res.status(201).json({ message: "Estimate created", estimate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create estimate" });
  }
}

// Protected: update estimate
export async function updateEstimate(req, res) {
  try {
    const estimateId = BigInt(req.params.id);
    await protectOwnership(req.user, estimateId, "estimate");

    const { title, projectId, notes, status } = req.body;

    const estimate = await prisma.estimate.update({
      where: { id: estimateId },
      data: {
        title,
        projectId: projectId ? BigInt(projectId) : null,
        notes,
        status,
      },
    });

    res.json({ message: "Estimate updated", estimate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update estimate" });
  }
}

// Protected: delete estimate
export async function deleteEstimate(req, res) {
  try {
    const estimateId = BigInt(req.params.id);
    await protectOwnership(req.user, estimateId, "estimate");

    await prisma.estimate.delete({ where: { id: estimateId } });

    res.json({ message: "Estimate deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete estimate" });
  }
}

// Protected: add item to estimate
export async function addItemToEstimate(req, res) {
  try {
    const estimateId = BigInt(req.params.id);
    await protectOwnership(req.user, estimateId, "estimate");

    const { catalogItemId, quantity, unitPrice, notes } = req.body;

    const item = await prisma.estimateItem.create({
      data: {
        estimateId,
        catalogItemId: BigInt(catalogItemId),
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        notes,
      },
    });

    res.status(201).json({ message: "Item added to estimate", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add item to estimate" });
  }
}

// Protected: update estimate item
export async function updateEstimateItem(req, res) {
  try {
    const itemId = BigInt(req.params.itemId);
    const item = await prisma.estimateItem.findUnique({ where: { id: itemId }, select: { estimate: { select: { createdBy: true } } } });
    if (!item) return res.status(404).json({ message: "Estimate item not found" });
    await protectOwnership(req.user, item.estimate.createdBy, "estimate");

    const { quantity, unitPrice, notes } = req.body;

    await prisma.estimateItem.update({
      where: { id: itemId },
      data: {
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        notes,
      },
    });

    res.json({ message: "Estimate item updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update estimate item" });
  }
}

// Protected: delete estimate item
export async function deleteEstimateItem(req, res) {
  try {
    const itemId = BigInt(req.params.itemId);
    const item = await prisma.estimateItem.findUnique({ where: { id: itemId }, select: { estimate: { select: { createdBy: true } } } });
    if (!item) return res.status(404).json({ message: "Estimate item not found" });
    await protectOwnership(req.user, item.estimate.createdBy, "estimate");

    await prisma.estimateItem.delete({ where: { id: itemId } });

    res.json({ message: "Estimate item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete estimate item" });
  }
}
