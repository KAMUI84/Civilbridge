import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function getUserInitials(user) {
  const value = user?.fullName || user?.email || 'User';
  return value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getRoleLabel(role) {
  return String(role || 'CLIENT').replaceAll('_', ' ');
}

export default function Sidebar({ isOpen, onClose, config, activeSection, onSectionChange, user }) {
  const location = useLocation();
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const roleLabel = getRoleLabel(user?.role);

  const handleNavClick = (sectionId) => {
    onSectionChange(sectionId);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && isMobile ? <div style={styles.overlay} onClick={onClose} /> : null}

      <aside
        style={{
          ...styles.sidebar,
          ...(isOpen ? styles.sidebarOpen : styles.sidebarClosed),
          ...(isMobile ? styles.sidebarMobile : {}),
          ...(isMobile && !isOpen ? { transform: 'translateX(-100%)' } : {}),
        }}
      >
        <div style={styles.logoSection}>
          <Link to="/" style={styles.logoLink}>
            <div style={styles.logoMark}>CB</div>
            {isOpen ? (
              <div style={styles.logoTextWrap}>
                <span style={styles.logoText}>CivilBridge</span>
                <span style={styles.logoSubtext}>{config.workspaceLabel || 'Workspace'}</span>
              </div>
            ) : null}
          </Link>
          {isOpen ? (
            <div style={styles.workspaceBadge}>
              <span style={styles.workspaceBadgeLabel}>{roleLabel}</span>
              <span style={styles.workspaceBadgeText}>Workspace access</span>
            </div>
          ) : null}
        </div>

        <nav style={styles.navigation}>
          {isOpen ? <div style={styles.navHeading}>Navigation</div> : null}
          {config.navigation.map((item) => {
            const isActive = activeSection === item.id || location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => handleNavClick(item.id)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                  ...(!isOpen ? styles.navItemClosed : {}),
                }}
              >
                <span style={{ ...styles.navBadge, ...(isActive ? styles.navBadgeActive : {}) }}>{item.shortLabel || item.label.slice(0, 2).toUpperCase()}</span>
                {isOpen ? (
                  <div style={styles.navCopy}>
                    <span style={styles.navLabel}>{item.label}</span>
                  </div>
                ) : null}
                {isActive ? <div style={styles.activeIndicator} /> : null}
              </Link>
            );
          })}
        </nav>

        {isOpen ? (
          <div style={styles.bottomSection}>
            {config.quickAction ? (
              <Link to={config.quickAction.path} style={styles.quickAction}>
                <span style={styles.quickActionLabel}>Quick focus</span>
                <strong style={styles.quickActionText}>{config.quickAction.label}</strong>
              </Link>
            ) : null}
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>{getUserInitials(user)}</div>
              <div style={styles.userDetails}>
                <div style={styles.userName}>{user?.fullName || 'CivilBridge user'}</div>
                <div style={styles.userEmail}>{user?.email || 'No email available'}</div>
              </div>
            </div>
          </div>
        ) : null}

        <button style={styles.toggleButton} type="button" onClick={onClose}>
          {isOpen ? 'Close' : 'Open'}
        </button>
      </aside>
    </>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: 248,
    background: 'var(--sidebar-bg)',
    borderRight: '1px solid var(--surface-border)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1000,
    boxShadow: '12px 0 36px rgba(15,23,42,0.18)',
    backdropFilter: 'blur(12px)',
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  sidebarClosed: {
    width: 72,
    transform: 'translateX(0)',
  },
  sidebarMobile: {
    width: 240,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  logoSection: {
    padding: '18px 14px 14px',
    borderBottom: '1px solid var(--surface-border)',
    display: 'grid',
    gap: 12,
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textDecoration: 'none',
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.12)',
    color: '#ffffff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800,
    fontSize: 13,
    boxShadow: 'none',
    border: '1px solid var(--surface-border)',
  },
  logoTextWrap: {
    display: 'grid',
    gap: 3,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 800,
    color: '#ffffff',
  },
  logoSubtext: {
    fontSize: 11,
    color: 'rgba(191,219,254,0.86)',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 700,
  },
  workspaceBadge: {
    display: 'grid',
    gap: 6,
    padding: 14,
    borderRadius: 18,
    border: '1px solid rgba(148,163,184,0.22)',
    background: 'rgba(37,99,235,0.14)',
  },
  workspaceBadgeLabel: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  workspaceBadgeText: {
    color: 'rgba(226,232,240,0.84)',
    fontSize: 12,
    lineHeight: 1.6,
  },
  navigation: {
    flex: 1,
    padding: '14px 10px',
    overflowY: 'auto',
  },
  navHeading: {
    padding: '0 8px 10px',
    color: 'rgba(191,219,254,0.7)',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    marginBottom: 6,
    borderRadius: 16,
    color: 'rgba(226,232,240,0.86)',
    textDecoration: 'none',
    border: '1px solid transparent',
    position: 'relative',
    minHeight: 52,
    transition: 'background 0.15s ease',
  },
  navItemActive: {
    background: 'var(--accent-soft)',
    color: '#ffffff',
    borderColor: 'rgba(96,165,250,0.35)',
    boxShadow: 'none',
  },
  navItemClosed: {
    justifyContent: 'center',
    padding: '12px 8px',
  },
  navBadge: {
    minWidth: 34,
    height: 28,
    borderRadius: 8,
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(219,234,254,0.92)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.04em',
  },
  navBadgeActive: {
    background: 'var(--accent-color)',
    color: '#ffffff',
    boxShadow: 'none',
  },
  navCopy: {
    display: 'grid',
    gap: 3,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: 600,
  },
  navCaption: {
    fontSize: 11,
    color: 'rgba(191,219,254,0.7)',
    lineHeight: 1.4,
  },
  activeIndicator: {
    position: 'absolute',
    right: 10,
    width: 4,
    height: 24,
    borderRadius: 4,
    background: 'var(--accent-color)',
    boxShadow: 'none',
  },
  bottomSection: {
    padding: 16,
    borderTop: '1px solid var(--surface-border)',
    display: 'grid',
    gap: 14,
  },
  quickAction: {
    display: 'grid',
    gap: 4,
    padding: 14,
    borderRadius: 18,
    textDecoration: 'none',
    border: '1px solid rgba(148,163,184,0.22)',
    background: 'rgba(255,255,255,0.06)',
  },
  quickActionLabel: {
    color: 'var(--text-muted)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 700,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 14,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: 'rgba(37,99,235,0.22)',
    color: '#ffffff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800,
    border: '1px solid rgba(148,163,184,0.22)',
  },
  userDetails: {
    minWidth: 0,
    display: 'grid',
    gap: 4,
  },
  userName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    color: 'rgba(191,219,254,0.76)',
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toggleButton: {
    margin: 12,
    height: 38,
    borderRadius: 12,
    border: '1px solid rgba(148,163,184,0.22)',
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(219,234,254,0.88)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
};
