import prisma from "../../config/prisma.js";
import { generateBoqPdfExport } from "./boq.export.service.js";

const VALID_CATEGORIES = new Set([
  "FOUNDATION", "STRUCTURE", "ROOFING", "FINISHES",
  "PLUMBING", "ELECTRICAL", "LABOR", "OTHER",
]);

function toCategory(raw) {
  if (!raw) return "OTHER";
  const up = String(raw).toUpperCase();
  return VALID_CATEGORIES.has(up) ? up : "OTHER";
}

function serializeBOQItem(item) {
  return {
    id: item.id.toString(),
    project_id: item.projectId.toString(),
    section: item.category,
    category: item.category,
    description: item.customName || "",
    customName: item.customName || "",
    unit: item.unit,
    quantity: Number(item.quantity),
    unit_rate: Number(item.unitCost),
    unitCost: Number(item.unitCost),
    amount: Number(item.totalCost),
    totalCost: Number(item.totalCost),
    catalog_item_id: item.catalogItemId ? item.catalogItemId.toString() : null,
    notes: item.notes || null,
    created_at: item.createdAt,
  };
}

// ─── GET /api/boq/:project_id ─────────────────────────────────────────────────
export const getBOQ = async (req, res) => {
  try {
    const projectId = BigInt(req.params.estimate_id || req.params.project_id);
    const userId = BigInt(req.user.id);

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ userId }, { members: { some: { userId } } }],
      },
      select: { id: true, projectName: true, estimateSummary: true },
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    const items = await prisma.projectBOQItem.findMany({
      where: { projectId },
      orderBy: [{ category: "asc" }, { createdAt: "asc" }],
    });

    const summary = project.estimateSummary
      ? {
          id: project.estimateSummary.id.toString(),
          title: project.projectName,
          total: Number(project.estimateSummary.finalEstimatedCost),
          subtotal: Number(project.estimateSummary.estimatedTotalCost),
          contingency: Number(project.estimateSummary.riskBufferAmount),
        }
      : { id: projectId.toString(), title: project.projectName, total: 0 };

    res.json({ success: true, estimate: summary, items: items.map(serializeBOQItem) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch BOQ" });
  }
};

// ─── POST /api/boq/:project_id/items ─────────────────────────────────────────
export const addBOQItem = async (req, res) => {
  try {
    const projectId = BigInt(req.params.estimate_id || req.params.project_id);
    const { section, category, description, customName, unit, quantity, unit_rate, unitCost, catalog_item_id, notes } = req.body;

    const resolvedCategory = toCategory(section || category);
    const resolvedName = customName || description || "";
    const resolvedUnitCost = Number(unit_rate ?? unitCost ?? 0);
    const resolvedQty = Number(quantity ?? 0);
    const totalCost = resolvedQty * resolvedUnitCost;

    const item = await prisma.projectBOQItem.create({
      data: {
        projectId,
        catalogItemId: catalog_item_id ? BigInt(catalog_item_id) : null,
        customName: resolvedName,
        category: resolvedCategory,
        unit: unit || "unit",
        quantity: resolvedQty,
        unitCost: resolvedUnitCost,
        totalCost,
        notes: notes || null,
      },
    });

    await recalcEstimateSummary(projectId);

    res.status(201).json({ success: true, id: item.id.toString(), message: "Item added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add BOQ item" });
  }
};

// ─── PUT /api/boq/items/:id ────────────────────────────────────────────────────
export const updateBOQItem = async (req, res) => {
  try {
    const { section, category, description, customName, unit, quantity, unit_rate, unitCost, notes } = req.body;

    const existing = await prisma.projectBOQItem.findUnique({
      where: { id: BigInt(req.params.id) },
    });
    if (!existing) return res.status(404).json({ message: "Item not found" });

    const resolvedQty = quantity !== undefined ? Number(quantity) : Number(existing.quantity);
    const resolvedUnitCost = (unit_rate ?? unitCost) !== undefined
      ? Number(unit_rate ?? unitCost)
      : Number(existing.unitCost);

    const data = {};
    if (section !== undefined || category !== undefined) data.category = toCategory(section || category);
    if (customName !== undefined || description !== undefined) data.customName = customName || description;
    if (unit !== undefined) data.unit = unit;
    if (quantity !== undefined) data.quantity = resolvedQty;
    if ((unit_rate ?? unitCost) !== undefined) data.unitCost = resolvedUnitCost;
    if (quantity !== undefined || (unit_rate ?? unitCost) !== undefined) {
      data.totalCost = resolvedQty * resolvedUnitCost;
    }
    if (notes !== undefined) data.notes = notes;

    await prisma.projectBOQItem.update({ where: { id: BigInt(req.params.id) }, data });
    await recalcEstimateSummary(existing.projectId);

    res.json({ success: true, message: "Item updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update BOQ item" });
  }
};

// ─── DELETE /api/boq/items/:id ────────────────────────────────────────────────
export const deleteBOQItem = async (req, res) => {
  try {
    const item = await prisma.projectBOQItem.findUnique({
      where: { id: BigInt(req.params.id) },
    });
    if (!item) return res.status(404).json({ message: "Item not found" });

    await prisma.projectBOQItem.delete({ where: { id: BigInt(req.params.id) } });
    await recalcEstimateSummary(item.projectId);

    res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete BOQ item" });
  }
};

// ─── POST /api/boq/project/:projectId/export ──────────────────────────────────
export const exportProjectBOQPdf = async (req, res) => {
  try {
    const result = await generateBoqPdfExport({
      projectId: req.params.projectId,
      actor: req.user,
      approveDocument: req.body?.approveDocument === true,
      reviewNotes: req.body?.reviewNotes || null,
    });
    res.json({ success: true, document: result.document, signedUrl: result.signedUrl });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Failed to export BOQ PDF" });
  }
};

// Recalculate EstimateSummary totals from BOQ items if a summary exists
async function recalcEstimateSummary(projectId) {
  const agg = await prisma.projectBOQItem.aggregate({
    where: { projectId },
    _sum: { totalCost: true },
  });
  const subtotal = Number(agg._sum.totalCost ?? 0);

  await prisma.estimateSummary.updateMany({
    where: { projectId },
    data: {
      estimatedTotalCost: subtotal,
      riskBufferAmount: subtotal * 0.1,
      finalEstimatedCost: subtotal * 1.1,
    },
  });
}
