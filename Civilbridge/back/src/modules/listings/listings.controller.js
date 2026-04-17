import prisma from "../../config/prisma.js";
import { notify } from "../realtime/notify.js";
import { emailService } from "../../services/email.service.js";

const LEAD_REQUEST_TYPES = new Set(["MORE_INFO", "SCHEDULE_VISIT", "CONNECT_AGENT"]);
const INBOUND_ALERT_EMAIL = process.env.INBOUND_ALERT_EMAIL || "samuelnizeyimana505@gmail.com";
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

function serializeListing(listing) {
  if (!listing) return null;
  return {
    ...listing,
    images: (listing.images || []).map((image) => ({
      ...image,
      imageUrl: image.imageUrl,
    })),
  };
}

async function ensureListingManagementAccess(user, listingId) {
  const listing = await prisma.listing.findUnique({
    where: { id: BigInt(listingId) },
    select: { id: true, ownerUserId: true },
  });

  if (!listing) {
    const error = new Error("Listing not found");
    error.status = 404;
    throw error;
  }

  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    return listing;
  }

  if (String(listing.ownerUserId) !== String(user.id)) {
    const error = new Error("Not authorized to manage this listing");
    error.status = 403;
    throw error;
  }

  return listing;
}

// Public: get listings with filters
export async function getListings(req, res) {
  try {
    const { page = 1, limit = 20, type, region, status = "ACTIVE", search } = req.query;
    const where = { status };
    if (type) where.listingType = type;
    if (region) where.regionId = BigInt(region);
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { locationText: { contains: search } },
      ];
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        region: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        owner: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.listing.count({ where });

    res.json({ listings: listings.map(serializeListing), total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
}

// Public: get listing by id
export async function getListingById(req, res) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: BigInt(req.params.id) },
      include: {
        region: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        owner: { select: { fullName: true } },
      },
    });

    if (!listing) return res.status(404).json({ message: "Listing not found" });

    res.json(serializeListing(listing));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
}

// Protected: create listing
export async function createListing(req, res) {
  try {
    const { title, description, regionId, locationText, price, currency, sizeM2, bedrooms, bathrooms, zoningInfo, listingType } = req.body;
    const userId = BigInt(req.user.id);
    const normalizedType = String(listingType || "").toUpperCase();

    if (!title || !regionId || !normalizedType) {
      return res.status(400).json({ message: "Title, region, and listing type are required" });
    }

    if (!["PROPERTY", "LAND"].includes(normalizedType)) {
      return res.status(400).json({ message: "Invalid listing type" });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description: description || null,
        regionId: BigInt(regionId),
        locationText: locationText || null,
        price: price ? Number(price) : null,
        currency: currency || "RWF",
        sizeM2: sizeM2 ? Number(sizeM2) : null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        zoningInfo: zoningInfo || null,
        listingType: normalizedType,
        ownerUserId: userId,
        status: "ACTIVE",
      },
    });

    if (req.files?.length) {
      await prisma.listingImage.createMany({
        data: req.files.map((file, idx) => ({
          listingId: listing.id,
          imageUrl: `/uploads/${file.filename}`,
          sortOrder: idx,
        })),
      });
    }

    const createdListing = await prisma.listing.findUnique({
      where: { id: listing.id },
      include: {
        region: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        owner: { select: { fullName: true } },
      },
    });

    res.status(201).json({ message: "Listing published", listing: serializeListing(createdListing) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create listing" });
  }
}

