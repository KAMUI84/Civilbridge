import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ──────────────────────────────────────────────
   CivilBridge – Premium Dark Login
   Split-screen: left = form, right = branding
   ────────────────────────────────────────────── */

export default function ModernLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      if (!email || !password) throw new Error('Please enter email and password.');
      await login({ email, password });
    } catch (error) {
      setErr(error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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

          {/* Heading */}
          <h1 style={S.heading}>Welcome back</h1>
          <p style={S.subtext}>Sign in to your CivilBridge account</p>

          {/* Google */}
          <button type="button" style={S.googleBtn} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09a6.97 6.97 0 0 1 0-4.18V7.07H2.18A11.01 11.01 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Log in with Google</span>
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
          <form onSubmit={handleSubmit} style={S.form}>
            <label style={S.label}>
              Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={S.input}
                required
              />
            </label>

            <label style={S.label}>
              <span style={S.labelRow}>
                Password
                <Link to="/forgot-password" style={S.forgot}>Forgot password?</Link>
              </span>
              <div style={S.pwWrap}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={S.input}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={S.eyeBtn}>
                  {showPw ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  )}
                </button>
              </div>
            </label>

            <button type="submit" disabled={loading} style={S.submitBtn}>
              {loading ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          {/* Footer */}
          <p style={S.footer}>
            Don't have an account?{' '}
            <Link to="/register" style={S.footerLink}>Sign up</Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT: Branding Panel ── */}
      <div style={S.right}>
        <div style={S.brandOverlay} />
        <div style={S.brandContent}>
          <h2 style={S.brandStat}>
            Where Construction<br />Meets Intelligence.
          </h2>
          <p style={S.brandDesc}>
            AI-powered planning, verified experts, and real-time cost estimation for Rwanda's construction industry.
          </p>
          <div style={S.brandChips}>
            <span style={S.chip}>🏗️ Smart Estimation</span>
            <span style={S.chip}>📐 Plan Generation</span>
            <span style={S.chip}>👷 Expert Directory</span>
          </div>
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
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  pwWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'grid',
    placeItems: 'center',
  },
  forgot: {
    fontSize: 12,
    color: accent,
    textDecoration: 'none',
    fontWeight: 500,
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
    maxWidth: 460,
  },
  brandStat: {
    margin: '0 0 16px',
    fontSize: 36,
    fontWeight: 800,
    color: '#f0f0f0',
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
  },
  brandDesc: {
    margin: '0 0 32px',
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 1.65,
  },
  brandChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.06)',
    color: '#94a3b8',
    letterSpacing: '.01em',
  },
};
