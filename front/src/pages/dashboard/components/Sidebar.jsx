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
              <span style={styles.workspaceBadgeText}>{config.workspaceDescription || 'Live workspace only'}</span>
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
                    <span style={styles.navCaption}>{item.path === '/dashboard' ? 'Main workspace' : 'Open live data'}</span>
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
    boxShadow: '24px 0 60px rgba(0,0,0,0.28)',
    backdropFilter: 'blur(20px)',
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
    background: 'rgba(0, 0, 0, 0.45)',
    zIndex: 999,
  },
  logoSection: {
    padding: '22px 16px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
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
    background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))',
    color: '#ffffff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800,
    fontSize: 13,
    boxShadow: '0 0 0 6px rgba(255,255,255,0.03)',
  },
  logoTextWrap: {
    display: 'grid',
    gap: 3,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 800,
    color: 'var(--text-color)',
  },
  logoSubtext: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 700,
  },
  workspaceBadge: {
    display: 'grid',
    gap: 6,
    padding: 14,
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))',
  },
  workspaceBadgeLabel: {
    color: 'var(--highlight-color)',
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  workspaceBadgeText: {
    color: 'var(--text-muted)',
    fontSize: 12,
    lineHeight: 1.6,
  },
  navigation: {
    flex: 1,
    padding: '16px 10px',
    overflowY: 'auto',
  },
  navHeading: {
    padding: '0 8px 10px',
    color: 'var(--text-muted)',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    marginBottom: 6,
    borderRadius: 16,
    color: 'var(--text-muted)',
    textDecoration: 'none',
    border: '1px solid transparent',
    position: 'relative',
    minHeight: 60,
  },
  navItemActive: {
    background: 'linear-gradient(135deg, var(--accent-soft), rgba(255,255,255,0.03))',
    color: 'var(--text-color)',
    borderColor: 'var(--surface-border)',
    boxShadow: '0 14px 26px rgba(0,0,0,0.18)',
  },
  navItemClosed: {
    justifyContent: 'center',
    padding: '12px 8px',
  },
  navBadge: {
    minWidth: 34,
    height: 28,
    borderRadius: 8,
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--text-color)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.04em',
  },
  navBadgeActive: {
    background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))',
    color: '#061018',
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
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },
  activeIndicator: {
    position: 'absolute',
    right: 10,
    width: 4,
    height: 24,
    borderRadius: 4,
    background: 'var(--accent-color)',
    boxShadow: '0 0 18px var(--accent-glow)',
  },
  bottomSection: {
    padding: 16,
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'grid',
    gap: 14,
  },
  quickAction: {
    display: 'grid',
    gap: 4,
    padding: 14,
    borderRadius: 18,
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))',
  },
  quickActionLabel: {
    color: 'var(--text-muted)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 700,
  },
  quickActionText: {
    color: 'var(--text-color)',
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
    background: 'linear-gradient(135deg, var(--accent-soft), rgba(255,255,255,0.05))',
    color: 'var(--highlight-color)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800,
  },
  userDetails: {
    minWidth: 0,
    display: 'grid',
    gap: 4,
  },
  userName: {
    color: 'var(--text-color)',
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    color: 'var(--text-muted)',
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toggleButton: {
    margin: 12,
    height: 38,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.02)',
    color: 'var(--text-color)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
};
