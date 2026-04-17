import prisma from "../../config/prisma.js";
import {
  DEFAULT_PAGE_SIZE,
  ESCROW_STATUSES,
  MAX_PAGE_SIZE,
  MILESTONE_APPROVER_ROLES,
  PAYMENT_ACCESS_STATUSES,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
  REFUND_ADMIN_ROLES,
  SERVICE_TYPES,
} from "./payments.constants.js";
import {
  buildClientPaymentResponse,
  deriveEscrowStatus,
  deriveFinalStatus,
  generateInvoiceNumber,
  generateTransactionReference,
  normalizeCurrency,
  normalizeProvider,
  normalizeServiceType,
  toDecimalAmount,
} from "./payments.helpers.js";
import { buildInvoicePdfBuffer } from "./payments.invoice.js";
import { sendPaymentReceiptEmail } from "./payments.mailer.js";
import { verifyHmacSignature, verifyStripeSignature } from "./payments.signature.js";
import {
  getAirtelPaymentStatus,
  initiateAirtelPayment,
  refundAirtelPayment,
} from "./providers/airtel.provider.js";
import {
  getMtnPaymentStatus,
  initiateMtnPayment,
  refundMtnPayment,
} from "./providers/mtn.provider.js";
import {
  getStripePaymentStatus,
  initiateStripePayment,
  refundStripePayment,
} from "./providers/stripe.provider.js";

const providerAdapters = {
  [PAYMENT_PROVIDERS.MTN_MOMO]: {
    initiate: initiateMtnPayment,
    status: getMtnPaymentStatus,
    refund: refundMtnPayment,
  },
  [PAYMENT_PROVIDERS.AIRTEL_MONEY]: {
    initiate: initiateAirtelPayment,
    status: getAirtelPaymentStatus,
    refund: refundAirtelPayment,
  },
  [PAYMENT_PROVIDERS.STRIPE]: {
    initiate: initiateStripePayment,
    status: getStripePaymentStatus,
    refund: refundStripePayment,
  },
};

function toBigIntId(value, fieldName = "id") {
  try {
    if (value === undefined || value === null || value === "") {
      throw new Error(`${fieldName} is required`);
    }
    return BigInt(value);
  } catch {
    throw new Error(`${fieldName} must be a valid numeric identifier`);
  }
}

function isPrivilegedActor(actor) {
  return ["ADMIN", "SUPER_ADMIN", "FINANCE"].includes(actor?.role);
}

function canApproveMilestone(actor) {
  return MILESTONE_APPROVER_ROLES.includes(actor?.role);
}

function canRefund(actor) {
  return REFUND_ADMIN_ROLES.includes(actor?.role);
}

function parseRawBody(rawBody) {
  if (!rawBody) return "";
  return Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : String(rawBody);
}

function resolveWebhookVerification(provider, { headers, rawBody }) {
  const payload = parseRawBody(rawBody);

  if (provider === PAYMENT_PROVIDERS.STRIPE) {
    return verifyStripeSignature({
      rawBody: payload,
      signatureHeader: headers["stripe-signature"],
      secret: process.env.STRIPE_WEBHOOK_SECRET,
    });
  }

  if (provider === PAYMENT_PROVIDERS.MTN_MOMO) {
    const headerName = (process.env.MTN_MOMO_WEBHOOK_SIGNATURE_HEADER || "x-signature").toLowerCase();
    return verifyHmacSignature({
      payload,
      signature: headers[headerName],
      secret: process.env.MTN_MOMO_WEBHOOK_SECRET,
    });
  }

  if (provider === PAYMENT_PROVIDERS.AIRTEL_MONEY) {
    const headerName = (process.env.AIRTEL_RW_WEBHOOK_SIGNATURE_HEADER || "x-signature").toLowerCase();
    return verifyHmacSignature({
      payload,
      signature: headers[headerName],
      secret: process.env.AIRTEL_RW_WEBHOOK_SECRET,
    });
  }

  return false;
}

