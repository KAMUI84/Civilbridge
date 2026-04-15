function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildActionButton(label, url, tone = "#0f766e") {
  if (!url) return "";

  return `
    <p style="margin: 28px 0;">
      <a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 22px;background:${tone};color:#ffffff;text-decoration:none;border-radius:999px;font-weight:600;">
        ${escapeHtml(label)}
      </a>
    </p>
  `;
}

function buildEmailShell({ eyebrow, title, intro, bodyHtml, footer, accent = "#0f766e" }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;background:#f5f7fb;font-family:Georgia, 'Times New Roman', serif;color:#183153;">
        <div style="max-width:680px;margin:0 auto;padding:32px 18px;">
          <div style="background:linear-gradient(135deg, ${accent}, #11253f);padding:28px 32px;border-radius:24px 24px 0 0;color:#fff;">
            <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.82;margin-bottom:10px;">${escapeHtml(eyebrow)}</div>
            <h1 style="margin:0;font-size:30px;line-height:1.1;">${escapeHtml(title)}</h1>
            <p style="margin:12px 0 0;font-size:15px;line-height:1.6;opacity:0.92;">${escapeHtml(intro)}</p>
          </div>
          <div style="background:#ffffff;padding:32px;border-radius:0 0 24px 24px;box-shadow:0 20px 50px rgba(15, 23, 42, 0.08);font-size:15px;line-height:1.7;">
            ${bodyHtml}
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
            <p style="margin:0;color:#5b6b82;font-size:13px;">${escapeHtml(footer)}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function buildKeyValueList(items) {
  const rows = items
    .filter((item) => item?.value !== undefined && item?.value !== null && item?.value !== "")
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#5b6b82;vertical-align:top;">${escapeHtml(item.label)}</td>
          <td style="padding:8px 0 8px 16px;font-weight:600;vertical-align:top;">${escapeHtml(item.value)}</td>
        </tr>
      `
    )
    .join("");

  if (!rows) return "";

  return `<table style="width:100%;border-collapse:collapse;margin:18px 0;">${rows}</table>`;
}

function baseText(lines) {
  return lines.filter(Boolean).join("\n");
}

function resolveAppUrl(pathname = "") {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  return `${baseUrl.replace(/\/$/, "")}${pathname}`;
}

const registry = {
  verification: ({ otp, firstName }) => {
    const name = firstName || "there";
    return {
      subject: "Verify your CivilBridge account",
      html: buildEmailShell({
        eyebrow: "Account Security",
        title: "Confirm your email",
        intro: `Hello ${name}, use the code below to verify your CivilBridge account.`,
        accent: "#0f766e",
        bodyHtml: `
          <p>Your one-time verification code is:</p>
          <div style="font-size:32px;letter-spacing:0.24em;font-weight:700;padding:18px 22px;border-radius:18px;background:#ecfeff;color:#115e59;text-align:center;">
            ${escapeHtml(otp)}
          </div>
          <p style="margin-top:18px;">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
        `,
        footer: "CivilBridge authentication service",
      }),
      text: baseText([
        `Hello ${name},`,
        `Your CivilBridge verification code is: ${otp}`,
        "This code expires in 10 minutes.",
      ]),
    };
  },
  welcome: ({ firstName }) => {
    const name = firstName || "there";
    return {
      subject: `Welcome to CivilBridge, ${name}`,
      html: buildEmailShell({
        eyebrow: "Welcome",
        title: "Your account is ready",
        intro: `Welcome ${name}. CivilBridge is ready to help you move from idea to buildable project.`,
        accent: "#1d4ed8",
        bodyHtml: `
          <p>You can now start creating projects, reviewing plans, and working with experts on the platform.</p>
          <ul>
            <li>Create and organize construction projects</li>
            <li>Generate AI-backed planning documents</li>
            <li>Collaborate with engineers and suppliers</li>
          </ul>
          ${buildActionButton("Open Dashboard", resolveAppUrl("/dashboard"), "#1d4ed8")}
        `,
        footer: "CivilBridge platform onboarding",
      }),
      text: baseText([
        `Welcome ${name},`,
        "Your CivilBridge account is ready.",
        `Open your dashboard: ${resolveAppUrl("/dashboard")}`,
      ]),
    };
  },
  loginThanks: ({ firstName }) => {
    const name = firstName || "there";
    return {
      subject: "Welcome back to CivilBridge",
      html: buildEmailShell({
        eyebrow: "Login Alert",
        title: "You just signed in",
        intro: `Good to see you again, ${name}.`,
        accent: "#2563eb",
        bodyHtml: `
          <p>Your account was just used to sign in to CivilBridge.</p>
          <p>If this was you, no action is needed. If it was not, reset your password right away.</p>
          ${buildActionButton("Go to Dashboard", resolveAppUrl("/dashboard"), "#2563eb")}
        `,
        footer: "CivilBridge account activity",
      }),
      text: baseText([
        `Hello ${name},`,
        "You just signed in to CivilBridge.",
        "If this was not you, reset your password immediately.",
      ]),
    };
  },
  passwordReset: ({ resetUrl, firstName }) => {
    const name = firstName || "there";
    return {
      subject: "Reset your CivilBridge password",
      html: buildEmailShell({
        eyebrow: "Account Recovery",
        title: "Reset your password",
        intro: `Hello ${name}, use the secure link below to reset your CivilBridge password.`,
        accent: "#c2410c",
        bodyHtml: `
          <p>We received a request to reset your password.</p>
          ${buildActionButton("Reset Password", resetUrl, "#c2410c")}
          <p>This link expires soon. If you did not request a reset, you can ignore this email.</p>
          <p style="word-break:break-all;color:#7c2d12;">${escapeHtml(resetUrl)}</p>
        `,
        footer: "CivilBridge account recovery",
      }),
      text: baseText([
        `Hello ${name},`,
        "Reset your CivilBridge password using this link:",
        resetUrl,
      ]),
    };
  },
  projectAssigned: ({
    professionalName,
    projectName,
    clientName,
    role,
    projectUrl,
  }) => ({
    subject: `New project assignment: ${projectName}`,
    html: buildEmailShell({
      eyebrow: "Project Assignment",
      title: "A project has been assigned to you",
      intro: `${professionalName}, you have been assigned to ${projectName}.`,
      accent: "#166534",
      bodyHtml: `
        <p>You have been added to a CivilBridge project and can start reviewing the details right away.</p>
        ${buildKeyValueList([
          { label: "Project", value: projectName },
          { label: "Client", value: clientName },
          { label: "Assigned Role", value: role },
        ])}
        ${buildActionButton("Open Project", projectUrl, "#166534")}
      `,
      footer: "CivilBridge project assignment workflow",
    }),
    text: baseText([
      `${professionalName},`,
      `You have been assigned to project: ${projectName}`,
      `Client: ${clientName}`,
      `Role: ${role}`,
      projectUrl,
    ]),
  }),
  engineerApproved: ({
    recipientName,
    projectName,
    reviewerName,
    notes,
    documentUrl,
  }) => ({
    subject: `Approved by engineer: ${projectName}`,
    html: buildEmailShell({
      eyebrow: "Document Review",
      title: "Your document was approved",
      intro: `${recipientName}, an engineer has approved the latest document for ${projectName}.`,
      accent: "#047857",
      bodyHtml: `
        ${buildKeyValueList([
          { label: "Project", value: projectName },
          { label: "Reviewed By", value: reviewerName },
          { label: "Notes", value: notes || "Approved without additional notes" },
        ])}
        ${buildActionButton("Open Approved Document", documentUrl, "#047857")}
      `,
      footer: "CivilBridge engineering review workflow",
    }),
    text: baseText([
      `${recipientName}, your document for ${projectName} was approved by ${reviewerName}.`,
      notes ? `Notes: ${notes}` : null,
      documentUrl,
    ]),
  }),
  engineerRejected: ({
    recipientName,
    projectName,
    reviewerName,
    notes,
    projectUrl,
  }) => ({
    subject: `Engineer review requires changes: ${projectName}`,
    html: buildEmailShell({
      eyebrow: "Document Review",
      title: "Changes are required",
      intro: `${recipientName}, the latest document for ${projectName} was reviewed and needs revision.`,
      accent: "#b91c1c",
      bodyHtml: `
        ${buildKeyValueList([
          { label: "Project", value: projectName },
          { label: "Reviewed By", value: reviewerName },
          { label: "Review Notes", value: notes || "Please review with the assigned engineer." },
        ])}
        ${buildActionButton("Review Project", projectUrl, "#b91c1c")}
      `,
      footer: "CivilBridge engineering review workflow",
    }),
    text: baseText([
      `${recipientName}, the document for ${projectName} needs changes.`,
      `Reviewed by: ${reviewerName}`,
      notes ? `Notes: ${notes}` : null,
      projectUrl,
    ]),
  }),
  paymentConfirmed: ({
    recipientName,
    amount,
    currency,
    provider,
    reference,
    serviceLabel,
    invoiceUrl,
  }) => ({
    subject: "Payment confirmed",
    html: buildEmailShell({
      eyebrow: "Payment",
      title: "Your payment was confirmed",
      intro: `${recipientName}, your CivilBridge payment has been received successfully.`,
      accent: "#7c3aed",
      bodyHtml: `
        ${buildKeyValueList([
          { label: "Amount", value: `${amount} ${currency}` },
          { label: "Provider", value: provider },
          { label: "Reference", value: reference },
          { label: "Service", value: serviceLabel },
        ])}
        <p>Your receipt and invoice are ready.</p>
        ${buildActionButton("Open Invoice", invoiceUrl, "#7c3aed")}
      `,
      footer: "CivilBridge payment system",
    }),
    text: baseText([
      `${recipientName}, your payment has been confirmed.`,
      `Amount: ${amount} ${currency}`,
      `Provider: ${provider}`,
      `Reference: ${reference}`,
      invoiceUrl,
    ]),
  }),
  appointmentReminder: ({
    recipientName,
    counterpartName,
    projectName,
    startsAt,
    reminderWindow,
    meetingUrl,
    notes,
  }) => ({
    subject: `Appointment reminder: ${reminderWindow} to go`,
    html: buildEmailShell({
      eyebrow: "Appointment Reminder",
      title: "Your appointment is coming up",
      intro: `${recipientName}, this is a reminder that your CivilBridge appointment starts in ${reminderWindow}.`,
      accent: "#9333ea",
      bodyHtml: `
        ${buildKeyValueList([
          { label: "Time", value: startsAt },
          { label: "With", value: counterpartName },
          { label: "Project", value: projectName || "General consultation" },
          { label: "Notes", value: notes || "No notes added." },
        ])}
        ${buildActionButton("Open Appointment", meetingUrl, "#9333ea")}
      `,
      footer: "CivilBridge appointments",
    }),
    text: baseText([
      `${recipientName}, your CivilBridge appointment starts in ${reminderWindow}.`,
      `Time: ${startsAt}`,
      `With: ${counterpartName}`,
      projectName ? `Project: ${projectName}` : null,
      meetingUrl,
    ]),
  }),
  documentReady: ({
    recipientName,
    projectName,
    documentName,
    documentUrl,
    documentType,
  }) => ({
    subject: `${documentName} is ready`,
    html: buildEmailShell({
      eyebrow: "Document Ready",
      title: "Your document is available",
      intro: `${recipientName}, ${documentName} has been generated and is ready to review.`,
      accent: "#0f766e",
      bodyHtml: `
        ${buildKeyValueList([
          { label: "Project", value: projectName || "CivilBridge Project" },
          { label: "Document", value: documentName },
          { label: "Type", value: documentType },
        ])}
        ${buildActionButton("Open Document", documentUrl, "#0f766e")}
      `,
      footer: "CivilBridge document delivery",
    }),
    text: baseText([
      `${recipientName}, ${documentName} is ready.`,
      projectName ? `Project: ${projectName}` : null,
      documentUrl,
    ]),
  }),
  test: ({ recipientName, dashboardUrl }) => ({
    subject: "CivilBridge email queue test",
    html: buildEmailShell({
      eyebrow: "Diagnostics",
      title: "Email queue is working",
      intro: `${recipientName}, this is a test email from the CivilBridge queue.`,
      accent: "#1d4ed8",
      bodyHtml: `
        <p>Your queued email infrastructure is active and able to render templates.</p>
        ${buildActionButton("Open Dashboard", dashboardUrl, "#1d4ed8")}
      `,
      footer: "CivilBridge diagnostics",
    }),
    text: baseText([
      `${recipientName}, this is a CivilBridge email queue test.`,
      dashboardUrl,
    ]),
  }),
};

export function renderEmailTemplate(templateName, variables = {}) {
  const renderer = registry[templateName];

  if (!renderer) {
    throw new Error(`Unknown email template: ${templateName}`);
  }

  return renderer(variables);
}

export function listEmailTemplates() {
  return Object.keys(registry);
}

export { resolveAppUrl };
