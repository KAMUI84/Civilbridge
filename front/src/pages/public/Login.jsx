import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <div style={S.page}>
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
          <p style={S.subtext}>Enter your credentials to access your account</p>

          <GoogleButton onCredential={handleGoogleLogin} />

          <div style={S.divider}><div style={S.divLine} /><span style={S.divText}>OR</span><div style={S.divLine} /></div>
          
          {err && <div style={S.error}>{err}</div>}

          <form onSubmit={onSubmit} style={S.form}>
            <label style={S.label}>Email
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={S.input} required autoComplete="email" />
            </label>
            <label style={S.label}>Password
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={S.input} required autoComplete="current-password" />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: -6, marginBottom: 8 }}>
              <div style={S.forgotPassword}>Forgot password?</div>
            </div>

            <button type="submit" disabled={loading} style={{ ...S.submitBtn, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

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
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' },
  divLine: { flex: 1, height: 1, background: '#e5e7eb' },
  divText: { fontSize: 11, fontWeight: 700, color: '#9ca3af' },
  error: { padding: '10px 14px', marginBottom: 16, borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', fontSize: 13 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#1a1a1a' },
  input: { width: '100%', height: 44, padding: '0 14px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#1a1a1a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease' },
  submitBtn: { width: '100%', height: 44, background: accent, color: '#ffffff', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginTop: 4, border: 'none', transition: 'background-color 0.2s ease', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' },
  forgotPassword: { color: '#6b7280', fontWeight: 600, fontSize: 12, cursor: 'pointer', outline: 'none', '&:hover': { color: '#1a1a1a' } },
  footer: { marginTop: 28, textAlign: 'center', fontSize: 13, color: '#6b7280' },
  footerLink: { color: accent, fontWeight: 600, textDecoration: 'none' },
  right: { position: 'relative', background: '#f8fafc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandOverlay: { position: 'absolute', inset: 0, background: 'radial-gradient(600px 400px at 70% 30%, rgba(59,130,246,.1), transparent 65%)', pointerEvents: 'none' },
  brandContent: { position: 'relative', zIndex: 1, padding: '48px 40px', width: '100%', display: 'flex', justifyContent: 'center' },
  brandLogoImage: { width: '100%', maxWidth: 480, height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 60px rgba(59, 130, 246, 0.25))' },
};