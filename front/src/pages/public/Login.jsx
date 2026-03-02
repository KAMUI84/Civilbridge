import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/auth/authshell";
import { setAuth } from "../../store/authStore";
import { writeLS } from "../../utils/storage";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");

    if (!email || !password) return setErr("Enter email and password.");
    setLoading(true);

    try {
      // ✅ DEMO login (replace with your real API call later)
      const token = "demo_token_" + Date.now();
      const user = { full_name: "User", contact: email, role: "USER", verified: true };

      // ✅ MUST match authStore keys
      writeLS("cb_token", token);
      writeLS("cb_user_profile", user);
      setAuth({ token, user });

      nav("/dashboard", { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleClick = async () => {
    // UI-only for now (no real OAuth)
    const token = "google_demo_" + Date.now();
    const user = { full_name: "Google User", contact: "google", role: "USER", verified: true };

    writeLS("cb_token", token);
    writeLS("cb_user_profile", user);
    setAuth({ token, user });

    nav("/dashboard", { replace: true });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        <>
          Don’t have an account? <Link to="/register">Create one</Link>
        </>
      }
      leftTitle="Success starts here"
      leftImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
    >
      <button type="button" onClick={onGoogleClick} style={googleBtn}>
        <span style={googleIconWrap}>
          <span style={googleG}>G</span>
        </span>
        Continue with Google
      </button>

      <div style={dividerRow}>
        <div style={dividerLine} />
        <div style={dividerText}>or</div>
        <div style={dividerLine} />
      </div>

      {err ? <div style={errBox}>{err}</div> : null}

      <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
        <label style={labelStyle}>
          Email
          <input
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            type="email"
            autoComplete="email"
          />
        </label>

        <label style={labelStyle}>
          Password
          <input
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.75 : 1 }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div style={{ marginTop: 2, color: "#64708a", fontWeight: 650, fontSize: 12 }}>
          Forgot password?
        </div>
      </form>
    </AuthShell>
  );
}

const labelStyle = { display: "grid", gap: 6, fontWeight: 900, color: "#0c1220", fontSize: 13 };
const inputStyle = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid #e9ecf2",
  outline: "none",
  fontWeight: 750,
  width: "100%",
  boxSizing: "border-box",
};

const btnPrimary = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(29,78,216,0.2)",
  background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
  color: "#fff",
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 14px 26px rgba(29,78,216,.18)",
};

const errBox = {
  padding: 12,
  borderRadius: 12,
  background: "#fff1f2",
  border: "1px solid #ffe4e6",
  color: "#9f1239",
  fontWeight: 750,
};

const googleBtn = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #eef0f4",
  background: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
};

const googleIconWrap = {
  width: 26,
  height: 26,
  borderRadius: 10,
  border: "1px solid #eef0f4",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
};

const googleG = { fontWeight: 950, color: "#0c1220" };

const dividerRow = { display: "flex", alignItems: "center", gap: 10, margin: "14px 0" };
const dividerLine = { height: 1, background: "#eef0f4", flex: 1 };
const dividerText = { color: "#94a3b8", fontWeight: 900, fontSize: 12 };