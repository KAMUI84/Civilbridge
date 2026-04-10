import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationInbox from '../../../components/common/NotificationInbox';
import authService from '../../../services/authService';
import { useAuthStore } from '../../../store/authStore';

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function getInitials(user) {
  const value = user?.fullName || user?.email || 'User';
  return value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatSectionName(section) {
  return String(section || 'overview')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function TopBar({ user, config, activeSection, onToggleSidebar, onOpenRightPanel }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/dashboard/projects${searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : ''}`);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue clearing local state even if the API logout call fails.
    }
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header style={styles.topBar}>
      <div style={styles.leftSection}>
        <button type="button" style={styles.iconButton} onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <MenuIcon />
        </button>

        <div style={styles.titleBlock}>
          <span style={styles.eyebrow}>{config?.workspaceLabel || 'Workspace'}</span>
          <div style={styles.pageTitle}>{formatSectionName(activeSection)}</div>
        </div>

        <form onSubmit={handleSearch} style={styles.searchForm}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}><SearchIcon /></span>
            <input
              type="text"
              placeholder="Search projects, people, and files"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              style={styles.searchInput}
            />
          </div>
        </form>
      </div>

      <div style={styles.rightSection}>
        {config?.quickAction ? (
          <button type="button" onClick={() => navigate(config.quickAction.path)} style={styles.primaryAction}>
            {config.quickAction.label}
          </button>
        ) : null}

        <NotificationInbox compact dark />

        <Link to="/dashboard/profile" style={styles.secondaryAction}>
          Profile
        </Link>
        <button type="button" onClick={handleLogout} style={styles.secondaryAction}>
          Logout
        </button>

        <button type="button" onClick={onOpenRightPanel} style={styles.profileButton} aria-label="Open account panel">
          <div style={styles.profileAvatar}>{getInitials(user)}</div>
          <div style={styles.profileTextWrap}>
            <span style={styles.profileName}>{user?.fullName || 'CivilBridge user'}</span>
            <span style={styles.profileRole}>{String(user?.role || 'CLIENT').replace('_', ' ')}</span>
          </div>
        </button>
      </div>
    </header>
  );
}

const styles = {
  topBar: {
    minHeight: 76,
    background: 'var(--topbar-bg)',
    borderBottom: '1px solid var(--surface-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(18px)',
    gap: 18,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    minWidth: 0,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)',
    color: 'var(--text-color)',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
  },
  titleBlock: {
    display: 'grid',
    gap: 2,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: 'var(--text-muted)',
  },
  pageTitle: {
    color: 'var(--text-color)',
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  searchForm: {
    margin: 0,
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '10px 14px',
    width: 340,
    maxWidth: '44vw',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  },
  searchIcon: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-muted)',
    marginRight: 10,
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-color)',
    fontSize: 14,
    outline: 'none',
    flex: 1,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  primaryAction: {
    height: 40,
    padding: '0 16px',
    borderRadius: 14,
    border: '1px solid var(--accent-glow)',
    background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))',
    color: '#061018',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondaryAction: {
    height: 40,
    padding: '0 14px',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)',
    color: 'var(--text-color)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))',
    display: 'grid',
    placeItems: 'center',
    fontSize: 12,
    fontWeight: 800,
    color: '#061018',
  },
  profileTextWrap: {
    display: 'grid',
    textAlign: 'left',
  },
  profileName: {
    color: 'var(--text-color)',
    fontSize: 13,
    fontWeight: 700,
  },
  profileRole: {
    color: 'var(--text-muted)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
};

