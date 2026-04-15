import { useEffect } from "react";
import "./authModal.css";

export default function AuthModal({ open, onClose, mode, onSwitchMode, children }) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="cb-authBackdrop" onMouseDown={onClose}>
      <div className="cb-authModal" onMouseDown={(e) => e.stopPropagation()}>
        {/* Left visual panel */}
        <div className="cb-authLeft">
          <div className="cb-authLeftOverlay" />
          <div className="cb-authLeftInner">
            <div className="cb-authKicker">CivilBridge</div>
            <h2 className="cb-authLeftTitle">
              Success starts here
            </h2>
            <ul className="cb-authBullets">
              <li>Verified experts & suppliers</li>
              <li>Plans + estimation + BOQ tools</li>
              <li>Compliance & permits guidance</li>
              <li>Dashboard for project progress</li>
            </ul>
          </div>
        </div>

        {/* Right form panel */}
        <div className="cb-authRight">
          <button className="cb-authClose" onClick={onClose} aria-label="Close">
            ✕
          </button>

          <div className="cb-authHead">
            <h3 className="cb-authTitle">
              {mode === "login" ? "Welcome back" : "Create a new account"}
            </h3>

            <div className="cb-authSub">
              {mode === "login" ? (
                <>
                  Don’t have an account?{" "}
                  <button className="cb-authLinkBtn" onClick={onSwitchMode}>
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button className="cb-authLinkBtn" onClick={onSwitchMode}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Social buttons UI (real Google auth later) */}
          <div className="cb-authSocial">
            <button className="cb-socialBtn" type="button" onClick={() => alert("Google sign-in UI only for now. We'll wire it next.")}>
              <span className="cb-socialIcon">G</span>
              Continue with Google
            </button>

            <div className="cb-authDivider">
              <span />
              <em>or</em>
              <span />
            </div>
          </div>

          {/* Your form goes here */}
          <div className="cb-authBody">{children}</div>

          <div className="cb-authLegal">
            By continuing, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}