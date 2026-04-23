import prisma from "../../config/prisma.js";

const PROVIDER_TYPES = new Set(["CONTRACTOR", "SUPPLIER", "ENGINEER", "ARCHITECT"]);

export function toProviderType(raw) {
  const up = String(raw || "").toUpperCase();
  return PROVIDER_TYPES.has(up) ? up : null;
}

export async function listExperts({ page = 1, limit = 20, type, regionId, search, verificationStatus } = {}) {
  const where = {};
  if (type) where.providerType = toProviderType(type);
  if (regionId) where.regionId = BigInt(regionId);
  if (verificationStatus) where.verificationStatus = verificationStatus;
  if (search) {
    where.OR = [
      { businessName: { contains: search } },
      { user: { fullName: { contains: search } } },
    ];
  }

  const [experts, total] = await prisma.$transaction([
    prisma.serviceProvider.findMany({
      where,
      include: {
        user: { select: { fullName: true, email: true, profile: { select: { avatarUrl: true, bio: true } } } },
        region: { select: { name: true } },
        reviews: { select: { rating: true }, take: 5 },
      },
      orderBy: { avgRating: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.serviceProvider.count({ where }),
  ]);

  return { experts: experts.map(serializeExpert), total, page: Number(page), limit: Number(limit) };
}

export async function getExpertById(expertId) {
  const expert = await prisma.serviceProvider.findUnique({
    where: { id: BigInt(expertId) },
    include: {
      user: { select: { fullName: true, email: true, profile: { select: { avatarUrl: true, bio: true, licenseNumber: true } } } },
      region: { select: { name: true } },
      reviews: {
        include: { reviewer: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
  if (!expert) throw Object.assign(new Error("Expert not found"), { status: 404 });
  return serializeExpert(expert);
}

export async function upsertExpertProfile(userId, data) {
  const { providerType, businessName, specialties, regionId } = data;
  const type = toProviderType(providerType);
  if (!type) throw Object.assign(new Error("Invalid provider type"), { status: 400 });
  if (!businessName?.trim()) throw Object.assign(new Error("businessName is required"), { status: 400 });

  const existing = await prisma.serviceProvider.findUnique({ where: { userId: BigInt(userId) } });

  if (existing) {
    return prisma.serviceProvider.update({
      where: { userId: BigInt(userId) },
      data: {
        providerType: type,
        businessName: businessName.trim(),
        specialtiesJson: Array.isArray(specialties) ? specialties : [],
        regionId: regionId ? BigInt(regionId) : existing.regionId,
      },
    });
  }

  return prisma.serviceProvider.create({
    data: {
      userId: BigInt(userId),
      providerType: type,
      businessName: businessName.trim(),
      specialtiesJson: Array.isArray(specialties) ? specialties : [],
      regionId: regionId ? BigInt(regionId) : null,
      verificationStatus: "PENDING",
    },
  });
}

export async function recalcExpertRating(providerId) {
  const agg = await prisma.providerReview.aggregate({
    where: { providerId },
    _avg: { rating: true },
  });
  await prisma.serviceProvider.update({
    where: { id: providerId },
    data: { avgRating: Number((agg._avg.rating || 0).toFixed(2)) },
  });
}

function serializeExpert(expert) {
  return {
    id: expert.id.toString(),
    userId: expert.userId.toString(),
    providerType: expert.providerType,
    businessName: expert.businessName,
    specialties: expert.specialtiesJson || [],
    regionId: expert.regionId?.toString() || null,
    region: expert.region?.name || null,
    verificationStatus: expert.verificationStatus,
    avgRating: Number(expert.avgRating),
    fullName: expert.user?.fullName || null,
    email: expert.user?.email || null,
    avatarUrl: expert.user?.profile?.avatarUrl || null,
    bio: expert.user?.profile?.bio || null,
    licenseNumber: expert.user?.profile?.licenseNumber || null,
    createdAt: expert.createdAt,
  };
}
