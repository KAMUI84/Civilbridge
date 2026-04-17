import nodemailer from "nodemailer";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { listEmailTemplates, renderEmailTemplate, resolveAppUrl } from "./email.templates.js";

const EMAIL_QUEUE_NAME = process.env.EMAIL_QUEUE_NAME || "civilbridge-email";
const RETRY_ATTEMPTS = 3;
const BACKOFF_DELAY_MS = 1000;

let transporterPromise = null;
let queue = null;
let worker = null;
let redis = null;
let memoryFallbackEnabled = false;
let memoryJobs = [];
let memoryProcessing = false;
let initialized = false;

function hasSmtpCredentials() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

async function createTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (hasSmtpCredentials()) {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_PORT || 587),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  })();

  return transporterPromise;
}

function buildMailOptions(job) {
  if (job.mode === "raw") {
    return {
      from: process.env.EMAIL_FROM || "CivilBridge <noreply@civilbridge.rw>",
      to: job.to,
      subject: job.subject,
      html: job.html,
      text: job.text,
      attachments: job.attachments || [],
    };
  }

  const rendered = renderEmailTemplate(job.template, job.variables);

  return {
    from: process.env.EMAIL_FROM || "CivilBridge <noreply@civilbridge.rw>",
    to: job.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    attachments: job.attachments || [],
  };
}

async function deliverEmail(job) {
  const transporter = await createTransporter();
  const mailOptions = buildMailOptions(job);
  const info = await transporter.sendMail(mailOptions);

  if (!hasSmtpCredentials()) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("Email preview URL:", previewUrl);
    }
  }

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  };
}

function scheduleMemoryProcessor() {
  if (memoryProcessing) return;
  memoryProcessing = true;

  const tick = async () => {
    const now = Date.now();
    const index = memoryJobs.findIndex((job) => job.runAt <= now);

    if (index === -1) {
      memoryProcessing = false;
      return;
    }

    const job = memoryJobs.splice(index, 1)[0];

    try {
      await deliverEmail(job.payload);
    } catch (error) {
      job.attempts += 1;
      if (job.attempts < RETRY_ATTEMPTS) {
        job.runAt = Date.now() + BACKOFF_DELAY_MS * 2 ** (job.attempts - 1);
        memoryJobs.push(job);
      } else {
        console.error("Email queue job failed after retries:", error.message);
      }
    }

    setImmediate(tick);
  };

  setImmediate(tick);
}

function initializeMemoryFallback() {
  memoryFallbackEnabled = true;
}

function initializeBullQueue() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    initializeMemoryFallback();
    return;
  }

  redis = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  queue = new Queue(EMAIL_QUEUE_NAME, { connection: redis });
  worker = new Worker(
    EMAIL_QUEUE_NAME,
    async (job) => deliverEmail(job.data),
    { connection: redis }
  );

  worker.on("failed", (job, error) => {
    console.error("Bull email job failed:", job?.name, error.message);
  });
}

export function initializeEmailInfrastructure() {
  if (initialized) return;
  initialized = true;

  try {
    initializeBullQueue();
  } catch (error) {
    console.error("Falling back to in-memory email queue:", error.message);
    initializeMemoryFallback();
  }
}

function normalizeRecipients(to) {
  if (Array.isArray(to)) {
    return to.join(", ");
  }

  return to;
}

export async function enqueueEmail(job) {
  initializeEmailInfrastructure();

  const payload = {
    ...job,
    to: normalizeRecipients(job.to),
    attachments: job.attachments || [],
    queuedAt: new Date().toISOString(),
  };

  if (queue) {
    const createdJob = await queue.add("send-email", payload, {
      attempts: RETRY_ATTEMPTS,
      backoff: {
        type: "exponential",
        delay: BACKOFF_DELAY_MS,
      },
      removeOnComplete: 100,
      removeOnFail: 100,
      delay: job.delayMs || 0,
    });

    return { queued: true, queue: "bullmq", jobId: createdJob.id };
  }

  memoryJobs.push({
    payload,
    attempts: 0,
    runAt: Date.now() + (job.delayMs || 0),
  });
  scheduleMemoryProcessor();

  return {
    queued: true,
    queue: "memory",
    jobId: `memory-${Date.now()}-${memoryJobs.length}`,
  };
}

