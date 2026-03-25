import express from "express";
import { requestRegisterOtp, register, login, googleLogin, logout } from "./auth.controller.js";

const router = express.Router();

router.post("/register/request-otp", requestRegisterOtp);
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/google-login", googleLogin); // Add alias for frontend compatibility
router.post("/logout", logout);

export default router;