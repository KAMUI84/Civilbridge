import prisma from "../../config/prisma.js";
import { protectOwnership } from "../../utils/ownership.js";

// Public: get plans with filters
export async function getPlans(req, res) {
  try {
    const { page = 1, limit = 20, category, style, bedrooms, minArea, maxArea, search, status = "APPROVED" } = req.query;
    const where = { status };
    if (category) where.category = category;
    if (style) where.style = style;
    if (bedrooms) where.bedrooms = Number(bedrooms);
    if (minArea || maxArea) {
      where.builtAreaM2 = {};
      if (minArea) where.builtAreaM2.gte = Number(minArea);
      if (maxArea) where.builtAreaM2.lte = Number(maxArea);
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const plans = await prisma.plan.findMany({
      where,
      include: {
        creator: { select: { fullName: true } },
        assets: {
          where: { assetType: "render" },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.plan.count({ where });

    res.json({ plans, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
}

// Public: get plan by id
export async function getPlanById(req, res) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: BigInt(req.params.id) },
      include: {
        creator: { select: { fullName: true, email: true } },
        assets: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch plan" });
  }
}

// Protected: create plan
export async function createPlan(req, res) {
  try {
    const { title, description, category, style, bedrooms, floors, builtAreaM2, estimatedCostMin, estimatedCostMax, zoningInfo } = req.body;
    const userId = BigInt(req.user.id);

    const plan = await prisma.plan.create({
      data: {
        createdByUserId: userId,
        title,
        description,
        category: category || "RESIDENTIAL",
        style,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        floors: floors ? Number(floors) : 1,
        builtAreaM2: builtAreaM2 ? Number(builtAreaM2) : null,
        estimatedCostMin: estimatedCostMin ? Number(estimatedCostMin) : null,
        estimatedCostMax: estimatedCostMax ? Number(estimatedCostMax) : null,
        zoningInfo,
        status: "PENDING", // Require admin approval
      },
    });

    // If assets uploaded, associate them
    if (req.files?.length) {
      await prisma.planAsset.createMany({
        data: req.files.map((file, idx) => ({
          planId: plan.id,
          assetType: "render",
          assetUrl: `/uploads/plans/${file.filename}`,
          sortOrder: idx,
        })),
      });
    }

    res.status(201).json({ message: "Plan submitted for approval", plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create plan" });
  }
}

// Protected: update plan
export async function updatePlan(req, res) {
  try {
    const planId = BigInt(req.params.id);
    await protectOwnership(req.user, planId, "plan");

    const { title, description, category, style, bedrooms, floors, builtAreaM2, estimatedCostMin, estimatedCostMax, zoningInfo, status } = req.body;

    const plan = await prisma.plan.update({
      where: { id: planId },
      data: {
        title,
        description,
        category,
        style,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        floors: floors ? Number(floors) : undefined,
        builtAreaM2: builtAreaM2 ? Number(builtAreaM2) : undefined,
        estimatedCostMin: estimatedCostMin ? Number(estimatedCostMin) : undefined,
        estimatedCostMax: estimatedCostMax ? Number(estimatedCostMax) : undefined,
        zoningInfo,
        status,
      },
    });

    // If new assets uploaded, associate them
    if (req.files?.length) {
      await prisma.planAsset.createMany({
        data: req.files.map((file, idx) => ({
          planId,
          assetType: "render",
          assetUrl: `/uploads/plans/${file.filename}`,
          sortOrder: idx,
        })),
      });
    }

    res.json({ message: "Plan updated", plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update plan" });
  }
}

// Protected: delete plan
export async function deletePlan(req, res) {
  try {
    const planId = BigInt(req.params.id);
    await protectOwnership(req.user, planId, "plan");

    await prisma.plan.delete({ where: { id: planId } });

    res.json({ message: "Plan deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete plan" });
  }
}

// Protected: get my plans
export async function getMyPlans(req, res) {
  try {
    const plans = await prisma.plan.findMany({
      where: { createdByUserId: BigInt(req.user.id) },
      include: {
        assets: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your plans" });
  }
}

// Protected: upload additional assets
export async function uploadPlanAssets(req, res) {
  try {
    const planId = BigInt(req.params.id);
    await protectOwnership(req.user, planId, "plan");

    if (!req.files?.length) return res.status(400).json({ message: "No assets uploaded" });

    await prisma.planAsset.createMany({
      data: req.files.map((file, idx) => ({
        planId,
        assetType: "render",
        assetUrl: `/uploads/plans/${file.filename}`,
        sortOrder: idx,
      })),
    });

    res.json({ message: "Assets uploaded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload assets" });
  }
}

// Admin: approve plan
export async function approvePlan(req, res) {
  try {
    const planId = BigInt(req.params.id);
    const { status, rejectionReason } = req.body;

    const plan = await prisma.plan.update({
      where: { id: planId },
      data: { status },
    });

    // Optionally store rejection reason in audit log
    if (status === "INACTIVE" && rejectionReason) {
      await prisma.auditLog.create({
        data: {
          userId: BigInt(req.user.id),
          action: "PLAN_REJECTED",
          entityType: "plan",
          entityId: planId,
          metaJson: { reason: rejectionReason },
        },
      });
    }

    res.json({ message: "Plan approved/rejected", plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve plan" });
  }
}
