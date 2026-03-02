import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { isAuthed, getUser} from "../../store/authStore";

// ─────────────────────────────────────────────────────────────
// NAV CONFIG
// ─────────────────────────────────────────────────────────────
const PRIMARY_LINKS = [
  { to: "/",           label: "Home",        end: true  },
  { to: "/marketplace",label: "Marketplace", end: false },
  { to: "/plans",      label: "Plans",       end: false },
  { to: "/estimator",  label: "Estimator",   end: false },
  { to: "/experts",      label: "Experts",      end: false },
  { to: "/intelligence", label: "Intelligence", end: false },
];

const MORE_LINKS = [
  { to: "/uploads",     label: "Uploads",  icon: "📤" },
  { to: "/intelligence",label: "AI Studio",icon: "🤖" },
  { to: "/about",       label: "About",    icon: "ℹ️" },
  { to: "/pricing",     label: "Pricing",  icon: "💰" },
  { to: "/faq",         label: "FAQ",      icon: "❓" },
  { to: "/contact",     label: "Contact",  icon: "✉️" },
  { to: "/privacy",     label: "Privacy",  icon: "🔒" },
  { to: "/terms",       label: "Terms",    icon: "📄" },
];

// ─────────────────────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────────────────────
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
        fontFamily: "'Sora', sans-serif",
        fontWeight: 900,
        letterSpacing: "-0.03em",
        flexShrink: 0,
      }}
    >
      {/* Icon mark */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
          boxShadow: "0 8px 20px rgba(42,102,255,.30)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 16L9 3L16 16" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 11H13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{ fontSize: 16 }}>
        Civil<span style={{ color: "#1d4ed8" }}>Bridge</span>
      </span>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
function navLinkStyle({ isActive }) {
  return {
    textDecoration: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    color: isActive ? "#0c1220" : "#4a556b",
    padding: "9px 13px",
    borderRadius: 10,
    background: isActive ? "rgba(12,18,32,0.07)" : "transparent",
    border: isActive ? "1px solid rgba(12,18,32,0.09)" : "1px solid transparent",
    transition: "all .18s ease",
    whiteSpace: "nowrap",
  };
}

