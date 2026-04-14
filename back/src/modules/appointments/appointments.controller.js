import {
  cancelAppointment,
  confirmAppointment,
  createAppointment,
  getProviderAvailability,
  listAppointmentsForActor,
} from "./appointments.service.js";

export async function postAppointment(req, res) {
  try {
    const appointment = await createAppointment({
      actor: req.user,
      providerId: req.body?.providerId,
      projectId: req.body?.projectId,
      calendarSlotId: req.body?.calendarSlotId,
      startsAt: req.body?.startsAt,
      endsAt: req.body?.endsAt,
      meetingType: req.body?.meetingType,
      notes: req.body?.notes,
    });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || "Failed to create appointment" });
  }
}

export async function listMyAppointments(req, res) {
  try {
    const appointments = await listAppointmentsForActor(req.user, {
      status: req.query?.status,
    });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || "Failed to fetch appointments" });
  }
}

export async function getAvailability(req, res) {
  try {
    const availability = await getProviderAvailability(req.params.providerId);
    res.json({ success: true, availability });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || "Failed to fetch availability" });
  }
}

export async function confirmAppointmentRequest(req, res) {
  try {
    const appointment = await confirmAppointment({
      appointmentId: req.params.id,
      actor: req.user,
    });
    res.json({ success: true, appointment });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || "Failed to confirm appointment" });
  }
}

export async function cancelAppointmentRequest(req, res) {
  try {
    const appointment = await cancelAppointment({
      appointmentId: req.params.id,
      actor: req.user,
      cancelReason: req.body?.cancelReason,
    });
    res.json({ success: true, appointment });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || "Failed to cancel appointment" });
  }
}
