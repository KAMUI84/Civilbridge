import { NavLink, Outlet, Navigate } from "react-router-dom";
import { getUser } from "../../store/authStore";

const linkStyle = ({ isActive }) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 850,
  color: isActive ? "#0c1220" : "#3a4357",
  background: isActive ? "#f7f8fb" : "transparent",
  border: isActive ? "1px solid #eef0f4" : "1px solid transparent",
  transition: "all .2s ease",
});

function Icon({ children }) {
  return (
    <span style={{ width: 18, height: 18, display: "inline-flex" }}>{children}</span>
  );
}

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-18v6h8V3h-8Z" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  estimates: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M7 3h10v18H7V3Z" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  docs: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l3 3v15H7V3Z" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  team: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M16 11a4 4 0 1 0-8 0" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M4 21c1.2-3.5 4.2-6 8-6s6.8 2.5 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  permits: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8 8h8v8H8V8Z" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
};

export default function DashboardLayout() {
  const user = getUser();
  const role = user?.role || "USER";

  // If ADMIN, force them to use /admin (unique dashboard)
  if (role === "ADMIN") return <Navigate to="/admin" replace />;

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: icons.dashboard, roles: ["USER","ENGINEER","CONTRACTOR","SUPPLIER","STUDENT"] },
    { to: "/dashboard/projects", label: "Projects", icon: icons.projects, roles: ["USER","ENGINEER","CONTRACTOR"] },
    { to: "/dashboard/estimates", label: "BOQs & Estimates", icon: icons.estimates, roles: ["USER","ENGINEER","CONTRACTOR"] },
    { to: "/dashboard/documents", label: "Documents", icon: icons.docs, roles: ["USER","ENGINEER","CONTRACTOR","SUPPLIER"] },
    { to: "/dashboard/team", label: "Project Team", icon: icons.team, roles: ["CONTRACTOR"] },
    { to: "/dashboard/permits", label: "Permits", icon: icons.permits, roles: ["ENGINEER"] },
    { to: "/dashboard/ai-studio", label: "AI Studio (Beta)", icon: icons.ai, roles: ["USER","ENGINEER","CONTRACTOR","SUPPLIER","STUDENT"] },
  ];

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "16px 18px 28px",
        display: "grid",
        gridTemplateColumns: "270px 1fr",
        gap: 14,
      }}
    >
      <aside
        style={{
          border: "1px solid #eef0f4",
          borderRadius: 18,
          background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
          padding: 14,
          height: "calc(100vh - 110px)",
          position: "sticky",
          top: 84,
          overflow: "auto",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 950, color: "#0c1220", fontSize: 16 }}>
            {user?.full_name || "Your Account"}
          </div>
          <div style={{ color: "#64708a", fontWeight: 750, fontSize: 12 }}>
            Role: {role}
          </div>
        </div>

        <div style={{ height: 1, background: "#eef0f4", margin: "12px 0" }} />

        <div style={{ display: "grid", gap: 6 }}>
          {navItems
            .filter((item) => item.roles.includes(role))
            .map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/dashboard"} style={linkStyle}>
                <Icon>{item.icon}</Icon>
                {item.label}
              </NavLink>
            ))}
        </div>

        <div style={{ height: 1, background: "#eef0f4", margin: "12px 0" }} />

        <div style={{ display: "grid", gap: 8 }}>
          <button
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #eef0f4",
              background: "#fff",
              fontWeight: 900,
              cursor: "pointer",
              textAlign: "left",
              transition: "all .2s ease",
            }}
            onClick={() => alert("We will wire this to a request flow later.")}
          >
            Request Site Visit
          </button>

          <button
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #eef0f4",
              background: "#fff",
              fontWeight: 900,
              cursor: "pointer",
              textAlign: "left",
              transition: "all .2s ease",
            }}
            onClick={() => alert("We will wire this to support chat later.")}
          >
            Chat with Agent
          </button>
        </div>
      </aside>

      <main
        style={{
          border: "1px solid #eef0f4",
          borderRadius: 18,
          background: "#fff",
          padding: 16,
          minHeight: "calc(100vh - 110px)",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}