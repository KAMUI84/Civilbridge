import PageShell from "../../components/common/PageShell";
import { getUser } from "../../store/authStore";

export default function Profile() {
  const user = getUser();
  return (
    <PageShell title="Profile" subtitle="Your account details, role, and verification status.">
      <div style={{ display: "grid", gap: 10, color: "#3a4357", fontWeight: 650 }}>
        <Line k="Name" v={user?.full_name || "-"} />
        <Line k="Role" v={user?.role || "USER"} />
        <Line k="Verification" v={user?.verified ? "Verified" : "Pending"} />
      </div>
    </PageShell>
  );
}
function Line({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderRadius: 14, border: "1px solid #eef0f4", background: "#f7f9ff" }}>
      <b style={{ color: "#0c1220" }}>{k}</b>
      <span>{v}</span>
    </div>
  );
}