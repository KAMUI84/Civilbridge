import { Outlet, Link, useLocation } from "react-router-dom";
import "./auth.css";

export default function AuthLayout() {
  const loc = useLocation();
  const isLogin = loc.pathname.includes("/login");

  return (
    <div className="authPage">
      <div className="authCard">
        {/* LEFT */}
        <div className="authLeft">
          <div className="authLeftOverlay" />
          <div className="authLeftContent">
            <div className="authBrandPill">CivilBridge</div>

            <h2 className="authLeftTitle">Success starts here</h2>
            <ul className="authBullets">
              <li>Verified experts & suppliers</li>
              <li>Plans + estimation + BOQ tools</li>
              <li>Compliance & permits guidance</li>
              <li>Dashboard for project progress</li>
            </ul>
          </div>
        </div>

        {/* RIGHT */}
        <div className="authRight">
          <div className="authRightTop">
            <div className="authHeading">
              <h1>{isLogin ? "Welcome back" : "Create a new account"}</h1>
              <p>
                {isLogin ? (
                  <>
                    Don&apos;t have an account? <Link to="/register">Create one</Link>
                  </>
                ) : (
                  <>
                    Already have an account? <Link to="/login">Sign in</Link>
                  </>
                )}
              </p>
            </div>

            <Link to="/" className="authCloseBtn" aria-label="Close">
              ✕
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}