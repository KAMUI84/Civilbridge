import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';

/* ──────────────────────────────────────────────
   CivilBridge – Premium Dark Register
   Split-screen: left = form, right = branding
   ────────────────────────────────────────────── */

export default function ModernRegister() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = info, 2 = OTP
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Password strength
  const strength = (() => {
    const p = form.password;
    if (!p) return { score: 0, label: '', color: '#333' };
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    const map = [
      { label: 'Weak', color: '#ef4444' },
      { label: 'Fair', color: '#f59e0b' },
      { label: 'Good', color: '#3b82f6' },
      { label: 'Strong', color: '#22c55e' },
    ];
    return { score: s, ...(map[s - 1] || { label: '', color: '#333' }) };
  })();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.full_name || !form.email || !form.password) return setErr('Please fill all required fields.');
    if (form.password !== form.confirmPassword) return setErr('Passwords do not match.');
    if (form.password.length < 8) return setErr('Password must be at least 8 characters.');
    if (!form.agreeTerms) return setErr('Please agree to the Terms of Service.');

    setLoading(true);
    try {
      // Step 1: Request OTP first
      await authService.requestRegisterOtp({ email: form.email, phone: form.phone });
      setStep(2);
    } catch (error) {
      setErr(error?.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setErr('');
    if (!otp || otp.length < 4) return setErr('Please enter the verification code.');
    setLoading(true);
    try {
      // Step 2: Register with the OTP
      await authService.register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        otp
      });
      navigate('/login');
    } catch (error) {
      setErr(error?.message || 'Registration failed with this code.');
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

          {step === 1 ? (
            <>
              <h1 style={S.heading}>Create your account</h1>
              <p style={S.subtext}>Start your construction journey today</p>

              {err && <div style={S.error}>{err}</div>}

              <form onSubmit={handleRegister} style={S.form}>
                {/* Full Name */}
                <label style={S.label}>
                  Full Name *
                  <input type="text" value={form.full_name} onChange={set('full_name')} placeholder="John Doe" style={S.input} required />
                </label>

                {/* Email */}
                <label style={S.label}>
                  Email Address *
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" style={S.input} required />
                </label>

                {/* Phone (optional) */}
                <label style={S.label}>
                  Phone Number
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+250 7XX XXX XXX" style={S.input} />
                </label>

                {/* Password */}
                <label style={S.label}>
                  Password *
                  <div style={S.pwWrap}>
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 8 characters" style={S.input} required />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={S.eyeBtn}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                  </div>
                  {/* Strength bar */}
                  {form.password && (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 6 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength.score ? strength.color : '#262626', transition: 'background .2s' }} />
                      ))}
                      <span style={{ fontSize: 11, fontWeight: 600, color: strength.color, marginLeft: 8 }}>{strength.label}</span>
                    </div>
                  )}
                </label>

                {/* Confirm Password */}
                <label style={S.label}>
                  Confirm Password *
                  <div style={S.pwWrap}>
                    <input type={showCpw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Re-enter password" style={S.input} required />
                    <button type="button" onClick={() => setShowCpw(!showCpw)} style={S.eyeBtn}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                  </div>
                </label>

                {/* Terms */}
                <label style={S.checkRow}>
                  <input type="checkbox" checked={form.agreeTerms} onChange={e => setForm({ ...form, agreeTerms: e.target.checked })} style={S.checkbox} />
                  <span style={S.checkText}>
                    I agree to the <Link to="/terms" style={S.link}>Terms of Service</Link> and <Link to="/privacy" style={S.link}>Privacy Policy</Link>
                  </span>
                </label>

                <button type="submit" disabled={loading} style={S.submitBtn}>
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p style={S.footer}>
                Already have an account?{' '}
                <Link to="/login" style={S.footerLink}>Log in</Link>
              </p>
            </>
          ) : (
            /* ── Step 2: OTP ── */
            <>
              <h1 style={S.heading}>Verify your email</h1>
              <p style={S.subtext}>
                We've sent a verification code to <strong style={{ color: '#f0f0f0' }}>{form.email}</strong>
              </p>

              {err && <div style={S.error}>{err}</div>}

              <form onSubmit={handleVerify} style={S.form}>
                <label style={S.label}>
                  Verification Code
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit code" maxLength={6} style={{ ...S.input, letterSpacing: '0.2em', textAlign: 'center', fontSize: 18, fontWeight: 700 }} required />
                </label>

                <button type="submit" disabled={loading} style={S.submitBtn}>
                  {loading ? 'Verifying…' : 'Verify & Continue'}
                </button>

                <button type="button" onClick={() => setStep(1)} style={S.backBtn}>
                  ← Back to registration
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
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=1000&fit=crop&auto=format"
            alt="Construction Architecture"
            style={S.brandImage}
          />
          <div style={S.brandTextOverlay}>
            <div style={S.stepTag}>
              {step === 1 ? '1 / 2 — Account Info' : '2 / 2 — Verify'}
            </div>
            <h2 style={S.brandTitle}>Join the Future of Construction</h2>
            <p style={S.brandDesc}>Create your account to access estimates, plans, permits, and verified experts in Rwanda.</p>
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
    overflowY: 'auto',
  },
  formWrap: {
    width: '100%',
    maxWidth: 420,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
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
    fontSize: 26,
    fontWeight: 700,
    color: '#f0f0f0',
    letterSpacing: '-0.03em',
  },
  subtext: {
    margin: '0 0 24px',
    fontSize: 14,
    color: '#64748b',
    fontWeight: 400,
  },

  /* Error */
  error: {
    padding: '10px 14px',
    marginBottom: 14,
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
    gap: 14,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    fontSize: 13,
    fontWeight: 600,
    color: '#a1a1aa',
  },
  input: {
    width: '100%',
    height: 42,
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
  checkRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    cursor: 'pointer',
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 2,
  },
  checkbox: {
    width: 16,
    height: 16,
    accentColor: accent,
    marginTop: 1,
    flexShrink: 0,
  },
  checkText: {
    lineHeight: 1.4,
  },
  link: {
    color: accent,
    textDecoration: 'none',
    fontWeight: 600,
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
    marginTop: 2,
  },
  backBtn: {
    width: '100%',
    height: 40,
    background: 'transparent',
    color: '#64748b',
    border: '1px solid #262626',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'border-color .2s',
  },

  /* Footer */
  footer: {
    marginTop: 24,
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
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  brandTextOverlay: {
    position: 'absolute',
    bottom: 48,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#fff',
    textShadow: '0 2px 12px rgba(0,0,0,0.65)',
  },
  stepTag: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: 99,
    background: 'rgba(0,242,255,.2)',
    border: '1px solid rgba(0,242,255,.3)',
    fontSize: 12,
    fontWeight: 700,
    color: '#00f2ff',
    letterSpacing: '.03em',
    marginBottom: 16,
  },
  brandTitle: {
    margin: '0 0 12px',
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.03em',
  },
  brandDesc: {
    margin: 0,
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 1.6,
    opacity: 0.92,
  },
};
