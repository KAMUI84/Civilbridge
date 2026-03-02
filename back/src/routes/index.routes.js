import { Router } from "express";
import aiRoutes from "./ai.route.js";

const router = Router();

router.use("/api/ai", aiRoutes);

export default router;