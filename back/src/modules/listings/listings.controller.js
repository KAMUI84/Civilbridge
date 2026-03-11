import prisma from "../../config/prisma.js";
import { protectOwnership } from "../../utils/ownership.js";

// Public: get listings with filters
export async function getListings(req, res) {
  try {
    const { page = 1, limit = 20, type, region, status = "ACTIVE", search } = req.query;
    const where = { status };
    if (type) where.listingType = type;
    if (region) where.regionId = BigInt(region);
    if (search) where.title = { contains: search };

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

    res.json({ listings, total, page, limit });
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

    res.json(listing);
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

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        regionId: BigInt(regionId),
        locationText,
        price: price ? Number(price) : null,
        currency: currency || "RWF",
        sizeM2: sizeM2 ? Number(sizeM2) : null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        zoningInfo,
        listingType,
        ownerUserId: userId,
        status: "PENDING", // Require moderation
      },
    });

    // If images uploaded, associate them
    if (req.files?.length) {
      await prisma.listingImage.createMany({
        data: req.files.map((file, idx) => ({
          listingId: listing.id,
          imageUrl: `/uploads/listings/${file.filename}`,
          sortOrder: idx,
        })),
      });
    }

    res.status(201).json({ message: "Listing submitted for moderation", listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create listing" });
  }
}

// Protected: update listing
export async function updateListing(req, res) {
  try {
    const listingId = BigInt(req.params.id);
    await protectOwnership(req.user, listingId, "listing");

    const { title, description, regionId, locationText, price, currency, sizeM2, bedrooms, bathrooms, zoningInfo, status } = req.body;

    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        title,
        description,
        regionId: regionId ? BigInt(regionId) : undefined,
        locationText,
        price: price ? Number(price) : null,
        currency,
        sizeM2: sizeM2 ? Number(sizeM2) : null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        zoningInfo,
        status,
      },
    });

    // If new images uploaded, associate them
    if (req.files?.length) {
      await prisma.listingImage.createMany({
        data: req.files.map((file, idx) => ({
          listingId,
          imageUrl: `/uploads/listings/${file.filename}`,
          sortOrder: idx,
        })),
      });
    }

    res.json({ message: "Listing updated", listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update listing" });
  }
}

// Protected: delete listing
export async function deleteListing(req, res) {
  try {
    const listingId = BigInt(req.params.id);
    await protectOwnership(req.user, listingId, "listing");

    await prisma.listing.delete({ where: { id: listingId } });

    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete listing" });
  }
}

// Protected: get my listings
export async function getMyListings(req, res) {
  try {
    const listings = await prisma.listing.findMany({
      where: { ownerUserId: BigInt(req.user.id) },
      include: {
        region: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your listings" });
  }
}

// Protected: upload additional images
export async function uploadListingImages(req, res) {
  try {
    const listingId = BigInt(req.params.id);
    await protectOwnership(req.user, listingId, "listing");

    if (!req.files?.length) return res.status(400).json({ message: "No images uploaded" });

    await prisma.listingImage.createMany({
      data: req.files.map((file, idx) => ({
        listingId,
        imageUrl: `/uploads/listings/${file.filename}`,
        sortOrder: idx,
      })),
    });

    res.json({ message: "Images uploaded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload images" });
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
