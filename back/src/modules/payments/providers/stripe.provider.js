import axios from "axios";
import { URLSearchParams } from "url";
import { toMinorUnits } from "../payments.helpers.js";

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getStripeClient() {
  const secretKey = getRequiredEnv("STRIPE_SECRET_KEY");
  return axios.create({
    baseURL: process.env.STRIPE_API_BASE_URL || "https://api.stripe.com/v1",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    timeout: 30000,
  });
}

export async function initiateStripePayment(transaction, input) {
  const client = getStripeClient();
  const params = new URLSearchParams();

  params.set("amount", String(toMinorUnits(transaction.amount, transaction.currency)));
  params.set("currency", transaction.currency.toLowerCase());
  params.set("metadata[transactionReference]", transaction.reference);
  params.set("metadata[userId]", transaction.userId.toString());
  params.set("metadata[serviceType]", transaction.serviceType);
  if (transaction.serviceReference) {
    params.set("metadata[serviceReference]", transaction.serviceReference);
  }
  params.set("description", transaction.description || transaction.serviceLabel || "CivilBridge payment");
  params.set("automatic_payment_methods[enabled]", "true");

  if (input.receiptEmail) {
    params.set("receipt_email", input.receiptEmail);
  }

  const response = await client.post("/payment_intents", params.toString());
  const paymentIntent = response.data;

  return {
    providerTransactionId: paymentIntent.id,
    providerStatus: paymentIntent.status,
    clientSecret: paymentIntent.client_secret,
    redirectUrl: paymentIntent.next_action?.redirect_to_url?.url || null,
    paymentIntentId: paymentIntent.id,
    raw: paymentIntent,
  };
}

export async function getStripePaymentStatus(transaction) {
  const client = getStripeClient();
  const paymentIntentId = transaction.providerTransactionId;
  if (!paymentIntentId) {
    throw new Error("Stripe transaction is missing a provider transaction id");
  }

  const response = await client.get(`/payment_intents/${paymentIntentId}`);
  return {
    providerStatus: response.data.status,
    providerTransactionId: response.data.id,
    raw: response.data,
  };
}

export async function refundStripePayment(transaction, reason) {
  const client = getStripeClient();
  const params = new URLSearchParams();
  params.set("payment_intent", transaction.providerTransactionId);
  if (reason) {
    params.set("metadata[refund_reason]", reason);
  }

  const response = await client.post("/refunds", params.toString());

  return {
    refundReference: response.data.id,
    providerStatus: response.data.status || "pending",
    raw: response.data,
  };
}
