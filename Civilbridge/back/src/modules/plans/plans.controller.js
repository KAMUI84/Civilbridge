import prisma from "../../config/prisma.js";
import { getPlanDownloadPayload } from "../payments/payments.service.js";
import { notify } from "../realtime/notify.js";
import { emailService } from "../../services/email.service.js";

const PLAN_REQUEST_TYPES = new Set(["CUSTOMIZE", "BUY_FULL_PACKAGE", "ASK_EXPERT"]);
const INBOUND_ALERT_EMAIL = process.env.INBOUND_ALERT_EMAIL || "samuelnizeyimana505@gmail.com";
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

function serializePlan(plan) {
  if (!plan) return null;
  return {
    ...plan,
    status: plan.isVerified ? "APPROVED" : "PENDING",
    assets: (plan.assets || []).map((asset) => ({
      ...asset,
      assetUrl: asset.fileUrl,
    })),
  };
}

async function ensurePlanManagementAccess(user, planId) {
  const plan = await prisma.plan.findUnique({
    where: { id: BigInt(planId) },
    select: { id: true, createdByUserId: true },
  });

  if (!plan) {
    const error = new Error("Plan not found");
    error.status = 404;
    throw error;
  }

  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    return plan;
  }

  if (String(plan.createdByUserId) !== String(user.id)) {
    const error = new Error("Not authorized to manage this plan");
    error.status = 403;
    throw error;
  }

  return plan;
}

export async function getPlans(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      style,
      tier,
      bedrooms,
      minArea,
      maxArea,
      search,
      status = "APPROVED",
    } = req.query;

    const where = {};
    const requestedStatus = String(status).toUpperCase();
    const isPrivileged = req.user && ["SUPER_ADMIN", "ADMIN", "ENGINEER"].includes(req.user.role);

    // Public callers can only ever see approved plans.
    // Only admin/engineer/super_admin may request PENDING view.
    if (requestedStatus === "PENDING" && !isPrivileged) {
      where.isVerified = true; // silently fall back to approved
    } else if (requestedStatus === "APPROVED") {
      where.isVerified = true;
    } else if (requestedStatus === "PENDING" && isPrivileged) {
      where.isVerified = false;
    }
    if (category) where.category = category;
    if (style) where.style = style;
    if (tier) where.tier = tier;
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
        assets: { orderBy: { sortOrder: "asc" }, take: 3 },
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.plan.count({ where });

    res.json({
      plans: plans.map(serializePlan),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
}

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

    res.json(serializePlan(plan));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch plan" });
  }
}

export async function downloadPlan(req, res) {
  try {
    const plan = await getPlanDownloadPayload(req.params.id, req.user);
    res.json({ success: true, plan });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Failed to download plan" });
  }
}

