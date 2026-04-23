import prisma from "../../config/prisma.js";

// ─── POST /api/reviews ────────────────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { provider_id, expert_id, rating, comment, title, project_id } = req.body;
    const reviewerUserId = BigInt(req.user.id);
    const providerId = BigInt(provider_id || expert_id);

    if (!providerId || !rating) {
      return res.status(400).json({ message: "provider_id and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { id: true, userId: true },
    });
    if (!provider) return res.status(404).json({ message: "Provider not found" });
    if (provider.userId === reviewerUserId) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    // Prevent duplicate review from same user
    const existing = await prisma.providerReview.findFirst({
      where: { providerId, reviewerUserId },
    });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this provider" });
    }

    const review = await prisma.providerReview.create({
      data: {
        providerId,
        reviewerUserId,
        rating: Number(rating),
        comment: [title, comment].filter(Boolean).join(" — ") || null,
      },
    });

    // Recalculate provider avg rating
    await recalcProviderRating(providerId);

    res.status(201).json({ success: true, id: review.id.toString(), message: "Review submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit review" });
  }
};

// ─── GET /api/reviews/expert/:id ──────────────────────────────────────────────
export const getExpertReviews = async (req, res) => {
  try {
    const reviews = await prisma.providerReview.findMany({
      where: { providerId: BigInt(req.params.id) },
      include: {
        reviewer: {
          select: {
            fullName: true,
            profile: { select: { avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = reviews.map(r => ({
      id: r.id.toString(),
      provider_id: r.providerId.toString(),
      reviewer_id: r.reviewerUserId.toString(),
      reviewer_name: r.reviewer.fullName,
      reviewer_avatar: r.reviewer.profile?.avatarUrl || null,
      rating: r.rating,
      comment: r.comment || null,
      created_at: r.createdAt,
    }));

    res.json({ success: true, reviews: serialized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// ─── DELETE /api/reviews/:id ──────────────────────────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const review = await prisma.providerReview.findUnique({
      where: { id: BigInt(req.params.id) },
    });
    if (!review) return res.status(404).json({ message: "Review not found" });

    const isOwner = review.reviewerUserId === BigInt(req.user.id);
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.providerReview.delete({ where: { id: BigInt(req.params.id) } });
    await recalcProviderRating(review.providerId);

    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete review" });
  }
};

async function recalcProviderRating(providerId) {
  const agg = await prisma.providerReview.aggregate({
    where: { providerId },
    _avg: { rating: true },
  });
  await prisma.serviceProvider.update({
    where: { id: providerId },
    data: { avgRating: Number((agg._avg.rating || 0).toFixed(2)) },
  });
}
