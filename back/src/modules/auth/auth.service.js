import prisma from "../../config/prisma.js";
import { hashPassword } from "../../utils/password.js";
import { generateToken, generateRefreshToken, hashToken, refreshTokenExpiresAt } from "../../utils/jwt.js";
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

  await prisma.oTPCode.deleteMany({
    where: { target, purpose: "register" }
  });

  await prisma.oTPCode.create({
    data: {
      target,
      otpHash,
      purpose: "register",
      expiresAt
    }
  });

  // Only show OTP in development mode for testing
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${target}: ${otp}`);
  }
  
  return { otp, expiresAt };
}

export async function verifyRegistrationOtp(target, otp) {
  const row = await prisma.oTPCode.findFirst({
    where: { target, purpose: "register" },
    orderBy: { id: "desc" }
  });

  if (!row) throw new Error("No OTP found. Request a new one.");

  if (row.expiresAt.getTime() < Date.now()) {
    throw new Error("OTP expired. Request a new one.");
  }

  if (row.attempts >= 5) {
    throw new Error("Too many attempts. Request a new OTP.");
  }

  const ok = row.otpHash === hashOtp(otp);
  if (!ok) {
    await prisma.oTPCode.update({
      where: { id: row.id },
      data: { attempts: { increment: 1 } }
    });
    throw new Error("Invalid OTP.");
  }

  await prisma.oTPCode.delete({ where: { id: row.id } });
  return true;
}

/**
 * Create a UserSession row for a newly issued refresh token.
 * Returns the plain-text refresh token to be placed in the cookie.
 */
export async function createSession(userId, req) {
  const refreshToken = generateRefreshToken();
  await prisma.userSession.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiresAt(),
      deviceInfo: req.headers?.["user-agent"]?.slice(0, 255) ?? null,
      ipAddress:  req.ip ?? null,
    },
  });
  return refreshToken;
}

export async function createUser(userData) {
  // Log exactly what the service receives
  console.log("Service received userData:", userData);

  const { fullname, fullName, full_name, email, phone, password } = userData;
  const finalName = fullname || fullName || full_name;

  if (!finalName || finalName.trim() === "") {
    throw new Error("fullname is required to create a user");
  }
  
  if (!password) {
    throw new Error("password is required to create a user");
  }

  // 🔒 SECURITY: Force CLIENT role for all new registrations
  // Users cannot choose their own role - only admins can assign roles
  const forcedRole = "CLIENT";

  const hashed = await hashPassword(password);

  // 3. Perform Database Transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName: finalName, 
        email: email || null,
        phone: phone || null,
        passwordHash: hashed,
        role: forcedRole, // 🔒 Forced to CLIENT - no user choice
        verificationStatus: "VERIFIED"
      }
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "REGISTER"
      }
    });

    return user;
  });

  // 4. Generate token and return response object
  const token = generateToken({ id: result.id.toString(), role: forcedRole });

  return {
    token,
    user: { 
      id: result.id.toString(), 
      full_name: result.fullName, 
      email: result.email, 
      phone: result.phone, 
      role: forcedRole 
    }
  };  
}
