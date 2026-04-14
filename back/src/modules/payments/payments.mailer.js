import { emailService } from "../../services/email.service.js";

export async function sendPaymentReceiptEmail({ user, transaction, pdfBuffer }) {
  if (!user?.email) return { skipped: true, reason: "User has no email address" };

  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
  const invoiceUrl = `${frontendUrl}/payments/${transaction.id}/invoice`;

  const queued = await emailService.sendPaymentConfirmedEmail({
    to: user.email,
    recipientName: user.fullName || "there",
    amount: transaction.amount,
    currency: transaction.currency,
    provider: transaction.provider,
    reference: transaction.reference,
    serviceLabel: transaction.serviceLabel || transaction.serviceType,
    invoiceUrl,
    attachments: [
      {
        filename: `${transaction.invoiceNumber || transaction.reference || "invoice"}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return { skipped: false, queued: true, ...queued };
}
