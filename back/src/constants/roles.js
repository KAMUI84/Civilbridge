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

export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

export const VERIFIED_ACCOUNT_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "PROFESSIONAL",
  "ENGINEER",
  "ARCHITECT",
  "CONTRACTOR",
  "SUPPLIER",
];

export const EXPERT_ROLES = [
  "PROFESSIONAL",
  "ENGINEER",
  "ARCHITECT",
  "CONTRACTOR",
  "SUPPLIER",
];

export function normalizeRole(role) {
  return String(role || "").trim().toUpperCase();
}

export function normalizeRoles(...inputs) {
  return [...new Set(inputs.flat(Infinity).map(normalizeRole).filter(Boolean))];
}

export function isValidRole(role) {
  return ALL_USER_ROLES.includes(normalizeRole(role));
}

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(normalizeRole(role));
}
