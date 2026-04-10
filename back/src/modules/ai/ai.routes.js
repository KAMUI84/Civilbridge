import { Router } from "express";
import multer from "multer";
import { protect } from "../../middlewares/auth.js";
import {
  aiRateLimit,
  analyzePlan,
  createThread,
  deleteThread,
  estimateProject,
  generatePlan,
  getProviders,
  getMessages,
  getThreads,
  guestChat,
  sendMessage,
} from "./ai.controller.js";

const router = Router();
const allowedPlanMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const planUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedPlanMimeTypes.has(file.mimetype)) {
      callback(new Error("Only PDF, JPEG, PNG, and WEBP files are supported."));
      return;
    }

    callback(null, true);
  },
});

router.post("/guest/chat", aiRateLimit, guestChat);

router.use(protect, aiRateLimit);

router.get("/providers", getProviders);
router.post("/analyze-plan", planUpload.single("file"), analyzePlan);
router.post("/generate-plan", generatePlan);
router.post("/estimate", estimateProject);
router.get("/threads", getThreads);
router.post("/threads", createThread);
router.get("/threads/:id/messages", getMessages);
router.post("/threads/:id/chat", sendMessage);
router.delete("/threads/:id", deleteThread);

export default router;
