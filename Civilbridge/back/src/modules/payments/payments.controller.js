import {
  getInvoice,
  getPaymentHistory,
  handleWebhook,
  initiatePayment,
  pollPaymentStatus,
  refundPayment,
  releaseMilestonePayment,
} from "./payments.service.js";
import { getPayoutSummary, listPayouts, settlePayout } from "./payments.payout.js";

function errorStatus(error) {
  const msg = (error.message || "").toLowerCase();
  if (msg.includes("not found") || msg.includes("no transaction") || msg.includes("no matching")) return 404;
  if (msg.includes("not allowed") || msg.includes("not authorized") || msg.includes("cannot ")) return 403;
  if (msg.includes("invalid webhook signature") || msg.includes("unauthorized")) return 401;
  return 400;
}

function toPlainTransaction(transaction) {
  return {
    ...transaction,
    id: transaction.id?.toString?.() || transaction.id,
    userId: transaction.userId?.toString?.() || transaction.userId,
  };
}

export async function initiatePaymentHandler(req, res) {
  try {
    const payload = await initiatePayment(req.body, req.user);
    res.status(201).json({
      success: true,
      transactionId: payload.transactionId,
      transaction: {
        id: payload.transactionId,
        ...payload,
      },
      payment: payload,
    });
  } catch (error) {
    res.status(errorStatus(error)).json({ success: false, message: error.message });
  }
}

export async function pollPaymentStatusHandler(req, res) {
  try {
    const transaction = await pollPaymentStatus(req.params.transactionId, req.user);
    res.json({ success: true, transaction: toPlainTransaction(transaction) });
  } catch (error) {
    res.status(errorStatus(error)).json({ success: false, message: error.message });
  }
}

export async function paymentHistoryHandler(req, res) {
  try {
    const history = await getPaymentHistory(req.query, req.user);
    res.json({ success: true, ...history });
  } catch (error) {
    res.status(errorStatus(error)).json({ success: false, message: error.message });
  }
}

export async function invoiceHandler(req, res) {
  try {
    const { transaction, pdfBuffer } = await getInvoice(req.params.transactionId, req.user);
    const filename = `${transaction.invoiceNumber || transaction.reference || "invoice"}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(errorStatus(error)).json({ success: false, message: error.message });
  }
}

async function webhookResponder(req, res, provider) {
  try {
    const result = await handleWebhook(provider, {
      headers: Object.fromEntries(
        Object.entries(req.headers || {}).map(([key, value]) => [key.toLowerCase(), value]),
      ),
      rawBody: req.rawBody,
      payload: req.body,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
}

export async function mtnWebhookHandler(req, res) {
  return webhookResponder(req, res, "MTN_MOMO");
}

export async function airtelWebhookHandler(req, res) {
  return webhookResponder(req, res, "AIRTEL_MONEY");
}

export async function stripeWebhookHandler(req, res) {
  return webhookResponder(req, res, "STRIPE");
}

export async function releaseMilestonePaymentHandler(req, res) {
  try {
    const transaction = await releaseMilestonePayment(
      req.params.transactionId,
      req.user,
      req.body,
    );
    res.json({ success: true, transaction: toPlainTransaction(transaction) });
  } catch (error) {
    res.status(errorStatus(error)).json({ success: false, message: error.message });
  }
}

export async function refundPaymentHandler(req, res) {
  try {
    const transaction = await refundPayment(
      req.params.transactionId,
      req.user,
      req.body?.reason,
    );
    res.json({ success: true, transaction: toPlainTransaction(transaction) });
  } catch (error) {
    res.status(errorStatus(error)).json({ success: false, message: error.message });
  }
}

export async function listPayoutsHandler(req, res) {
  try {
    const result = await listPayouts(req.query, req.user);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(errorStatus(error)).json({ success: false, message: error.message });
  }
}

export async function settlePayoutHandler(req, res) {
  try {
    const payout = await settlePayout(req.params.payoutId, req.user, req.body?.notes);
    res.json({ success: true, payout });
  } catch (error) {
    res.status(errorStatus(error)).json({ success: false, message: error.message });
  }
}

export async function payoutSummaryHandler(req, res) {
  try {
    const summary = await getPayoutSummary(req.user);
    res.json({ success: true, summary });
  } catch (error) {
    res.status(errorStatus(error)).json({ success: false, message: error.message });
  }
}
