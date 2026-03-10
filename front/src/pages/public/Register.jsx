import { useState } from "react";
import { setAuth } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import GoogleButton from "../../components/auth/GoogleButton";

const STEP_DETAILS = 1;
const STEP_OTP = 2;

export default function Register() {
  const [step, setStep] = useState(STEP_DETAILS);
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const nav = useNavigate();

  async function requestOtp(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!fullName || !emailOrPhone || !password) throw new Error("Fill all fields.");

      const isEmail = emailOrPhone.includes("@");
      const payload = {};

      if (isEmail) {
        payload.email = emailOrPhone;
      } else {
        payload.phone = emailOrPhone;
      }

      const data = await api("/api/auth/register/request-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data.success) {
        setOtpSent(true);
        setStep(STEP_OTP);
        setErr("");
        setDevOtp(data.otp);
        console.log("[DEV] OTP:", data.otp);
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (e2) {
      setErr(e2?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndRegister(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!otp) throw new Error("Enter OTP code.");

      const isEmail = emailOrPhone.includes("@");
      const payload = {
        full_name: fullName,
        password,
        otp
      };

      if (isEmail) {
        payload.email = emailOrPhone;
      } else {
        payload.phone = emailOrPhone;
      }

      const data = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data.success && data.token && data.user) {
        setAuth({ token: data.token, user: data.user });
        nav("/dashboard", { replace: true });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (e2) {
      setErr(e2?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(credential) {
    setErr("");
    setLoading(true);

    try {
      const data = await api("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential }),
      });

      if (data.success && data.token && data.user) {
        setAuth({ token: data.token, user: data.user });
        nav("/dashboard", { replace: true });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (e2) {
      setErr(e2?.message || "Google registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (step === STEP_OTP) {
    return (
      <div>
        {err ? <div style={errBox}>{err}</div> : null}

        <div style={{ marginBottom: 20, color: "#0c1220", fontWeight: 700 }}>
          Enter the 6-digit code sent to {emailOrPhone}
        </div>

        {devOtp && (
          <div style={devOtpBox}>
            <strong>🔑 DEV MODE - Your OTP:</strong> <span style={{ fontSize: 24, letterSpacing: 4 }}>{devOtp}</span>
          </div>
        )}

        <form onSubmit={verifyAndRegister} style={{ display: "grid", gap: 12 }}>
          <label style={labelStyle}>
            OTP Code
            <input
              style={inputStyle}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              autoFocus
            />
          </label>

          <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.8 : 1 }} disabled={loading}>
            {loading ? "Verifying..." : "Verify & Create Account"}
          </button>

          <button 
            type="button" 
            onClick={() => setStep(STEP_DETAILS)}
            style={{ ...btnSecondary }}
          >
            Back
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      {err ? <div style={errBox}>{err}</div> : null}

      <GoogleButton onCredential={handleGoogleLogin} />

      <div style={orRow}>
        <div style={orLine} />
        <div style={orText}>or</div>
        <div style={orLine} />
      </div>

      <form onSubmit={requestOtp} style={{ display: "grid", gap: 12 }}>
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
            placeholder="email or +250..."
            autoComplete="email"
          />
        </label>

        <label style={labelStyle}>
          Password
          <input
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
          />
        </label>

        <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.8 : 1 }} disabled={loading}>
          {loading ? "Sending OTP..." : "Continue"}
        </button>

      </form>
    </div>
  );
}

const labelStyle = { display: "grid", gap: 6, fontWeight: 900, color: "#0c1220", fontSize: 13 };
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

const googleBtn = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e9ecf2",
  background: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const gIcon = {
  width: 28,
  height: 28,
  borderRadius: 10,
  border: "1px solid #eef0f4",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
};

const orRow = { display: "flex", alignItems: "center", gap: 10, margin: "14px 0" };
const orLine = { height: 1, background: "#eef0f4", flex: 1 };
const orText = { color: "#94a3b8", fontWeight: 900, fontSize: 12 };

const btnSecondary = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e9ecf2",
  background: "#fff",
  color: "#0c1220",
  fontWeight: 900,
  cursor: "pointer",
};

const devOtpBox = {
  padding: 16,
  borderRadius: 12,
  background: "#f0fdf4",
  border: "2px solid #86efac",
  color: "#166534",
  fontWeight: 700,
  marginBottom: 20,
  textAlign: "center",
};