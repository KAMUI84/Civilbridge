import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import GoogleButton from "../../components/auth/GoogleButton";
import AuthPortalStory from "../../components/auth/AuthPortalStory";
import SEO from "../../components/seo/SEO";
import "../../components/auth/auth-portal.css";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const location = useLocation();
  const returnTo = location.state?.from?.pathname || null;
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
      await login({ email, password }, returnTo);
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
      await googleLogin(credential, returnTo);
    } catch (error) {
      setErr(error?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="portalPage">
      <div className="portalBackground" />
      <SEO title="Login" description="Sign in to your CivilBridge account." noindex />

      <div className="authPortalCard login">
        <div className="portalSplit">
          <section className="portalAction">
            <div className="portalSectionHeader">
              <span className="portalTag">Login</span>
              <h1>Login</h1>
              <p className="portalLead">
                {returnTo
                  ? "Sign in to continue and return to your workspace."
                  : "Enter your credentials and access your CivilBridge dashboard."}
              </p>
            </div>

            {err && <div className="portalError">{err}</div>}

            {authMethod === "choice" && (
              <div className="portalChoices">
                <button type="button" className="portalMethodButton" onClick={() => setAuthMethod("google")}>Continue with Google</button>
                <button type="button" className="portalBtnSecondary" onClick={() => setAuthMethod("email")}>Sign in with email</button>
              </div>
            )}

            {authMethod === "google" && (
              <>
                <div className="portalHint">Secure access with Google authentication for faster sign-in.</div>
                <GoogleButton onCredential={handleGoogleLogin} />
                <button type="button" className="portalSwitchBtn" onClick={() => setAuthMethod("email")}>Use email instead</button>
              </>
            )}

            {authMethod === "email" && (
              <>
                <div className="portalHint">Sign in with your registered email and password.</div>
                <form onSubmit={onSubmit} className="portalForm">
                  <label>
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="portalInput"
                      required
                      autoComplete="email"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="portalInput"
                      required
                      autoComplete="current-password"
                    />
                  </label>

                  <div className="portalUtilityRow">
                    <Link to="/forgot-password" className="portalLink">Forgot password?</Link>
                  </div>

                  <button type="submit" disabled={loading} className="portalBtnPrimary">
                    {loading ? "Signing in…" : "Login"}
                  </button>
                </form>
                <button type="button" className="portalSwitchBtn" onClick={() => setAuthMethod("google")}>Use Google instead</button>
              </>
            )}

            <div className="portalFooterText">
              Don&apos;t have an account? <Link to="/register">Sign Up</Link>
            </div>
          </section>

          <section className="portalStoryPanel">
            <AuthPortalStory variant="login" />
          </section>
        </div>
      </div>
    </div>
  );
}
