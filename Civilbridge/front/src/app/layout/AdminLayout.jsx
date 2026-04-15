import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/users", label: "Users Management" },
  { to: "/admin/verification", label: "Verification Queue" },
  { to: "/admin/plans", label: "Plans Moderation" },
  { to: "/admin/listings", label: "Listings Moderation" },
];

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px 12px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 14,
  color: isActive ? "#1a1a2e" : "#4b5563",
  background: isActive ? "#1a1a2e14" : "transparent",
  border: isActive ? "1px solid #1a1a2e25" : "1px solid transparent",
  transition: "all .18s ease",
});

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function pageTitle(pathname) {
  const map = {
    "/admin": "Admin Overview",
    "/admin/users": "Users Management",
    "/admin/verification": "Verification Queue",
    "/admin/plans": "Plans Moderation",
    "/admin/listings": "Listings Moderation",
  };
  return map[pathname] ?? "Admin Panel";
}

const HEADER_H = 62;
const SIDEBAR_W = 260;

export default function AdminLayout() {
  const { user, role, logout } = useAuth();
  const { pathname } = useLocation();

  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) return <Navigate to="/dashboard" replace />;

  return (
    <div style={styles.shell}>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.logoRow}>
          <div style={styles.logoDot} />
          <span style={styles.logoText}>CivilBridge</span>
          <span style={styles.adminPill}>Admin</span>
        </div>

        <div style={styles.pageTitle}>{pageTitle(pathname)}</div>

        <div style={styles.headerRight}>
          <div style={styles.roleBadge}>Full Platform Control</div>
          <div style={styles.avatar}>{initials(user?.full_name || "A")}</div>
          <button style={styles.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </header>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div style={styles.body}>
        <aside style={styles.sidebar}>
          <div style={styles.userBlock}>
            <div style={styles.sidebarAvatar}>{initials(user?.full_name || "A")}</div>
            <div>
              <div style={styles.userName}>{user?.full_name || "Administrator"}</div>
              <div style={styles.userRole}>Administrator</div>
            </div>
          </div>

          <div style={styles.divider} />

          <nav style={{ display: "grid", gap: 4 }}>
            {ADMIN_NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} style={linkStyle}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main style={styles.outlet}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  shell: {
    display: "grid",
    gridTemplateRows: `${HEADER_H}px 1fr`,
    minHeight: "100vh",
    background: "#f4f6fb",
  },
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
  logoRow: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  logoDot: {
    width: 12, height: 12, borderRadius: "50%",
    background: "linear-gradient(135deg,#1a1a2e,#3a3a5e)",
  },
  logoText: { fontWeight: 900, fontSize: 17, color: "#0c1220", letterSpacing: "-0.4px" },
  adminPill: {
    background: "#1a1a2e",
    color: "#fff",
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: 100,
    letterSpacing: "0.5px",
  },
  pageTitle: { flex: 1, fontWeight: 800, fontSize: 16, color: "#0c1220", letterSpacing: "-0.3px" },
  headerRight: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
  roleBadge: {
    padding: "4px 12px",
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 800,
    color: "#1a1a2e",
    background: "#f1f5f9",
    border: "1px solid #1a1a2e30",
  },
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "#1a1a2e", color: "#fff",
    fontWeight: 900, fontSize: 13,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  logoutBtn: {
    padding: "6px 14px", borderRadius: 10,
    border: "1.5px solid #e5e7eb", background: "#fff",
    color: "#374151", fontWeight: 700, fontSize: 13, cursor: "pointer",
  },
  body: {
    display: "grid",
    gridTemplateColumns: `${SIDEBAR_W}px 1fr`,
    height: `calc(100vh - ${HEADER_H}px)`,
    overflow: "hidden",
  },
  sidebar: {
    borderRight: "1px solid #e5e7eb",
    background: "#ffffff",
    padding: "16px 14px",
    overflowY: "auto",
    height: "100%",
  },
  userBlock: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 4px", marginBottom: 8,
  },
  sidebarAvatar: {
    width: 38, height: 38, borderRadius: 10,
    background: "#1a1a2e", color: "#fff",
    fontWeight: 900, fontSize: 14,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  userName: { fontWeight: 800, fontSize: 14, color: "#0c1220", letterSpacing: "-0.2px", lineHeight: 1.2 },
  userRole: { fontSize: 11, fontWeight: 700, marginTop: 2, color: "#1a1a2e", letterSpacing: "0.2px" },
  divider: { height: 1, background: "#f0f0f4", margin: "12px 0" },
  outlet: { overflowY: "auto", padding: "24px", height: "100%" },
};
