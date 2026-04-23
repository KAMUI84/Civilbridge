import prisma from "../../config/prisma.js";

export function serializeProfile(user) {
  return {
    id: user.id.toString(),
    fullName: user.fullName,
    email: user.email || null,
    phone: user.phone || null,
    role: user.role,
    verificationStatus: user.verificationStatus,
    isActive: user.isActive,
    createdAt: user.createdAt,
    avatarUrl: user.profile?.avatarUrl || null,
    bio: user.profile?.bio || null,
    profession: user.profile?.profession || null,
    addressText: user.profile?.addressText || null,
    companyName: user.profile?.companyName || null,
    licenseNumber: user.profile?.licenseNumber || null,
  };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    include: { profile: true },
  });
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return serializeProfile(user);
}

export async function updateProfile(userId, fields) {
  const bigId = BigInt(userId);
  const { full_name, phone, profession, bio, addressText, companyName, licenseNumber } = fields;

  const userUpdate = {};
  if (full_name?.trim()) userUpdate.fullName = full_name.trim();
  if (phone?.trim()) userUpdate.phone = phone.trim();

  if (Object.keys(userUpdate).length > 0) {
    await prisma.user.update({ where: { id: bigId }, data: userUpdate });
  }

  const profileData = {};
  if (profession !== undefined) profileData.profession = profession?.trim() || null;
  if (bio !== undefined) profileData.bio = bio?.trim() || null;
  if (addressText !== undefined) profileData.addressText = addressText?.trim() || null;
  if (companyName !== undefined) profileData.companyName = companyName?.trim() || null;
  if (licenseNumber !== undefined) profileData.licenseNumber = licenseNumber?.trim() || null;

  if (Object.keys(profileData).length > 0) {
    await prisma.userProfile.upsert({
      where: { userId: bigId },
      create: { userId: bigId, ...profileData },
      update: profileData,
    });
  }

  return getProfile(userId);
}

export async function setAvatar(userId, avatarUrl) {
  const bigId = BigInt(userId);
  await prisma.userProfile.upsert({
    where: { userId: bigId },
    create: { userId: bigId, avatarUrl },
    update: { avatarUrl },
  });
  return { avatarUrl };
}

export async function getPublicProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId), isActive: true },
    include: { profile: true },
  });
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return serializeProfile(user);
}
