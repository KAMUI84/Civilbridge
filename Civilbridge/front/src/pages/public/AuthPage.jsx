import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import SEO from "../../components/seo/SEO";
import { api } from "../../services/apiClientService";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import "./auth-page.css";

// Toast notification component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <AlertCircle size={18} />
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  );
}

// Load external SDKs dynamically
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const ABOUT_SLIDES = [
  {
    id: 1,
    title: "AI-Powered Estimation",
    description: "Our advanced AI analyzes construction plans in seconds, delivering accurate cost estimates that save weeks of manual work.",
  },
  {
    id: 2,
    title: "Unified Project Hub",
    description: "Connect engineers, contractors, and homeowners on a single platform with real-time collaboration and transparent communication.",
  },
  {
    id: 3,
    title: "Verified Expert Network",
    description: "Access our curated network of certified construction professionals, each vetted for quality and reliability.",
  },
  {
    id: 4,
    title: "Smart Marketplace",
    description: "Discover properties with detailed plans, pricing transparency, and direct connections to project stakeholders.",
  },
  {
    id: 5,
    title: "Bank-Grade Security",
    description: "Your data is protected with enterprise-level encryption and compliance with international privacy standards.",
  },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, facebookLogin } = useAuth();
  const returnTo = location.state?.from?.pathname || null;

  const isRegisterPath = location.pathname === "/register";
  const [isRegister, setIsRegister] = useState(isRegisterPath);
  const [activeSlide, setActiveSlide] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Show toast helper
  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % ABOUT_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((v) => v - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const toggleMode = () => {
    const newMode = !isRegister;
    setIsRegister(newMode);
    setErr("");
    setEmail("");
    setPassword("");
    setFullName("");
    setOtp("");
    setStep(1);
    navigate(newMode ? "/register" : "/login", { replace: true, state: location.state });
  };

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (!email || !password) throw new Error("Enter email and password.");
      await login({ email, password }, returnTo);
    } catch (error) {
      setErr(error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function requestOtp(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (!fullName || !email || !password) throw new Error("Fill all fields.");
      if (!termsAccepted) throw new Error("You must accept the Terms & Conditions.");

      const data = await api.post("/api/auth/register/request-otp", {
        email: email.toLowerCase().trim(),
      });

      if (data.success) {
        setStep(2);
        setCountdown(60);
      } else {
        throw new Error(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      setErr(error?.message || "Failed to send OTP.");
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
      const data = await api.post("/api/auth/register", {
        fullname: fullName,
        password,
        otp: otp.trim(),
        email: email.toLowerCase().trim(),
      });

      if (data.success && data.user) {
        navigate(returnTo || "/dashboard", { replace: true, state: { newUser: true } });
      } else {
        throw new Error(data.message || "Registration failed.");
      }
    } catch (error) {
      setErr(error?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setErr("");
    setLoading(true);
    try {
      // Load Google Sign-In SDK if not already loaded
      if (!window.google) {
        await loadScript('https://accounts.google.com/gsi/client');
      }

      // Trigger Google sign-in flow
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              await googleLogin(response.credential, returnTo);
            } catch (error) {
              setErr(error?.message || "Google login failed");
              setLoading(false);
            }
          }
        });

        window.google.accounts.id.prompt();
      }
    } catch (error) {
      setErr(error?.message || "Google login failed");
      setLoading(false);
    }
  }

  async function handleGoogleCredential(credential) {
    setErr("");
    setLoading(true);
    try {
      await googleLogin(credential, returnTo);
    } catch (error) {
      setErr(error?.message || `Google ${isRegister ? "signup" : "login"} failed.`);
    } finally {
      setLoading(false);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SOCIAL LOGIN HANDLERS - Facebook, X
  // ═══════════════════════════════════════════════════════════════════════════

  // Facebook Login - Uses FB SDK
  async function handleFacebookLogin() {
    try {
      const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
      if (!appId || appId === 'your_facebook_app_id') {
        showToast("🔧 Facebook Login needs setup: Add VITE_FACEBOOK_APP_ID to your .env file", "info");
        return;
      }

      // Load the FB SDK if needed
      if (typeof window.FB === 'undefined') {
        await new Promise((resolve, reject) => {
          window.fbAsyncInit = function() {
            window.FB.init({
              appId,
              cookie: true,
              xfbml: false,
              version: 'v18.0',
            });
            resolve();
          };

          const script = document.createElement('script');
          script.src = 'https://connect.facebook.net/en_US/sdk.js';
          script.async = true;
          script.defer = true;
          script.crossOrigin = 'anonymous';
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      setLoading(true);
      const authResponse = await new Promise((resolve, reject) => {
        window.FB.login((response) => {
          if (response.authResponse) {
            resolve(response.authResponse);
          } else {
            reject(new Error('Facebook login cancelled'));
          }
        }, { scope: 'email,public_profile' });
      });

      await facebookLogin(authResponse.accessToken, returnTo);
    } catch (error) {
      if (error?.message?.includes('not configured')) {
        showToast("🔧 Facebook Login needs setup: Add VITE_FACEBOOK_APP_ID to your .env file", "info");
      } else {
        showToast(error?.message || "Facebook Login failed", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  // X (Twitter) Login - OAuth 2.0 PKCE flow
  async function handleXLogin() {
    try {
      const clientId = import.meta.env.VITE_X_CLIENT_ID;

      if (!clientId || clientId === 'YOUR_X_CLIENT_ID') {
        showToast("🔧 X Login needs setup: Add X_CLIENT_ID to your .env file", "info");
        return;
      }

      // Generate PKCE challenge
      const generateCodeVerifier = () => {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      };

      const generateCodeChallenge = async (verifier) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      };

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Store code verifier for callback
      sessionStorage.setItem('x_code_verifier', codeVerifier);
      sessionStorage.setItem('x_return_to', returnTo || '/dashboard');

      // Build OAuth URL
      const redirectUri = `${window.location.origin}/auth/x/callback`;
      const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'tweet.read users.read offline.access');
      authUrl.searchParams.set('state', 'civilbridge_auth_' + Math.random().toString(36).substring(7));
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      // Redirect to X OAuth
      window.location.href = authUrl.toString();

    } catch (error) {
      showToast(error?.message || "X Login failed", "error");
    }
  }

  // Handle X OAuth callback
  const handleXCallback = useCallback(async (code) => {
    try {
      const codeVerifier = sessionStorage.getItem('x_code_verifier');
      const returnPath = sessionStorage.getItem('x_return_to') || '/dashboard';

      if (!codeVerifier) {
        throw new Error('Invalid OAuth callback');
      }

      setLoading(true);

      // Exchange code for token via backend
      const data = await api.post("/api/auth/x", {
        code,
        codeVerifier,
        redirectUri: `${window.location.origin}/auth/x/callback`,
      });

      // Clear stored values
      sessionStorage.removeItem('x_code_verifier');
      sessionStorage.removeItem('x_return_to');

      if (data.success && data.user) {
        localStorage.setItem("cb_user", JSON.stringify(data.user));
        navigate(returnPath, { replace: true });
      }
    } catch (error) {
      showToast(error?.message || "X Login failed", "error");
      setLoading(false);
    }
  }, [navigate]);

  // Check for X OAuth callback on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state?.includes('civilbridge_auth')) {
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      handleXCallback(code);
    }
  }, [handleXCallback]);

  async function resendOtp() {
    if (countdown > 0) return;
    setErr("");
    setLoading(true);
    try {
      await api.post("/api/auth/register/request-otp", { email: email.toLowerCase().trim() });
      setCountdown(60);
    } catch (error) {
      setErr(error?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <SEO title={isRegister ? "Sign Up" : "Sign In"} description="Access your CivilBridge account." noindex />

      <div className={`auth-container ${isRegister ? "register-mode" : "login-mode"}`}>
        <div className="auth-panel form-panel">
          <div className="auth-form-container">
            <div className="auth-logo">
              <div className="logo-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0d9488"/>
                  <path d="M2 17L12 22L22 17" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="logo-text">CivilBridge</span>
            </div>

            <div className="auth-header">
              <h1>Welcome to CivilBridge</h1>
              <p>Start your experience by signing in or signing up.</p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${!isRegister ? "active" : ""}`}
                onClick={() => isRegister && toggleMode()}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab ${isRegister ? "active" : ""}`}
                onClick={() => !isRegister && toggleMode()}
              >
                Sign Up
              </button>
            </div>

            {err && <div className="auth-error">{err}</div>}

            {!isRegister && (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-group">
                  <label>
                    Email Address <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Password <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}

            {isRegister && step === 1 && (
              <form onSubmit={requestOtp} className="auth-form">
                <div className="form-group">
                  <label>
                    Full Name <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Email Address <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Password <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <label className="terms-label">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                  />
                  <span>
                    I agree to the <Link to="/terms">Terms & Condition</Link> and{" "}
                    <Link to="/privacy">Privacy & Policy</Link>.
                  </span>
                </label>

                <button type="submit" className="auth-submit-btn" disabled={loading || !termsAccepted}>
                  {loading ? "Sending code..." : "Sign Up"}
                </button>
              </form>
            )}

            {isRegister && step === 2 && (
              <form onSubmit={verifyAndRegister} className="auth-form">
                <div className="otp-info">
                  Enter the verification code sent to <strong>{email}</strong>
                </div>

                <div className="form-group">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="otp-input"
                    autoFocus
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>

                <div className="otp-actions">
                  <span>Didn&apos;t receive the code?</span>
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={resendOtp}
                    disabled={countdown > 0 || loading}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                  </button>
                </div>

                <button type="button" className="back-btn" onClick={() => setStep(1)}>
                  Go back to details
                </button>
              </form>
            )}

            {!isRegister && (
              <>
                <div className="auth-divider">
                  <span>Or continue with</span>
                </div>

                <div className="social-login">
                  <button
                    type="button"
                    className="social-btn google"
                    aria-label="Sign in with Google"
                    onClick={handleGoogleLogin}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.3-2.3H12v4.4h6.4c-.3 1.8-1.5 3.2-3.3 4v3.3h5.4c3.1-2.9 4.9-7 4.9-11.4z" />
                      <path fill="#34A853" d="M12 24c3.2 0 5.9-1 7.9-2.7l-3.8-3.3c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-4.8H1.8v3.1C3.8 20.9 7.7 24 12 24z" />
                      <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.3-1.4-.3-2.2s.1-1.5.3-2.2V6.9H1.8C.7 8.9 0 10.9 0 12.9s.7 4 1.8 6h3.4z" />
                      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.7 1.7l3.5-3.5C17.8 1.2 15 0 12 0 7.7 0 3.8 3.1 1.8 6.9l3.4 2.6C6.2 6.9 8.9 4.8 12 4.8z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="social-btn facebook"
                    aria-label="Sign in with Facebook"
                    onClick={handleFacebookLogin}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M15.117 8.2h-2.1V6c0-.5.3-.6.6-.6h1.5V2.1h-2.2c-2.4 0-3.9 1.5-3.9 3.9v1.8H7v3h1.1V22h3.3v-9.9h2.1l.3-3z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="social-btn x"
                    aria-label="Sign in with X"
                    onClick={handleXLogin}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M7 7l10 10M17 7l-10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </>
            )}

            <div className="auth-footer">
              <span>Copyright - CivilBridge. All Right Reserved.</span>
              <div className="auth-footer-links">
                <Link to="/terms">Terms & Condition</Link>
                <Link to="/privacy">Privacy & Policy</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-panel showcase-panel">
          <div className="feature-showcase">
            <div className="floating-cards">
              <div className="floating-card financial-card">
                <div className="card-header">
                  <span className="card-label">Financial Plan</span>
                  <span className="card-date">November</span>
                </div>
                <div className="card-amount">$2,005.45</div>
                <div className="card-status">On Track</div>
                <div className="card-chart">
                  <svg viewBox="0 0 100 50" className="donut-chart">
                    <circle cx="50" cy="25" r="20" fill="none" stroke="#f59e0b" strokeWidth="6" strokeDasharray="50 100" />
                    <circle cx="50" cy="25" r="20" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="30 100" strokeDashoffset="-50" />
                    <circle cx="50" cy="25" r="20" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray="20 100" strokeDashoffset="-80" />
                  </svg>
                </div>
                <div className="card-breakdown">
                  <div className="breakdown-item">
                    <span className="dot yellow"></span>
                    <span>Budgeted Expenses</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="dot green"></span>
                    <span>Additional Spending</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="dot blue"></span>
                    <span>On Track</span>
                  </div>
                </div>
              </div>

              <div className="floating-card funds-card">
                <div className="card-title">Future Funds</div>
                <div className="fund-item">
                  <div className="fund-name">Vacation Trip</div>
                  <div className="fund-amount">$1800</div>
                  <div className="fund-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "75%" }}></div>
                    </div>
                    <span className="progress-text">75% of $2400</span>
                  </div>
                </div>
              </div>

              <div className="floating-card allocation-card">
                <div className="card-header-row">
                  <span className="card-title">Capital Allocations</span>
                  <span className="allocation-total">$17,366.00</span>
                </div>
                <div className="allocation-items">
                  <div className="allocation-item">
                    <span className="item-name">iPhone 14 Pro Max</span>
                    <span className="item-amount">$1,099</span>
                  </div>
                  <div className="allocation-item">
                    <span className="item-name">MacBook Pro M3</span>
                    <span className="item-amount">$2,499</span>
                  </div>
                  <div className="allocation-item">
                    <span className="item-name">Sony WH-1000XM5</span>
                    <span className="item-amount">$348</span>
                  </div>
                </div>
                <button className="review-btn">Review Investment</button>
              </div>
            </div>

            <div className="showcase-logo">
              <div className="logo-mark">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <div className="slideshow-content">
              <h2>A Unified Hub for Smarter Construction Decision-Making</h2>
              <p className="slideshow-description">
                CivilBridge empowers you with a unified construction command center—delivering deep insights and a 360° view of your entire project ecosystem.
              </p>

              <div className="slides-container">
                {ABOUT_SLIDES.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`slide ${index === activeSlide ? "active" : ""}`}
                  >
                    <h3>{slide.title}</h3>
                    <p>{slide.description}</p>
                  </div>
                ))}
              </div>

              <div className="slide-indicators">
                {ABOUT_SLIDES.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`indicator ${index === activeSlide ? "active" : ""}`}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
