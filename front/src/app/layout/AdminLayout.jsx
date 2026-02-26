import { NavLink, Outlet, Navigate } from "react-router-dom";
import { getUser } from "../../store/authStore";

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px 12px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 850,
  color: isActive ? "#0c1220" : "#3a4357",
  background: isActive ? "#f7f8fb" : "transparent",
  border: isActive ? "1px solid #eef0f4" : "1px solid transparent",
});

export default function AdminLayout() {
  const user = getUser();
  const role = user?.role || "USER";

  if (role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 18px", display: "grid", gridTemplateColumns: "270px 1fr", gap: 14 }}>
      <aside style={{ border: "1px solid #eef0f4", borderRadius: 18, padding: 14, background: "#fff", height: "calc(100vh - 110px)", position: "sticky", top: 84 }}>
        <div style={{ fontWeight: 950, color: "#0c1220" }}>Admin Panel</div>
        <div style={{ color: "#64708a", fontWeight: 750, fontSize: 12, marginTop: 4 }}>
          Full platform control
        </div>

        <div style={{ height: 1, background: "#eef0f4", margin: "12px 0" }} />

        <div style={{ display: "grid", gap: 6 }}>
          <NavLink to="/admin" end style={linkStyle}>Overview</NavLink>
          <NavLink to="/admin/users" style={linkStyle}>Users Management</NavLink>
          <NavLink to="/admin/verification" style={linkStyle}>Verification Queue</NavLink>
        </div>
      </aside>

      <main style={{ border: "1px solid #eef0f4", borderRadius: 18, background: "#fff", padding: 16, minHeight: "calc(100vh - 110px)" }}>
        <Outlet />
      </main>
    </div>
  );
}