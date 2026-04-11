import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import GoogleButton from "../../components/auth/GoogleButton";
import { api } from "../../services/apiClientService";
import civilbridge from "/civilbridge.png";
import SEO from "../../components/seo/SEO";

const STEP_DETAILS = 1;
const STEP_OTP = 2;

export default function Register() {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [step, setStep] = useState(STEP_DETAILS);
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Resend OTP state
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Terms & Conditions state
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  async function requestOtp(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!fullName || !emailOrPhone || !password) throw new Error("Fill all fields.");
      
      // 🔒 Check terms acceptance
      if (!termsAccepted) {
        throw new Error("You must accept the Terms & Conditions to continue.");
      }

      const isEmail = emailOrPhone.includes("@");
      const payload = {};

      if (isEmail) {
        payload.email = emailOrPhone.toLowerCase().trim();
      } else {
        payload.phone = emailOrPhone.trim();
      }

      const data = await api.post("/api/auth/register/request-otp", payload);

      if (data.success) {
        setStep(STEP_OTP);
        setErr("");
        
        // Start countdown for resend (60 seconds)
        setCountdown(60);
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (error) {
      setErr(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP function
  async function resendOtp() {
    if (countdown > 0) {
      return; // Prevent resend during countdown
    }
    
    setErr("");
    setResendLoading(true);
    
    try {
      const isEmail = emailOrPhone.includes("@");
      const payload = {};

      if (isEmail) {
        payload.email = emailOrPhone.toLowerCase().trim();
      } else {
        payload.phone = emailOrPhone.trim();
      }

      const data = await api.post("/api/auth/register/request-otp", payload);

      if (data.success) {
        // Restart countdown
        setCountdown(60);
        // Clear any previous OTP input
        setOtp("");
      } else {
        throw new Error("Failed to resend OTP");
      }
    } catch (error) {
      setErr(error.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  }

 async function verifyAndRegister(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!otp) throw new Error("Enter OTP code.");
      
      // Ensure we have the data from the first step
      if (!fullName || !password) {
        throw new Error("Missing registration details. Please go back.");
      }

      const isEmail = emailOrPhone.includes("@");
      
      // Build the payload once using the state variables
      const payload = {
        fullname: fullName,   // backend expects this
        password: password,   // refers to the state variable at top of file
        otp: otp.trim(),
        email: isEmail ? emailOrPhone.toLowerCase().trim() : undefined,
        phone: !isEmail ? emailOrPhone.trim() : undefined,
      };

      const data = await api.post("/api/auth/register", payload);

      if (data.success && data.user) {
        // Registration successful - user is automatically logged in via AuthContext
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (e2) {
      console.error("Registration Error:", e2);
      setErr(e2?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(credential) {
    setErr("");
    setLoading(true);
    try {
      await googleLogin(credential);
      // Navigation is handled by AuthContext
    } catch (error) {
      setErr(error.message || "Google signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.page}>
      <SEO title="Create Account" description="Create your CivilBridge account." noindex />
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

          {step === STEP_DETAILS ? (
            <>
              <h1 style={S.heading}>Create an account</h1>
              <p style={S.subtext}>
                Choose how you want to create your account. Google is quickest; email/phone uses a verification code to prevent spam.
              </p>
              <div
                style={{
                  width: "100%",
                  opacity: loading ? 0.6 : 1,
                  pointerEvents: loading ? "none" : "auto",
                }}
              >
                <GoogleButton onCredential={handleGoogleCredential} />
              </div>
              <div style={S.divider}><div style={S.divLine} /><span style={S.divText}>OR</span><div style={S.divLine} /></div>
              {err && <div style={S.error}>{err}</div>}
              <form onSubmit={requestOtp} style={S.form}>
                <label style={S.label}>Full Name
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" style={S.input} required />
                </label>
                <label style={S.label}>Email or Phone
                  <input type="text" value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)} placeholder="you@example.com" style={S.input} required />
                </label>
                <label style={S.label}>Password
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={S.input} required />
                </label>
                
                {/* Terms & Conditions */}
                <div style={S.termsSection}>
                  <label style={S.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                      style={S.checkbox}
                    />
                    <span style={S.termsText}>
                      I agree to the <Link to="/terms" style={S.termsLink}>Terms & Conditions</Link> and <Link to="/privacy" style={S.termsLink}>Privacy Policy</Link>
                    </span>
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || !termsAccepted} 
                  style={{
                    ...S.submitBtn,
                    opacity: loading || !termsAccepted ? 0.6 : 1,
                    cursor: loading || !termsAccepted ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Sending code…' : 'Continue'}
                </button>
              </form>
              <p style={S.footer}>Already have an account? <Link to="/login" style={S.footerLink}>Log in</Link></p>
            </>
          ) : (
            <>
              <h1 style={S.heading}>Check your inbox</h1>
              <p style={S.subtext}>Enter the 6-digit code sent to {emailOrPhone}</p>
              {err && <div style={S.error}>{err}</div>}
              
              <form onSubmit={verifyAndRegister} style={S.form}>
                <label style={S.label}>Verification Code
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" maxLength={6} style={S.input} required autoFocus />
                </label>
                <button type="submit" disabled={loading} style={S.submitBtn}>{loading ? 'Verifying…' : 'Verify & Create Account'}</button>
                
                {/* Resend OTP Section */}
                <div style={S.resendSection}>
                  <span style={S.resendText}>
                    Didn't receive the code?
                  </span>
                  <button 
                    type="button" 
                    onClick={resendOtp} 
                    disabled={countdown > 0 || resendLoading}
                    style={{
                      ...S.resendBtn,
                      opacity: countdown > 0 || resendLoading ? 0.6 : 1,
                      cursor: countdown > 0 || resendLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {(() => {
                      if (resendLoading) return 'Sending...';
                      if (countdown > 0) return `Resend in ${countdown}s`;
                      return 'Resend Code';
                    })()}
                  </button>
                </div>
                
                <button type="button" onClick={() => setStep(STEP_DETAILS)} style={S.backBtn}>Go Back</button>
              </form>
            </>
          )}
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

// --- STYLES REMAIN UNCHANGED FROM YOUR PREVIOUS CODE ---
const accent = '#3b82f6';
const S = {
    // ... Copy your existing S object here exactly as it was ...
    page: { display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', sans-serif" },
    left: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', background: '#ffffff' },
    formWrap: { width: '100%', maxWidth: 400 },
    logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 },
    logoIcon: { width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.25)', display: 'grid', placeItems: 'center' },
    logoText: { fontSize: 16, fontWeight: 700, color: '#1a1a1a' },
    heading: { margin: '0 0 6px', fontSize: 28, fontWeight: 700, color: '#1a1a1a' },
    subtext: { margin: '0 0 28px', fontSize: 14, color: '#6b7280' },
    googleBtn: { width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#1a1a1a', cursor: 'pointer' },
    divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' },
    divLine: { flex: 1, height: 1, background: '#e5e7eb' },
    divText: { fontSize: 11, fontWeight: 700, color: '#9ca3af' },
    error: { padding: '10px 14px', marginBottom: 16, borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', fontSize: 13 },
    devOtpBox: { padding: 16, borderRadius: 12, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)', color: '#22c55e', marginBottom: 20, textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: 18 },
    label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#1a1a1a' },
    input: { width: '100%', height: 44, padding: '0 14px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#1a1a1a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease' },
    submitBtn: { width: '100%', height: 44, background: accent, color: '#ffffff', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginTop: 4, border: 'none', transition: 'background-color 0.2s ease', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' },
    backBtn: { width: '100%', height: 44, background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' },
    footer: { marginTop: 28, textAlign: 'center', fontSize: 13, color: '#6b7280' },
    footerLink: { color: accent, fontWeight: 600, textDecoration: 'none' },
    right: { position: 'relative', background: '#f8fafc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    brandOverlay: { position: 'absolute', inset: 0, background: 'radial-gradient(600px 400px at 70% 30%, rgba(59,130,246,.1), transparent 65%)', pointerEvents: 'none' },
    brandContent: { position: 'relative', zIndex: 1, padding: '48px 40px', width: '100%', display: 'flex', justifyContent: 'center' },
    brandLogoImage: { width: '100%', maxWidth: 480, height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 60px rgba(59, 130, 246, 0.25))' },
    
    // New styles for resend section
    resendSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 8 },
    resendText: { fontSize: 13, color: '#6b7280' },
    resendBtn: { 
        background: 'transparent', 
        border: 'none', 
        color: accent, 
        fontSize: 13, 
        fontWeight: 600, 
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: 6,
        transition: 'opacity 0.2s ease'
    },
    
    // New styles for terms & conditions
    termsSection: { marginTop: 8, marginBottom: 16 },
    checkboxLabel: { 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: 8, 
        fontSize: 12, 
        color: '#ffffff',
        cursor: 'pointer',
        lineHeight: 1.4
    },
    checkbox: { 
        marginTop: 2, 
        width: 14, 
        height: 14, 
        accent: accent, 
        cursor: 'pointer',
        flexShrink: 0
    },
    termsText: { flex: 1 },
    termsLink: { 
        color: accent, 
        textDecoration: 'none', 
        fontWeight: 600,
        '&:hover': { textDecoration: 'underline' }
    }
};
