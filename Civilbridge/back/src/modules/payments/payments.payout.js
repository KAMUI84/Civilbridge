import prisma from "../../config/prisma.js";

// ── Platform fee configuration ────────────────────────────────────────────────
// Set PLATFORM_FEE_PERCENT in your .env (e.g. 15 = 15%).
// Defaults to 15 if not configured.
export function getPlatformFeePercent() {
  const raw = process.env.PLATFORM_FEE_PERCENT;
  const parsed = raw !== undefined ? parseFloat(raw) : NaN;
  if (isNaN(parsed) || parsed < 0 || parsed > 100) return 15;
  return parsed;
}

// ── Commission calculation ────────────────────────────────────────────────────
export function calculateCommission(grossAmount, feePercent) {
  const gross = Number(grossAmount);
  const fee = Math.round((gross * feePercent) / 100 * 100) / 100;
  const net = Math.round((gross - fee) * 100) / 100;
  return { grossAmount: gross, platformFee: fee, netAmount: net, feePercent };
}

// ── Service types that trigger payouts to a recipient ────────────────────────
const PAYOUT_SERVICE_TYPES = new Set(["ENGINEER_ASSIGNMENT", "PROJECT_MILESTONE"]);

// ── Auto-create a payout when a payment is confirmed/released ────────────────
export async function maybeCreatePayout(transaction) {
  // Only for service types that involve paying a recipient
  if (!PAYOUT_SERVICE_TYPES.has(transaction.serviceType)) return null;

  // Must have a recipient specified
  if (!transaction.recipientId) return null;

  // Avoid duplicates
  const existing = await prisma.payout.findUnique({
    where: { transactionId: transaction.id },
  });
  if (existing) return existing;

  const feePercent = getPlatformFeePercent();
  const { grossAmount, platformFee, netAmount } = calculateCommission(transaction.amount, feePercent);

  const payout = await prisma.payout.create({
    data: {
      transactionId: transaction.id,
      recipientId: transaction.recipientId,
      grossAmount,
      platformFee,
      feePercent,
      netAmount,
      currency: transaction.currency || "RWF",
      status: "PENDING",
      notes: `Auto-created for ${transaction.serviceType} · ref ${transaction.reference}`,
    },
    include: { recipient: { select: { id: true, fullName: true, email: true, role: true } } },
  });

  // Notify recipient
  await prisma.notification.create({
    data: {
      userId: transaction.recipientId,
      type: "PAYMENT",
      title: "Payout pending",
      body: `A payout of ${transaction.currency} ${netAmount.toLocaleString()} is pending for ${transaction.serviceLabel || transaction.serviceType}. Platform fee (${feePercent}%) deducted from ${transaction.currency} ${grossAmount.toLocaleString()}.`,
      payloadJson: {
        payoutId: payout.id.toString(),
        transactionId: transaction.id.toString(),
        netAmount,
        currency: transaction.currency,
      },
    },
  }).catch(() => {}); // notification failure must not break the flow

  return payout;
}

// ── Mark a payout as settled (admin action) ───────────────────────────────────
export async function settlePayout(payoutId, actor, notes) {
  const SETTLE_ROLES = ["ADMIN", "SUPER_ADMIN", "FINANCE"];
  if (!SETTLE_ROLES.includes(actor?.role)) {
    throw new Error("You are not authorised to settle payouts");
  }

  const id = BigInt(payoutId);
  const payout = await prisma.payout.findUnique({
    where: { id },
    include: {
      recipient: { select: { id: true, fullName: true, email: true } },
      transaction: true,
    },
  });

  if (!payout) throw new Error("Payout not found");
  if (payout.status === "SETTLED") throw new Error("Payout is already settled");
  if (payout.status === "CANCELLED") throw new Error("Cannot settle a cancelled payout");

  const updated = await prisma.payout.update({
    where: { id },
    data: {
      status: "SETTLED",
      settledAt: new Date(),
      settledById: BigInt(actor.id),
      notes: notes || payout.notes,
    },
    include: { recipient: { select: { id: true, fullName: true, email: true, role: true } } },
  });

  // Notify recipient
  await prisma.notification.create({
    data: {
      userId: payout.recipientId,
      type: "PAYMENT",
      title: "Payout settled",
      body: `Your payout of ${payout.currency} ${Number(payout.netAmount).toLocaleString()} has been settled.`,
      payloadJson: {
        payoutId: payout.id.toString(),
        netAmount: Number(payout.netAmount),
        currency: payout.currency,
      },
    },
  }).catch(() => {});

  return serializePayout(updated);
}

// ── List payouts ───────────────────────────────────────────────────────────────
export async function listPayouts(query, actor) {
  const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "FINANCE"];
  const isAdmin = ADMIN_ROLES.includes(actor?.role);

  const page = Math.max(1, parseInt(query.page || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || "20", 10)));

  const where = {};

  // Non-admins only see their own payouts
  if (!isAdmin) {
    where.recipientId = BigInt(actor.id);
  } else if (query.recipientId) {
    where.recipientId = BigInt(query.recipientId);
  }

  if (query.status) where.status = query.status.toUpperCase();

  const [items, total] = await Promise.all([
    prisma.payout.findMany({
      where,
      include: {
        recipient: { select: { id: true, fullName: true, email: true, role: true } },
        transaction: { select: { id: true, reference: true, serviceType: true, serviceLabel: true, amount: true, currency: true } },
        settledBy: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payout.count({ where }),
  ]);

  return {
    items: items.map(serializePayout),
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ── Get payout summary for admins ─────────────────────────────────────────────
export async function getPayoutSummary(actor) {
  const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "FINANCE"];
  if (!ADMIN_ROLES.includes(actor?.role)) {
    throw new Error("You are not authorised to view payout summary");
  }

  const [pendingAgg, settledAgg, pendingCount, settledCount] = await Promise.all([
    prisma.payout.aggregate({ where: { status: "PENDING" }, _sum: { netAmount: true, platformFee: true, grossAmount: true } }),
    prisma.payout.aggregate({ where: { status: "SETTLED" }, _sum: { netAmount: true, platformFee: true, grossAmount: true } }),
    prisma.payout.count({ where: { status: "PENDING" } }),
    prisma.payout.count({ where: { status: "SETTLED" } }),
  ]);

  return {
    pending: {
      count: pendingCount,
      grossAmount: Number(pendingAgg._sum.grossAmount || 0),
      platformRevenue: Number(pendingAgg._sum.platformFee || 0),
      netPayable: Number(pendingAgg._sum.netAmount || 0),
    },
    settled: {
      count: settledCount,
      grossAmount: Number(settledAgg._sum.grossAmount || 0),
      platformRevenue: Number(settledAgg._sum.platformFee || 0),
      netPaid: Number(settledAgg._sum.netAmount || 0),
    },
  };
}

// ── Serialize BigInt fields for JSON ──────────────────────────────────────────
function serializePayout(p) {
  return {
    ...p,
    id: p.id?.toString(),
    transactionId: p.transactionId?.toString(),
    recipientId: p.recipientId?.toString(),
    settledById: p.settledById?.toString() ?? null,
    grossAmount: Number(p.grossAmount),
    platformFee: Number(p.platformFee),
    feePercent: Number(p.feePercent),
    netAmount: Number(p.netAmount),
    recipient: p.recipient ? { ...p.recipient, id: p.recipient.id?.toString() } : undefined,
    settledBy: p.settledBy ? { ...p.settledBy, id: p.settledBy.id?.toString() } : undefined,
    transaction: p.transaction ? { ...p.transaction, id: p.transaction.id?.toString() } : undefined,
  };
}
