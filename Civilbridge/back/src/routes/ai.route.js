import { Router } from "express";
import { chat, models } from "../controllers/ai.controller.js";

const router = Router();

router.get("/models", models);
router.post("/chat", chat);

export default router;