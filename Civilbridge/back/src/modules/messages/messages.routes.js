import { Router } from "express";
import { uploadSingle } from "../../middlewares/upload.js";
import {
  listThreads,
  createThread,
  getThreadMessages,
  markThreadRead,
  sendMessage,
} from "./messages.controller.js";

const router = Router();

// All routes are mounted under /api/messages (protected in app.js)

router.get("/threads",              listThreads);
router.post("/threads",             createThread);
router.get("/:threadId",            getThreadMessages);
router.post("/:threadId/read",      markThreadRead);
router.post("/:threadId/send",      uploadSingle("attachment"), sendMessage);

export default router;
