import { pool } from "../../config/db.js";
import { hashPassword } from "../../utils/password.js";
import { generateToken } from "../../utils/jwt.js";
import crypto from "crypto";

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendRegistrationOtp(target) {
  const otp = genOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await pool.query("DELETE FROM otp_codes WHERE target=? AND purpose='register'", [target]);

  await pool.query(
    "INSERT INTO otp_codes (target, otp_hash, purpose, expires_at) VALUES (?,?,?,?)",
    [target, otpHash, 'register', expiresAt]
  );

  console.log(`[DEV] OTP for ${target}: ${otp}`);
  
  return { otp, expiresAt };
}

export async function verifyRegistrationOtp(target, otp) {
  const [rows] = await pool.query(
    "SELECT * FROM otp_codes WHERE target=? AND purpose='register' ORDER BY id DESC LIMIT 1",
    [target]
  );

  const row = rows?.[0];
  if (!row) throw new Error("No OTP found. Request a new one.");

  if (new Date(row.expires_at).getTime() < Date.now()) {
    throw new Error("OTP expired. Request a new one.");
  }

  if (row.attempts >= 5) {
    throw new Error("Too many attempts. Request a new OTP.");
  }

  const ok = row.otp_hash === hashOtp(otp);
  if (!ok) {
    await pool.query("UPDATE otp_codes SET attempts = attempts + 1 WHERE id=?", [row.id]);
    throw new Error("Invalid OTP.");
  }

  await pool.query("DELETE FROM otp_codes WHERE id=?", [row.id]);
  return true;
}

export async function createUser(userData) {
  const { full_name, email, phone, password } = userData;
  
  const hashed = await hashPassword(password);

  const [[defaultRole]] = await pool.query(
    "SELECT id FROM roles WHERE name = 'USER' LIMIT 1"
  );

  const [result] = await pool.query(
    "INSERT INTO users (full_name, email, phone, password_hash, role_id, verification_status) VALUES (?, ?, ?, ?, ?, ?)",
    [full_name, email || null, phone || null, hashed, defaultRole.id, 'VERIFIED']
  );

  await pool.query(
    "INSERT INTO audit_logs (actor_user_id, action) VALUES (?, ?)",
    [result.insertId, "REGISTER"]
  );

  const token = generateToken({ id: result.insertId, role: 'USER' });

  return {
    token,
    user: { 
      id: result.insertId, 
      full_name, 
      email: email || null, 
      phone: phone || null, 
      role: 'USER' 
    }
  };
}
