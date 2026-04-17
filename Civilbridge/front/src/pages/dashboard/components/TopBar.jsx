import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationInbox from '../../../components/common/NotificationInbox';

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

function getSearchPlaceholder(section) {
  if (section === 'payments') return 'Search payments or invoices';
  if (section === 'users') return 'Search users or approvals';
  if (section === 'files') return 'Search files or submissions';
  if (section === 'ai-studio') return 'Search project prompts';
  return 'Search projects';
}

export default function TopBar({ user, config, activeSection, onToggleSidebar, onOpenRightPanel }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/dashboard/projects${searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : ''}`);
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
              placeholder={getSearchPlaceholder(activeSection)}
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

        <button type="button" onClick={() => navigate('/dashboard/ai-studio')} style={styles.secondaryAction}>
          AI Workspace
        </button>

        <NotificationInbox compact dark />

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
    minHeight: 68,
    background: 'var(--topbar-bg)',
    borderBottom: '1px solid var(--surface-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 18px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)',
    gap: 14,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    minWidth: 0,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: '1px solid var(--border-color)',
    background: '#ffffff',
    color: 'var(--text-color)',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(15,23,42,0.05)',
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
    background: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 14,
    padding: '9px 12px',
    width: 320,
    maxWidth: '44vw',
    boxShadow: 'none',
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
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  primaryAction: {
    height: 38,
    padding: '0 15px',
    borderRadius: 12,
    border: '1px solid var(--accent-color)',
    background: 'var(--accent-color)',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: 'none',
  },
  secondaryAction: {
    height: 38,
    padding: '0 13px',
    borderRadius: 12,
    border: '1px solid var(--border-color)',
    background: '#ffffff',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 16,
    padding: '7px 11px',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(15,23,42,0.05)',
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    background: 'var(--accent-color)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 12,
    fontWeight: 800,
    color: '#ffffff',
    border: '1px solid transparent',
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

