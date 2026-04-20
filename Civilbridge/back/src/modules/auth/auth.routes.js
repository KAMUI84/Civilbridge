import express from "express";
import {
  requestRegisterOtp,
  register,
  login,
  googleLogin,
  logout,
  refreshAccessToken,
  getGoogleNonce,
  changePassword,
  appleLogin,
  facebookLogin,
  xLogin,
} from "./auth.controller.js";
import { protect } from "../../middlewares/auth.js";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

const router = express.Router();

// Extra abuse-prevention: throttle by identifier (email/phone) + IP.
// This complements the global `authLimiter` applied in `app.js`.
const byIdentifier = ({ windowMs, max }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again later." },
    keyGenerator: (req) => {
      const ip = ipKeyGenerator(req.ip || "unknown-ip");
      const body = req.body || {};
      const identifier =
        (typeof body.email === "string" && body.email.toLowerCase().trim()) ||
        (typeof body.phone === "string" && body.phone.trim()) ||
        (typeof body.email === "string" && body.email.trim()) || // login uses `email` field for phone too
        "unknown-identifier";
      return `${ip}:${identifier}`;
    },
  });

const loginLimiter = byIdentifier({ windowMs: 15 * 60 * 1000, max: 8 }); // 8 per 15 minutes per identifier+IP
const otpLimiter = byIdentifier({ windowMs: 15 * 60 * 1000, max: 5 }); // 5 OTP requests per 15 minutes per identifier+IP

router.post("/register/request-otp", otpLimiter, requestRegisterOtp);
router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/google", googleLogin);
router.post("/google-login", googleLogin); // alias for frontend compatibility
router.post("/logout", logout);
router.post("/refresh", refreshAccessToken);
router.get("/google/nonce", getGoogleNonce);
router.post("/change-password", protect, changePassword);

// Additional social login providers
router.post("/apple", appleLogin);
router.post("/facebook", facebookLogin);
router.post("/x", xLogin);
router.post("/twitter", xLogin); // alias

export default router;
