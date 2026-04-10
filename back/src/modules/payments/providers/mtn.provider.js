import axios from "axios";
import { Buffer } from "buffer";

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getBaseUrl() {
  return (process.env.MTN_MOMO_BASE_URL || "https://sandbox.momodeveloper.mtn.com").replace(/\/$/, "");
}

function getCollectionPath() {
  return (process.env.MTN_MOMO_COLLECTION_PATH || "/collection/v1_0").replace(/\/$/, "");
}

async function getAccessToken() {
  const apiUser = getRequiredEnv("MTN_MOMO_API_USER");
  const apiKey = getRequiredEnv("MTN_MOMO_API_KEY");
  const subscriptionKey = getRequiredEnv("MTN_MOMO_SUBSCRIPTION_KEY");
  const credentials = Buffer.from(`${apiUser}:${apiKey}`).toString("base64");

  const response = await axios.post(
    `${getBaseUrl()}/collection/token/`,
    null,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
      timeout: 30000,
    },
  );

  return response.data.access_token;
}

function getAuthHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Ocp-Apim-Subscription-Key": getRequiredEnv("MTN_MOMO_SUBSCRIPTION_KEY"),
    "X-Target-Environment": process.env.MTN_MOMO_TARGET_ENVIRONMENT || "sandbox",
  };
}

export async function initiateMtnPayment(transaction, input) {
  const accessToken = await getAccessToken();
  const callbackUrl = process.env.MTN_MOMO_CALLBACK_URL;

  const payload = {
    amount: String(transaction.amount),
    currency: transaction.currency,
    externalId: transaction.reference,
    payer: {
      partyIdType: process.env.MTN_MOMO_PARTY_ID_TYPE || "MSISDN",
      partyId: input.phoneNumber,
    },
    payerMessage: input.description || process.env.MTN_MOMO_PAYER_MESSAGE || "CivilBridge payment",
    payeeNote: input.serviceLabel || input.serviceType || "CivilBridge service",
  };

  if (callbackUrl) {
    payload.callbackUrl = callbackUrl;
  }

  await axios.post(
    `${getBaseUrl()}${getCollectionPath()}/requesttopay`,
    payload,
    {
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
        "X-Reference-Id": transaction.reference,
      },
      timeout: 30000,
    },
  );

  return {
    providerTransactionId: transaction.reference,
    providerStatus: "PENDING",
    ussdPrompt: `Approve the MTN MoMo prompt on ${input.phoneNumber}.`,
    message: "MTN MoMo payment request initiated",
  };
}

export async function getMtnPaymentStatus(transaction) {
  const accessToken = await getAccessToken();
  const response = await axios.get(
    `${getBaseUrl()}${getCollectionPath()}/requesttopay/${transaction.reference}`,
    {
      headers: getAuthHeaders(accessToken),
      timeout: 30000,
    },
  );

  return {
    providerStatus: response.data.status || response.data.financialTransactionStatus || "PENDING",
    providerTransactionId: response.data.financialTransactionId || response.data.externalId || transaction.reference,
    raw: response.data,
  };
}

export async function refundMtnPayment(transaction, reason) {
  const accessToken = await getAccessToken();
  const refundPath = process.env.MTN_MOMO_REFUND_PATH || `${getCollectionPath()}/refund`;
  const refundReference = `${transaction.reference}-refund`;

  const payload = {
    amount: String(transaction.amount),
    currency: transaction.currency,
    externalId: refundReference,
    originatingTransactionId: transaction.providerTransactionId || transaction.reference,
    payerMessage: reason || "CivilBridge refund",
    payeeNote: reason || "Refund processed",
  };

  await axios.post(
    `${getBaseUrl()}${refundPath.startsWith("/") ? refundPath : `/${refundPath}`}`,
    payload,
    {
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
        "X-Reference-Id": refundReference,
      },
      timeout: 30000,
    },
  );

  return {
    refundReference,
    providerStatus: "PENDING",
    raw: payload,
  };
}