function normalizeWebhookPayload(provider, payload) {
  if (provider === PAYMENT_PROVIDERS.STRIPE) {
    const object = payload?.data?.object || {};
    const transactionReference =
      object.metadata?.transactionReference ||
      object.metadata?.transaction_reference ||
      object.client_reference_id ||
      null;

    return {
      eventType: payload?.type || "stripe.event",
      transactionReference,
      providerTransactionId: object.id || null,
      providerStatus: object.status || null,
      externalEventId: payload?.id || object.id || null,
      raw: payload,
    };
  }

  if (provider === PAYMENT_PROVIDERS.MTN_MOMO) {
    return {
      eventType: payload?.eventType || "mtn.callback",
      transactionReference:
        payload?.externalId ||
        payload?.reference ||
        payload?.financialTransactionId ||
        null,
      providerTransactionId:
        payload?.financialTransactionId ||
        payload?.transactionId ||
        payload?.reference ||
        null,
      providerStatus: payload?.status || payload?.financialTransactionStatus || null,
      externalEventId: payload?.financialTransactionId || payload?.reference || null,
      raw: payload,
    };
  }

  return {
    eventType: payload?.event?.type || payload?.status?.message || "airtel.callback",
    transactionReference:
      payload?.reference ||
      payload?.data?.transaction?.id ||
      payload?.data?.transaction?.reference ||
      null,
    providerTransactionId:
      payload?.data?.transaction?.airtel_money_id ||
      payload?.data?.transaction?.id ||
      null,
    providerStatus:
      payload?.data?.transaction?.status ||
      payload?.status?.code ||
      payload?.status ||
      null,
    externalEventId:
      payload?.data?.transaction?.airtel_money_id ||
      payload?.data?.transaction?.id ||
      null,
    raw: payload,
  };
}

async function createNotification(userId, title, body, payloadJson = {}) {
  await prisma.notification.create({
    data: {
      userId,
      type: "PAYMENT",
      title,
      body,
      payloadJson,
    },
  });
}

async function getUserOrThrow(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  return user;
}

async function getTransactionForActor(transactionId, actor) {
  const id = toBigIntId(transactionId, "transactionId");
  const where = isPrivilegedActor(actor)
    ? { id }
    : { id, userId: toBigIntId(actor.id, "userId") };

  const transaction = await prisma.transaction.findFirst({
    where,
    include: { user: true },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  return transaction;
}

async function maybeIssueReceipt(transactionId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { user: true },
  });

  if (!transaction || transaction.receiptIssuedAt) return transaction;

  const pdfBuffer = buildInvoicePdfBuffer({
    transaction,
    user: transaction.user,
  });

  await sendPaymentReceiptEmail({
    user: transaction.user,
    transaction,
    pdfBuffer,
  }).catch((error) => {
    console.error("Failed to send payment receipt email:", error.message);
  });

  return prisma.transaction.update({
    where: { id: transactionId },
    data: { receiptIssuedAt: new Date() },
    include: { user: true },
  });
}

