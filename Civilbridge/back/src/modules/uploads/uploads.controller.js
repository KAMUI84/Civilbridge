import multer from "multer";
import path from "path";
import prisma from "../config/prisma.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + suffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = new Set([
    "image/jpeg", "image/png", "image/gif",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "model/obj", "model/stl", "model/3mf",
  ]);
  const allowedExt = new Set([
    ".jpg", ".jpeg", ".png", ".gif", ".pdf",
    ".doc", ".docx", ".xls", ".xlsx", ".obj", ".stl", ".3mf",
  ]);
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.has(file.mimetype) && allowedExt.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images, PDFs, documents, and 3D models are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024, files: 5 } });

export const uploadPlanFiles = upload.array("files", 5);
export const uploadListingFiles = upload.array("files", 5);

// ─── POST /uploads/plans ──────────────────────────────────────────────────────
export async function uploadPlan(req, res) {
  try {
    const { title, description, category, price } = req.body;
    const userId = BigInt(req.user.id);

    if (!title || !category) {
      return res.status(400).json({ error: "Title and category are required" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one file is required" });
    }

    const CATEGORY_MAP = { RESIDENTIAL: "RESIDENTIAL", COMMERCIAL: "COMMERCIAL", INDUSTRIAL: "INDUSTRIAL", INFRA: "INFRA" };
    const planCategory = CATEGORY_MAP[String(category).toUpperCase()] || "RESIDENTIAL";

    const plan = await prisma.plan.create({
      data: {
        category: planCategory,
        title,
        description: description || null,
        builtAreaM2: 0,
        estimatedCostMin: price ? Number(price) : null,
        createdByUserId: userId,
      },
    });

    await Promise.all(
      req.files.map(file =>
        prisma.planAsset.create({
          data: {
            planId: plan.id,
            assetType: file.mimetype.startsWith("image/") ? "image" : "document",
            fileUrl: file.path,
          },
        })
      )
    );

    res.status(201).json({
      success: true,
      message: "Plan uploaded successfully. It will be reviewed before being published.",
      plan_id: plan.id.toString(),
    });
  } catch (error) {
    console.error("Upload plan error:", error);
    res.status(500).json({ error: "Failed to upload plan", message: error.message });
  }
}

// ─── POST /uploads/marketplace ────────────────────────────────────────────────
export async function uploadMarketplaceListing(req, res) {
  try {
    const { title, description, category, price, location } = req.body;
    const userId = BigInt(req.user.id);

    if (!title || !price) {
      return res.status(400).json({ error: "Title and price are required" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    const listingType = String(category).toUpperCase() === "LAND" ? "LAND" : "PROPERTY";

    // Ensure a default region exists (region id 1)
    let regionId;
    const firstRegion = await prisma.region.findFirst({ orderBy: { id: "asc" }, select: { id: true } });
    regionId = firstRegion?.id ?? BigInt(1);

    const listing = await prisma.listing.create({
      data: {
        listingType,
        title,
        description: description || null,
        regionId,
        locationText: location || null,
        price: Number(price),
        ownerUserId: userId,
        status: "PENDING",
      },
    });

    await Promise.all(
      req.files.map((file, i) =>
        prisma.listingImage.create({
          data: { listingId: listing.id, imageUrl: file.path, sortOrder: i },
        })
      )
    );

    res.status(201).json({
      success: true,
      message: "Marketplace listing uploaded. It will be reviewed before being published.",
      listing_id: listing.id.toString(),
    });
  } catch (error) {
    console.error("Upload marketplace listing error:", error);
    res.status(500).json({ error: "Failed to upload marketplace listing", message: error.message });
  }
}

// ─── GET /uploads/plans ───────────────────────────────────────────────────────
export async function getPlans(req, res) {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { isVerified: true };
    if (category) {
      const cat = String(category).toUpperCase();
      if (["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "INFRA"].includes(cat)) where.category = cat;
    }

    const plans = await prisma.plan.findMany({
      where,
      include: { assets: true, creator: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    });

    res.json({
      plans: plans.map(p => ({
        id: p.id.toString(),
        title: p.title,
        description: p.description,
        category: p.category,
        price: p.estimatedCostMin ? Number(p.estimatedCostMin) : 0,
        uploader_name: p.creator?.fullName || null,
        files: p.assets.map(a => ({ id: a.id.toString(), file_path: a.fileUrl, file_type: a.assetType })),
        created_at: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ error: "Failed to get plans", message: error.message });
  }
}

// ─── GET /uploads/marketplace ─────────────────────────────────────────────────
export async function getMarketplaceListings(req, res) {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { status: "ACTIVE" };
    if (category) {
      const t = String(category).toUpperCase();
      if (["PROPERTY", "LAND"].includes(t)) where.listingType = t;
    }

    const listings = await prisma.listing.findMany({
      where,
      include: { images: true, owner: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    });

    res.json({
      listings: listings.map(l => ({
        id: l.id.toString(),
        title: l.title,
        description: l.description,
        category: l.listingType,
        price: l.price ? Number(l.price) : null,
        location: l.locationText,
        seller_name: l.owner?.fullName || null,
        images: l.images.map(i => ({ id: i.id.toString(), file_path: i.imageUrl })),
        created_at: l.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get marketplace listings error:", error);
    res.status(500).json({ error: "Failed to get marketplace listings", message: error.message });
  }
}

// ─── GET /uploads/my-uploads ─────────────────────────────────────────────────
export async function getUserUploads(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const { type = "all" } = req.query;
    const result = [];

    if (type === "plans" || type === "all") {
      const plans = await prisma.plan.findMany({
        where: { createdByUserId: userId },
        include: { assets: true },
        orderBy: { createdAt: "desc" },
      });
      result.push({
        type: "plans",
        data: plans.map(p => ({ id: p.id.toString(), title: p.title, category: p.category, created_at: p.createdAt })),
      });
    }

    if (type === "listings" || type === "all") {
      const listings = await prisma.listing.findMany({
        where: { ownerUserId: userId },
        include: { images: true },
        orderBy: { createdAt: "desc" },
      });
      result.push({
        type: "listings",
        data: listings.map(l => ({ id: l.id.toString(), title: l.title, status: l.status, created_at: l.createdAt })),
      });
    }

    res.json({ uploads: result });
  } catch (error) {
    console.error("Get user uploads error:", error);
    res.status(500).json({ error: "Failed to get user uploads", message: error.message });
  }
}
