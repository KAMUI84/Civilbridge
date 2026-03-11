import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from "../../store/authStore";
import { api } from "../../services/apiClientService";
import civilbridge from "/civilbridge.png";

const STEP_DETAILS = 1;
const STEP_OTP = 2;

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP_DETAILS);
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

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

      const data = await api.post("/api/auth/register/request-otp", payload);

      if (data.success) {
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

      const data = await api.post("/api/auth/register", payload);

      if (data.success && data.token && data.user) {
        localStorage.setItem("cb_token", data.token);
        useAuthStore.getState().setUser(data.user);
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (e2) {
      setErr(e2?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const googleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErr('');
      try {
        const data = await api.post("/api/auth/google-login", { credential: tokenResponse.access_token });
        if (data.success && data.token && data.user) {
          localStorage.setItem("cb_token", data.token);
          useAuthStore.getState().setUser(data.user);
          navigate("/dashboard", { replace: true });
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        setErr(error.message || 'Google signup failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setErr('Google signup failed. Please try again.');
      setLoading(false);
    },
    flow: 'implicit',
  });

  const handleGoogleClick = () => {
    if (!loading) {
      setLoading(true);
      googleSignIn();
    }
  }

  return (
    <div style={S.page}>
      {/* ── LEFT: Form Panel ── */}
      <div style={S.left}>
        <div style={S.formWrap}>
          {/* Logo */}
          <div style={S.logoRow}>
            <div style={S.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" stroke="#00f2ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={S.logoText}>CivilBridge</span>
          </div>

          {step === STEP_DETAILS ? (
            <>
              {/* Heading */}
              <h1 style={S.heading}>Create an account</h1>
              <p style={S.subtext}>Join CivilBridge to unlock your platform access</p>

              {/* Google */}
              <button type="button" onClick={handleGoogleClick} style={S.googleBtn} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09a6.97 6.97 0 0 1 0-4.18V7.07H2.18A11.01 11.01 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Sign up with Google</span>
              </button>

              {/* Divider */}
              <div style={S.divider}>
                <div style={S.divLine} />
                <span style={S.divText}>OR</span>
                <div style={S.divLine} />
              </div>

              {/* Error */}
              {err && <div style={S.error}>{err}</div>}

              {/* Form */}
              <form onSubmit={requestOtp} style={S.form}>
                <label style={S.label}>
                  Full Name
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="John Doe"
                    style={S.input}
                    required
                  />
                </label>

                <label style={S.label}>
                  Email or Phone
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={e => setEmailOrPhone(e.target.value)}
                    placeholder="you@example.com / +250..."
                    style={S.input}
                    required
                  />
                </label>

                <label style={S.label}>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={S.input}
                    required
                  />
                </label>

                <button type="submit" disabled={loading} style={S.submitBtn}>
                  {loading ? 'Sending code…' : 'Continue'}
                </button>
              </form>

              {/* Footer */}
              <p style={S.footer}>
                Already have an account?{' '}
                <Link to="/login" style={S.footerLink}>Log in</Link>
              </p>
            </>
          ) : (
            <>
              {/* Heading */}
              <h1 style={S.heading}>Check your inbox</h1>
              <p style={S.subtext}>Enter the 6-digit code sent to {emailOrPhone}</p>

              {/* Error */}
              {err && <div style={S.error}>{err}</div>}

              {devOtp && (
                <div style={S.devOtpBox}>
                  <strong>🔑 DEV MODE OTP:</strong> <span style={{ fontSize: 24, letterSpacing: 4, display: 'block', marginTop: 6 }}>{devOtp}</span>
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={verifyAndRegister} style={S.form}>
                <label style={S.label}>
                  Verification Code
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    style={S.input}
                    required
                    autoFocus
                  />
                </label>

                <button type="submit" disabled={loading} style={S.submitBtn}>
                  {loading ? 'Verifying…' : 'Verify & Create Account'}
                </button>

                <button 
                  type="button" 
                  onClick={() => setStep(STEP_DETAILS)}
                  style={S.backBtn}
                >
                  Go Back
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT: Branding Panel ── */}
      <div style={S.right}>
        <div style={S.brandOverlay} />
        <div style={S.brandContent}>
          <img src={civilbridge} alt="CivilBridge Logo" style={S.brandLogoImage} />
        </div>
      </div>
    </div>
  );
}

/* ── Inline Styles ── */
const accent = '#00f2ff';

const S = {
  page: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    minHeight: '100vh',
    background: '#050505',
    fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
  },

  /* LEFT */
  left: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
  },
  formWrap: {
    width: '100%',
    maxWidth: 400,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 40,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'rgba(0,242,255,.08)',
    border: '1px solid rgba(0,242,255,.15)',
    display: 'grid',
    placeItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 700,
    color: '#f0f0f0',
    letterSpacing: '-0.02em',
  },
  heading: {
    margin: '0 0 6px',
    fontSize: 28,
    fontWeight: 700,
    color: '#f0f0f0',
    letterSpacing: '-0.03em',
  },
  subtext: {
    margin: '0 0 28px',
    fontSize: 14,
    color: '#64748b',
    fontWeight: 400,
  },

  /* Google */
  googleBtn: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    background: '#171717',
    border: '1px solid #262626',
    borderRadius: 10,
    color: '#d4d4d8',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'border-color .2s, background .2s',
  },

  /* Divider */
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '22px 0',
  },
  divLine: {
    flex: 1,
    height: 1,
    background: '#262626',
  },
  divText: {
    fontSize: 11,
    fontWeight: 700,
    color: '#525252',
    letterSpacing: '.08em',
  },

  /* Error */
  error: {
    padding: '10px 14px',
    marginBottom: 16,
    borderRadius: 8,
    background: 'rgba(239,68,68,.08)',
    border: '1px solid rgba(239,68,68,.18)',
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: 500,
  },

  devOtpBox: {
    padding: 16,
    borderRadius: 12,
    background: 'rgba(34,197,94,.08)',
    border: '1px solid rgba(34,197,94,.18)',
    color: '#86efac',
    fontWeight: 700,
    marginBottom: 20,
    textAlign: 'center',
  },

  /* Form */
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#a1a1aa',
  },
  input: {
    width: '100%',
    height: 44,
    padding: '0 14px',
    background: '#1a1a1a',
    border: '1px solid #262626',
    borderRadius: 10,
    color: '#f0f0f0',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color .2s',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%',
    height: 44,
    background: accent,
    color: '#050505',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
    transition: 'opacity .2s',
    marginTop: 4,
  },
  backBtn: {
    width: '100%',
    height: 44,
    background: 'transparent',
    color: '#a1a1aa',
    border: '1px solid #262626',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'border-color .2s',
  },

  /* Footer */
  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 13,
    color: '#64748b',
  },
  footerLink: {
    color: accent,
    fontWeight: 600,
    textDecoration: 'none',
  },

  /* RIGHT */
  right: {
    position: 'relative',
    background: '#0a0f1a',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(600px 400px at 70% 30%, rgba(0,242,255,.06), transparent 65%), radial-gradient(500px 350px at 30% 70%, rgba(59,130,246,.05), transparent 60%)',
    pointerEvents: 'none',
  },
  brandContent: {
    position: 'relative',
    zIndex: 1,
    padding: '48px 40px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  brandLogoImage: {
    width: '100%',
    maxWidth: 480,
    height: 'auto',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 60px rgba(0, 242, 255, 0.15))',
    display: 'block',
    margin: '0 auto',
  },
};