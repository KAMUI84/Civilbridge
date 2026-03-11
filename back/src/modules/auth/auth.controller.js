import prisma from "../../config/prisma.js";
import { comparePassword } from "../../utils/password.js";
import { generateToken } from "../../utils/jwt.js";
import { OAuth2Client } from "google-auth-library";
import { sendRegistrationOtp, verifyRegistrationOtp, createUser } from "./auth.service.js";
import { emailService } from "../../services/email.service.js";
import { setAuthCookie, clearAuthCookie, generateCSRFToken } from "../../utils/cookie.js";

export const requestRegisterOtp = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const target = email || phone;

    if (!target) {
      return res.status(400).json({ message: "Email or phone required" });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: target }, { phone: target }]
      },
      select: { id: true }
    });

    if (existing) {
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

    const authResult = await createUser({ full_name, email, phone, password });

    if (authResult.user.email) {
      await emailService.sendWelcomeEmail(authResult.user.email, authResult.user.full_name);
    }

    res.status(201).json({
      success: true,
      message: "User registered and email sent!",
      user: authResult.user
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message || "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.passwordHash)
      return res.status(400).json({ message: "Please use Google sign-in" });

    const valid = await comparePassword(password, user.passwordHash);

    if (!valid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken({ id: user.id.toString(), role: user.role });
    const csrfToken = generateCSRFToken();

    // Set httpOnly cookie and CSRF token in response
    setAuthCookie(res, token);
    res.cookie('csrf', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN"
      }
    });

    res.json({
      success: true,
      csrfToken,
      user: {
        id: user.id.toString(),
        full_name: user.fullName,
        email: user.email,
        role: user.role
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

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleSub }]
      }
    });

    let userId;
    let roleName;

    if (user) {
      userId = user.id;
      roleName = user.role;

      await prisma.user.update({
        where: { id: userId },
        data: { googleSub, lastLoginAt: new Date() }
      });
    } else {
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            fullName: name,
            email,
            googleSub,
            role: "USER",
            verificationStatus: "VERIFIED"
          }
        });

        await tx.auditLog.create({
          data: {
            userId: newUser.id,
            action: "GOOGLE_REGISTER"
          }
        });

        return newUser;
      });
      
      userId = user.id;
      roleName = user.role;
    }

    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: "GOOGLE_LOGIN"
      }
    });

    const token = generateToken({ id: userId.toString(), role: roleName });
    const csrfToken = generateCSRFToken();

    // Set httpOnly cookie and CSRF token in response
    setAuthCookie(res, token);
    res.cookie('csrf', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    res.json({
      success: true,
      csrfToken,
      user: {
        id: userId.toString(),
        full_name: user.fullName,
        email: user.email,
        role: roleName,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
};

export const logout = async (req, res) => {
  clearAuthCookie(res);
  res.clearCookie('csrf', { path: '/' });
  res.json({ success: true, message: 'Logged out' });
};