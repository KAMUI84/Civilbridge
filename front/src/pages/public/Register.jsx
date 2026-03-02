import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import { setAuth } from "../../store/authStore";
import { writeLS } from "../../utils/storage";
// import OtpVerify from "../../components/auth/OtpVerify";
// import { generateOtp } from "../../components/auth/otp";

export default function Register() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // If you want OTP steps later:
  // const [step, setStep] = useState("form"); // form | otp

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!fullName || !emailOrPhone || !password) return setErr("Fill all fields.");
    setLoading(true);

    try {
      // ✅ DEMO register (replace with your real API call later)
      const token = "demo_token_" + Date.now();
      const user = { full_name: fullName, contact: emailOrPhone, role: "USER", verified: true };

      writeLS("cb_token", token);
      writeLS("cb_user_profile", user);
      setAuth({ token, user });

      nav("/dashboard", { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleClick = async () => {
    const token = "google_demo_" + Date.now();
    const user = { full_name: "Google User", contact: "google", role: "USER", verified: true };

    writeLS("cb_token", token);
    writeLS("cb_user_profile", user);
    setAuth({ token, user });

    nav("/dashboard", { replace: true });
  };

  return (
    <AuthShell
      title="Create a new account"
      subtitle={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
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

      <button
        type="button"
        onClick={() => {
          // just scroll to form; keeps your “continue with email” feel
          document.getElementById("cb-email-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        style={emailBtn}
      >
        <span style={mailIconWrap}>✉</span>
        Continue with email
      </button>

      <div style={dividerRow}>
        <div style={dividerLine} />
        <div style={dividerText}>or</div>
        <div style={dividerLine} />
      </div>

      {err ? <div style={errBox}>{err}</div> : null}

      <form id="cb-email-form" onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={labelStyle}>
          Full name
          <input
            style={inputStyle}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Samuel Nizeyimana"
            autoComplete="name"
          />
        </label>

        <label style={labelStyle}>
          Email or phone
          <input
            style={inputStyle}
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="name@example.com or +250..."
            autoComplete="email"
          />
        </label>

        <label style={labelStyle}>
          Password
          <input
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            type="password"
            autoComplete="new-password"
          />
        </label>

        <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.75 : 1 }}>
          {loading ? "Creating..." : "Create account"}
        </button>

        <div style={{ color: "#64708a", fontWeight: 650, fontSize: 12, lineHeight: 1.5 }}>
          By joining, you agree to our <span style={{ color: "#1d4ed8", fontWeight: 900 }}>Terms</span> and{" "}
          <span style={{ color: "#1d4ed8", fontWeight: 900 }}>Privacy Policy</span>.
        </div>
      </form>

      {/* Later: OTP step
        {step === "otp" ? <OtpVerify target={emailOrPhone} onVerified={finish} /> : null}
      */}
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

const emailBtn = {
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

const mailIconWrap = {
  width: 26,
  height: 26,
  borderRadius: 10,
  border: "1px solid #eef0f4",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
  fontWeight: 950,
  color: "#0c1220",
};

const dividerRow = { display: "flex", alignItems: "center", gap: 10, margin: "14px 0" };
const dividerLine = { height: 1, background: "#eef0f4", flex: 1 };
const dividerText = { color: "#94a3b8", fontWeight: 900, fontSize: 12 };