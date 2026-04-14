import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NotificationInbox from './NotificationInbox';
import authService from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

const isAuthRoute = (path) => ['/login', '/register', '/forgot-password', '/reset-password'].includes(path);

function Logo() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
        boxShadow: '0 8px 18px rgba(37,99,235,0.14)',
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        fontSize: 12,
        fontWeight: 800,
      }}>
        CB
      </div>
      <span style={{ fontSize: 15, fontWeight: 750, color: '#0f172a', letterSpacing: '-0.02em' }}>
        Civil<span style={{ color: '#38bdf8' }}>Bridge</span>
      </span>
    </Link>
  );
}

function getInitials(user) {
  const value = user?.fullName || user?.full_name || user?.email || 'User';
  return value.trim().charAt(0).toUpperCase();
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const onAuth = isAuthRoute(location.pathname);
  const { isAuthenticated: authed, user, logout: doLogout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (onAuth) return null;

  const bg = scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.88)';
  const border = '#edf2f7';

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue clearing client state even if the API call fails.
    }
    doLogout();
    navigate('/login', { replace: true });
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 60,
      background: bg,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${border}`,
      boxShadow: scrolled ? '0 10px 26px rgba(15,23,42,0.05)' : 'none',
      transition: 'all .25s ease',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <Logo />

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {[
            { to: '/', label: 'Home', end: true },
            { to: '/marketplace', label: 'Marketplace' },
            { to: '/plans', label: 'Plans' },
            { to: '/estimator', label: 'Estimator' },
            { to: '/experts', label: 'Experts' },
            { to: '/intelligence', label: 'Intelligence' },
          ].map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                textDecoration: 'none',
                fontWeight: 650,
                fontSize: 13,
                color: isActive ? '#0f172a' : '#64748b',
                padding: '7px 11px',
                borderRadius: 8,
                background: isActive ? '#f4f8fd' : 'transparent',
                transition: 'all .15s ease',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!authed ? (
            <>
              <Link to="/login" style={styles.secondaryButton}>Login</Link>
              <Link to="/register" style={styles.primaryButton}>Get Started</Link>
            </>
          ) : (
            <>
              <NotificationInbox compact dark />
              <Link to="/dashboard" style={styles.secondaryButton}>Dashboard</Link>
              <button onClick={handleLogout} style={styles.secondaryButton}>Logout</button>
              <div title={user?.fullName || user?.full_name || 'User'} style={styles.avatarChip}>
                {getInitials(user)}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  secondaryButton: {
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 13,
    padding: '8px 14px',
    borderRadius: 9,
    border: '1px solid #e7edf5',
    background: '#ffffff',
    color: '#334155',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
  },
  primaryButton: {
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 13,
    padding: '8px 14px',
    borderRadius: 9,
    background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 8px 18px rgba(37,99,235,.14)',
  },
  avatarChip: {
    width: 34,
    height: 34,
    borderRadius: 12,
    border: '1px solid #e6ecf4',
    background: 'linear-gradient(135deg, rgba(37,99,235,.12), rgba(56,189,248,.08))',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800,
    fontSize: 13,
    color: '#1e3a8a',
  },
};
