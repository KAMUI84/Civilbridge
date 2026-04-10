import { emailService } from "./email.service.js";

class LegacyEmailServiceAdapter {
  async sendEmail(to, templateName, variables = {}) {
    const { enqueueTemplateEmail } = await import("./email.queue.js");
    return enqueueTemplateEmail({ to, template: templateName, variables });
  }

  async sendWelcomeEmail(user) {
    return emailService.sendWelcomeEmail(user.email, user.fullName?.split(" ")[0]);
  }

  async sendProjectAssignmentEmail(professional, project) {
    return emailService.sendProjectAssignedEmail({
      to: professional.email,
      professionalName: professional.fullName,
      projectName: project.name || project.projectName,
      clientName: project.client || project.clientName || "CivilBridge Client",
      role: project.role || "PROJECT_MEMBER",
      projectUrl: `${process.env.APP_BASE_URL || process.env.FRONTEND_URL || "http://localhost:5175"}/projects/${project.id}`,
    });
  }

  async sendInvoiceReminderEmail(client, invoice) {
    return emailService.sendPaymentConfirmedEmail({
      to: client.email,
      recipientName: client.fullName,
      amount: invoice.amount,
      currency: invoice.currency || "RWF",
      provider: invoice.provider || "CivilBridge",
      reference: invoice.number || invoice.reference,
      serviceLabel: invoice.projectName || "Invoice reminder",
      invoiceUrl: `${process.env.APP_BASE_URL || process.env.FRONTEND_URL || "http://localhost:5175"}/payments/${invoice.id}`,
    });
  }

  async sendProjectCompletionEmail(client, project) {
    return emailService.sendDocumentReadyEmail({
      to: client.email,
      recipientName: client.fullName,
      projectName: project.name || project.projectName,
      documentName: "Final project package",
      documentUrl: `${process.env.APP_BASE_URL || process.env.FRONTEND_URL || "http://localhost:5175"}/projects/${project.id}`,
      documentType: "PROJECT_PACKAGE_PDF",
    });
  }

  async sendTestEmail(to) {
    return emailService.sendTestEmail(to);
  }

  getStatus() {
    return emailService.getStatus();
  }
}

const legacyEmailService = new LegacyEmailServiceAdapter();

export default legacyEmailService;