async function syncTransactionState(transaction, providerUpdate, source) {
  const nextStatus = deriveFinalStatus({
    provider: transaction.provider,
    providerStatus: providerUpdate.providerStatus,
    currentStatus: transaction.status,
    serviceType: transaction.serviceType,
  });
  const escrowStatus = deriveEscrowStatus({
    serviceType: transaction.serviceType,
    status: nextStatus,
  });

  const updateData = {
    providerStatus: providerUpdate.providerStatus || transaction.providerStatus,
    providerTransactionId:
      providerUpdate.providerTransactionId || transaction.providerTransactionId,
    webhookStatus: source,
    status: nextStatus,
    escrowStatus,
    metadata: {
      ...(transaction.metadata || {}),
      lastProviderSync: {
        at: new Date().toISOString(),
        source,
        providerStatus: providerUpdate.providerStatus || transaction.providerStatus,
      },
      lastProviderPayload: providerUpdate.raw || null,
    },
  };

  if (
    [PAYMENT_STATUSES.CONFIRMED, PAYMENT_STATUSES.ESCROW_HELD, PAYMENT_STATUSES.RELEASED].includes(nextStatus) &&
    !transaction.settledAt
  ) {
    updateData.settledAt = new Date();
  }

  if (nextStatus === PAYMENT_STATUSES.ESCROW_HELD && !transaction.heldAt) {
    updateData.heldAt = new Date();
  }

  if (nextStatus === PAYMENT_STATUSES.REFUNDED && !transaction.refundedAt) {
    updateData.refundedAt = new Date();
  }

  if (nextStatus === PAYMENT_STATUSES.FAILED) {
    updateData.failureReason =
      providerUpdate.raw?.reason ||
      providerUpdate.raw?.message ||
      transaction.failureReason ||
      "Provider reported payment failure";
  }

  const updated = await prisma.transaction.update({
    where: { id: transaction.id },
    data: updateData,
    include: { user: true },
  });

  if ([PAYMENT_STATUSES.CONFIRMED, PAYMENT_STATUSES.ESCROW_HELD].includes(updated.status)) {
    await maybeIssueReceipt(updated.id);
    await createNotification(
      updated.userId,
      "Payment confirmed",
      `Payment ${updated.reference} has been confirmed for ${updated.serviceLabel || updated.serviceType}.`,
      {
        transactionId: updated.id.toString(),
        serviceType: updated.serviceType,
        status: updated.status,
      },
    );
  }

  if (updated.status === PAYMENT_STATUSES.REFUNDED) {
    await createNotification(
      updated.userId,
      "Payment refunded",
      `Refund completed for payment ${updated.reference}.`,
      { transactionId: updated.id.toString(), status: updated.status },
    );
  }

  return updated;
}

function getProviderAdapter(provider) {
  const adapter = providerAdapters[provider];
  if (!adapter) {
    throw new Error(`Provider ${provider} is not configured`);
  }
  return adapter;
}

export async function initiatePayment(input, actor) {
  const provider = normalizeProvider(input.provider);
  const serviceType = normalizeServiceType(input.serviceType);
  const userId = input.userId ? toBigIntId(input.userId, "userId") : toBigIntId(actor.id, "userId");

  if (!isPrivilegedActor(actor) && userId !== toBigIntId(actor.id, "userId")) {
    throw new Error("You cannot initiate a payment for another user");
  }

  if (
    [PAYMENT_PROVIDERS.MTN_MOMO, PAYMENT_PROVIDERS.AIRTEL_MONEY].includes(provider) &&
    !input.phoneNumber
  ) {
    throw new Error("phoneNumber is required for mobile money payments");
  }

  const amount = toDecimalAmount(input.amount);
  const currency = normalizeCurrency(input.currency);
  const user = await getUserOrThrow(userId);
  const adapter = getProviderAdapter(provider);

  const created = await prisma.transaction.create({
    data: {
      userId,
      provider,
      reference: generateTransactionReference(provider),
      invoiceNumber: generateInvoiceNumber(),
      amount,
      currency,
      type: "payment",
      serviceType,
      serviceReference: input.serviceReference ? String(input.serviceReference) : null,
      serviceLabel: input.serviceLabel || null,
      description: input.description || null,
      phoneNumber: input.phoneNumber || user.phone || null,
      status: PAYMENT_STATUSES.INITIATED,
      metadata: {
        initiatedByUserId: actor.id,
        successUrl: input.successUrl || null,
        cancelUrl: input.cancelUrl || null,
        receiptEmail: input.receiptEmail || user.email || null,
      },
      milestoneStage: input.milestoneStage || null,
    },
  });

  const providerResult = await adapter.initiate(created, {
    ...input,
    receiptEmail: input.receiptEmail || user.email || null,
    serviceType,
  });

  const updated = await syncTransactionState(
    created,
    {
      providerStatus: providerResult.providerStatus || PAYMENT_STATUSES.PENDING,
      providerTransactionId: providerResult.providerTransactionId || null,
      raw: providerResult.raw || providerResult,
    },
    "initiate",
  );

  const finalTransaction = await prisma.transaction.update({
    where: { id: updated.id },
    data: {
      redirectUrl: providerResult.redirectUrl || null,
      ussdPrompt: providerResult.ussdPrompt || null,
    },
  });

  return buildClientPaymentResponse(finalTransaction, providerResult);
}

