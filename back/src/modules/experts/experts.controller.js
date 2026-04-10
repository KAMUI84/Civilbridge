import prisma from "../../config/prisma.js";

function toBigInt(value, label = "id") {
  try {
    return BigInt(value);
  } catch {
    throw new Error(`${label} is invalid`);
  }
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseSpecialties(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  return [];
}

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return Object.values(value).filter(Boolean);
  return [];
}

function getUploadFileType(file) {
  const mimeType = String(file?.mimetype || "").toLowerCase();
  const filename = String(file?.originalname || "").toLowerCase();

  if (mimeType.startsWith("image/") || /\.(jpeg|jpg|png|gif|webp)$/i.test(filename)) {
    return "IMAGE";
  }

  if (mimeType === "application/pdf" || filename.endsWith(".pdf")) {
    return "PDF";
  }

  if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.endsWith(".doc") ||
    filename.endsWith(".docx")
  ) {
    return "DOC";
  }

  return "OTHER";
}

function buildVerificationDocument(upload) {
  if (!upload) return null;

  return {
    id: upload.id.toString(),
    url: upload.url,
    filename: upload.filename,
    mimeType: upload.mimeType || null,
    sizeBytes: upload.sizeBytes ? upload.sizeBytes.toString() : null,
    createdAt: upload.createdAt,
  };
}

async function saveVerificationDocument(userId, profileId, file) {
  if (!file?.filename || !profileId) {
    return null;
  }

  const upload = await prisma.upload.create({
    data: {
      uploadedById: userId,
      entityType: "PROFILE",
      entityId: profileId,
      fileType: getUploadFileType(file),
      mimeType: file.mimetype || null,
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      sizeBytes: Number.isFinite(file.size) ? BigInt(file.size) : null,
    },
  });

  return buildVerificationDocument(upload);
}

async function getLatestVerificationDocument(userId, profileId) {
  if (!profileId) {
    return null;
  }

  const upload = await prisma.upload.findFirst({
    where: {
      uploadedById: userId,
      entityType: "PROFILE",
      entityId: profileId,
      filename: { startsWith: "verificationDoc-" },
    },
    orderBy: { createdAt: "desc" },
  });

  return buildVerificationDocument(upload);
}

function mapReview(review) {
  return {
    id: review.id.toString(),
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    reviewer: review.reviewer
      ? {
          id: review.reviewer.id.toString(),
          fullName: review.reviewer.fullName,
          avatarUrl: review.reviewer.profile?.avatarUrl || null,
        }
      : null,
  };
}

function buildProviderSummary(provider) {
  const specialties = parseJsonArray(provider.specialtiesJson).map((item) => normalizeText(String(item))).filter(Boolean);
  const profile = provider.user?.profile;

  return {
    id: provider.id.toString(),
    userId: provider.userId.toString(),
    providerType: provider.providerType,
    businessName: provider.businessName,
    verificationStatus: provider.verificationStatus,
    verificationNotes: provider.verificationNotes || null,
    verifiedAt: provider.verifiedAt,
    rejectedAt: provider.rejectedAt,
    avgRating: Number(provider.avgRating || 0),
    reviewCount: provider._count?.reviews ?? provider.reviews?.length ?? 0,
    createdAt: provider.createdAt,
    region: provider.region
      ? { id: provider.region.id.toString(), name: provider.region.name }
      : null,
    user: provider.user
      ? {
          id: provider.user.id.toString(),
          fullName: provider.user.fullName,
          email: provider.user.email,
          phone: provider.user.phone,
          role: provider.user.role,
          verificationStatus: provider.user.verificationStatus,
          avatarUrl: profile?.avatarUrl || null,
          profession: profile?.profession || provider.providerType,
          bio: profile?.bio || null,
          companyName: profile?.companyName || null,
          licenseNumber: profile?.licenseNumber || null,
          signatureUrl: profile?.signatureUrl || null,
          createdAt: provider.user.createdAt,
        }
      : null,
    specialties,
    headline: specialties[0] || provider.providerType,
    experienceYears: null,
  };
}

async function getReviewEligibility(actor, provider) {
  if (!actor?.id) {
    return {
      eligible: false,
      reason: "Authentication required",
      completedProjectCount: 0,
      existingReviewId: null,
    };
  }

  const actorId = BigInt(actor.id);
  if (actorId === provider.userId) {
    return {
      eligible: false,
      reason: "You cannot review yourself",
      completedProjectCount: 0,
      existingReviewId: null,
    };
  }

  const [completedProjectCount, existingReview] = await Promise.all([
    prisma.project.count({
      where: {
        userId: actorId,
        status: "COMPLETED",
        members: {
          some: {
            userId: provider.userId,
          },
        },
      },
    }),
    prisma.providerReview.findFirst({
      where: {
        providerId: provider.id,
        reviewerUserId: actorId,
      },
      select: { id: true },
    }),
  ]);

  if (!completedProjectCount) {
    return {
      eligible: false,
      reason: "A completed project with this expert is required before leaving a review",
      completedProjectCount: 0,
      existingReviewId: existingReview?.id?.toString() || null,
    };
  }

  if (existingReview) {
    return {
      eligible: false,
      reason: "You have already reviewed this expert",
      completedProjectCount,
      existingReviewId: existingReview.id.toString(),
    };
  }

  return {
    eligible: true,
    reason: null,
    completedProjectCount,
    existingReviewId: null,
  };
}

