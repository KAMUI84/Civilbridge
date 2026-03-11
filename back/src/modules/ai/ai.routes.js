import { Router } from "express";
import { protect } from "../../middlewares/auth.js";
import { aiRateLimit } from "./ai.controller.js";
import { getThreads, createThread, getMessages, sendMessage, guestChat, deleteThread } from "./ai.controller.js";

const router = Router();

// Guest endpoint — no auth, but rate limited
router.post("/guest/chat", aiRateLimit, guestChat);

// Protected endpoints
router.get("/threads", protect, getThreads);
router.post("/threads", protect, createThread);
router.get("/threads/:id/messages", protect, getMessages);
router.post("/threads/:id/chat", protect, aiRateLimit, sendMessage);
router.delete("/threads/:id", protect, deleteThread);

export default router;
