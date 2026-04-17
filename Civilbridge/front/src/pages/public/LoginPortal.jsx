import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import GoogleButton from "../../components/auth/GoogleButton";
import AuthPortalStory from "../../components/auth/AuthPortalStory";
import SEO from "../../components/seo/SEO";
import "../../components/auth/auth-portal-restored.css";

export default function LoginPortal() {
  const { login, googleLogin } = useAuth();
  const location = useLocation();
  const returnTo = location.state?.from?.pathname || null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
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
              <h1>Sign in</h1>
              <p className="portalLead">
                {returnTo
                  ? "Sign in to continue and return to your workspace."
                  : "Access your CivilBridge dashboard and active work."}
              </p>
            </div>

            {err ? <div className="portalError">{err}</div> : null}

            <div className="portalGoogleWrap">
              <p className="portalHint">Login with Google</p>
              <div className="mt-3">
                <GoogleButton onCredential={handleGoogleLogin} />
              </div>
            </div>

            <div className="portalSeparator" />

            <form onSubmit={onSubmit} className="portalForm">
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="portalInput"
                  required
                  autoComplete="current-password"
                />
              </label>

              <div className="portalUtilityRow">
                <Link to="/forgot-password" className="portalLink">Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading} className="portalBtnPrimary">
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

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
