// Sidebar Navigation Component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose, config, activeSection, onSectionChange, user }) {
  const location = useLocation();

  const handleNavClick = (sectionId) => {
    onSectionChange(sectionId);
    // Mobile: close sidebar after navigation
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          style={styles.overlay}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div style={{ 
        ...styles.sidebar, 
        ...(isOpen ? styles.sidebarOpen : styles.sidebarClosed),
        ...(window.innerWidth < 768 && { 
          ...styles.sidebarMobile,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
        })
      }}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🏗️</span>
            <span style={{ ...styles.logoText, ...(isOpen ? {} : styles.logoTextClosed) }}>
              CivilBridge
            </span>
          </div>
          {isOpen && (
            <div style={styles.userRole}>
              {user?.role?.replace('_', ' ')}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={styles.navigation}>
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
                  ...(!isOpen ? styles.navItemClosed : {})
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {isOpen && (
                  <span style={styles.navLabel}>{item.label}</span>
                )}
                {isActive && (
                  <div style={styles.activeIndicator} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        {isOpen && (
          <div style={styles.bottomSection}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {user?.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <div style={styles.userDetails}>
                <div style={styles.userName}>{user?.fullName}</div>
                <div style={styles.userEmail}>{user?.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button (for desktop) */}
        <button
          style={{
            ...styles.toggleButton,
            ...(window.innerWidth >= 768 ? styles.toggleButtonDesktop : styles.toggleButtonMobile)
          }}
          onClick={onClose}
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>
    </>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: 240,
    background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)',
    borderRight: '1px solid #1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1000
  },
  sidebarOpen: {
    transform: 'translateX(0)'
  },
  sidebarClosed: {
    transform: 'translateX(-180px)',
    width: 60
  },
  sidebarMobile: {
    width: 240
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: 'none'
  },
  logoSection: {
    padding: '20px 16px',
    borderBottom: '1px solid #1a1a1a',
    textAlign: 'center'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8
  },
  logoIcon: {
    fontSize: 24,
    color: '#00f2ff'
  },
  logoText: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-color)',
    transition: 'opacity 0.3s ease'
  },
  logoTextClosed: {
    opacity: 0,
    width: 0,
    overflow: 'hidden'
  },
  userRole: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 600
  },
  navigation: {
    flex: 1,
    padding: '16px 8px',
    overflowY: 'auto'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    margin: '2px 8px',
    borderRadius: 8,
    color: 'var(--text-muted)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    position: 'relative',
    cursor: 'pointer'
  },
  navItemActive: {
    background: 'rgba(0, 242, 255, 0.1)',
    color: '#00f2ff',
    border: '1px solid rgba(0, 242, 255, 0.2)'
  },
  navItemClosed: {
    justifyContent: 'center',
    padding: '12px'
  },
  navIcon: {
    fontSize: 18,
    minWidth: 18,
    textAlign: 'center'
  },
  navLabel: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: 500
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 3,
    height: 20,
    background: '#00f2ff',
    borderRadius: 2
  },
  bottomSection: {
    padding: '16px',
    borderTop: '1px solid #1a1a1a'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #00f2ff, #6366f1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--bg-color)'
  },
  userDetails: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-color)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  userEmail: {
    fontSize: 12,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  toggleButton: {
    position: 'absolute',
    right: -12,
    top: 20,
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#00f2ff',
    border: '2px solid #050505',
    color: 'var(--bg-color)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 600,
    transition: 'all 0.2s ease',
    zIndex: 1001
  },
  toggleButtonDesktop: {
    display: 'flex'
  },
  toggleButtonMobile: {
    display: 'none'
  }
};
