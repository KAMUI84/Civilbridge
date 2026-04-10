import { assignRole, getUserRole } from "./roles.service.js";

// ─── POST /api/roles/assign ───────────────────────────────────────────────────
// Body: { userId: number, role: string }
// Requires: ADMIN or SUPER_ADMIN (enforced by route middleware)
export const assignRoleHandler = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: "userId and role are required" });
    }

    const result = await assignRole(req.user, userId, role);

    res.json({
      success: true,
      message: `Role successfully updated to ${result.user.role}`,
      user: result.user,
      previousRole: result.previousRole,
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Role assignment failed" });
  }
};

// ─── GET /api/roles/:userId ───────────────────────────────────────────────────
// Returns the current role for a user.
// Requires: ADMIN or SUPER_ADMIN (enforced by route middleware)
export const getUserRoleHandler = async (req, res) => {
  try {
    const user = await getUserRole(req.params.userId);
    res.json({ success: true, user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Failed to fetch user role" });
  }
};