// Protected: update listing
export async function updateListing(req, res) {
  try {
    const listingId = BigInt(req.params.id);
    await ensureListingManagementAccess(req.user, listingId);

    // status is intentionally excluded — only admins may change it via /moderate
    const { title, description, regionId, locationText, price, currency, sizeM2, bedrooms, bathrooms, zoningInfo, listingType } = req.body;

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(regionId ? { regionId: BigInt(regionId) } : {}),
        ...(locationText !== undefined ? { locationText: locationText || null } : {}),
        ...(price !== undefined ? { price: price ? Number(price) : null } : {}),
        ...(currency !== undefined ? { currency: currency || "RWF" } : {}),
        ...(sizeM2 !== undefined ? { sizeM2: sizeM2 ? Number(sizeM2) : null } : {}),
        ...(bedrooms !== undefined ? { bedrooms: bedrooms ? Number(bedrooms) : null } : {}),
        ...(bathrooms !== undefined ? { bathrooms: bathrooms ? Number(bathrooms) : null } : {}),
        ...(zoningInfo !== undefined ? { zoningInfo: zoningInfo || null } : {}),
        ...(listingType ? { listingType: String(listingType).toUpperCase() } : {}),
      },
    });

    if (req.files?.length) {
      await prisma.listingImage.createMany({
        data: req.files.map((file, idx) => ({
          listingId,
          imageUrl: `/uploads/${file.filename}`,
          sortOrder: idx,
        })),
      });
    }

    const refreshedListing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        region: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        owner: { select: { fullName: true } },
      },
    });

    res.json({ message: "Listing updated", listing: serializeListing(refreshedListing) });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Failed to update listing" });
  }
}

// Protected: delete listing
export async function deleteListing(req, res) {
  try {
    const listingId = BigInt(req.params.id);
    await ensureListingManagementAccess(req.user, listingId);

    await prisma.listing.delete({ where: { id: listingId } });

    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Failed to delete listing" });
  }
}

// Protected: get my listings with pagination
export async function getMyListings(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: { ownerUserId: BigInt(req.user.id) },
        include: {
          region: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.listing.count({ where: { ownerUserId: BigInt(req.user.id) } }),
    ]);

    res.json({
      listings: listings.map(serializeListing),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your listings" });
  }
}

