import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';

/* ──────────────────────────────────────────────
   CivilBridge – Premium Dark Forgot Password
   ────────────────────────────────────────────── */

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      if (!email) throw new Error('Email is required');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address');

      await authService.requestPasswordReset(email);
      setSuccess(true);
    } catch (error) {
      setErr(error?.message || 'Failed to send reset link');
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

          {!success ? (
            <>
              {/* Heading */}
              <h1 style={S.heading}>Reset Password</h1>
              <p style={S.subtext}>Enter your email to receive a reset link</p>

              {err && <div style={S.error}>{err}</div>}

              {/* Form */}
              <form onSubmit={handleSubmit} style={S.form}>
                <label style={S.label}>
                  Email Address
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={S.input}
                    required
                  />
                </label>

                <button type="submit" disabled={loading} style={S.submitBtn}>
                  {loading ? 'Sending link…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div style={S.successBox}>
              <div style={S.successIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#00f2ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={S.successHeading}>Check your email</h2>
              <p style={S.successText}>
                We've sent a password reset link to<br />
                <span style={{ color: '#00f2ff', fontWeight: 600 }}>{email}</span>
              </p>
              <button
                onClick={() => { setSuccess(false); setEmail(''); }}
                style={{ ...S.submitBtn, background: '#1a1a1a', border: '1px solid #262626', color: '#f0f0f0' }}
              >
                Send Another Link
              </button>
            </div>
          )}

          {/* Footer */}
          <p style={S.footer}>
            Remember your password?{' '}
            <Link to="/login" style={S.footerLink}>Back to Login</Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT: Branding Panel ── */}
      <div style={S.right}>
        <div style={S.brandOverlay} />
        <div style={S.brandContent}>
          <h2 style={S.brandStat}>
            Build Smarter,<br />Build with Data.
          </h2>
          <p style={S.brandDesc}>
            Join thousands of construction professionals using CivilBridge to plan, estimate, and build with precision in Rwanda.
          </p>
          <div style={S.brandChips}>
            <span style={S.chip}>✅ Free to start</span>
            <span style={S.chip}>🔒 Bank-grade security</span>
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
  successBox: {
    background: '#171717',
    border: '1px solid #262626',
    borderRadius: 12,
    padding: '32px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'rgba(0,242,255,.08)',
    display: 'grid',
    placeItems: 'center',
    marginBottom: 16,
  },
  successHeading: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f0f0f0',
    margin: '0 0 10px',
  },
  successText: {
    fontSize: 14,
    color: '#94a3b8',
    margin: '0 0 24px',
    lineHeight: 1.6,
  },
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
