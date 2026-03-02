import PageShell from "../../components/common/PageShell";
import { logout } from "../../store/authStore";
import { primaryBtn, ghostBtn } from "../../components/common/FormUI";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const nav = useNavigate();
  return (
    <PageShell title="Settings" subtitle="Security, preferences, and logout.">
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ border: "1px solid #eef0f4", borderRadius: 16, padding: 16 }}>
          <div style={{ fontWeight: 950, color: "#0c1220" }}>Security</div>
          <div style={{ color: "#64708a", fontWeight: 650, marginTop: 6 }}>
            Email/phone verification and password reset will be added next.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            style={ghostBtn}
            onClick={() => alert("Password reset flow will be added next.")}
          >
            Reset Password
          </button>

          <button
            style={primaryBtn}
            onClick={() => {
              logout();
              nav("/");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </PageShell>
  );
}