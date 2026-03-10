import { pool } from "../../config/db.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { generateToken } from "../../utils/jwt.js";
import { OAuth2Client } from "google-auth-library";
import { sendRegistrationOtp, verifyRegistrationOtp, createUser } from "./auth.service.js";
import { emailService } from "../../services/email.service.js";

export const requestRegisterOtp = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const target = email || phone;

    if (!target) {
      return res.status(400).json({ message: "Email or phone required" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR phone = ?",
      [target, target]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const { otp } = await sendRegistrationOtp(target);

    // Send OTP by email if target is an email address
    if (target.includes("@")) {
      try {
        await emailService.sendVerificationEmail(target, otp);
      } catch (emailErr) {
        console.error("Failed to send OTP email:", emailErr.message);
      }
    }

    console.log(`[DEV] OTP for ${target}: ${otp}`); // Only in dev
    res.json({
      success: true,
      message: target.includes("@")
        ? "OTP sent to your email address"
        : "OTP sent to your phone number",
      expires_in_sec: 300,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, otp } = req.body;
    const target = email || phone;

    if (!target || !otp) {
      return res.status(400).json({ message: "Email/phone and OTP required" });
    }

    await verifyRegistrationOtp(target, otp);

    // createUser returns an object with the new user data
    const newUser = await createUser({ full_name, email, phone, password });

    // Send the email (using await to ensure it succeeds)
    await emailService.sendWelcomeEmail(newUser.email, newUser.full_name);

    // Send response AFTER everything is successful
    res.status(201).json({
      success: true,
      message: "User registered and email sent!",
      user: newUser
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message || "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?",
      [email]
    );

    if (!rows.length)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = rows[0];

    if (!user.password_hash)
      return res.status(400).json({ message: "Please use Google sign-in" });

    const valid = await comparePassword(password, user.password_hash);

    if (!valid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken({ id: user.id, role: user.role_name });

    await pool.query(
      "INSERT INTO audit_logs (actor_user_id, action) VALUES (?, ?)",
      [user.id, "LOGIN"]
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role_name
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential required" });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleSub } = payload;

    const [existingUsers] = await pool.query(
      "SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ? OR u.google_sub = ?",
      [email, googleSub]
    );

    let user;
    let userId;
    let roleName;

    if (existingUsers.length > 0) {
      user = existingUsers[0];
      userId = user.id;
      roleName = user.role_name;

      await pool.query(
        "UPDATE users SET google_sub = ?, last_login_at = NOW() WHERE id = ?",
        [googleSub, userId]
      );
    } else {
      const [[defaultRole]] = await pool.query(
        "SELECT id FROM roles WHERE name = 'USER' LIMIT 1"
      );

      const [result] = await pool.query(
        "INSERT INTO users (full_name, email, google_sub, role_id, verification_status) VALUES (?, ?, ?, ?, ?)",
        [name, email, googleSub, defaultRole.id, 'VERIFIED']
      );
      userId = result.insertId;
      roleName = 'USER';

      await pool.query(
        "INSERT INTO audit_logs (actor_user_id, action) VALUES (?, ?)",
        [userId, "GOOGLE_REGISTER"]
      );

      user = { id: userId, full_name: name, email, role_name: 'USER' };
    }

    await pool.query(
      "INSERT INTO audit_logs (actor_user_id, action) VALUES (?, ?)",
      [userId, "GOOGLE_LOGIN"]
    );

    const token = generateToken({ id: userId, role: roleName });

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        full_name: user.full_name || name,
        email: user.email || email,
        role: roleName,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
};

export const logout = async (req, res) => {
  // Blacklist token or clear session
  res.json({ success: true, message: 'Logged out' });
};