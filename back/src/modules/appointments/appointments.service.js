import prisma from "../../config/prisma.js";

function toBigInt(value, label) {
  try {
    return BigInt(value);
  } catch {
    throw new Error(`${label} is invalid`);
  }
}

function actorCanManageAppointment(actor, appointment) {
  const actorId = BigInt(actor.id);
  return (
    ["ADMIN", "SUPER_ADMIN"].includes(actor.role) ||
    appointment.providerUserId === actorId ||
    appointment.clientUserId === actorId
  );
}

export async function getProviderAvailability(providerId) {
  const providerUserId = toBigInt(providerId, "providerId");
  const slots = await prisma.calendarSlot.findMany({
    where: {
      providerUserId,
      status: "AVAILABLE",
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
    include: {
      appointment: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  return slots.map((slot) => ({
    id: slot.id,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    status: slot.status,
    notes: slot.notes,
    booked: Boolean(slot.appointment && slot.appointment.status !== "CANCELLED"),
  }));
}

export async function listAppointmentsForActor(actor, filters = {}) {
  const actorId = BigInt(actor.id);
  const where = ["ADMIN", "SUPER_ADMIN"].includes(actor.role)
    ? {}
    : {
        OR: [
          { providerUserId: actorId },
          { clientUserId: actorId },
        ],
      };

  if (filters.status) {
    where.status = filters.status;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
    include: {
      provider: { select: { id: true, fullName: true, email: true } },
      client: { select: { id: true, fullName: true, email: true } },
      project: { select: { id: true, projectName: true, status: true } },
      calendarSlot: true,
    },
  });

  return appointments.map((appointment) => ({
    ...appointment,
    id: appointment.id.toString(),
    providerUserId: appointment.providerUserId.toString(),
    clientUserId: appointment.clientUserId.toString(),
    projectId: appointment.projectId?.toString() || null,
    calendarSlotId: appointment.calendarSlotId?.toString() || null,
    provider: appointment.provider
      ? { ...appointment.provider, id: appointment.provider.id.toString() }
      : null,
    client: appointment.client
      ? { ...appointment.client, id: appointment.client.id.toString() }
      : null,
    project: appointment.project
      ? { ...appointment.project, id: appointment.project.id.toString() }
      : null,
    calendarSlot: appointment.calendarSlot
      ? { ...appointment.calendarSlot, id: appointment.calendarSlot.id.toString(), providerUserId: appointment.calendarSlot.providerUserId.toString() }
      : null,
  }));
}

export async function createAppointment({
  actor,
  providerId,
  projectId,
  calendarSlotId,
  startsAt,
  endsAt,
  meetingType,
  notes,
}) {
  const providerUserId = toBigInt(providerId, "providerId");
  const clientUserId = BigInt(actor.id);
  const projectBigInt = projectId ? toBigInt(projectId, "projectId") : null;

  if (providerUserId === clientUserId) {
    throw new Error("You cannot book an appointment with yourself");
  }

  if (!calendarSlotId && (!startsAt || !endsAt)) {
    throw new Error("Provide a calendarSlotId or both startsAt and endsAt");
  }

  return prisma.$transaction(async (tx) => {
    let slot = null;

    if (calendarSlotId) {
      slot = await tx.calendarSlot.findUnique({
        where: { id: toBigInt(calendarSlotId, "calendarSlotId") },
      });

      if (!slot || slot.providerUserId !== providerUserId) {
        throw new Error("Calendar slot not found for this provider");
      }

      if (slot.status !== "AVAILABLE") {
        throw new Error("Selected calendar slot is not available");
      }
    }

    if (projectBigInt) {
      const project = await tx.project.findUnique({
        where: { id: projectBigInt },
        select: { id: true, userId: true },
      });
      if (!project) {
        throw new Error("Project not found");
      }
      if (
        project.userId !== clientUserId &&
        !["ADMIN", "SUPER_ADMIN"].includes(actor.role)
      ) {
        throw new Error("You are not allowed to link this project");
      }
    }

    const appointment = await tx.appointment.create({
      data: {
        providerUserId,
        clientUserId,
        projectId: projectBigInt,
        calendarSlotId: slot?.id || null,
        startsAt: slot?.startsAt || new Date(startsAt),
        endsAt: slot?.endsAt || new Date(endsAt),
        status: "REQUESTED",
        meetingType: meetingType || null,
        notes: notes || null,
      },
      include: {
        provider: { select: { fullName: true, email: true } },
        client: { select: { fullName: true, email: true } },
        project: { select: { projectName: true } },
        calendarSlot: true,
      },
    });

    if (slot) {
      await tx.calendarSlot.update({
        where: { id: slot.id },
        data: { status: "HELD" },
      });
    }

    return appointment;
  });
}

export async function confirmAppointment({ appointmentId, actor }) {
  const id = toBigInt(appointmentId, "appointmentId");

  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id },
      include: {
        provider: { select: { fullName: true, email: true } },
        client: { select: { fullName: true, email: true } },
        project: { select: { projectName: true } },
        calendarSlot: true,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (
      !["ADMIN", "SUPER_ADMIN"].includes(actor.role) &&
      appointment.providerUserId !== BigInt(actor.id)
    ) {
      throw new Error("Only the provider can confirm this appointment");
    }

    const updated = await tx.appointment.update({
      where: { id },
      data: { status: "CONFIRMED" },
      include: {
        provider: { select: { fullName: true, email: true } },
        client: { select: { fullName: true, email: true } },
        project: { select: { projectName: true } },
      },
    });

    if (appointment.calendarSlotId) {
      await tx.calendarSlot.update({
        where: { id: appointment.calendarSlotId },
        data: { status: "BOOKED" },
      });
    }

    return updated;
  });
}

export async function cancelAppointment({ appointmentId, actor, cancelReason }) {
  const id = toBigInt(appointmentId, "appointmentId");

  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id },
      include: { calendarSlot: true },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (!actorCanManageAppointment(actor, appointment)) {
      throw new Error("You are not allowed to cancel this appointment");
    }

    const updated = await tx.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelReason: cancelReason || null,
      },
      include: {
        provider: { select: { fullName: true, email: true } },
        client: { select: { fullName: true, email: true } },
        project: { select: { projectName: true } },
      },
    });

    if (appointment.calendarSlotId) {
      await tx.calendarSlot.update({
        where: { id: appointment.calendarSlotId },
        data: { status: "AVAILABLE" },
      });
    }

    return updated;
  });
}