async function refreshProviderRating(providerId) {
  const aggregate = await prisma.providerReview.aggregate({
    where: { providerId },
    _avg: { rating: true },
    _count: { id: true },
  });

  return prisma.serviceProvider.update({
    where: { id: providerId },
    data: {
      avgRating: Number(aggregate._avg.rating || 0),
    },
    select: { id: true },
  });
}

async function buildPortfolio(providerUserId) {
  const projects = await prisma.project.findMany({
    where: {
      members: { some: { userId: providerUserId } },
    },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: {
      region: { select: { name: true } },
      documents: {
        where: { reviewStatus: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 2,
        select: {
          id: true,
          originalName: true,
          fileUrl: true,
          docType: true,
          reviewStatus: true,
        },
      },
      progressLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { stage: true, progressPercent: true, createdAt: true },
      },
    },
  });

  return projects.map((project) => ({
    id: project.id.toString(),
    projectName: project.projectName,
    projectType: project.projectType,
    status: project.status,
    regionName: project.region?.name || null,
    progress: Number(project.progressLogs?.[0]?.progressPercent || 0),
    latestStage: project.progressLogs?.[0]?.stage || null,
    documents: project.documents.map((document) => ({
      id: document.id.toString(),
      name: document.originalName,
      fileUrl: document.fileUrl,
      docType: document.docType,
      reviewStatus: document.reviewStatus,
    })),
  }));
}