export async function createPlan(req, res) {
  try {
    const {
      title,
      description,
      category,
      style,
      bedrooms,
      floors,
      builtAreaM2,
      estimatedCostMin,
      estimatedCostMax,
      tier,
    } = req.body;

    if (!title || !builtAreaM2) {
      return res.status(400).json({ message: "Title and built area are required" });
    }

    const userId = BigInt(req.user.id);
    const isAutoApproved = req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN";

    const plan = await prisma.plan.create({
      data: {
        createdByUserId: userId,
        title,
        description: description || null,
        category: category || "RESIDENTIAL",
        style: style || null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        floors: floors ? Number(floors) : 1,
        builtAreaM2: Number(builtAreaM2),
        estimatedCostMin: estimatedCostMin ? Number(estimatedCostMin) : null,
        estimatedCostMax: estimatedCostMax ? Number(estimatedCostMax) : null,
        tier: tier || "FREE",
        isVerified: isAutoApproved,
      },
      include: {
        creator: { select: { fullName: true, email: true } },
        assets: true,
      },
    });

    if (req.files?.length) {
      await prisma.planAsset.createMany({
        data: req.files.map((file, index) => ({
          planId: plan.id,
          assetType: file.mimetype === "application/pdf" ? "document" : "render",
          fileUrl: `/uploads/${file.filename}`,
          sortOrder: index,
        })),
      });
    }

    const createdPlan = await prisma.plan.findUnique({
      where: { id: plan.id },
      include: {
        creator: { select: { fullName: true, email: true } },
        assets: { orderBy: { sortOrder: "asc" } },
      },
    });

    res.status(201).json({ message: isAutoApproved ? "Plan published" : "Plan submitted for approval", plan: serializePlan(createdPlan) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create plan" });
  }
}

export async function updatePlan(req, res) {
  try {
    const planId = BigInt(req.params.id);
    await ensurePlanManagementAccess(req.user, planId);

    const {
      title,
      description,
      category,
      style,
      bedrooms,
      floors,
      builtAreaM2,
      estimatedCostMin,
      estimatedCostMax,
      tier,
    } = req.body;

    const plan = await prisma.plan.update({
      where: { id: planId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(category ? { category } : {}),
        ...(style !== undefined ? { style: style || null } : {}),
        ...(bedrooms !== undefined ? { bedrooms: bedrooms ? Number(bedrooms) : null } : {}),
        ...(floors !== undefined ? { floors: Number(floors) || 1 } : {}),
        ...(builtAreaM2 !== undefined ? { builtAreaM2: Number(builtAreaM2) } : {}),
        ...(estimatedCostMin !== undefined ? { estimatedCostMin: estimatedCostMin ? Number(estimatedCostMin) : null } : {}),
        ...(estimatedCostMax !== undefined ? { estimatedCostMax: estimatedCostMax ? Number(estimatedCostMax) : null } : {}),
        ...(tier ? { tier } : {}),
        ...(req.user.role === "SUPER_ADMIN" || req.user.role === "ADMIN" ? {} : { isVerified: false }),
      },
      include: {
        creator: { select: { fullName: true, email: true } },
        assets: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (req.files?.length) {
      await prisma.planAsset.createMany({
        data: req.files.map((file, index) => ({
          planId,
          assetType: file.mimetype === "application/pdf" ? "document" : "render",
          fileUrl: `/uploads/${file.filename}`,
          sortOrder: index,
        })),
      });
    }

    const refreshedPlan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        creator: { select: { fullName: true, email: true } },
        assets: { orderBy: { sortOrder: "asc" } },
      },
    });

    res.json({ message: "Plan updated", plan: serializePlan(refreshedPlan || plan) });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Failed to update plan" });
  }
}

export async function deletePlan(req, res) {
  try {
    const planId = BigInt(req.params.id);
    await ensurePlanManagementAccess(req.user, planId);

    await prisma.plan.delete({ where: { id: planId } });

    res.json({ message: "Plan deleted" });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Failed to delete plan" });
  }
}

export async function getMyPlans(req, res) {
  try {
    const plans = await prisma.plan.findMany({
      where: { createdByUserId: BigInt(req.user.id) },
      include: {
        assets: { orderBy: { sortOrder: "asc" }, take: 3 },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(plans.map(serializePlan));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your plans" });
  }
}

export async function getMyPlanRequests(req, res) {
  try {
    const requests = await prisma.planRequest.findMany({
      where: { requesterUserId: BigInt(req.user.id) },
      include: {
        plan: {
          include: {
            assets: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      requests: requests.map((request) => ({
        ...request,
        plan: serializePlan(request.plan),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your plan requests" });
  }
}

export async function createPlanRequest(req, res) {
  try {
    const planId = BigInt(req.params.id);
    const { requestType = "ASK_EXPERT", notes } = req.body;
    const normalizedType = String(requestType || "ASK_EXPERT").toUpperCase();

    if (!PLAN_REQUEST_TYPES.has(normalizedType)) {
      return res.status(400).json({ message: "Invalid plan request type" });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: { id: true, title: true, createdByUserId: true, isVerified: true },
    });

    if (!plan || !plan.isVerified) {
      return res.status(404).json({ message: "This plan is not available for follow-up requests" });
    }

    const request = await prisma.planRequest.create({
      data: {
        planId,
        requesterUserId: BigInt(req.user.id),
        requestType: normalizedType,
        notes: notes || null,
      },
    });

    if (plan.createdByUserId) {
      await notify({
        userId: plan.createdByUserId.toString(),
        type: "PLAN_REQUEST_CREATED",
        title: `New follow-up request for "${plan.title}"`,
        body: "A client has requested follow-up on one of your published plans.",
        actionUrl: `/plans/${planId}`,
        payloadJson: {
          planId: planId.toString(),
          requestId: request.id.toString(),
          requestType: normalizedType,
        },
      });
    }

    await emailService.sendEmail(
      INBOUND_ALERT_EMAIL,
      `CivilBridge plan follow-up: ${plan.title}`,
      `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#0c1220;">New plan follow-up request</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:bold;width:140px;">Plan</td><td style="padding:8px;">${plan.title}</td></tr>
            <tr style="background:#f7f9ff;"><td style="padding:8px;font-weight:bold;">Request type</td><td style="padding:8px;">${normalizedType}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Requester</td><td style="padding:8px;">${req.user?.fullName || "CivilBridge user"}</td></tr>
            <tr style="background:#f7f9ff;"><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${req.user?.email || "Not provided"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;vertical-align:top;">Notes</td><td style="padding:8px;white-space:pre-wrap;">${notes || "No notes provided."}</td></tr>
          </table>
          <p style="margin-top:18px;">
            <a href="${FRONTEND_URL}/plans/${planId}" style="color:#2563eb;">Open plan details</a>
          </p>
        </div>
      `,
      `Plan follow-up request\nPlan: ${plan.title}\nType: ${normalizedType}\nRequester: ${req.user?.fullName || "CivilBridge user"}\nEmail: ${req.user?.email || "Not provided"}\nNotes: ${notes || "No notes provided."}`
    );

    res.status(201).json({ message: "Plan follow-up request submitted", request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit plan follow-up request" });
  }
}

export async function uploadPlanAssets(req, res) {
  try {
    const planId = BigInt(req.params.id);
    await ensurePlanManagementAccess(req.user, planId);

    if (!req.files?.length) return res.status(400).json({ message: "No assets uploaded" });

    await prisma.planAsset.createMany({
      data: req.files.map((file, index) => ({
        planId,
        assetType: file.mimetype === "application/pdf" ? "document" : "render",
        fileUrl: `/uploads/${file.filename}`,
        sortOrder: index,
      })),
    });

    res.json({ message: "Assets uploaded" });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Failed to upload assets" });
  }
}

// Admin: all plan requests (assignment/review queue)
export async function getAllPlanRequests(req, res) {
  try {
    const { page = 1, limit = 30, status } = req.query;
    const where = {};
    if (status) where.status = String(status).toUpperCase();

    const requests = await prisma.planRequest.findMany({
      where,
      include: {
        plan: {
          select: { id: true, title: true, category: true, isVerified: true, assets: { take: 1, orderBy: { sortOrder: "asc" } } },
        },
        requester: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.planRequest.count({ where });

    res.json({ requests, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch plan requests" });
  }
}

// Admin: update plan request status
export async function updatePlanRequest(req, res) {
  try {
    const requestId = BigInt(req.params.requestId);
    const { status, notes } = req.body;
    const validStatuses = ["NEW", "IN_REVIEW", "ACCEPTED", "REJECTED", "COMPLETED"];
    const next = String(status || "").toUpperCase();

    if (!validStatuses.includes(next)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await prisma.planRequest.update({
      where: { id: requestId },
      data: { status: next },
      include: {
        requester: { select: { id: true, fullName: true } },
        plan: { select: { id: true, title: true } },
      },
    });

    await notify({
      userId: updated.requester.id.toString(),
      type: "PLAN_REQUEST_UPDATED",
      title: `Your request for "${updated.plan.title}" was ${next.toLowerCase()}`,
      body: notes || `Your plan follow-up request status is now: ${next}`,
      actionUrl: `/plans/${updated.plan.id}`,
      payloadJson: { planId: updated.plan.id.toString(), requestId: requestId.toString(), status: next },
    });

    res.json({ message: "Plan request updated", request: updated });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Failed to update plan request" });
  }
}

export async function approvePlan(req, res) {
  try {
    const planId = BigInt(req.params.id);
    const { status = "APPROVED", rejectionReason } = req.body;
    const nextStatus = String(status).toUpperCase();
    const isApproved = nextStatus === "APPROVED";

    const plan = await prisma.plan.update({
      where: { id: planId },
      data: { isVerified: isApproved },
      include: {
        creator: {
          select: {
            fullName: true,
            email: true,
          },
        },
        assets: { orderBy: { sortOrder: "asc" } },
      },
    });

    const adminId = req.user.id.toString();
    const ownerId = plan.createdByUserId?.toString();
    const now = new Date().toISOString();

    if (isApproved && ownerId) {
      if (plan.creator?.email) {
        await emailService.sendEngineerApprovedEmail({
          to: plan.creator.email,
          recipientName: plan.creator.fullName || "there",
          projectName: plan.title,
          reviewerName: req.user.fullName || req.user.email || "CivilBridge reviewer",
          notes: "Your plan has been approved and is now available on CivilBridge.",
          documentUrl: `${(process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "")}/plans/${planId}`,
        });
      }

      await notify({
        userId: ownerId,
        type: "PLAN_APPROVED",
        title: `Your plan "${plan.title}" has been approved`,
        body: "Your submitted plan has been reviewed and approved.",
        actionUrl: `/plans/${planId}`,
        payloadJson: { planId: planId.toString(), approvedBy: adminId, approvedAt: now },
        event: "plan:approved",
        eventPayload: {
          projectId: null,
          planId: planId.toString(),
          approvedBy: adminId,
          approvedAt: now,
          message: null,
        },
      });
    }

    if (!isApproved && ownerId) {
      if (rejectionReason) {
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

      if (plan.creator?.email) {
        await emailService.sendEngineerRejectedEmail({
          to: plan.creator.email,
          recipientName: plan.creator.fullName || "there",
          projectName: plan.title,
          reviewerName: req.user.fullName || req.user.email || "CivilBridge reviewer",
          notes: rejectionReason || "Your plan needs revision before it can be approved.",
          projectUrl: `${(process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "")}/plans/${planId}`,
        });
      }

      await notify({
        userId: ownerId,
        type: "PLAN_REJECTED",
        title: `Your plan "${plan.title}" was not approved`,
        body: rejectionReason ?? "Your submitted plan has been reviewed and was not approved.",
        actionUrl: `/plans/${planId}`,
        payloadJson: { planId: planId.toString(), rejectedBy: adminId, rejectedAt: now, reason: rejectionReason },
        event: "plan:rejected",
        eventPayload: {
          projectId: null,
          planId: planId.toString(),
          rejectedBy: adminId,
          rejectedAt: now,
          reason: rejectionReason ?? null,
        },
      });
    }

    res.json({ message: "Plan review updated", plan: serializePlan(plan) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve plan" });
  }
}
