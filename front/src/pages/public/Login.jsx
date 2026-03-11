import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GoogleButton from "../../components/auth/GoogleButton";
import civilbridge from "/civilbridge.png";

export default function Login() {
  const nav = useNavigate();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!email || !password) throw new Error("Enter email and password.");

      await login({ email, password });
      // Navigation is handled by the AuthContext
    } catch (error) {
      setErr(error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(credential) {
    setErr("");
    setLoading(true);

    try {
      await googleLogin(credential);
      // Navigation is handled by the AuthContext
    } catch (error) {
      setErr(error?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 60, alignItems: "center", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ flex: 1 }}>
        {err ? <div style={errBox}>{err}</div> : null}

        <GoogleButton onCredential={handleGoogleLogin} />

        <div style={orRow}>
          <div style={orLine} />
          <div style={orText}>or</div>
          <div style={orLine} />
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 30 }}>
          <label style={labelStyle}>
            Email
            <input
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
            />
          </label>

          <label style={labelStyle}>
            Password
            <input
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.8 : 1 }} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div style={{ color: "#64708a", fontWeight: 650, fontSize: 12, marginLeft: 20 }}>
            Forgot password?
          </div>
        </form>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img 
          src={civilbridge} 
          alt="CivilBridge" 
          style={{ 
            maxWidth: "100%", 
            height: "auto",
            maxHeight: 400,
            objectFit: "contain"
          }} 
        />
      </div>
    </div>
  );
}

const labelStyle = { display: "grid", gap: 12, fontWeight: 900, color: "#0c1220", fontSize: 18, margin: 10 };
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid #e9ecf2",
  outline: "none",
  fontWeight: 750,
};
const btnPrimary = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
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
const orRow = { display: "flex", alignItems: "center", gap: 10, margin: "14px 0" };
const orLine = { height: 1, background: "#eef0f4", flex: 1 };
const orText = { color: "#94a3b8", fontWeight: 900, fontSize: 12 };