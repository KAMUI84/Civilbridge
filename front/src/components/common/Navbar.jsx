import { NavLink, Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { logout as doLogout, getUser, isAuthed } from "../../store/authStore";

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

export default function Navbar() {
  const navigate = useNavigate();

  // ✅ local reactive state (updates on login/logout)
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);

    // our custom event (your store already dispatches it)
    window.addEventListener("cb_ls_changed", rerender);

    // bonus: if token changes in another tab
    window.addEventListener("storage", rerender);

    return () => {
      window.removeEventListener("cb_ls_changed", rerender);
      window.removeEventListener("storage", rerender);
    };
  }, []);

  const authed = useMemo(() => isAuthed(), [tick]);
  const user = useMemo(() => getUser(), [tick]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    doLogout();
    navigate("/login", { replace: true });
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.78)",
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
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
          <Logo />
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <NavLink to="/" style={navLinkStyle} end>Home</NavLink>
          <NavLink to="/marketplace" style={navLinkStyle}>Marketplace</NavLink>
          <NavLink to="/plans" style={navLinkStyle}>Plans</NavLink>
          <NavLink to="/estimator" style={navLinkStyle}>Estimator</NavLink>
          <NavLink to="/experts" style={navLinkStyle}>Experts</NavLink>
          <NavLink to="/intelligence" style={navLinkStyle}>Intelligence</NavLink>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!authed ? (
            <>
              <Link to="/login" style={btnGhost}>Login</Link>
              <Link to="/register" style={btnPrimary}>Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={btnGhost}>Dashboard</Link>
              <button onClick={handleLogout} style={btnGhostBtn}>Logout</button>

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

const btnGhost = {
  textDecoration: "none",
  fontWeight: 900,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #eef0f4",
  background: "#fff",
  color: "#0c1220",
};

const btnGhostBtn = {
  ...btnGhost,
  cursor: "pointer",
};

const btnPrimary = {
  textDecoration: "none",
  fontWeight: 950,
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(29,78,216,0.2)",
  background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
  color: "#fff",
  boxShadow: "0 12px 26px rgba(29,78,216,.22)",
};