import crypto from "crypto";
import prisma from "../config/prisma.js";
import { emailService } from "../services/email.service.js";

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendOtp(req, res) {
  const { target, purpose = "register", firstName = null } = req.body;
  if (!target) return res.status(400).json({ error: "target is required" });

  const otp = genOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.oTPCode.deleteMany({ where: { target, purpose } });
  await prisma.oTPCode.create({ data: { target, otpHash, purpose, expiresAt } });

  try {
    await emailService.sendVerificationEmail(target, otp, firstName);
    return res.json({ ok: true, message: "OTP sent to your email", expires_in_sec: 600 });
  } catch (emailError) {
    console.error("Email send failed:", emailError);
    if (process.env.NODE_ENV === "production") {
      return res.status(500).json({ error: "Email service unavailable. Please try again later." });
    }
    return res.json({ ok: true, message: "OTP sent (development mode)", otp, expires_in_sec: 600 });
  }
}

export async function verifyOtp(req, res) {
  const { target, otp, purpose = "register" } = req.body;
  if (!target || !otp) return res.status(400).json({ error: "target and otp are required" });

  const record = await prisma.oTPCode.findFirst({
    where: { target, purpose },
    orderBy: { id: "desc" },
  });

  if (!record) return res.status(400).json({ error: "No OTP found. Request a new one." });
  if (record.expiresAt.getTime() < Date.now()) {
    return res.status(400).json({ error: "OTP expired. Request a new one." });
  }
  if (record.attempts >= 5) {
    return res.status(429).json({ error: "Too many attempts. Request a new OTP." });
  }

  const ok = record.otpHash === hashOtp(otp);
  if (!ok) {
    await prisma.oTPCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return res.status(400).json({ error: "Invalid OTP." });
  }

  await prisma.oTPCode.delete({ where: { id: record.id } });
  return res.json({ ok: true, message: "OTP verified" });
}
