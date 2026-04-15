import { Router } from "express";
import {
  cancelAppointmentRequest,
  confirmAppointmentRequest,
  getAvailability,
  listMyAppointments,
  postAppointment,
} from "./appointments.controller.js";

const router = Router();

router.get("/my", listMyAppointments);
router.post("/", postAppointment);
router.get("/availability/:providerId", getAvailability);
router.put("/:id/confirm", confirmAppointmentRequest);
router.put("/:id/cancel", cancelAppointmentRequest);

export default router;
