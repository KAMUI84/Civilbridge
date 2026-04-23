import {
  getProfile,
  updateProfile,
  setAvatar,
  getPublicProfile as fetchPublicProfile,
} from "./profiles.service.js";

// ─── GET /api/profiles/me ─────────────────────────────────────────────────────
export const getMyProfile = async (req, res) => {
  try {
    const profile = await getProfile(req.user.id);
    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Failed to fetch profile" });
  }
};

// ─── PUT /api/profiles/me ─────────────────────────────────────────────────────
export const updateMyProfile = async (req, res) => {
  try {
    const profile = await updateProfile(req.user.id, req.body);
    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Failed to update profile" });
  }
};

// ─── POST /api/profiles/me/avatar ─────────────────────────────────────────────
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    const avatarUrl = `/uploads/${req.file.filename}`;
    const result = await setAvatar(req.user.id, avatarUrl);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Failed to upload avatar" });
  }
};

// ─── GET /api/profiles/:id ────────────────────────────────────────────────────
export const getPublicProfile = async (req, res) => {
  try {
    const profile = await fetchPublicProfile(req.params.id);
    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Failed to fetch profile" });
  }
};