export async function enqueueTemplateEmail({
  to,
  template,
  variables,
  attachments,
  delayMs,
}) {
  return enqueueEmail({
    to,
    template,
    variables,
    attachments,
    delayMs,
  });
}

export async function enqueueRawEmail({
  to,
  subject,
  html,
  text,
  attachments,
  delayMs,
}) {
  return enqueueEmail({
    mode: "raw",
    to,
    subject,
    html,
    text,
    attachments,
    delayMs,
  });
}

export function getEmailQueueStatus() {
  return {
    queueName: EMAIL_QUEUE_NAME,
    queueMode: queue ? "bullmq" : "memory",
    redisConfigured: Boolean(process.env.REDIS_URL),
    smtpConfigured: hasSmtpCredentials(),
    availableTemplates: listEmailTemplates(),
    initialized,
    pendingMemoryJobs: memoryJobs.length,
  };
}

export async function enqueueVerificationEmail(email, otp, firstName = null) {
  return enqueueTemplateEmail({
    to: email,
    template: "verification",
    variables: { otp, firstName },
  });
}

export async function enqueueWelcomeEmail(email, firstName = null) {
  return enqueueTemplateEmail({
    to: email,
    template: "welcome",
    variables: { firstName },
  });
}

export async function enqueueLoginThanksEmail(email, firstName = null) {
  return enqueueTemplateEmail({
    to: email,
    template: "loginThanks",
    variables: { firstName },
  });
}

export async function enqueuePasswordResetEmail(email, resetToken, firstName = null) {
  return enqueueTemplateEmail({
    to: email,
    template: "passwordReset",
    variables: {
      firstName,
      resetUrl: `${resolveAppUrl("/reset-password")}?token=${encodeURIComponent(resetToken)}`,
    },
  });
}

export async function enqueueProjectAssignedEmail({ to, professionalName, projectName, clientName, role, projectUrl }) {
  return enqueueTemplateEmail({
    to,
    template: "projectAssigned",
    variables: { professionalName, projectName, clientName, role, projectUrl },
  });
}

export async function enqueueEngineerApprovedEmail({ to, recipientName, projectName, reviewerName, notes, documentUrl }) {
  return enqueueTemplateEmail({
    to,
    template: "engineerApproved",
    variables: { recipientName, projectName, reviewerName, notes, documentUrl },
  });
}

export async function enqueueEngineerRejectedEmail({ to, recipientName, projectName, reviewerName, notes, projectUrl }) {
  return enqueueTemplateEmail({
    to,
    template: "engineerRejected",
    variables: { recipientName, projectName, reviewerName, notes, projectUrl },
  });
}

export async function enqueuePaymentConfirmedEmail({ to, recipientName, amount, currency, provider, reference, serviceLabel, invoiceUrl, attachments }) {
  return enqueueTemplateEmail({
    to,
    template: "paymentConfirmed",
    variables: { recipientName, amount, currency, provider, reference, serviceLabel, invoiceUrl },
    attachments,
  });
}

export async function enqueueAppointmentReminderEmail({ to, recipientName, counterpartName, projectName, startsAt, reminderWindow, meetingUrl, notes }) {
  return enqueueTemplateEmail({
    to,
    template: "appointmentReminder",
    variables: {
      recipientName,
      counterpartName,
      projectName,
      startsAt,
      reminderWindow,
      meetingUrl,
      notes,
    },
  });
}

export async function enqueueDocumentReadyEmail({ to, recipientName, projectName, documentName, documentUrl, documentType }) {
  return enqueueTemplateEmail({
    to,
    template: "documentReady",
    variables: {
      recipientName,
      projectName,
      documentName,
      documentUrl,
      documentType,
    },
  });
}

export async function enqueueTestEmail(to) {
  return enqueueTemplateEmail({
    to,
    template: "test",
    variables: {
      recipientName: "Samuel",
      dashboardUrl: resolveAppUrl("/dashboard"),
    },
  });
}
