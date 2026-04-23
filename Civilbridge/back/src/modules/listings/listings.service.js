import prisma from "../../config/prisma.js";

export function serializeListing(listing) {
  if (!listing) return null;
  return {
    ...listing,
    id: listing.id?.toString(),
    regionId: listing.regionId?.toString(),
    ownerUserId: listing.ownerUserId?.toString(),
    price: listing.price ? Number(listing.price) : null,
    sizeM2: listing.sizeM2 ? Number(listing.sizeM2) : null,
    images: (listing.images || []).map(img => ({
      ...img,
      id: img.id?.toString(),
      listingId: img.listingId?.toString(),
    })),
  };
}

export async function getListings({ page = 1, limit = 20, type, region, status = "ACTIVE", search } = {}) {
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

  const [listings, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      include: {
        region: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        owner: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.listing.count({ where }),
  ]);

  return { listings: listings.map(serializeListing), total, page: Number(page), limit: Number(limit) };
}

export async function getListingById(listingId) {
  const listing = await prisma.listing.findUnique({
    where: { id: BigInt(listingId) },
    include: {
      region: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" } },
      owner: { select: { fullName: true } },
    },
  });
  if (!listing) throw Object.assign(new Error("Listing not found"), { status: 404 });
  return serializeListing(listing);
}

export async function createListing(userId, data) {
  const { listingType, title, description, regionId, locationText, price, currency, sizeM2, bedrooms, bathrooms, zoningInfo } = data;

  const listing = await prisma.listing.create({
    data: {
      listingType: listingType || "PROPERTY",
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
      ownerUserId: BigInt(userId),
      status: "ACTIVE",
    },
    include: { region: { select: { name: true } }, images: true },
  });

  return serializeListing(listing);
}

export async function updateListing(listingId, userId, userRole, data) {
  const listing = await prisma.listing.findUnique({ where: { id: BigInt(listingId) } });
  if (!listing) throw Object.assign(new Error("Listing not found"), { status: 404 });

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole);
  if (!isAdmin && String(listing.ownerUserId) !== String(userId)) {
    throw Object.assign(new Error("Not authorized"), { status: 403 });
  }

  const { title, description, locationText, price, sizeM2, bedrooms, bathrooms, zoningInfo, status } = data;
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (locationText !== undefined) updateData.locationText = locationText;
  if (price !== undefined) updateData.price = Number(price);
  if (sizeM2 !== undefined) updateData.sizeM2 = Number(sizeM2);
  if (bedrooms !== undefined) updateData.bedrooms = Number(bedrooms);
  if (bathrooms !== undefined) updateData.bathrooms = Number(bathrooms);
  if (zoningInfo !== undefined) updateData.zoningInfo = zoningInfo;
  if (status !== undefined) updateData.status = status;

  const updated = await prisma.listing.update({
    where: { id: BigInt(listingId) },
    data: updateData,
    include: { region: { select: { name: true } }, images: true },
  });

  return serializeListing(updated);
}

export async function deleteListing(listingId, userId, userRole) {
  const listing = await prisma.listing.findUnique({ where: { id: BigInt(listingId) } });
  if (!listing) throw Object.assign(new Error("Listing not found"), { status: 404 });

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole);
  if (!isAdmin && String(listing.ownerUserId) !== String(userId)) {
    throw Object.assign(new Error("Not authorized"), { status: 403 });
  }

  await prisma.listing.delete({ where: { id: BigInt(listingId) } });
}

export async function getMyListings(userId) {
  const listings = await prisma.listing.findMany({
    where: { ownerUserId: BigInt(userId) },
    include: { region: { select: { name: true } }, images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return listings.map(serializeListing);
}

export async function submitLeadRequest(listingId, requesterId, data) {
  const { requestType, name, phone, email, message } = data;

  return prisma.leadRequest.create({
    data: {
      listingId: BigInt(listingId),
      requesterUserId: requesterId ? BigInt(requesterId) : null,
      requestType,
      name: name || null,
      phone: phone || null,
      email: email || null,
      message: message || null,
    },
  });
}
