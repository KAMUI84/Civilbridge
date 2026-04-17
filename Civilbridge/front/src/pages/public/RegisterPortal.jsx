import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import GoogleButton from "../../components/auth/GoogleButton";
import AuthPortalStory from "../../components/auth/AuthPortalStory";
import { api } from "../../services/apiClientService";
import SEO from "../../components/seo/SEO";
import "../../components/auth/auth-portal-restored.css";

const STEP_DETAILS = 1;
const STEP_OTP = 2;

export default function RegisterPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from?.pathname || null;
  const { googleLogin } = useAuth();
  const [step, setStep] = useState(STEP_DETAILS);
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setTimeout(() => setCountdown((value) => Math.max(value - 1, 0)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function requestOtp(event) {
    event.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!fullName || !emailOrPhone || !password) throw new Error("Fill all fields.");
      if (!termsAccepted) throw new Error("You must accept the Terms & Conditions to continue.");

      const isEmail = emailOrPhone.includes("@");
      const payload = isEmail
        ? { email: emailOrPhone.toLowerCase().trim() }
        : { phone: emailOrPhone.trim() };

      const data = await api.post("/api/auth/register/request-otp", payload);

      if (!data.success) {
        throw new Error(data.message || "Failed to send OTP.");
      }

      setStep(STEP_OTP);
      setCountdown(60);
    } catch (error) {
      setErr(error?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (countdown > 0) return;
    setErr("");
    setResendLoading(true);

    try {
      const isEmail = emailOrPhone.includes("@");
      const payload = isEmail
        ? { email: emailOrPhone.toLowerCase().trim() }
        : { phone: emailOrPhone.trim() };

      const data = await api.post("/api/auth/register/request-otp", payload);
      if (!data.success) throw new Error(data.message || "Failed to resend OTP.");

      setCountdown(60);
      setOtp("");
    } catch (error) {
      setErr(error?.message || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  }

  async function verifyAndRegister(event) {
    event.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!otp) throw new Error("Enter OTP code.");
      const isEmail = emailOrPhone.includes("@");
      const payload = {
        fullname: fullName,
        password,
        otp: otp.trim(),
        email: isEmail ? emailOrPhone.toLowerCase().trim() : undefined,
        phone: !isEmail ? emailOrPhone.trim() : undefined,
      };

      const data = await api.post("/api/auth/register", payload);
      if (!data.success) throw new Error(data.message || "Registration failed.");

      navigate(returnTo || "/dashboard", { replace: true, state: { newUser: true } });
    } catch (error) {
      setErr(error?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(credential) {
    setErr("");
    setLoading(true);

    try {
      await googleLogin(credential, returnTo);
    } catch (error) {
      setErr(error?.message || "Google signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="portalPage">
      <div className="portalBackground" />
      <SEO title="Sign Up" description="Create your CivilBridge account." noindex />

      <div className="authPortalCard register">
        <div className="portalSplit">
          <section className="portalStoryPanel">
            <AuthPortalStory variant="register" />
          </section>

          <section className="portalAction">
            <div className="portalSectionHeader">
              <span className="portalTag">Sign Up</span>
              <h1>Create account</h1>
              <p className="portalLead">
                All new accounts begin as normal clients. Role upgrades and public expert visibility are handled later by admin approval.
              </p>
            </div>

            {err ? <div className="portalError">{err}</div> : null}

            {step === STEP_DETAILS ? (
              <>
                <div className="portalGoogleWrap">
                  <p className="portalHint">Login with Google</p>
                  <div className="mt-3">
                    <GoogleButton onCredential={handleGoogleCredential} />
                  </div>
                </div>

                <div className="portalSeparator" />

                <form onSubmit={requestOtp} className="portalForm">
                  <label>
                    Full name
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="John Doe"
                      className="portalInput"
                      required
                    />
                  </label>

                  <label>
                    Email or Phone
                    <input
                      type="text"
                      value={emailOrPhone}
                      onChange={(event) => setEmailOrPhone(event.target.value)}
                      placeholder="you@example.com"
                      className="portalInput"
                      required
                    />
                  </label>

                  <label>
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Create a password"
                      className="portalInput"
                      required
                    />
                  </label>

                  <label className="portalTermsLabel">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      className="portalTermsCheckbox"
                    />
                    <span>
                      I agree to the <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>.
                    </span>
                  </label>

                  <button type="submit" disabled={loading || !termsAccepted} className="portalBtnPrimary">
                    {loading ? "Sending code..." : "Register"}
                  </button>
                </form>

                <div className="portalFooterText">
                  Already have an account? <Link to="/login">Login</Link>
                </div>
              </>
            ) : (
              <form onSubmit={verifyAndRegister} className="portalForm">
                <p className="portalHint">
                  Enter the verification code sent to <strong>{emailOrPhone}</strong> to finish registration.
                </p>

                <label>
                  Verification Code
                  <input
                    type="text"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="123456"
                    className="portalInput"
                    required
                    maxLength={6}
                    autoFocus
                  />
                </label>

                <button type="submit" disabled={loading} className="portalBtnPrimary">
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>

                <div className="portalResendRow">
                  <span className="portalHintCompact">Didn&apos;t receive the code?</span>
                  <button
                    type="button"
                    className="portalBtnSecondary"
                    onClick={resendOtp}
                    disabled={countdown > 0 || resendLoading}
                  >
                    {resendLoading ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                  </button>
                </div>

                <button type="button" className="portalSwitchBtn" onClick={() => setStep(STEP_DETAILS)}>
                  Go back to details
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
