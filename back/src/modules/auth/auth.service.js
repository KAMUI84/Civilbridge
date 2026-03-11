import prisma from "../../config/prisma.js";
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

  console.log(`[DEV] OTP for ${target}: ${otp}`);
  
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

export async function createUser(userData) {
  const { full_name, email, phone, password } = userData;
  
  const hashed = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName: full_name,
        email: email || null,
        phone: phone || null,
        passwordHash: hashed,
        role: "USER",
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

  const token = generateToken({ id: result.id.toString(), role: "USER" });

  return {
    token,
    user: { 
      id: result.id.toString(), 
      full_name: result.fullName, 
      email: result.email, 
      phone: result.phone, 
      role: "USER" 
    }
  };
}
