import prisma from "../../config/prisma.js";
import { comparePassword } from "../../utils/password.js";
import {
  generateToken,
  hashToken,
  generateSignedNonce,
  verifySignedNonce,
} from "../../utils/jwt.js";
import { OAuth2Client } from "google-auth-library";
import { sendRegistrationOtp, verifyRegistrationOtp, createUser, createSession } from "./auth.service.js";
import { emailService } from "../../services/email.service.js";
import {
  setAuthCookie,
  clearAuthCookie,
  setRefreshCookie,
  clearRefreshCookie,
  generateCSRFToken,
} from "../../utils/cookie.js";

// Google ID tokens must be issued by one of these two values.
const GOOGLE_ISS_WHITELIST = new Set([
  "accounts.google.com",
  "https://accounts.google.com",
]);

// Maximum consecutive failed login attempts before a 15-minute lockout.
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS  = 15 * 60 * 1000; // 15 minutes

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

    // 6. Send welcome email (email-based registrations)
    if (email) {
      const firstName = extractedName.split(" ")[0];
      try {
        await emailService.sendWelcomeEmail(email.toLowerCase().trim(), firstName);
      } catch (emailErr) {
        console.error("Welcome email failed:", emailErr.message);
        // Do not block registration on email failure
      }
    }

    // 7. Set Auth Cookies for Auto-Login
    const csrfToken    = generateCSRFToken();
    const refreshToken = await createSession(authResult.user.id, req);

    setAuthCookie(res, authResult.token);
    setRefreshCookie(res, refreshToken);
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
      where: { OR: [{ email: cleanEmail }, { phone: email }] }
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // ── Account lockout check (Task 5) ───────────────────────────────────────
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const secondsLeft = Math.ceil((user.lockedUntil - Date.now()) / 1000);
      return res.status(423).json({
        message: `Account locked due to too many failed attempts. Try again in ${secondsLeft} seconds.`,
        locked_until: user.lockedUntil,
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    const valid = await comparePassword(password, user.passwordHash);

    if (!valid) {
      // ── Record failure and apply lockout if threshold reached ─────────────
      const newCount = user.failedLoginAttempts + 1;
      const shouldLock = newCount >= MAX_FAILED_ATTEMPTS;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newCount,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
        },
      });
      await prisma.auditLog.create({
        data: { userId: user.id, action: "LOGIN_FAILURE", ipAddress: req.ip },
      });
      if (shouldLock) {
        return res.status(423).json({
          message: `Too many failed attempts. Account locked for 15 minutes.`,
        });
      }
      return res.status(400).json({ message: "Invalid credentials" });
      // ───────────────────────────────────────────────────────────────────────
    }

    // ── Successful login — reset lockout counters ────────────────────────────
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
    // ─────────────────────────────────────────────────────────────────────────

    const token        = generateToken({ id: user.id.toString(), role: user.role });
    const csrfToken    = generateCSRFToken();
    const refreshToken = await createSession(user.id, req);

    setAuthCookie(res, token);
    setRefreshCookie(res, refreshToken);
    res.cookie('csrf', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    await prisma.auditLog.create({ data: { userId: user.id, action: "LOGIN", ipAddress: req.ip } });

    if (user.email) {
      const firstName = (user.fullName || "").split(" ")[0];
      try {
        await emailService.sendLoginThanksEmail(user.email, firstName);
      } catch (emailErr) {
        console.error("Login thanks email failed:", emailErr.message);
      }
    }

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
    const { credential, state } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential required" });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // ── Harden the verified payload (Task 4) ─────────────────────────────────
    // 1. Issuer check — must be Google's canonical issuer string.
    if (!GOOGLE_ISS_WHITELIST.has(payload.iss)) {
      return res.status(401).json({ message: "Invalid token issuer" });
    }

    // 2. Email must be verified by Google.
    if (!payload.email_verified) {
      return res.status(401).json({ message: "Google account email is not verified" });
    }

    // 3. Nonce / state validation — if the client supplied a signed state,
    //    verify it and confirm the embedded nonce matches the ID token's nonce
    //    claim. This closes the CSRF / replay-attack vector for the credential
    //    flow. Callers that have not yet adopted nonce are still accepted (the
    //    iss + email_verified checks above remain in force).
    if (state) {
      let expectedNonce;
      try {
        expectedNonce = verifySignedNonce(state);
      } catch {
        return res.status(401).json({ message: "Invalid or expired OAuth state" });
      }
      if (payload.nonce !== expectedNonce) {
        return res.status(401).json({ message: "Nonce mismatch — possible replay attack" });
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

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

      // Send welcome email for newly created Google accounts
      if (user.email) {
        const firstName = (user.fullName || "").split(" ")[0];
        try {
          await emailService.sendWelcomeEmail(user.email, firstName);
        } catch (emailErr) {
          console.error("Google welcome email failed:", emailErr.message);
        }
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: "GOOGLE_LOGIN"
      }
    });

    const token        = generateToken({ id: userId.toString(), role: roleName });
    const csrfToken    = generateCSRFToken();
    const refreshToken = await createSession(userId, req);

    setAuthCookie(res, token);
    setRefreshCookie(res, refreshToken);
    res.cookie('csrf', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    if (user.email) {
      const firstName = (user.fullName || "").split(" ")[0];
      try {
        await emailService.sendLoginThanksEmail(user.email, firstName);
      } catch (emailErr) {
        console.error("Google login thanks email failed:", emailErr.message);
      }
    }

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

// ─── GET /api/auth/google/nonce ───────────────────────────────────────────────
// Returns a short-lived signed state + raw nonce.
// The frontend passes `nonce` to the Google Sign-In component and sends
// `state` back on the /google callback for CSRF verification.
export const getGoogleNonce = (_req, res) => {
  const { nonce, state } = generateSignedNonce();
  res.json({ success: true, nonce, state });
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// Invalidates the refresh token server-side before clearing cookies (Task 3).
export const logout = async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;

  if (rawRefreshToken) {
    try {
      // Delete the session row so the refresh token can never be reused.
      await prisma.userSession.deleteMany({
        where: { tokenHash: hashToken(rawRefreshToken) },
      });
    } catch (err) {
      // Log but never block the logout response.
      console.error("Session invalidation error on logout:", err.message);
    }
  }

  clearAuthCookie(res);
  clearRefreshCookie(res);
  res.clearCookie('csrf', { path: '/' });
  res.json({ success: true, message: 'Logged out' });
};

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
// Silently rotates the access + refresh token pair (Task 2).
// The old refresh token is deleted (invalidated) and a new pair is issued.
export const refreshAccessToken = async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;

  if (!rawRefreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  const tokenHash = hashToken(rawRefreshToken);

  // Find the session by hashed token and verify it has not expired.
  const session = await prisma.userSession.findFirst({
    where: { tokenHash },
    include: { user: { select: { id: true, role: true, isActive: true, lockedUntil: true } } },
  });

  if (!session) {
    return res.status(401).json({ message: "Invalid or already-used refresh token" });
  }

  if (session.expiresAt < new Date()) {
    await prisma.userSession.delete({ where: { id: session.id } });
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Refresh token expired. Please log in again." });
  }

  if (!session.user.isActive) {
    return res.status(403).json({ message: "Account is deactivated" });
  }

  if (session.user.lockedUntil && session.user.lockedUntil > new Date()) {
    return res.status(423).json({ message: "Account is temporarily locked" });
  }

  // ── Rotate: delete old session, create new one ────────────────────────────
  await prisma.userSession.delete({ where: { id: session.id } });

  const newAccessToken  = generateToken({ id: session.user.id.toString(), role: session.user.role });
  const newRefreshToken = await createSession(session.user.id, req);
  const csrfToken       = generateCSRFToken();

  setAuthCookie(res, newAccessToken);
  setRefreshCookie(res, newRefreshToken);
  res.cookie('csrf', csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
  });

  res.json({ success: true, token: newAccessToken, csrfToken });
};