export async function getExperts(req, res) {
  try {
    const { role, region, search, verified, status, page = 1, limit = 20 } = req.query;
    const where = {};

    if (verified === "false") {
      where.verificationStatus = status || undefined;
    } else if (status) {
      where.verificationStatus = status;
    } else {
      where.verificationStatus = "VERIFIED";
    }

    if (role && role !== "all") {
      where.providerType = String(role).toUpperCase().replace(/\s+/g, "_");
    }

    if (region && region !== "all") {
      where.region = {
        name: { contains: String(region) },
      };
    }

    if (search) {
      where.OR = [
        { businessName: { contains: String(search) } },
        { user: { fullName: { contains: String(search) } } },
        { user: { profile: { profession: { contains: String(search) } } } },
      ];
    }

    const providers = await prisma.serviceProvider.findMany({
      where,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        region: { select: { id: true, name: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: [
        { verificationStatus: "asc" },
        { verifiedAt: "desc" },
        { avgRating: "desc" },
        { createdAt: "desc" },
      ],
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.serviceProvider.count({ where });

    res.json({
      success: true,
      experts: providers.map(buildProviderSummary),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch experts" });
  }
}

export async function getExpertById(req, res) {
  try {
    const providerId = toBigInt(req.params.id, "expertId");
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      include: {
        user: { include: { profile: true } },
        region: { select: { id: true, name: true } },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 12,
          include: {
            reviewer: {
              include: { profile: { select: { avatarUrl: true } } },
            },
          },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!provider) {
      return res.status(404).json({ message: "Expert not found" });
    }

    const [availability, portfolio, completedProjectsCount, reviewEligibility] = await Promise.all([
      prisma.calendarSlot.findMany({
        where: {
          providerUserId: provider.userId,
          status: "AVAILABLE",
          startsAt: { gte: new Date() },
        },
        orderBy: { startsAt: "asc" },
        take: 16,
      }),
      buildPortfolio(provider.userId),
      prisma.project.count({
        where: {
          members: { some: { userId: provider.userId } },
          status: "COMPLETED",
        },
      }),
      getReviewEligibility(req.user, provider),
    ]);

    res.json({
      success: true,
      expert: {
        ...buildProviderSummary(provider),
        completedProjectsCount,
        reviews: provider.reviews.map(mapReview),
        availability: availability.map((slot) => ({
          id: slot.id.toString(),
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          status: slot.status,
          notes: slot.notes,
        })),
        portfolio,
      },
      reviewEligibility,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch expert" });
  }
}

export async function getReviewEligibilityHandler(req, res) {
  try {
    const providerId = toBigInt(req.params.id, "expertId");
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { id: true, userId: true },
    });

    if (!provider) {
      return res.status(404).json({ message: "Expert not found" });
    }

    const eligibility = await getReviewEligibility(req.user, provider);
    res.json({ success: true, eligibility });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch review eligibility" });
  }
}

export async function applyAsExpert(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        profession: req.body?.profession || undefined,
        companyName: req.body?.companyName || undefined,
        bio: req.body?.bio || undefined,
        licenseNumber: req.body?.licenseNumber || undefined,
      },
      create: {
        userId,
        profession: req.body?.profession || null,
        companyName: req.body?.companyName || null,
        bio: req.body?.bio || null,
        licenseNumber: req.body?.licenseNumber || null,
      },
    });

    const verificationDocument = await saveVerificationDocument(userId, profile.id, req.file);

    const actor = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
    const expert = await prisma.serviceProvider.upsert({
      where: { userId },
      update: {
        providerType: req.body?.providerType || "ENGINEER",
        businessName: req.body?.businessName || actor?.fullName || "CivilBridge Expert",
        specialtiesJson: parseSpecialties(req.body?.specialties),
        verificationStatus: "PENDING",
        verificationNotes: null,
        rejectedAt: null,
      },
      create: {
        userId,
        providerType: req.body?.providerType || "ENGINEER",
        businessName: req.body?.businessName || actor?.fullName || "CivilBridge Expert",
        specialtiesJson: parseSpecialties(req.body?.specialties),
        regionId: req.body?.regionId ? toBigInt(req.body.regionId, "regionId") : null,
        verificationStatus: "PENDING",
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: "PENDING" },
    });

    res.status(201).json({
      success: true,
      profile,
      expert: buildProviderSummary({
        ...expert,
        user: { id: userId, fullName: actor?.fullName, profile },
        region: null,
        _count: { reviews: 0 },
      }),
      verificationDocument,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit expert application" });
  }
}

export async function updateExpertProfile(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const existing = await prisma.serviceProvider.findUnique({ where: { userId } });
    if (!existing) {
      return res.status(404).json({ message: "Expert profile not found" });
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        profession: req.body?.profession || undefined,
        companyName: req.body?.companyName || undefined,
        bio: req.body?.bio || undefined,
        avatarUrl: req.file?.filename ? `/uploads/${req.file.filename}` : undefined,
        licenseNumber: req.body?.licenseNumber || undefined,
      },
      create: {
        userId,
        profession: req.body?.profession || null,
        companyName: req.body?.companyName || null,
        bio: req.body?.bio || null,
        avatarUrl: req.file?.filename ? `/uploads/${req.file.filename}` : null,
        licenseNumber: req.body?.licenseNumber || null,
      },
    });
    const verificationDocument = await getLatestVerificationDocument(userId, profile.id);

    const expert = await prisma.serviceProvider.update({
      where: { userId },
      data: {
        providerType: req.body?.providerType || undefined,
        businessName: req.body?.businessName || undefined,
        specialtiesJson: req.body?.specialties ? parseSpecialties(req.body.specialties) : undefined,
        regionId: req.body?.regionId ? toBigInt(req.body.regionId, "regionId") : undefined,
      },
      include: {
        user: { include: { profile: true } },
        region: { select: { id: true, name: true } },
        _count: { select: { reviews: true } },
      },
    });

    res.json({
      success: true,
      message: "Expert profile updated",
      expert: buildProviderSummary(expert),
      profile,
      verificationDocument,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
}

export async function createReview(req, res) {
  try {
    const providerId = toBigInt(req.params.id, "expertId");
    const reviewerUserId = BigInt(req.user.id);
    const rating = Number(req.body?.rating);
    const comment = normalizeText(req.body?.comment);

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { id: true, userId: true },
    });
    if (!provider) {
      return res.status(404).json({ message: "Expert not found" });
    }

    const eligibility = await getReviewEligibility(req.user, provider);
    if (!eligibility.eligible) {
      return res.status(400).json({ message: eligibility.reason || "You are not eligible to review this expert" });
    }

    const review = await prisma.providerReview.create({
      data: {
        providerId,
        reviewerUserId,
        rating,
        comment: comment || null,
      },
      include: {
        reviewer: {
          include: { profile: { select: { avatarUrl: true } } },
        },
      },
    });

    await refreshProviderRating(providerId);

    res.status(201).json({ success: true, review: mapReview(review) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit review" });
  }
}

export async function updateReview(req, res) {
  try {
    const reviewId = toBigInt(req.params.reviewId, "reviewId");
    const reviewerUserId = BigInt(req.user.id);
    const rating = Number(req.body?.rating);
    const comment = normalizeText(req.body?.comment);

    const existing = await prisma.providerReview.findUnique({
      where: { id: reviewId },
      select: { id: true, reviewerUserId: true, providerId: true },
    });

    if (!existing || existing.reviewerUserId !== reviewerUserId) {
      return res.status(404).json({ message: "Review not found" });
    }

    const review = await prisma.providerReview.update({
      where: { id: reviewId },
      data: {
        rating: Number.isFinite(rating) ? rating : undefined,
        comment: comment || null,
      },
      include: {
        reviewer: {
          include: { profile: { select: { avatarUrl: true } } },
        },
      },
    });

    await refreshProviderRating(existing.providerId);

    res.json({ success: true, review: mapReview(review) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update review" });
  }
}

export async function deleteReview(req, res) {
  try {
    const reviewId = toBigInt(req.params.reviewId, "reviewId");
    const actorId = BigInt(req.user.id);

    const existing = await prisma.providerReview.findUnique({
      where: { id: reviewId },
      select: { id: true, reviewerUserId: true, providerId: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (existing.reviewerUserId !== actorId && !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await prisma.providerReview.delete({ where: { id: reviewId } });
    await refreshProviderRating(existing.providerId);

    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete review" });
  }
}
