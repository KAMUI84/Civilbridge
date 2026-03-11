import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";

/* ──────────────────────────────────────────────
   CivilBridge – Transparent / Dark Navbar
   ────────────────────────────────────────────── */

const isAuthRoute = (path) => ['/login', '/register', '/forgot-password', '/reset-password'].includes(path);

function Logo() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: 'linear-gradient(135deg, #00f2ff, #0088ff)',
        boxShadow: '0 6px 18px rgba(0,242,255,.18)',
        display: 'grid', placeItems: 'center',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontSize: 15, fontWeight: 750, color: '#f0f0f0', letterSpacing: '-0.02em' }}>
        Civil<span style={{ color: '#00f2ff' }}>Bridge</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const onAuth = isAuthRoute(location.pathname);

  const { isAuthenticated: authed, user, logout: doLogout } = useAuthStore();

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    h();
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Hide navbar on auth pages (auth pages have their own logo)
  if (onAuth) return null;

  const bg = scrolled
    ? 'rgba(5,5,5,0.92)'
    : 'rgba(5,5,5,0.5)';
  const border = scrolled ? '#1e293b' : 'transparent';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 60,
      background: bg,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${border}`,
      transition: 'all .25s ease',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo />

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { to: '/', label: 'Home', end: true },
            { to: '/marketplace', label: 'Marketplace' },
            { to: '/plans', label: 'Plans' },
            { to: '/estimator', label: 'Estimator' },
            { to: '/experts', label: 'Experts' },
            { to: '/intelligence', label: 'Intelligence' },
          ].map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              textDecoration: 'none',
              fontWeight: 650, fontSize: 13,
              color: isActive ? '#f0f0f0' : '#94a3b8',
              padding: '8px 12px', borderRadius: 8,
              background: isActive ? 'rgba(255,255,255,.06)' : 'transparent',
              transition: 'all .15s ease',
            })}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!authed ? (
            <>
              <Link to="/login" style={{
                textDecoration: 'none', fontWeight: 700, fontSize: 13,
                padding: '9px 16px', borderRadius: 9,
                border: '1px solid #262626', background: 'transparent', color: '#d4d4d8',
              }}>Login</Link>
              <Link to="/register" style={{
                textDecoration: 'none', fontWeight: 700, fontSize: 13,
                padding: '9px 16px', borderRadius: 9,
                background: 'linear-gradient(135deg, #00f2ff, #0088ff)',
                color: '#050505', border: 'none',
                boxShadow: '0 4px 14px rgba(0,242,255,.15)',
              }}>Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={{
                textDecoration: 'none', fontWeight: 700, fontSize: 13,
                padding: '9px 16px', borderRadius: 9,
                border: '1px solid #262626', background: 'transparent', color: '#d4d4d8',
              }}>Dashboard</Link>
              <button onClick={() => { doLogout(); navigate('/login', { replace: true }); }} style={{
                fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                padding: '9px 16px', borderRadius: 9,
                border: '1px solid #262626', background: 'transparent', color: '#d4d4d8', cursor: 'pointer',
              }}>Logout</button>
              <div title={user?.full_name || 'User'} style={{
                width: 34, height: 34, borderRadius: 99,
                border: '1px solid #1e293b',
                background: 'linear-gradient(135deg, rgba(0,242,255,.08), rgba(0,136,255,.08))',
                display: 'grid', placeItems: 'center',
                fontWeight: 800, fontSize: 13, color: '#f0f0f0',
              }}>
                {(user?.full_name || 'U').trim().charAt(0).toUpperCase()}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}