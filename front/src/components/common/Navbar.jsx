import { NavLink, Link, useNavigate } from "react-router-dom";
import { clearAuth, getUser, isAuthed } from "../../store/authStore";
import { useEffect, useState } from "react";

/**
 * Shared styles for NavLinks
 */
const navLinkStyle = ({ isActive }) => ({
  textDecoration: "none",
  fontWeight: 850,
  fontSize: 14,
  color: isActive ? "#0c1220" : "#3a4357",
  padding: "10px 12px",
  borderRadius: 12,
  background: isActive ? "rgba(12,18,32,0.06)" : "transparent",
  border: isActive ? "1px solid rgba(12,18,32,0.08)" : "1px solid transparent",
  transition: "all .2s ease",
});

function Logo() {
  return (
    <Link
      to="/"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        color: "#0c1220",
        fontWeight: 950,
        letterSpacing: "-0.02em",
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
          boxShadow: "0 10px 24px rgba(42,102,255,.25)",
        }}
      />
      <span style={{ fontSize: 16 }}>
        Civil<span style={{ color: "#1d4ed8" }}>Bridge</span>
      </span>
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: "#3a4357" }}>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16.2 16.2 21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  
  // NOTE: If your UI doesn't update when logging in/out, 
  // you should wrap these in a useEffect or use a Context hook.
  const authed = isAuthed();
  const user = getUser();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        background: scrolled
          ? "rgba(255,255,255,0.92)"
          : "rgba(255,255,255,0.78)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid #eef0f4" : "1px solid transparent",
        transition: "all .2s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          justifyContent: "space-between",
        }}
      >
        {/* Left Section - Fixed Syntax Error Here */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
          <Logo />

          <div
            style={{
              flex: 1,
              maxWidth: 440,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid #eef0f4",
              background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
            }}
          >
            {/* <SearchIcon />
            <input
              placeholder="Search properties, land, plans, experts..."
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                fontWeight: 650,
                color: "#0c1220",
              }}
            /> */}
          </div>
        </div>

        {/* Center Section */}
        <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <NavLink to="/" style={navLinkStyle} end>
            Home
          </NavLink>

          <NavLink to="/marketplace" style={navLinkStyle}>
            Marketplace
          </NavLink>

          <NavLink to="/plans" style={navLinkStyle}>
            Plans
          </NavLink>

          <NavLink to="/estimator" style={navLinkStyle}>
            Estimator
          </NavLink>

          <NavLink to="/experts" style={navLinkStyle}>
            Experts
          </NavLink>

          <NavLink to="/dashboard/ai-studio" style={navLinkStyle}>
            Intelligence
          </NavLink>
        </nav>

        {/* Right Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!authed ? (
            <>
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  fontWeight: 900,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #eef0f4",
                  background: "#fff",
                  color: "#0c1220",
                  transition: "all .2s ease",
                }}
              >
                Login
              </Link>

              <Link
                to="/register"
                style={{
                  textDecoration: "none",
                  fontWeight: 950,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(29,78,216,0.2)",
                  background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
                  color: "#fff",
                  boxShadow: "0 12px 26px rgba(29,78,216,.22)",
                  transition: "all .2s ease",
                }}
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                style={{
                  textDecoration: "none",
                  fontWeight: 900,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #eef0f4",
                  background: "#fff",
                  color: "#0c1220",
                  transition: "all .2s ease",
                }}
              >
                Dashboard
              </Link>

              <button
                onClick={logout}
                style={{
                  fontWeight: 900,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #eef0f4",
                  background: "#fff",
                  cursor: "pointer",
                  transition: "all .2s ease",
                }}
              >
                Logout
              </button>

              <div
                title={user?.full_name || "User"}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  border: "1px solid #eef0f4",
                  background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 950,
                  color: "#0c1220",
                }}
              >
                {(user?.full_name || "U").trim().charAt(0).toUpperCase()}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
