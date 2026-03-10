import { Router } from "express";
import aiRoutes from "./ai.route.js";
import otpRoutes from "./otp.route.js";
import googleRoutes from "./Google.route.js";

const router = Router();

router.use("/api/ai", aiRoutes);
router.use("/otp", otpRoutes);
router.use("/auth", googleRoutes);

export default router;