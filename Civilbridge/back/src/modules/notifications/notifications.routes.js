import { Router } from "express";
import {
  listNotifications,
  markRead,
  markAllRead,
} from "./notifications.controller.js";

const router = Router();

// All routes are mounted under /api/notifications (protected in app.js)

router.get("/",                 listNotifications);
router.patch("/read-all",       markAllRead);
router.patch("/:id/read",       markRead);

export default router;
