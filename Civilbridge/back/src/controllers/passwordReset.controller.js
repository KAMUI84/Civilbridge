import crypto from "crypto";
import prisma from "../config/prisma.js";
import { emailService } from "../services/email.service.js";
import { hashPassword } from "../utils/password.js";

function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function requestPasswordReset(req, res) {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);

    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, fullName: true, email: true },
    });

    if (!user) {
      return res.json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.oTPCode.deleteMany({
      where: {
        target: normalizedEmail,
        purpose: "reset_password",
      },
    });

    await prisma.oTPCode.create({
      data: {
        target: normalizedEmail,
        otpHash: hashResetToken(resetToken),
        purpose: "reset_password",
        expiresAt,
      },
    });

    try {
      await emailService.sendPasswordResetEmail(normalizedEmail, resetToken, user.fullName);

      res.json({
        message: "Password reset link sent to your email",
        expires_in_sec: 900,
      });
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);

      if (process.env.NODE_ENV === "production") {
        return res.status(500).json({
          error: "Email service unavailable. Please try again later.",
        });
      }

      res.json({
        message: "Password reset link sent (development mode)",
        token: resetToken,
        expires_in_sec: 900,
      });
    }
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const resetRecord = await prisma.oTPCode.findFirst({
      where: {
        otpHash: hashResetToken(token),
        purpose: "reset_password",
      },
      orderBy: { id: "desc" },
    });

    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    if (new Date(resetRecord.expiresAt).getTime() < Date.now()) {
      await prisma.oTPCode.delete({ where: { id: resetRecord.id } });
      return res.status(400).json({ error: "Reset token has expired" });
    }

    const user = await prisma.user.findUnique({
      where: { email: resetRecord.target },
      select: { id: true },
    });

    if (!user) {
      await prisma.oTPCode.delete({ where: { id: resetRecord.id } });
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.oTPCode.delete({
        where: { id: resetRecord.id },
      }),
    ]);

    res.json({
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
}

export async function validateResetToken(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const resetRecord = await prisma.oTPCode.findFirst({
      where: {
        otpHash: hashResetToken(token),
        purpose: "reset_password",
      },
      orderBy: { id: "desc" },
    });

    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid or used reset token" });
    }

    if (new Date(resetRecord.expiresAt).getTime() < Date.now()) {
      await prisma.oTPCode.delete({ where: { id: resetRecord.id } });
      return res.status(400).json({ error: "Reset token has expired" });
    }

    res.json({
      valid: true,
      expires_at: resetRecord.expiresAt,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ error: "Failed to validate reset token" });
  }
}