export async function getMyLeadRequests(req, res) {
  try {
    const requests = await prisma.leadRequest.findMany({
      where: { requesterUserId: BigInt(req.user.id) },
      include: {
        listing: {
          include: {
            region: { select: { name: true } },
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      requests: requests.map((request) => ({
        ...request,
        listing: serializeListing(request.listing),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your listing requests" });
  }
}

// Protected: upload additional images
export async function uploadListingImages(req, res) {
  try {
    const listingId = BigInt(req.params.id);
    await ensureListingManagementAccess(req.user, listingId);

    if (!req.files?.length) return res.status(400).json({ message: "No images uploaded" });

    await prisma.listingImage.createMany({
      data: req.files.map((file, idx) => ({
        listingId,
        imageUrl: `/uploads/${file.filename}`,
        sortOrder: idx,
      })),
    });

    res.json({ message: "Images uploaded" });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Failed to upload images" });
  }
}

// Admin: moderate listing
export async function moderateListing(req, res) {
  try {
    const listingId = BigInt(req.params.id);
    const { status, rejectionReason } = req.body;

    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: { status },
    });

    // Optionally store rejection reason in audit log
    if (status === "INACTIVE" && rejectionReason) {
      await prisma.auditLog.create({
        data: {
          userId: BigInt(req.user.id),
          action: "LISTING_REJECTED",
          entityType: "listing",
          entityId: listingId,
          metaJson: { reason: rejectionReason },
        },
      });
    }

    res.json({ message: "Listing moderated", listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to moderate listing" });
  }
}

// Admin: get all lead requests across all listings
export async function getAllLeadRequests(req, res) {
  try {
    const { page = 1, limit = 30, status } = req.query;
    const where = {};
    if (status) where.status = String(status).toUpperCase();

    const requests = await prisma.leadRequest.findMany({
      where,
      include: {
        listing: {
          select: { id: true, title: true, listingType: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
        },
        requester: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.leadRequest.count({ where });
    res.json({ requests, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch lead requests" });
  }
}

// Admin: update a lead request status
export async function updateLeadRequest(req, res) {
  try {
    const requestId = BigInt(req.params.requestId);
    const { status } = req.body;
    const validStatuses = ["NEW", "CONTACTED", "CLOSED"];
    const next = String(status || "").toUpperCase();

    if (!validStatuses.includes(next)) {
      return res.status(400).json({ message: "Invalid status. Must be NEW, CONTACTED, or CLOSED" });
    }

    const updated = await prisma.leadRequest.update({
      where: { id: requestId },
      data: { status: next },
      include: {
        listing: { select: { id: true, title: true } },
        requester: { select: { id: true, fullName: true } },
      },
    });

    const updatedWithRels = /** @type {any} */ (updated);
    if (updatedWithRels.requester) {
      await notify({
        userId: updatedWithRels.requester.id.toString(),
        type: "LISTING_INQUIRY_UPDATED",
        title: `Your inquiry for "${updatedWithRels.listing?.title}" was updated`,
        body: `Status: ${next}`,
        actionUrl: `/marketplace/${updatedWithRels.listing?.id}`,
        payloadJson: { listingId: String(updatedWithRels.listing?.id ?? ""), requestId: requestId.toString(), status: next },
      });
    }

    res.json({ message: "Lead request updated", request: updated });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Failed to update lead request" });
  }
}

// Protected: submit an inquiry (lead request) for a listing
export async function inquireListing(req, res) {
  try {
    const listingId = BigInt(req.params.id);
    const { name, email, phone, message, requestType = "MORE_INFO" } = req.body;
    const normalizedType = String(requestType || "MORE_INFO").toUpperCase();

    if (!LEAD_REQUEST_TYPES.has(normalizedType)) {
      return res.status(400).json({ message: "Invalid listing request type" });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, title: true, ownerUserId: true },
    });
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.status !== "ACTIVE") return res.status(400).json({ message: "This listing is not currently active" });

    const lead = await prisma.leadRequest.create({
      data: {
        listingId,
        requesterUserId: req.user?.id ? BigInt(req.user.id) : undefined,
        name:        name        || req.user?.fullName || null,
        email:       email       || req.user?.email    || null,
        phone:       phone       || null,
        message:     message     || null,
        requestType: normalizedType,
      },
    });

    if (listing.ownerUserId) {
      await notify({
        userId: listing.ownerUserId.toString(),
        type: "LISTING_REQUEST_CREATED",
        title: `New ${normalizedType === "SCHEDULE_VISIT" ? "visit request" : "listing inquiry"} for "${listing.title}"`,
        body: normalizedType === "SCHEDULE_VISIT"
          ? "A client wants to schedule a visit for one of your published listings."
          : "A client has shown interest in one of your published listings.",
        actionUrl: `/marketplace/${listingId}`,
        payloadJson: {
          listingId: listingId.toString(),
          leadId: lead.id.toString(),
          requestType: normalizedType,
        },
      });
    }

    await emailService.sendEmail(
      INBOUND_ALERT_EMAIL,
      `CivilBridge listing follow-up: ${listing.title}`,
      `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#0c1220;">New listing follow-up request</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:bold;width:140px;">Listing</td><td style="padding:8px;">${listing.title}</td></tr>
            <tr style="background:#f7f9ff;"><td style="padding:8px;font-weight:bold;">Request type</td><td style="padding:8px;">${normalizedType}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Name</td><td style="padding:8px;">${name || req.user?.fullName || "Not provided"}</td></tr>
            <tr style="background:#f7f9ff;"><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${email || req.user?.email || "Not provided"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Phone</td><td style="padding:8px;">${phone || "Not provided"}</td></tr>
            <tr style="background:#f7f9ff;"><td style="padding:8px;font-weight:bold;vertical-align:top;">Reason</td><td style="padding:8px;white-space:pre-wrap;">${message || "No message provided."}</td></tr>
          </table>
          <p style="margin-top:18px;">
            <a href="${FRONTEND_URL}/marketplace/${listingId}" style="color:#2563eb;">Open listing details</a>
          </p>
        </div>
      `,
      `Listing follow-up request\nListing: ${listing.title}\nType: ${normalizedType}\nName: ${name || req.user?.fullName || "Not provided"}\nEmail: ${email || req.user?.email || "Not provided"}\nPhone: ${phone || "Not provided"}\nReason: ${message || "No message provided."}`
    );

    res.status(201).json({
      message: normalizedType === "SCHEDULE_VISIT" ? "Visit request submitted" : "Inquiry submitted",
      leadId: lead.id.toString(),
      requestType: normalizedType,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit inquiry" });
  }
}
