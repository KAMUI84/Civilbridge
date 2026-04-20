import axios from "axios";
import prisma from "../config/prisma.js";
import {
  generateToken,
  hashToken,
} from "../utils/jwt.js";
import {
  setAuthCookie,
  setRefreshCookie,
  generateCSRFToken,
} from "../utils/cookie.js";

/**
 * X (Twitter) OAuth 2.0 PKCE Login Handler
 * 
 * Exchanges authorization code for access token, retrieves user info,
 * creates or updates user in database, and returns auth tokens.
 */
export const xLogin = async (req, res) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!code) {
      return res.status(400).json({ message: "Authorization code is required" });
    }
    if (!codeVerifier) {
      return res.status(400).json({ message: "Code verifier is required" });
    }
    if (!redirectUri) {
      return res.status(400).json({ message: "Redirect URI is required" });
    }

    // ── Validate environment variables ────────────────────────────────────────
    const { X_CLIENT_ID, X_CLIENT_SECRET } = process.env;
    if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
      console.error("X OAuth credentials not configured");
      return res.status(500).json({ 
        message: "X login is not properly configured on the server" 
      });
    }

    // ── Exchange code for access token using PKCE ────────────────────────────
    let tokenResponse;
    try {
      tokenResponse = await axios.post(
        "https://api.twitter.com/2/oauth2/token",
        {
          code,
          grant_type: "authorization_code",
          client_id: X_CLIENT_ID,
          code_verifier: codeVerifier,
          redirect_uri: redirectUri,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          auth: {
            username: X_CLIENT_ID,
            password: X_CLIENT_SECRET,
          },
        }
      );
    } catch (err) {
      console.error("X token exchange failed:", err.response?.data || err.message);
      return res.status(401).json({ 
        message: "Failed to exchange authorization code with X. Please try again.",
        details: err.response?.data?.error_description || err.message
      });
    }

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(401).json({ message: "No access token received from X" });
    }

    // ── Fetch user info from X API ───────────────────────────────────────────
    let xUserData;
    try {
      const userResponse = await axios.get(
        "https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url,verified,public_metrics",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      xUserData = userResponse.data?.data;
    } catch (err) {
      console.error("Failed to fetch X user data:", err.response?.data || err.message);
      return res.status(401).json({ 
        message: "Failed to retrieve your X profile. Please try again.",
        details: err.message
      });
    }

    if (!xUserData || !xUserData.id) {
      return res.status(401).json({ message: "Invalid X user data received" });
    }

    const { id: xSub, name: xName, username: xUsername } = xUserData;

    // ── Find or create user ───────────────────────────────────────────────────
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ xSub }]
      }
    });

    let userId;
    let roleName;

    if (user) {
      // User exists: update xSub and last login
      userId = user.id;
      roleName = user.role;

      await prisma.user.update({
        where: { id: userId },
        data: { 
          xSub,
          lastLoginAt: new Date() 
        }
      });
    } else {
      // New user: create in transaction
      const createdUser = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            fullName: xName || xUsername || "X User",
            xSub,
            role: "CLIENT", // Default role
            verificationStatus: "VERIFIED", // X SSO implies verification
            lastLoginAt: new Date(),
          }
        });

        // Log the registration event
        await tx.auditLog.create({
          data: {
            userId: newUser.id,
            action: "X_REGISTER",
            details: `X (@${xUsername}) registration via OAuth`,
            ipAddress: req.ip || req.connection.remoteAddress,
          }
        });

        return newUser;
      });

      user = createdUser;
      userId = user.id;
      roleName = user.role;
    }

    // ── Generate session tokens ───────────────────────────────────────────────
    const csrfToken = generateCSRFToken();
    
    // Create session via the service or directly
    // Note: You may want to use a createSession function from auth.service.js
    const sessionToken = generateToken({ userId, role: roleName }, "30d");
    const hashedSessionToken = hashToken(sessionToken);

    await prisma.userSession.create({
      data: {
        userId,
        token: hashedSessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userAgent: req.get("user-agent") || "unknown",
        ipAddress: req.ip || req.connection.remoteAddress,
      }
    });

    // ── Generate access token ─────────────────────────────────────────────────
    const accessToken = generateToken(
      { userId, role: roleName },
      process.env.JWT_EXPIRES_IN || "15m"
    );

    // ── Set cookies ───────────────────────────────────────────────────────────
    setAuthCookie(res, accessToken);
    setRefreshCookie(res, sessionToken);
    res.cookie('csrf', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    // ── Log the login event ───────────────────────────────────────────────────
    await prisma.auditLog.create({
      data: {
        userId,
        action: "X_LOGIN",
        details: `X (@${xUsername}) login via OAuth`,
        ipAddress: req.ip || req.connection.remoteAddress,
      }
    });

    // ── Return success response ───────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "X login successful",
      token: accessToken,
      refreshToken: sessionToken,
      csrfToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        xSub,
        xUsername,
      }
    });

  } catch (err) {
    console.error("X Login Error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message || "X login failed",
    });
  }
};
