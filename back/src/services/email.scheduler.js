import prisma from "../config/prisma.js";
import { enqueueAppointmentReminderEmail } from "./email.queue.js";

let schedulerHandle = null;
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

function formatAppointmentTime(date) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function markReminderIfPending(appointmentId, field) {
  const result = await prisma.appointment.updateMany({
    where: {
      id: appointmentId,
      status: "CONFIRMED",
      [field]: null,
    },
    data: {
      [field]: new Date(),
    },
  });

  return result.count > 0;
}

async function queueReminderPair(appointment, reminderField, reminderWindow) {
  const marked = await markReminderIfPending(appointment.id, reminderField);
  if (!marked) return;

  const startsAt = formatAppointmentTime(appointment.startsAt);
  const projectName = appointment.project?.projectName || "General consultation";
  const meetingUrl = `${FRONTEND_URL}/appointments`;

  const sharedPayload = {
    projectName,
    startsAt,
    reminderWindow,
    meetingUrl,
    notes: appointment.notes || "",
  };

  if (appointment.client?.email) {
    await enqueueAppointmentReminderEmail({
      to: appointment.client.email,
      recipientName: appointment.client.fullName || "there",
      counterpartName: appointment.provider?.fullName || "your provider",
      ...sharedPayload,
    });
  }

  if (appointment.provider?.email) {
    await enqueueAppointmentReminderEmail({
      to: appointment.provider.email,
      recipientName: appointment.provider.fullName || "there",
      counterpartName: appointment.client?.fullName || "your client",
      ...sharedPayload,
    });
  }
}

export async function runAppointmentReminderSweep() {
  const now = new Date();
  const twentyFourHourStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const twentyFourHourEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const oneHourStart = new Date(now.getTime() + 30 * 60 * 1000);
  const oneHourEnd = new Date(now.getTime() + 90 * 60 * 1000);

  const [dayAppointments, hourAppointments] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        reminder24hSentAt: null,
        startsAt: {
          gte: twentyFourHourStart,
          lte: twentyFourHourEnd,
        },
      },
      include: {
        project: { select: { projectName: true } },
        provider: { select: { fullName: true, email: true } },
        client: { select: { fullName: true, email: true } },
      },
    }),
    prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        reminder1hSentAt: null,
        startsAt: {
          gte: oneHourStart,
          lte: oneHourEnd,
        },
      },
      include: {
        project: { select: { projectName: true } },
        provider: { select: { fullName: true, email: true } },
        client: { select: { fullName: true, email: true } },
      },
    }),
  ]);

  for (const appointment of dayAppointments) {
    await queueReminderPair(appointment, "reminder24hSentAt", "24 hours");
  }

  for (const appointment of hourAppointments) {
    await queueReminderPair(appointment, "reminder1hSentAt", "1 hour");
  }
}

export function startAppointmentReminderScheduler() {
  if (process.env.ENABLE_APPOINTMENT_REMINDER_SCHEDULER === "false") {
    return;
  }

  if (schedulerHandle) return;

  const intervalMs = Number(process.env.APPOINTMENT_REMINDER_INTERVAL_MS || 5 * 60 * 1000);
  schedulerHandle = setInterval(() => {
    runAppointmentReminderSweep().catch((error) => {
      console.error("Appointment reminder sweep failed:", error.message);
    });
  }, intervalMs);
  schedulerHandle.unref?.();

  runAppointmentReminderSweep().catch((error) => {
    console.error("Initial appointment reminder sweep failed:", error.message);
  });
}
