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
    // Normalize target for consistent DB lookups
    const target = email ? email.toLowerCase().trim() : phone;

    if (!target) return res.status(400).json({ message: "Email or phone required" });

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: target }, { phone: target }] },
      select: { id: true }
    });

    if (existing) return res.status(400).json({ message: "User already exists" });

    const { otp } = await sendRegistrationOtp(target);
    
    if (target.includes("@")) {
      try {
        await emailService.sendVerificationEmail(target, otp);
      } catch (emailErr) {
        console.error("Failed to send OTP email:", emailErr.message);
        return res.status(500).json({ message: "Failed to send OTP email" });
      }
    }

    const response = {
      success: true,
      message: target.includes("@") ? "OTP sent to email" : "OTP sent to phone",
      expires_in_sec: 300,
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const register = async (req, res) => {
  try {
    // 1. Extract EVERYTHING from the request body at once
    const { 
      fullname, 
      fullName, 
      full_name, 
      email, 
      phone, 
      password,
      otp 
    } = req.body;

    // 2. Identify the name and the target (email or phone)
    const extractedName = fullname || fullName || full_name;
    const target = email || phone;

    // 3. Strict Validation with better error messages
    if (!extractedName) {
      return res.status(400).json({ message: "Full name is required." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }
    if (!target || !otp) {
      return res.status(400).json({ message: "Email/Phone and OTP are required." });
    }

    // 4. Verify OTP
    await verifyRegistrationOtp(target, otp);

    // 5. Create user in database via the service
    const authResult = await createUser({ 
      fullname: extractedName, 
      email: email ? email.toLowerCase().trim() : null, 
      phone, 
      password // <--- This is now safely passed to the service
    });

    // 6. Set Auth Cookies for Auto-Login
    const csrfToken = generateCSRFToken();
    setAuthCookie(res, authResult.token);
    res.cookie('csrf', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    res.status(201).json({
      success: true,
      token: authResult.token,
      csrfToken,
      user: authResult.user
    });

  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(400).json({ success: false, message: err.message || "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { phone: email }]
      }
    }); 
    
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken({ id: user.id.toString(), role: user.role });
    const csrfToken = generateCSRFToken();

    setAuthCookie(res, token);
    res.cookie('csrf', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    await prisma.auditLog.create({ data: { userId: user.id, action: "LOGIN" } });

    res.json({
      success: true,
      token,
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
            role: "CLIENT", // 🔒 Forced to CLIENT - no user choice
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
      token,
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