// ─────────────────────────────────────────────────────────────
// AVATAR INITIALS
// ─────────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = (name || "U")
    .trim()
    .split(" ")
    .map((n) => n[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");

  return (
    <div
      title={name || "User"}
      style={{
        width: 36,
        height: 36,
        borderRadius: 999,
        background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
        display: "grid",
        placeItems: "center",
        fontFamily: "'Sora', sans-serif",
        fontWeight: 900,
        fontSize: 13,
        color: "#fff",
        flexShrink: 0,
        boxShadow: "0 4px 12px rgba(42,102,255,.30)",
        letterSpacing: "-0.01em",
      }}
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MOBILE MENU OVERLAY
// ─────────────────────────────────────────────────────────────
function MobileMenu({ open, onClose, authed, user, onLogout }) {
  const location = useLocation();

  // Close on route change
  useEffect(() => { onClose(); }, [location.pathname]); // eslint-disable-line

  // Trap scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);`
  const [tick, setTick] = useState(0);

useEffect(() => {
  const onChange = () => setTick((t) => t + 1);
  window.addEventListener("cb_ls_changed", onChange);
  return () => window.removeEventListener("cb_ls_changed", onChange);
}, []);

// then call:
const authed = isAuthed();
const user = getUser();`

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 55,
          background: "rgba(7,11,20,0.55)",
          backdropFilter: "blur(3px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .25s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 65,
          width: "min(320px, 88vw)",
          background: "#fff",
          boxShadow: "-24px 0 80px rgba(12,18,32,.18)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform .3s cubic-bezier(0.16,1,0.3,1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid #eef0f4",
          }}
        >
          <Logo />
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: 36, height: 36,
              borderRadius: 10,
              border: "1px solid #eef0f4",
              background: "#fff",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              fontSize: 18,
              color: "#0c1220",
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 24px" }}>

          {/* Primary links */}
          <div style={{ marginBottom: 8 }}>
            <div style={sectionLabel}>Navigation</div>
            {PRIMARY_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: isActive ? "#0c1220" : "#3a4357",
                  background: isActive ? "rgba(42,102,255,.07)" : "transparent",
                  marginBottom: 2,
                  transition: "background .15s",
                })}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* More links */}
          <div style={{ marginBottom: 8 }}>
            <div style={sectionLabel}>More</div>
            {MORE_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#3a4357",
                  marginBottom: 2,
                  transition: "background .15s",
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>{l.icon}</span>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Drawer footer — auth */}
        <div
          style={{
            padding: "16px 16px 24px",
            borderTop: "1px solid #eef0f4",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {authed ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "#f7f9ff",
                  border: "1px solid #eef0f4",
                }}
              >
                <Avatar name={user?.full_name} />
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: "#0c1220" }}>
                    {user?.full_name || "User"}
                  </div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#8492a6" }}>
                    {user?.email || ""}
                  </div>
                </div>
              </div>
              <Link to="/dashboard" style={mobileAuthBtn("#0c1220", "#fff", "#eef0f4")}>
                Dashboard
              </Link>
              <button onClick={onLogout} style={{ ...mobileAuthBtn("#0c1220", "#fff", "#eef0f4"), border: "none", cursor: "pointer" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    style={mobileAuthBtn("#0c1220", "#fff",  "#eef0f4")}>Login</Link>
              <Link to="/register" style={mobileAuthBtn("#fff",    "#2a66ff", "transparent", true)}>
                Get Started →
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const sectionLabel = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: ".10em",
  color: "#a0aab8",
  padding: "8px 14px 4px",
};

function mobileAuthBtn(color, bg, border, primary = false) {
  return {
    display: "block",
    textAlign: "center",
    textDecoration: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 800,
    fontSize: 14,
    padding: "13px",
    borderRadius: 12,
    color,
    background: primary ? "linear-gradient(135deg,#2a66ff,#1d4ed8)" : bg,
    border: `1px solid ${border}`,
    boxShadow: primary ? "0 10px 24px rgba(29,78,216,.25)" : "none",
    width: "100%",
  };
}

// ─────────────────────────────────────────────────────────────
// MAIN NAVBAR
// ─────────────────────────────────────────────────────────────
export default function Navbar() {
  const navigate  = useNavigate();

  const [scrolled,    setScrolled]    = useState(false);
  const [authed,      setAuthed]      = useState(isAuthed());
  const [user,        setUser]        = useState(getUser());
  const [moreOpen,    setMoreOpen]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [hoveredMore, setHoveredMore] = useState(null);
  const moreRef = useRef(null);

  // Re-render on auth change (localStorage / custom event)
  useEffect(() => {
    const sync = () => {
      setAuthed(isAuthed());
      setUser(getUser());
    };
    window.addEventListener("storage",         sync);
    window.addEventListener("cb_auth_changed", sync);
    return () => {
      window.removeEventListener("storage",         sync);
      window.removeEventListener("cb_auth_changed", sync);
    };
  }, []);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close "More" dropdown on outside click
  useEffect(() => {
    const close = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Close "More" on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setMoreOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const onLogout = useCallback(() => {
    clearAuth();
    window.dispatchEvent(new Event("cb_auth_changed"));
    setMobileOpen(false);
    navigate("/login");
  }, [navigate]);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: scrolled
            ? "rgba(255,255,255,0.94)"
            : "rgba(255,255,255,0.80)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: scrolled
            ? "1px solid #eef0f4"
            : "1px solid transparent",
          transition: "background .2s ease, border-color .2s ease, box-shadow .2s ease",
          boxShadow: scrolled ? "0 4px 24px rgba(12,18,32,.07)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 20px",
            height: 68,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Logo */}
          <div style={{ flex: "0 0 auto" }}>
            <Logo />
          </div>

          {/* Desktop nav — hidden below 960px */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: 1,
              justifyContent: "center",
            }}
            className="cb-nav-desktop"
          >
            {PRIMARY_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} style={navLinkStyle}>
                {l.label}
              </NavLink>
            ))}

            {/* More dropdown */}
            <div ref={moreRef} style={{ position: "relative" }}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: moreOpen ? "#0c1220" : "#4a556b",
                  padding: "9px 13px",
                  borderRadius: 10,
                  background: moreOpen ? "rgba(12,18,32,0.07)" : "transparent",
                  border: moreOpen ? "1px solid rgba(12,18,32,0.09)" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all .18s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  whiteSpace: "nowrap",
                }}
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                More
                <span
                  style={{
                    fontSize: 10,
                    display: "inline-block",
                    transform: moreOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform .2s ease",
                    lineHeight: 1,
                  }}
                >
                  ▾
                </span>
              </button>

              {/* Dropdown panel */}
              {moreOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: 230,
                    borderRadius: 18,
                    border: "1px solid #eef0f4",
                    background: "#fff",
                    boxShadow: "0 20px 50px rgba(12,18,32,.12)",
                    padding: 8,
                    zIndex: 20,
                    animation: "cbDropIn 0.18s cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  {MORE_LINKS.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setMoreOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        borderRadius: 12,
                        textDecoration: "none",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 650,
                        fontSize: 14,
                        color: hoveredMore === l.to ? "#0c1220" : "#3a4357",
                        background: hoveredMore === l.to
                          ? "rgba(42,102,255,.07)"
                          : "transparent",
                        transition: "background .12s, color .12s",
                        marginBottom: 1,
                      }}
                      onMouseEnter={() => setHoveredMore(l.to)}
                      onMouseLeave={() => setHoveredMore(null)}
                    >
                      <span style={{ fontSize: 15, lineHeight: 1 }}>{l.icon}</span>
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right side — auth buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
            className="cb-nav-auth"
          >
            {!authed ? (
              <>
                <Link
                  to="/login"
                  style={{
                    textDecoration: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    padding: "9px 16px",
                    borderRadius: 10,
                    border: "1px solid #eef0f4",
                    background: "#fff",
                    color: "#0c1220",
                    whiteSpace: "nowrap",
                    transition: "border-color .15s",
                  }}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  style={{
                    textDecoration: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 900,
                    fontSize: 14,
                    padding: "9px 18px",
                    borderRadius: 10,
                    border: "1px solid rgba(29,78,216,0.18)",
                    background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
                    color: "#fff",
                    boxShadow: "0 8px 22px rgba(29,78,216,.24)",
                    whiteSpace: "nowrap",
                    transition: "box-shadow .2s, transform .2s",
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
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    padding: "9px 16px",
                    borderRadius: 10,
                    border: "1px solid #eef0f4",
                    background: "#fff",
                    color: "#0c1220",
                    whiteSpace: "nowrap",
                  }}
                >
                  Dashboard
                </Link>

                <button
                  onClick={onLogout}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "1px solid #eef0f4",
                    background: "#fff",
                    color: "#0c1220",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Logout
                </button>

                <Avatar name={user?.full_name} />
              </>
            )}
          </div>

          {/* Hamburger — shown below 960px */}
          <button
            onClick={() => setMobileOpen(true)}
            className="cb-hamburger"
            aria-label="Open menu"
            style={{
              display: "none", // overridden by CSS below 960px
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "1px solid #eef0f4",
              background: "#fff",
              cursor: "pointer",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            {[0,1,2].map((i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: 18,
                  height: 2,
                  borderRadius: 2,
                  background: "#0c1220",
                }}
              />
            ))}
          </button>

        </div>
      </header>

      {/* Mobile drawer */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        authed={authed}
        user={user}
        onLogout={onLogout}
      />

      {/* Scoped styles for responsive + dropdown animation */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes cbDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }

        @media (max-width: 960px) {
          .cb-nav-desktop { display: none !important; }
          .cb-nav-auth    { display: none !important; }
          .cb-hamburger   { display: flex !important; }
        }
      `}</style>

    </>
  );
}
