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

function getFrontendUrl() {
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
}

export async function initiateStripePayment(transaction, input) {
  const client = getStripeClient();
  const params = new URLSearchParams();
  const baseUrl = getFrontendUrl();

  params.set("mode", "payment");
  params.set("line_items[0][price_data][currency]", transaction.currency.toLowerCase());
  params.set("line_items[0][price_data][product_data][name]", transaction.serviceLabel || transaction.description || "CivilBridge Payment");
  params.set("line_items[0][price_data][unit_amount]", String(toMinorUnits(transaction.amount, transaction.currency)));
  params.set("line_items[0][quantity]", "1");
  params.set("client_reference_id", transaction.reference);
  params.set("metadata[transactionReference]", transaction.reference);
  params.set("metadata[userId]", transaction.userId.toString());
  params.set("metadata[serviceType]", transaction.serviceType);
  if (transaction.serviceReference) {
    params.set("metadata[serviceReference]", transaction.serviceReference);
  }
  params.set("success_url", input.successUrl || `${baseUrl}/dashboard/payments?stripe_status=success&ref=${transaction.reference}`);
  params.set("cancel_url", input.cancelUrl || `${baseUrl}/dashboard/payments?stripe_status=cancelled&ref=${transaction.reference}`);

  if (input.receiptEmail) {
    params.set("customer_email", input.receiptEmail);
  }

  const response = await client.post("/checkout/sessions", params.toString());
  const session = response.data;

  return {
    providerTransactionId: session.id,
    providerStatus: session.payment_status || "unpaid",
    clientSecret: null,
    redirectUrl: session.url,
    paymentIntentId: session.payment_intent || null,
    raw: session,
  };
}

export async function getStripePaymentStatus(transaction) {
  const client = getStripeClient();
  const id = transaction.providerTransactionId;
  if (!id) throw new Error("Stripe transaction is missing a provider transaction id");

  if (id.startsWith("cs_")) {
    const response = await client.get(`/checkout/sessions/${id}`);
    const session = response.data;
    return {
      providerStatus: session.payment_status === "paid" ? "paid" : (session.payment_status || "unpaid"),
      providerTransactionId: session.id,
      raw: session,
    };
  }

  // Fallback for legacy PaymentIntent IDs
  const response = await client.get(`/payment_intents/${id}`);
  return {
    providerStatus: response.data.status,
    providerTransactionId: response.data.id,
    raw: response.data,
  };
}

export async function refundStripePayment(transaction, reason) {
  const client = getStripeClient();
  const id = transaction.providerTransactionId;

  let paymentIntentId = id;
  if (id?.startsWith("cs_")) {
    const sessionResponse = await client.get(`/checkout/sessions/${id}`);
    paymentIntentId = sessionResponse.data.payment_intent;
    if (!paymentIntentId) {
      throw new Error("Cannot refund: Stripe Checkout Session has no associated payment intent yet");
    }
  }

  const params = new URLSearchParams();
  params.set("payment_intent", paymentIntentId);
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
