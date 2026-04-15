import prisma from "../../config/prisma.js";
import path from "path";

const BASE_URL = process.env.APP_BASE_URL || process.env.FRONTEND_URL || "http://localhost:3000";

// ─── GET /api/profiles/me ─────────────────────────────────────────────────────
export const getMyProfile = async (req, res) => {
  try {
    const userId = BigInt(req.user.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ success: true, profile: serialize(user) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// ─── PUT /api/profiles/me ─────────────────────────────────────────────────────
export const updateMyProfile = async (req, res) => {
  try {
    const userId = BigInt(req.user.id);
    const { full_name, phone, profession, bio, addressText } = req.body;

    // Update core user fields
    const userUpdate = {};
    if (full_name?.trim()) userUpdate.fullName = full_name.trim();
    if (phone?.trim())     userUpdate.phone    = phone.trim();

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where: { id: userId }, data: userUpdate });
    }

    // Upsert profile fields
    const profileData = {};
    if (profession  !== undefined) profileData.profession  = profession?.trim()   || null;
    if (bio         !== undefined) profileData.bio         = bio?.trim()          || null;
    if (addressText !== undefined) profileData.addressText = addressText?.trim()  || null;

    if (Object.keys(profileData).length > 0) {
      await prisma.userProfile.upsert({
        where:  { userId },
        create: { userId, ...profileData },
        update: profileData,
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    return res.json({ success: true, profile: serialize(updated) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

// ─── POST /api/profiles/me/avatar ─────────────────────────────────────────────
export const uploadAvatar = async (req, res) => {
  try {
    const userId = BigInt(req.user.id);
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    const avatarUrl = `/uploads/${req.file.filename}`;

    await prisma.userProfile.upsert({
      where:  { userId },
      create: { userId, avatarUrl },
      update: { avatarUrl },
    });

    return res.json({ success: true, avatarUrl });
  } catch (err) {
    return res.status(500).json({ message: "Failed to upload avatar" });
  }
};

// ─── GET /api/profiles/:id ────────────────────────────────────────────────────
export const getPublicProfile = async (req, res) => {
  try {
    const userId = BigInt(req.params.id);
    const user = await prisma.user.findUnique({
      where:   { id: userId, isActive: true },
      include: { profile: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ success: true, profile: serialize(user) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// ─── Serializer ───────────────────────────────────────────────────────────────
function serialize(user) {
  return {
    id:                 user.id.toString(),
    fullName:           user.fullName,
    email:              user.email || null,
    phone:              user.phone || null,
    role:               user.role,
    verificationStatus: user.verificationStatus,
    isActive:           user.isActive,
    createdAt:          user.createdAt,
    // Profile fields
    avatarUrl:    user.profile?.avatarUrl  || null,
    bio:          user.profile?.bio        || null,
    profession:   user.profile?.profession || null,
    addressText:  user.profile?.addressText|| null,
    companyName:  user.profile?.companyName|| null,
  };
}
