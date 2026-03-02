import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// Nav config: each item declares which roles can see it
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Overview",
    end: true,
    roles: ["HOME_BUILDER", "ENGINEER", "CONTRACTOR", "SUPPLIER", "STUDENT"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-18v6h8V3h-8Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    to: "/dashboard/projects",
    label: "Projects",
    roles: ["HOME_BUILDER", "ENGINEER", "CONTRACTOR"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/dashboard/estimator",
    label: "BOQs & Estimates",
    roles: ["HOME_BUILDER", "ENGINEER", "CONTRACTOR"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M7 3h10v18H7V3Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/dashboard/documents",
    label: "Documents",
    roles: ["HOME_BUILDER", "ENGINEER", "CONTRACTOR", "SUPPLIER"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M7 3h7l3 3v15H7V3Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    to: "/dashboard/permits",
    label: "Permit Guide",
    roles: ["ENGINEER", "HOME_BUILDER", "CONTRACTOR"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/dashboard/intelligence/roi",
    label: "ROI Tools",
    roles: ["HOME_BUILDER", "ENGINEER", "CONTRACTOR", "SUPPLIER"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M3 17l4-4 4 4 4-6 4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/dashboard/intelligence/ai",
    label: "AI Studio",
    roles: ["HOME_BUILDER", "ENGINEER", "CONTRACTOR", "SUPPLIER", "STUDENT"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 8h8v8H8V8Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Role display config
// ─────────────────────────────────────────────────────────────────────────────
const ROLE_META = {
  HOME_BUILDER: { label: "Home Builder", color: "#16a34a", bg: "#f0fdf4" },
  ENGINEER: { label: "Engineer", color: "#2563eb", bg: "#eff6ff" },
  CONTRACTOR: { label: "Contractor", color: "#d97706", bg: "#fffbeb" },
  SUPPLIER: { label: "Supplier", color: "#0d9488", bg: "#f0fdfa" },
  STUDENT: { label: "Student", color: "#7c3aed", bg: "#faf5ff" },
  ADMIN: { label: "Admin", color: "#1a1a2e", bg: "#f8fafc" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: page title from pathname
// ─────────────────────────────────────────────────────────────────────────────
function pageTitle(pathname) {
  const map = {
    "/dashboard": "Overview",
    "/dashboard/projects": "Projects",
    "/dashboard/estimator": "BOQs & Estimates",
    "/dashboard/documents": "Documents",
    "/dashboard/permits": "Permit Guide",
    "/dashboard/intelligence/roi": "ROI Tools",
    "/dashboard/intelligence/ai": "AI Studio",
    "/dashboard/upload-plan": "Upload Plan",
  };
  return map[pathname] ?? "Dashboard";
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar initials
// ─────────────────────────────────────────────────────────────────────────────
function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// NavLink style factory
// ─────────────────────────────────────────────────────────────────────────────
const linkStyle = (accentColor) =>
  ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
    color: isActive ? accentColor : "#4b5563",
    background: isActive ? accentColor + "12" : "transparent",
    border: isActive ? `1px solid ${accentColor}25` : "1px solid transparent",
    transition: "all .18s ease",
  });

// ─────────────────────────────────────────────────────────────────────────────
// Main Layout
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const { pathname } = useLocation();
  const meta = ROLE_META[role] ?? ROLE_META.HOME_BUILDER;

  // Admins go to their own layout
  if (role === "ADMIN") return <Navigate to="/admin" replace />;

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div style={styles.shell}>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header style={styles.header}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoDot} />
          <span style={styles.logoText}>CivilBridge</span>
        </div>

        {/* Page title */}
        <div style={styles.pageTitle}>{pageTitle(pathname)}</div>

        {/* Right side */}
        <div style={styles.headerRight}>
          {/* Role badge */}
          <div style={{ ...styles.roleBadge, color: meta.color, background: meta.bg, border: `1px solid ${meta.color}30` }}>
            {meta.label}
          </div>

          {/* User avatar */}
          <div style={{ ...styles.avatar, background: meta.color }}>
            {initials(user?.full_name || "U")}
          </div>

          {/* Logout */}
          <button style={styles.logoutBtn} onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div style={styles.body}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          {/* User info */}
          <div style={styles.userBlock}>
            <div style={{ ...styles.sidebarAvatar, background: meta.color }}>
              {initials(user?.full_name || "U")}
            </div>
            <div>
              <div style={styles.userName}>{user?.full_name || "Your Account"}</div>
              <div style={{ ...styles.userRole, color: meta.color }}>{meta.label}</div>
            </div>
          </div>

          <div style={styles.divider} />

          {/* Nav links */}
          <nav style={{ display: "grid", gap: 4 }}>
            {visibleNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={linkStyle(meta.color)}
              >
                <span style={{ display: "inline-flex", width: 18, height: 18, flexShrink: 0 }}>
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div style={styles.divider} />

          {/* Bottom actions */}
          <div style={{ display: "grid", gap: 8 }}>
            <button
              style={styles.actionBtn}
              onClick={() => alert("Request site visit flow coming soon.")}
            >
              🏗️ Request Site Visit
            </button>
            <button
              style={styles.actionBtn}
              onClick={() => alert("Agent chat coming soon.")}
            >
              💬 Chat with Agent
            </button>
          </div>
        </aside>

        {/* MAIN OUTLET */}
        <main style={styles.outlet}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const HEADER_H = 62;
const SIDEBAR_W = 260;

const styles = {
  shell: {
    display: "grid",
    gridTemplateRows: `${HEADER_H}px 1fr`,
    minHeight: "100vh",
    background: "#f4f6fb",
  },
  // Header
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    height: HEADER_H,
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    gap: 18,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    flexShrink: 0,
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#2563eb,#16a34a)",
  },
  logoText: {
    fontWeight: 900,
    fontSize: 17,
    color: "#0c1220",
    letterSpacing: "-0.4px",
  },
  pageTitle: {
    flex: 1,
    fontWeight: 800,
    fontSize: 16,
    color: "#0c1220",
    letterSpacing: "-0.3px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  roleBadge: {
    padding: "4px 12px",
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.2px",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    color: "#fff",
    fontWeight: 900,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoutBtn: {
    padding: "6px 14px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    transition: "all .18s ease",
  },
  // Body
  body: {
    display: "grid",
    gridTemplateColumns: `${SIDEBAR_W}px 1fr`,
    height: `calc(100vh - ${HEADER_H}px)`,
    overflow: "hidden",
  },
  // Sidebar
  sidebar: {
    borderRight: "1px solid #e5e7eb",
    background: "#ffffff",
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    overflowY: "auto",
    height: "100%",
  },
  userBlock: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 4px",
    marginBottom: 8,
  },
  sidebarAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    color: "#fff",
    fontWeight: 900,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userName: {
    fontWeight: 800,
    fontSize: 14,
    color: "#0c1220",
    letterSpacing: "-0.2px",
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 2,
    letterSpacing: "0.2px",
  },
  divider: {
    height: 1,
    background: "#f0f0f4",
    margin: "12px 0",
  },
  actionBtn: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    textAlign: "left",
    color: "#374151",
    transition: "all .18s ease",
  },
  // Main outlet
  outlet: {
    overflowY: "auto",
    padding: "24px",
    height: "100%",
  },
};