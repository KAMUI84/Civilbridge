import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import authService from '../../services/authService';

/* ──────────────────────────────────────────────
   CivilBridge – Premium Dark Reset Password
   ────────────────────────────────────────────── */

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');
  const [tokenValid, setTokenValid] = useState(null);
  const [showPw, setShowPw] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setErr('Invalid or missing reset token');
      setTokenValid(false);
      return;
    }

    const validateToken = async () => {
      try {
        await authService.validateResetToken(token);
        setTokenValid(true);
      } catch (error) {
        setErr(error?.message || 'Invalid or expired reset token');
        setTokenValid(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      if (!password || !confirmPassword) throw new Error('Please fill in all fields');
      if (password.length < 8) throw new Error('Password must be at least 8 characters');
      if (password !== confirmPassword) throw new Error('Passwords do not match');

      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (error) {
      setErr(error?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Password Strength calculate
  const getStrength = (pw) => {
    if (pw.length === 0) return { width: '0%', color: 'transparent', label: '' };
    if (pw.length < 6) return { width: '33%', color: '#ef4444', label: 'Weak' }; // red
    if (pw.length < 8) return { width: '66%', color: '#eab308', label: 'Fair' }; // yellow
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { width: '85%', color: '#3b82f6', label: 'Good' }; // blue
    return { width: '100%', color: '#22c55e', label: 'Strong' }; // green
  };
  const strength = getStrength(password);

  // Loading state
  if (tokenValid === null) {
    return (
      <div style={S.pageSingle}>
        <div style={S.loaderWrap}>
          <div style={S.loader} />
          <p style={S.subtext}>Verifying secure link...</p>
        </div>
      </div>
    );
  }

  // Invalid Token state
  if (tokenValid === false) {
    return (
      <div style={S.pageSingle}>
        <div style={S.centerBox}>
          <div style={{ ...S.successIcon, background: 'rgba(239,68,68,.08)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
          <h2 style={S.heading}>Invalid Link</h2>
          <p style={S.subtext}>{err || 'This password reset link has expired or is invalid.'}</p>
          <button onClick={() => navigate('/forgot-password')} style={S.submitBtn}>
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  // Main UI
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

          {!success ? (
            <>
              {/* Heading */}
              <h1 style={S.heading}>Create new password</h1>
              <p style={S.subtext}>Your new password must be securely chosen.</p>

              {err && <div style={S.error}>{err}</div>}

              {/* Form */}
              <form onSubmit={handleSubmit} style={S.form}>

                {/* Password field */}
                <label style={S.label}>
                  New Password
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

                {/* Password Strength */}
                {password && (
                  <div style={S.pwStrengthWrap}>
                    <div style={S.pwBarBg}>
                      <div style={{ ...S.pwBar, width: strength.width, background: strength.color }} />
                    </div>
                    <span style={{ ...S.pwLabel, color: strength.color }}>{strength.label}</span>
                  </div>
                )}

                {/* Confirm Password */}
                <label style={S.label}>
                  Confirm Password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={S.input}
                    required
                  />
                </label>

                <button type="submit" disabled={loading} style={S.submitBtn}>
                  {loading ? 'Continuing…' : 'Update Password'}
                </button>
              </form>
            </>
          ) : (
            <div style={S.centerBox}>
              <div style={{ ...S.successIcon, background: 'rgba(34,197,94,.08)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ ...S.heading, textAlign: 'center' }}>Password Updated!</h2>
              <p style={{ ...S.subtext, textAlign: 'center', marginBottom: 24 }}>
                Your password has been successfully changed securely.
              </p>
              <button onClick={() => navigate('/login')} style={S.submitBtn}>
                Proceed to Login
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── RIGHT: Branding Panel ── */}
      <div style={S.right}>
        <div style={S.brandOverlay} />
        <div style={S.brandContent}>
          <h2 style={S.brandStat}>
            Your Progress,<br />Safely Secured.
          </h2>
          <p style={S.brandDesc}>
            CivilBridge employs enterprise-level security architecture, protecting your blueprints, project budgets, and vendor data with strict AES-256 encryption.
          </p>
          <div style={S.brandChips}>
            <span style={S.chip}>🛡️ AES-256 Encryption</span>
            <span style={S.chip}>📑 Secure Cloud</span>
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
  pageSingle: {
    display: 'flex',
    minHeight: '100vh',
    background: '#050505',
    fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
    alignItems: 'center',
    justifyContent: 'center'
  },
  loaderWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16
  },
  loader: {
    width: 32,
    height: 32,
    border: `3px solid rgba(0,242,255,0.1)`,
    borderTopColor: accent,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
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
  pwStrengthWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: -8,
  },
  pwBarBg: {
    flex: 1,
    height: 4,
    background: '#262626',
    borderRadius: 2,
    overflow: 'hidden',
  },
  pwBar: {
    height: '100%',
    transition: 'all .3s ease',
  },
  pwLabel: {
    fontSize: 12,
    fontWeight: 600,
    minWidth: 40,
    textAlign: 'right',
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
    transition: 'opacity .2s',
    marginTop: 4,
  },
  centerBox: {
    background: '#171717',
    border: '1px solid #262626',
    borderRadius: 12,
    padding: '32px 24px',
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    marginBottom: 16,
  },
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
    background: 'radial-gradient(600px 400px at 70% 30%, rgba(0,242,255,.06), transparent 65%)',
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
  },
};
// Adds a global CSS keyframe rule for the loader
const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);
