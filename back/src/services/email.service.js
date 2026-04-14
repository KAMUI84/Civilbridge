import {
  enqueueDocumentReadyEmail,
  enqueueEngineerApprovedEmail,
  enqueueEngineerRejectedEmail,
  enqueueLoginThanksEmail,
  enqueuePasswordResetEmail,
  enqueuePaymentConfirmedEmail,
  enqueueProjectAssignedEmail,
  enqueueRawEmail,
  enqueueTestEmail,
  enqueueVerificationEmail,
  enqueueWelcomeEmail,
  getEmailQueueStatus,
  initializeEmailInfrastructure,
} from "./email.queue.js";
import { startAppointmentReminderScheduler } from "./email.scheduler.js";

initializeEmailInfrastructure();
startAppointmentReminderScheduler();

class EmailService {
  async sendEmail(to, subject, html, text = null) {
    return enqueueRawEmail({ to, subject, html, text });
  }

  async sendVerificationEmail(email, otp, firstName = null) {
    return enqueueVerificationEmail(email, otp, firstName);
  }

  async sendWelcomeEmail(email, firstName = null) {
    return enqueueWelcomeEmail(email, firstName);
  }

  async sendLoginThanksEmail(email, firstName = null) {
    return enqueueLoginThanksEmail(email, firstName);
  }

  async sendPasswordResetEmail(email, resetToken, firstName = null) {
    return enqueuePasswordResetEmail(email, resetToken, firstName);
  }

  async sendProjectAssignedEmail({ to, professionalName, projectName, clientName, role, projectUrl }) {
    return enqueueProjectAssignedEmail({ to, professionalName, projectName, clientName, role, projectUrl });
  }

  async sendEngineerApprovedEmail({ to, recipientName, projectName, reviewerName, notes, documentUrl }) {
    return enqueueEngineerApprovedEmail({ to, recipientName, projectName, reviewerName, notes, documentUrl });
  }

  async sendEngineerRejectedEmail({ to, recipientName, projectName, reviewerName, notes, projectUrl }) {
    return enqueueEngineerRejectedEmail({ to, recipientName, projectName, reviewerName, notes, projectUrl });
  }

  async sendPaymentConfirmedEmail({ to, recipientName, amount, currency, provider, reference, serviceLabel, invoiceUrl, attachments }) {
    return enqueuePaymentConfirmedEmail({
      to,
      recipientName,
      amount,
      currency,
      provider,
      reference,
      serviceLabel,
      invoiceUrl,
      attachments,
    });
  }

  async sendDocumentReadyEmail({ to, recipientName, projectName, documentName, documentUrl, documentType }) {
    return enqueueDocumentReadyEmail({
      to,
      recipientName,
      projectName,
      documentName,
      documentUrl,
      documentType,
    });
  }

  async sendTestEmail(to) {
    if (!to) throw new Error("sendTestEmail requires an explicit recipient address");
    return enqueueTestEmail(to);
  }

  getStatus() {
    return getEmailQueueStatus();
  }
}

export const emailService = new EmailService();