export async function pollPaymentStatus(transactionId, actor) {
  const transaction = await getTransactionForActor(transactionId, actor);
  const adapter = getProviderAdapter(transaction.provider);

  if (!adapter.status) {
    return transaction;
  }

  const providerUpdate = await adapter.status(transaction);
  return syncTransactionState(transaction, providerUpdate, "poll");
}

export async function getPaymentHistory(query, actor) {
  const page = Math.max(1, Number(query.page || 1));
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.pageSize || DEFAULT_PAGE_SIZE)));
  const where = {};

  if (isPrivilegedActor(actor) && query.userId) {
    where.userId = toBigIntId(query.userId, "userId");
  } else {
    where.userId = toBigIntId(actor.id, "userId");
  }

  if (query.status) where.status = String(query.status).toUpperCase();
  if (query.provider) where.provider = normalizeProvider(query.provider);
  if (query.serviceType) where.serviceType = normalizeServiceType(query.serviceType);

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        reference: true,
        invoiceNumber: true,
        amount: true,
        currency: true,
        provider: true,
        status: true,
        serviceType: true,
        serviceReference: true,
        serviceLabel: true,
        createdAt: true,
        settledAt: true,
        refundedAt: true,
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      ...item,
      id: item.id.toString(),
    })),
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getInvoice(transactionId, actor) {
  const transaction = await getTransactionForActor(transactionId, actor);
  const pdfBuffer = buildInvoicePdfBuffer({
    transaction,
    user: transaction.user,
  });

  if (!transaction.receiptIssuedAt) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { receiptIssuedAt: new Date() },
    });
  }

  return {
    transaction,
    pdfBuffer,
  };
}

export async function handleWebhook(providerInput, { headers, rawBody, payload }) {
  const provider = normalizeProvider(providerInput);
  const signatureValid = resolveWebhookVerification(provider, { headers, rawBody });
  const normalized = normalizeWebhookPayload(provider, payload);

  let transaction = null;
  if (normalized.transactionReference) {
    transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { reference: normalized.transactionReference },
          { providerTransactionId: normalized.transactionReference },
        ],
      },
      include: { user: true },
    });
  }

  if (!transaction && normalized.providerTransactionId) {
    transaction = await prisma.transaction.findFirst({
      where: { providerTransactionId: normalized.providerTransactionId },
      include: { user: true },
    });
  }

  const event = await prisma.paymentWebhookEvent.create({
    data: {
      transactionId: transaction?.id || null,
      provider,
      eventType: normalized.eventType,
      externalEventId: normalized.externalEventId,
      signatureValid,
      payload,
      receivedAt: new Date(),
    },
  });

  if (!signatureValid) {
    await prisma.paymentWebhookEvent.update({
      where: { id: event.id },
      data: {
        processedAt: new Date(),
        processingError: "Webhook signature verification failed",
      },
    });
    throw new Error("Invalid webhook signature");
  }

  if (!transaction) {
    await prisma.paymentWebhookEvent.update({
      where: { id: event.id },
      data: {
        processedAt: new Date(),
        processingError: "No matching transaction found",
      },
    });
    return { acknowledged: true, matched: false };
  }

  const updated = await syncTransactionState(
    transaction,
    {
      providerStatus: normalized.providerStatus,
      providerTransactionId: normalized.providerTransactionId,
      raw: normalized.raw,
    },
    "webhook",
  );

  await prisma.paymentWebhookEvent.update({
    where: { id: event.id },
    data: { processedAt: new Date() },
  });

  return {
    acknowledged: true,
    matched: true,
    transactionId: updated.id.toString(),
    status: updated.status,
  };
}

