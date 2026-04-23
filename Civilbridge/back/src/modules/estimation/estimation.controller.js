import prisma from "../../config/prisma.js";
import {
  generateBOQ,
  checkBudgetFeasibility,
  PricingConfigurationError,
} from "./estimation.engine.js";
import { aiBudgetAnalysisService } from "../../services/aiBudgetAnalysis.service.js";
import { marketDataService } from "../../services/marketData.service.js";

const BOQ_SECTION_TO_CATEGORY = {
  "Substructure & Foundation": "FOUNDATION",
  "Structure & Walls": "STRUCTURE",
  "Roofing": "ROOFING",
  "Finishes": "FINISHES",
  "Plumbing & Sanitary": "PLUMBING",
  "Electrical Works": "ELECTRICAL",
  "External & Other Works": "OTHER",
};

function sectionToCategory(label) {
  return BOQ_SECTION_TO_CATEGORY[label] || label.toUpperCase().replace(/[^A-Z]/g, "") || "OTHER";
}

function handleEstimationError(err, res, fallbackMessage) {
  if (err instanceof PricingConfigurationError) {
    return res.status(err.statusCode || 409).json({
      success: false,
      code: err.code,
      message: err.message,
      pricing_readiness: err.readiness,
    });
  }
  console.error(err);
  return res.status(500).json({ message: fallbackMessage });
}

function serializeEstimate(summary) {
  return {
    id: summary.id.toString(),
    project_id: summary.projectId.toString(),
    title: summary.project?.projectName || `Estimate #${summary.id}`,
    area_sqm: summary.project ? Number(summary.project.builtAreaM2) : null,
    floors: summary.project?.floors || 1,
    building_type: summary.project?.finishLevel || null,
    region_name: summary.project?.region?.name || null,
    total: Number(summary.finalEstimatedCost),
    subtotal: Number(summary.estimatedTotalCost),
    contingency: Number(summary.riskBufferAmount),
    cost_per_m2: Number(summary.costPerM2),
    currency: "RWF",
    created_at: summary.createdAt,
  };
}

// ─── POST /api/estimation/run ─────────────────────────────────────────────────
export const runEstimation = async (req, res) => {
  try {
    await marketDataService.ensureReady();
    const {
      title,
      area_sqm,
      floors = 1,
      building_quality = "standard",
      region_id = 1,
      project_id,
      plan_id,
      save = false,
    } = req.body;

    if (!area_sqm) {
      return res.status(400).json({ message: "area_sqm is required" });
    }

    const boq = generateBOQ({ area_sqm, floors, building_quality, regionId: region_id });

    let savedId = null;
    if (save) {
      if (!project_id) {
        return res.status(400).json({ message: "project_id is required to save an estimate" });
      }

      const projectId = BigInt(project_id);
      const subtotal = boq.summary.construction_subtotal;
      const contingency = boq.summary.contingency_10pct;
      const grandTotal = boq.summary.grand_total;
      const costPerM2 = area_sqm > 0 ? subtotal / Number(area_sqm) : 0;

      const summary = await prisma.estimateSummary.upsert({
        where: { projectId },
        create: {
          projectId,
          planId: plan_id ? BigInt(plan_id) : null,
          estimatedTotalCost: subtotal,
          costPerM2,
          riskBufferPercent: 10,
          riskBufferAmount: contingency,
          finalEstimatedCost: grandTotal,
          assumptionsJson: { title: title || `Estimate - ${area_sqm}m²`, building_quality, region_id },
        },
        update: {
          planId: plan_id ? BigInt(plan_id) : null,
          estimatedTotalCost: subtotal,
          costPerM2,
          riskBufferPercent: 10,
          riskBufferAmount: contingency,
          finalEstimatedCost: grandTotal,
          assumptionsJson: { title: title || `Estimate - ${area_sqm}m²`, building_quality, region_id },
        },
      });

      savedId = summary.id.toString();

      // Replace BOQ items for this project
      await prisma.projectBOQItem.deleteMany({ where: { projectId } });
      for (const section of boq.sections) {
        for (const item of section.items) {
          await prisma.projectBOQItem.create({
            data: {
              projectId,
              customName: item.description,
              category: sectionToCategory(section.label),
              unit: item.unit,
              quantity: item.quantity,
              unitCost: item.unit_rate,
              totalCost: item.amount,
            },
          });
        }
      }
    }

    res.json({
      success: true,
      estimate_id: savedId,
      boq,
      message: save ? "Estimation saved" : "Estimation calculated (not saved)",
    });
  } catch (err) {
    return handleEstimationError(err, res, "Failed to run estimation");
  }
};

// ─── POST /api/estimation/feasibility ────────────────────────────────────────
export const checkFeasibility = async (req, res) => {
  try {
    await marketDataService.ensureReady();
    const { budget, area_sqm, floors = 1, region_id = 1, location } = req.body;
    if (!budget || !area_sqm) {
      return res.status(400).json({ message: "budget and area_sqm are required" });
    }

    const feasibility = checkBudgetFeasibility(Number(budget), Number(area_sqm), Number(floors), region_id);

    let aiResult = null;
    try {
      aiResult = await aiBudgetAnalysisService.analyzeBudget(Number(budget), region_id, {
        area_sqm: Number(area_sqm),
        floors: Number(floors),
        location,
      });
    } catch (e) {
      console.error("AI analysis failed:", e.message);
    }

    res.json({
      success: true,
      budget,
      area_sqm: Number(area_sqm),
      floors: Number(floors),
      feasibility_matrix: feasibility,
      ai_analysis: aiResult,
    });
  } catch (err) {
    return handleEstimationError(err, res, "Failed to check feasibility");
  }
};

// ─── GET /api/estimation ──────────────────────────────────────────────────────
export const getMyEstimates = async (req, res) => {
  try {
    const summaries = await prisma.estimateSummary.findMany({
      where: { project: { userId: BigInt(req.user.id) } },
      include: {
        project: {
          select: { projectName: true, builtAreaM2: true, floors: true, finishLevel: true, region: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, estimates: summaries.map(serializeEstimate) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch estimates" });
  }
};

// ─── GET /api/estimation/:id ──────────────────────────────────────────────────
export const getEstimateById = async (req, res) => {
  try {
    const summary = await prisma.estimateSummary.findFirst({
      where: {
        id: BigInt(req.params.id),
        project: { userId: BigInt(req.user.id) },
      },
      include: {
        project: {
          select: {
            projectName: true, builtAreaM2: true, floors: true, finishLevel: true,
            region: { select: { name: true } },
            boqItems: { orderBy: [{ category: "asc" }, { createdAt: "asc" }] },
          },
        },
      },
    });

    if (!summary) return res.status(404).json({ message: "Estimate not found" });

    const boq_items = (summary.project?.boqItems || []).map(item => ({
      id: item.id.toString(),
      section: item.category,
      description: item.customName || "",
      unit: item.unit,
      quantity: Number(item.quantity),
      unit_rate: Number(item.unitCost),
      amount: Number(item.totalCost),
    }));

    res.json({
      success: true,
      estimate: { ...serializeEstimate(summary), boq_items },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch estimate" });
  }
};

// ─── DELETE /api/estimation/:id ───────────────────────────────────────────────
export const deleteEstimate = async (req, res) => {
  try {
    const count = await prisma.estimateSummary.deleteMany({
      where: {
        id: BigInt(req.params.id),
        project: { userId: BigInt(req.user.id) },
      },
    });
    if (count.count === 0) return res.status(404).json({ message: "Estimate not found" });
    res.json({ success: true, message: "Estimate deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete estimate" });
  }
};
