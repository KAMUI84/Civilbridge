export const ALL_USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "PROFESSIONAL",
  "CLIENT",
  "ENGINEER",
  "CONTRACTOR",
  "SUPPLIER",
  "ARCHITECT",
  "HOME_BUILDER",
  "VIEWER",
  "AUDITOR",
  "FINANCE",
  "STUDENT",
];

export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];
export const EXPERT_ROLES = ["PROFESSIONAL", "ENGINEER", "ARCHITECT", "CONTRACTOR", "SUPPLIER"];
export const CLIENT_ROLES = ["CLIENT", "HOME_BUILDER"];

export function normalizeRole(role) {
  return String(role || "").trim().toUpperCase();
}

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(normalizeRole(role));
}

export function getPostLoginRoute() {
  return "/dashboard";
}

export function getRoleDashboardKey(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (normalizedRole === "ADMIN") return "ADMIN";
  if (EXPERT_ROLES.includes(normalizedRole)) return "PROFESSIONAL";
  if (CLIENT_ROLES.includes(normalizedRole)) return "CLIENT";
  if (normalizedRole === "FINANCE") return "FINANCE";
  if (normalizedRole === "AUDITOR") return "AUDITOR";
  if (normalizedRole === "VIEWER") return "VIEWER";
  if (normalizedRole === "STUDENT") return "STUDENT";

  return "CLIENT";
}

export function getRoleLabel(role) {
  return normalizeRole(role).replaceAll("_", " ");
}
