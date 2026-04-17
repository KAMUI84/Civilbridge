import crypto from "crypto";
import { randomUUID } from "crypto";
import {
  ESCROW_STATUSES,
  PAYMENT_ACCESS_STATUSES,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
  PROVIDER_STATUS_MAP,
  SERVICE_TYPES,
} from "./payments.constants.js";

export function normalizeProvider(provider) {
  const normalized = String(provider || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (!PAYMENT_PROVIDERS[normalized]) {
    throw new Error(`Unsupported payment provider '${provider}'`);
  }

  return normalized;
}

export function normalizeServiceType(serviceType) {
  const normalized = String(serviceType || "OTHER")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (!SERVICE_TYPES[normalized]) {
    throw new Error(`Unsupported service type '${serviceType}'`);
  }

  return normalized;
}

export function generateTransactionReference(provider) {
  return `${provider}_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

export function generateInvoiceNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `INV-${stamp}-${suffix}`;
}

export function normalizeCurrency(currency) {
  return String(currency || "RWF").trim().toUpperCase();
}

export function toDecimalAmount(amount) {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Amount must be a positive number");
  }
  return parsed.toFixed(2);
}

export function toMinorUnits(amount, currency) {
  const normalizedCurrency = normalizeCurrency(currency).toLowerCase();
  const zeroDecimalCurrencies = new Set([
    "bif",
    "clp",
    "djf",
    "gnf",
    "jpy",
    "kmf",
    "krw",
    "mga",
    "pyg",
    "rwf",
    "ugx",
    "vnd",
    "vuv",
    "xaf",
    "xof",
    "xpf",
  ]);
  const factor = zeroDecimalCurrencies.has(normalizedCurrency) ? 1 : 100;
  return Math.round(Number(amount) * factor);
}

export function maskPhoneNumber(phoneNumber) {
  if (!phoneNumber) return null;
  const digits = String(phoneNumber);
  if (digits.length <= 4) return digits;
  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

export function resolvePaymentStatus(provider, providerStatus) {
  const key = providerStatus == null ? "" : String(providerStatus).trim();
  const providerMap = PROVIDER_STATUS_MAP[provider] || {};
  return providerMap[key] || providerMap[key.toUpperCase()] || PAYMENT_STATUSES.PENDING;
}

export function deriveFinalStatus({
  provider,
  providerStatus,
  currentStatus,
  serviceType,
}) {
  const mappedStatus = resolvePaymentStatus(provider, providerStatus);

  if (mappedStatus === PAYMENT_STATUSES.CONFIRMED && serviceType === SERVICE_TYPES.PROJECT_MILESTONE) {
    return PAYMENT_STATUSES.ESCROW_HELD;
  }

  if (currentStatus === PAYMENT_STATUSES.REFUND_PENDING && mappedStatus === PAYMENT_STATUSES.PENDING) {
    return PAYMENT_STATUSES.REFUND_PENDING;
  }

  return mappedStatus;
}

export function deriveEscrowStatus({ serviceType, status }) {
  if (serviceType !== SERVICE_TYPES.PROJECT_MILESTONE) {
    if (status === PAYMENT_STATUSES.REFUNDED) return ESCROW_STATUSES.REFUNDED;
    return ESCROW_STATUSES.NONE;
  }

  switch (status) {
    case PAYMENT_STATUSES.ESCROW_HELD:
      return ESCROW_STATUSES.HELD;
    case PAYMENT_STATUSES.RELEASE_PENDING:
      return ESCROW_STATUSES.RELEASE_PENDING;
    case PAYMENT_STATUSES.RELEASED:
      return ESCROW_STATUSES.RELEASED;
    case PAYMENT_STATUSES.REFUND_PENDING:
      return ESCROW_STATUSES.REFUND_PENDING;
    case PAYMENT_STATUSES.REFUNDED:
      return ESCROW_STATUSES.REFUNDED;
    default:
      return ESCROW_STATUSES.NONE;
  }
}

export function buildClientPaymentResponse(transaction, providerResult = {}) {
  return {
    transactionId: transaction.id.toString(),
    reference: transaction.reference,
    provider: transaction.provider,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    serviceType: transaction.serviceType,
    serviceReference: transaction.serviceReference,
    redirectUrl: providerResult.redirectUrl || transaction.redirectUrl || null,
    ussdPrompt: providerResult.ussdPrompt || transaction.ussdPrompt || null,
    clientSecret: providerResult.clientSecret || null,
    paymentIntentId: providerResult.paymentIntentId || null,
    providerTransactionId: providerResult.providerTransactionId || transaction.providerTransactionId || null,
    message: providerResult.message || null,
  };
}

export function assertConfirmedAccess(transaction) {
  return PAYMENT_ACCESS_STATUSES.includes(transaction.status);
}

export function safeJsonParse(input, fallback = {}) {
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
}
