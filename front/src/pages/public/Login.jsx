import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import GoogleButton from "../../components/auth/GoogleButton";
import civilbridge from "/civilbridge.png";
import SEO from "../../components/seo/SEO";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const [authMethod, setAuthMethod] = useState("choice");
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
    } catch (error) {
      setErr(error?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.page}>
      <SEO title="Sign In" description="Sign in to your CivilBridge account." noindex />
      <div style={S.left}>
        <div style={S.formWrap}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={S.logoText}>CivilBridge</span>
          </div>

          <h1 style={S.heading}>Welcome back</h1>
          <p style={S.subtext}>
            Choose your preferred sign-in method. Google is fastest; email works on any device.
          </p>

          {err && <div style={S.error}>{err}</div>}

          {authMethod === "choice" && (
            <div style={S.methodGrid}>
              <button type="button" style={S.methodBtn} onClick={() => setAuthMethod("google")}>
                Continue with Google
              </button>
              <button type="button" style={S.methodBtn} onClick={() => setAuthMethod("email")}>
                Sign in with email
              </button>
            </div>
          )}

          {authMethod === "google" && (
            <>
              <div style={S.onboardingHint}>
                Tip: Google sign-in helps prevent fake accounts and keeps your access secure.
              </div>
              <GoogleButton onCredential={handleGoogleLogin} />
              <div style={S.switchRow}>
                <button type="button" style={S.switchBtn} onClick={() => setAuthMethod("email")}>Use email instead</button>
              </div>
            </>
          )}

          {authMethod === "email" && (
            <>
              <div style={S.onboardingHint}>Sign in with your registered email and password.</div>
              <form onSubmit={onSubmit} style={S.form}>
                <label style={S.label}>Email
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={S.input} required autoComplete="email" />
                </label>
                <label style={S.label}>Password
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={S.input} required autoComplete="current-password" />
                </label>

                <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginTop: -6, marginBottom: 8 }}>
                  <Link to="/forgot-password" style={S.forgotPassword}>Forgot password?</Link>
                </div>

                <button type="submit" disabled={loading} style={{ ...S.submitBtn, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
              <div style={S.switchRow}>
                <button type="button" style={S.switchBtn} onClick={() => setAuthMethod("google")}>Use Google instead</button>
              </div>
            </>
          )}

          <p style={S.footer}>Don't have an account? <Link to="/register" style={S.footerLink}>Sign up</Link></p>
        </div>
      </div>

      <div style={S.right}>
        <div style={S.brandOverlay} />
        <div style={S.brandContent}>
          <img src={civilbridge} alt="CivilBridge Logo" style={S.brandLogoImage} />
        </div>
      </div>
    </div>
  );
}

const accent = '#3b82f6';
const S = {
  page: { display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', sans-serif" },
  left: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', background: '#ffffff' },
  formWrap: { width: '100%', maxWidth: 400 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.25)', display: 'grid', placeItems: 'center' },
  logoText: { fontSize: 16, fontWeight: 700, color: '#1a1a1a' },
  heading: { margin: '0 0 6px', fontSize: 28, fontWeight: 700, color: '#1a1a1a' },
  subtext: { margin: '0 0 28px', fontSize: 14, color: '#6b7280' },
  methodGrid: { display: 'grid', gap: 14, marginBottom: 20 },
  methodBtn: { width: '100%', minHeight: 48, borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'border-color 0.2s ease, transform 0.2s ease', boxShadow: '0 8px 20px rgba(15,23,42,.05)' },
  onboardingHint: { marginBottom: 18, padding: '12px 14px', borderRadius: 10, background: '#f8fafc', color: '#475569', fontSize: 13, lineHeight: 1.5 },
  switchRow: { marginTop: 18, display: 'flex', justifyContent: 'center' },
  switchBtn: { border: 'none', background: 'transparent', color: accent, fontWeight: 700, cursor: 'pointer', fontSize: 13, textDecoration: 'underline' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' },
  divLine: { flex: 1, height: 1, background: '#e5e7eb' },
  divText: { fontSize: 11, fontWeight: 700, color: '#9ca3af' },
  error: { padding: '10px 14px', marginBottom: 16, borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', fontSize: 13 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#1a1a1a' },
  input: { width: '100%', height: 44, padding: '0 14px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#1a1a1a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease' },
  submitBtn: { width: '100%', height: 44, background: accent, color: '#ffffff', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginTop: 4, border: 'none', transition: 'background-color 0.2s ease', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' },
  forgotPassword: { color: '#6b7280', fontWeight: 600, fontSize: 12, cursor: 'pointer', outline: 'none', textDecoration: 'none' },
  footer: { marginTop: 28, textAlign: 'center', fontSize: 13, color: '#6b7280' },
  footerLink: { color: accent, fontWeight: 600, textDecoration: 'none' },
  right: { position: 'relative', background: '#f8fafc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandOverlay: { position: 'absolute', inset: 0, background: 'radial-gradient(600px 400px at 70% 30%, rgba(59,130,246,.1), transparent 65%)', pointerEvents: 'none' },
  brandContent: { position: 'relative', zIndex: 1, padding: '48px 40px', width: '100%', display: 'flex', justifyContent: 'center' },
  brandLogoImage: { width: '100%', maxWidth: 480, height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 60px rgba(59, 130, 246, 0.25))' },
};
