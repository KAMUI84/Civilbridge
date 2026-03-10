import crypto from "crypto";
import { pool } from "../config/db.js";
import { emailService } from "../services/email.service.js";

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

export async function sendOtp(req, res) {
  const { target, purpose = "register", firstName = null } = req.body;
  if (!target) return res.status(400).json({ error: "target is required" });

  const otp = genOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10min

  // delete old OTPs for this target+purpose
  await pool.query("DELETE FROM otp_codes WHERE target=? AND purpose=?", [target, purpose]);

  await pool.query(
    "INSERT INTO otp_codes (target, otp_hash, purpose, expires_at) VALUES (?,?,?,?)",
    [target, otpHash, purpose, expiresAt]
  );

  try {
    // Send email with OTP
    await emailService.sendVerificationEmail(target, otp, firstName);
    
    return res.json({
      ok: true,
      message: "OTP sent to your email",
      expires_in_sec: 600,
    });
  } catch (emailError) {
    console.error('Email send failed:', emailError);
    // In production, don't return the OTP - require email to work
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({ 
        error: "Email service unavailable. Please try again later." 
      });
    }
    
    // Development only: return OTP for testing
    return res.json({
      ok: true,
      message: "OTP sent (development mode)",
      otp, // remove in production
      expires_in_sec: 600,
    });
  }
}

export async function verifyOtp(req, res) {
  const { target, otp, purpose = "register" } = req.body;
  if (!target || !otp) return res.status(400).json({ error: "target and otp are required" });

  const [rows] = await pool.query(
    "SELECT * FROM otp_codes WHERE target=? AND purpose=? ORDER BY id DESC LIMIT 1",
    [target, purpose]
  );

  const row = rows?.[0];
  if (!row) return res.status(400).json({ error: "No OTP found. Request a new one." });

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ error: "OTP expired. Request a new one." });
  }

  if (row.attempts >= 5) {
    return res.status(429).json({ error: "Too many attempts. Request a new OTP." });
  }

  const ok = row.otp_hash === hashOtp(otp);
  if (!ok) {
    await pool.query("UPDATE otp_codes SET attempts = attempts + 1 WHERE id=?", [row.id]);
    return res.status(400).json({ error: "Invalid OTP." });
  }

  // OTP ok → consume it
  await pool.query("DELETE FROM otp_codes WHERE id=?", [row.id]);

  return res.json({ ok: true, message: "OTP verified" });
}