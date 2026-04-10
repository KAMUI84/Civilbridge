import axios from "axios";

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getBaseUrl() {
  return (process.env.AIRTEL_RW_BASE_URL || "https://openapiuat.airtel.africa").replace(/\/$/, "");
}

function buildPath(path) {
  return `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

async function getAccessToken() {
  const clientId = getRequiredEnv("AIRTEL_RW_CLIENT_ID");
  const clientSecret = getRequiredEnv("AIRTEL_RW_CLIENT_SECRET");
  const authPath = process.env.AIRTEL_RW_AUTH_PATH || "/auth/oauth2/token";

  const response = await axios.post(
    buildPath(authPath),
    {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    },
  );

  return response.data.access_token || response.data.token;
}

function getCountry() {
  return process.env.AIRTEL_RW_COUNTRY || "RW";
}

function getCurrency() {
  return process.env.AIRTEL_RW_CURRENCY || "RWF";
}

export async function initiateAirtelPayment(transaction, input) {
  const accessToken = await getAccessToken();
  const collectPath = process.env.AIRTEL_RW_COLLECT_PATH || "/merchant/v1/payments/";

  const payload = {
    reference: transaction.reference,
    subscriber: {
      country: getCountry(),
      currency: getCurrency(),
      msisdn: input.phoneNumber,
    },
    transaction: {
      amount: String(transaction.amount),
      country: getCountry(),
      currency: transaction.currency,
      id: transaction.reference,
    },
  };

  if (process.env.AIRTEL_RW_CALLBACK_URL) {
    payload.callback_url = process.env.AIRTEL_RW_CALLBACK_URL;
  }

  const response = await axios.post(
    buildPath(collectPath),
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Country": getCountry(),
        "X-Currency": getCurrency(),
      },
      timeout: 30000,
    },
  );

  return {
    providerTransactionId: response.data?.data?.transaction?.airtel_money_id || response.data?.data?.transaction?.id || transaction.reference,
    providerStatus: response.data?.data?.transaction?.status || response.data?.status?.code || "PENDING",
    ussdPrompt: `Approve the Airtel Money prompt on ${input.phoneNumber}.`,
    message: response.data?.message || "Airtel Money payment request initiated",
    raw: response.data,
  };
}

export async function getAirtelPaymentStatus(transaction) {
  const accessToken = await getAccessToken();
  const template = process.env.AIRTEL_RW_STATUS_PATH || "/standard/v1/payments/{reference}";
  const statusPath = template.replace("{reference}", transaction.reference);

  const response = await axios.get(buildPath(statusPath), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Country": getCountry(),
      "X-Currency": getCurrency(),
    },
    timeout: 30000,
  });

  return {
    providerStatus:
      response.data?.data?.transaction?.status ||
      response.data?.status?.code ||
      response.data?.status ||
      "PENDING",
    providerTransactionId:
      response.data?.data?.transaction?.airtel_money_id ||
      response.data?.data?.transaction?.id ||
      transaction.providerTransactionId ||
      transaction.reference,
    raw: response.data,
  };
}

export async function refundAirtelPayment(transaction, reason) {
  const accessToken = await getAccessToken();
  const template =
    process.env.AIRTEL_RW_REFUND_PATH ||
    "/standard/v1/payments/{reference}/refund";
  const refundPath = template.replace(
    "{reference}",
    transaction.providerTransactionId || transaction.reference,
  );

  const payload = {
    reference: `${transaction.reference}-refund`,
    transaction: {
      amount: String(transaction.amount),
      country: getCountry(),
      currency: transaction.currency,
      id: `${transaction.reference}-refund`,
    },
    remarks: reason || "CivilBridge refund",
  };

  const response = await axios.post(buildPath(refundPath), payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Country": getCountry(),
      "X-Currency": getCurrency(),
    },
    timeout: 30000,
  });

  return {
    refundReference: payload.reference,
    providerStatus:
      response.data?.data?.transaction?.status ||
      response.data?.status?.code ||
      "PENDING",
    raw: response.data,
  };
}