export async function releaseMilestonePayment(transactionId, actor, input = {}) {
  if (!canApproveMilestone(actor)) {
    throw new Error("You are not allowed to approve milestone releases");
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: toBigIntId(transactionId, "transactionId") },
    include: { user: true },
  });

  if (!transaction) throw new Error("Transaction not found");
  if (transaction.serviceType !== SERVICE_TYPES.PROJECT_MILESTONE) {
    throw new Error("Only project milestone payments can be released from escrow");
  }
  if (transaction.status !== PAYMENT_STATUSES.ESCROW_HELD) {
    throw new Error("This payment is not currently held in escrow");
  }
  if (input.milestoneStage && transaction.milestoneStage && input.milestoneStage !== transaction.milestoneStage) {
    throw new Error("Milestone stage does not match the escrowed transaction");
  }

  const updated = await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: PAYMENT_STATUSES.RELEASED,
      escrowStatus: ESCROW_STATUSES.RELEASED,
      releaseRequestedAt: transaction.releaseRequestedAt || new Date(),
      releasedAt: new Date(),
      milestoneApprovedAt: new Date(),
      providerStatus: "RELEASED",
      metadata: {
        ...(transaction.metadata || {}),
        milestoneApprovedBy: actor.id,
      },
    },
    include: { user: true },
  });

  await createNotification(
    updated.userId,
    "Escrow released",
    `Milestone payment ${updated.reference} has been released after approval.`,
    { transactionId: updated.id.toString(), status: updated.status },
  );

  return updated;
}

export async function refundPayment(transactionId, actor, reason) {
  if (!canRefund(actor)) {
    throw new Error("Only admin or finance users can initiate refunds");
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: toBigIntId(transactionId, "transactionId") },
    include: { user: true },
  });

  if (!transaction) throw new Error("Transaction not found");
  if (
    ![
      PAYMENT_STATUSES.CONFIRMED,
      PAYMENT_STATUSES.ESCROW_HELD,
      PAYMENT_STATUSES.RELEASED,
    ].includes(transaction.status)
  ) {
    throw new Error("Only confirmed or escrowed payments can be refunded");
  }

  const adapter = getProviderAdapter(transaction.provider);
  if (!adapter.refund) {
    throw new Error(`Refunds are not configured for ${transaction.provider}`);
  }

  const providerResult = await adapter.refund(transaction, reason);
  const nextStatus =
    String(providerResult.providerStatus).toLowerCase() === "succeeded" ||
    String(providerResult.providerStatus).toUpperCase() === "SUCCESSFUL" ||
    String(providerResult.providerStatus).toUpperCase() === "TS"
      ? PAYMENT_STATUSES.REFUNDED
      : PAYMENT_STATUSES.REFUND_PENDING;

  const updated = await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: nextStatus,
      escrowStatus: deriveEscrowStatus({
        serviceType: transaction.serviceType,
        status: nextStatus,
      }),
      refundReference: providerResult.refundReference || transaction.refundReference,
      refundReason: reason || null,
      refundRequestedAt: new Date(),
      refundedAt: nextStatus === PAYMENT_STATUSES.REFUNDED ? new Date() : null,
      providerStatus: providerResult.providerStatus || transaction.providerStatus,
      metadata: {
        ...(transaction.metadata || {}),
        lastRefundResponse: providerResult.raw || providerResult,
        refundedBy: actor.id,
      },
    },
    include: { user: true },
  });

  await createNotification(
    updated.userId,
    nextStatus === PAYMENT_STATUSES.REFUNDED ? "Refund complete" : "Refund requested",
    `A refund has been ${nextStatus === PAYMENT_STATUSES.REFUNDED ? "completed" : "requested"} for payment ${updated.reference}.`,
    { transactionId: updated.id.toString(), status: updated.status },
  );

  return updated;
}

export async function ensureConfirmedPayment({
  userId,
  serviceType,
  serviceReference,
}) {
  const transaction = await prisma.transaction.findFirst({
    where: {
      userId: toBigIntId(userId, "userId"),
      serviceType: normalizeServiceType(serviceType),
      serviceReference: String(serviceReference),
      status: { in: PAYMENT_ACCESS_STATUSES },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!transaction) {
    const error = new Error("Confirmed payment is required before accessing this service");
    error.status = 402;
    throw error;
  }

  return transaction;
}

export async function getPlanDownloadPayload(planId, actor) {
  const id = toBigIntId(planId, "planId");

  await ensureConfirmedPayment({
    userId: actor.id,
    serviceType: SERVICE_TYPES.PLAN_DOWNLOAD,
    serviceReference: id.toString(),
  });

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      creator: { select: { fullName: true, email: true } },
      assets: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  return plan;
}
