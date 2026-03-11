import prisma from "../../config/prisma.js";

// Public: get experts with filters
export async function getExperts(req, res) {
  try {
    const { role, region, search, verified, page = 1, limit = 20 } = req.query;
    const where = { user: { isActive: true } };
    if (verified !== "false") where.verifiedAt = { not: null };
    if (role) where.user.profession = role;
    if (region) where.OR = [{ region }, { user: { region } }];
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search } } },
        { headline: { contains: search } },
        { skills: { contains: search } },
        { company: { contains: search } },
      ];
    }

    const experts = await prisma.expertProfile.findMany({
      where,
      include: {
        user: { select: { fullName: true, email: true, profession: true, avatarUrl: true, region: true } },
      },
      orderBy: [
        { verifiedAt: { sort: 'desc', nulls: 'last' } },
        { ratingAvg: 'desc' },
        { ratingCount: 'desc' },
      ],
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.expertProfile.count({ where });

    res.json({ experts, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch experts" });
  }
}

// Public: get expert by id with reviews
export async function getExpertById(req, res) {
  try {
    const expert = await prisma.expertProfile.findUnique({
      where: { id: BigInt(req.params.id) },
      include: {
        user: { select: { fullName: true, email: true, profession: true, avatarUrl: true, region: true, createdAt: true } },
        reviews: {
          include: {
            reviewer: { select: { fullName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!expert) return res.status(404).json({ message: "Expert not found" });

    res.json(expert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch expert" });
  }
}

// Protected: apply as expert
export async function applyAsExpert(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const { headline, bio, experienceYears, skills, company, licenseId, region, specialization, websiteUrl, phone } = req.body;

    const existing = await prisma.expertProfile.findUnique({ where: { userId } });
    if (existing) {
      return res.status(400).json({ message: "You already have an expert profile" });
    }

    const expert = await prisma.expertProfile.create({
      data: {
        userId,
        headline,
        bio,
        experienceYears: experienceYears ? Number(experienceYears) : null,
        skills,
        company,
        licenseId,
        region,
        specialization,
        websiteUrl,
        phone,
        verificationDocUrl: req.file?.filename ? `/uploads/experts/${req.file.filename}` : null,
      },
    });

    // Update user verification status to PENDING
    await prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: "PENDING" },
    });

    res.status(201).json({ message: "Expert application submitted. Awaiting admin verification.", expert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit expert application" });
  }
}

// Protected: update expert profile
export async function updateExpertProfile(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const { headline, bio, experienceYears, skills, company, region, specialization, websiteUrl, phone } = req.body;

    await prisma.expertProfile.update({
      where: { userId },
      data: {
        headline,
        bio,
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
        skills,
        company,
        region,
        specialization,
        websiteUrl,
        phone,
        avatarUrl: req.file?.filename ? `/uploads/experts/${req.file.filename}` : undefined,
      },
    });

    res.json({ message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
}

// Protected: create review
export async function createReview(req, res) {
  try {
    const expertId = BigInt(req.params.id);
    const { rating, comment } = req.body;
    const reviewerId = BigInt(req.user.id);

    // Prevent self-review
    const expert = await prisma.expertProfile.findUnique({ where: { id: expertId }, select: { userId: true } });
    if (!expert || expert.userId === reviewerId) {
      return res.status(400).json({ message: "Cannot review yourself" });
    }

    const review = await prisma.review.create({
      data: {
        expertId,
        reviewerId,
        rating: Number(rating),
        comment,
      },
    });

    // Update expert rating stats
    const stats = await prisma.review.groupBy({
      by: ['rating'],
      where: { expertId },
      _count: { rating: true },
    });
    const totalReviews = stats.reduce((sum, s) => sum + s._count.rating, 0);
    const avgRating = stats.reduce((sum, s) => sum + s.rating * s._count.rating, 0) / totalReviews;

    await prisma.expertProfile.update({
      where: { id: expertId },
      data: {
        ratingAvg: avgRating,
        ratingCount: totalReviews,
      },
    });

    res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit review" });
  }
}

// Protected: update review
export async function updateReview(req, res) {
  try {
    const reviewId = BigInt(req.params.reviewId);
    const reviewerId = BigInt(req.user.id);

    const review = await prisma.review.findUnique({ where: { id: reviewId }, select: { reviewerId: true } });
    if (!review || review.reviewerId !== reviewerId) {
      return res.status(404).json({ message: "Review not found or not authorized" });
    }

    const { rating, comment } = req.body;
    await prisma.review.update({
      where: { id: reviewId },
      data: { rating: Number(rating), comment },
    });

    res.json({ message: "Review updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update review" });
  }
}

// Protected: delete review
export async function deleteReview(req, res) {
  try {
    const reviewId = BigInt(req.params.reviewId);
    const reviewerId = BigInt(req.user.id);

    const review = await prisma.review.findUnique({ where: { id: reviewId }, select: { reviewerId: true, expertId: true } });
    if (!review || review.reviewerId !== reviewerId) {
      return res.status(404).json({ message: "Review not found or not authorized" });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    // Update expert rating stats
    const stats = await prisma.review.groupBy({
      by: ['rating'],
      where: { expertId: review.expertId },
      _count: { rating: true },
    });
    const totalReviews = stats.reduce((sum, s) => sum + s._count.rating, 0);
    const avgRating = totalReviews > 0 ? stats.reduce((sum, s) => sum + s.rating * s._count.rating, 0) / totalReviews : null;

    await prisma.expertProfile.update({
      where: { id: review.expertId },
      data: {
        ratingAvg: avgRating,
        ratingCount: totalReviews,
      },
    });

    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete review" });
  }
}
