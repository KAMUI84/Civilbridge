// Top Bar Component with Search, Profile, and Notifications
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ user, onToggleSidebar, onToggleRightPanel }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    // Clear auth store and redirect to login
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const notifications = [
    { id: 1, type: 'project', message: 'New project request from John Doe', time: '2m ago', read: false },
    { id: 2, type: 'message', message: 'Sarah sent you a message', time: '15m ago', read: false },
    { id: 3, type: 'approval', message: 'Project "Bridge Design" approved', time: '1h ago', read: true },
    { id: 4, type: 'payment', message: 'Payment received from Client ABC', time: '2h ago', read: true }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={styles.topBar}>
      {/* Left Section */}
      <div style={styles.leftSection}>
        <button style={styles.menuButton} onClick={onToggleSidebar}>
          ☰
        </button>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search users, projects, logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </form>
      </div>

      {/* Right Section */}
      <div style={styles.rightSection}>
        {/* Notifications */}
        <div style={styles.notificationWrapper}>
          <button 
            style={styles.notificationButton}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            {unreadCount > 0 && (
              <span style={styles.notificationBadge}>{unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div style={styles.notificationDropdown}>
              <div style={styles.notificationHeader}>
                <h4 style={styles.notificationTitle}>Notifications</h4>
                <button style={styles.markAllRead}>Mark all read</button>
              </div>
              <div style={styles.notificationList}>
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    style={{
                      ...styles.notificationItem,
                      ...(notification.read ? styles.notificationRead : {})
                    }}
                  >
                    <div style={styles.notificationContent}>
                      <div style={styles.notificationMessage}>
                        {notification.message}
                      </div>
                      <div style={styles.notificationTime}>
                        {notification.time}
                      </div>
                    </div>
                    {!notification.read && (
                      <div style={styles.notificationDot} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div style={styles.profileWrapper}>
          <button 
            style={styles.profileButton}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div style={styles.profileAvatar}>
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <span style={styles.profileName}>{user?.fullName}</span>
            <span style={styles.profileArrow}>▼</span>
          </button>
          
          {showProfileMenu && (
            <div style={styles.profileDropdown}>
              <Link to="/dashboard/profile" style={styles.profileMenuItem}>
                👤 Profile Settings
              </Link>
              <Link to="/dashboard/settings" style={styles.profileMenuItem}>
                ⚙️ Account Settings
              </Link>
              <div style={styles.profileDivider} />
              <button style={styles.profileLogout} onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        {/* Right Panel Toggle */}
        <button style={styles.rightPanelButton} onClick={onToggleRightPanel}>
          🤖
        </button>
      </div>
    </div>
  );
}

const styles = {
  topBar: {
    height: 64,
    background: 'var(--card-bg)',
    borderBottom: '1px solid #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 16
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 20,
    cursor: 'pointer',
    padding: 8,
    borderRadius: 6,
    transition: 'background 0.2s ease'
  },
  searchForm: {
    margin: 0
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: 8,
    padding: '8px 12px',
    width: 320,
    transition: 'border-color 0.2s ease'
  },
  searchIcon: {
    color: 'var(--text-muted)',
    marginRight: 8,
    fontSize: 14
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: 'var(--text-color)',
    fontSize: 14,
    outline: 'none',
    flex: 1,
    width: '100%'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 16
  },
  notificationWrapper: {
    position: 'relative'
  },
  notificationButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 18,
    cursor: 'pointer',
    padding: 8,
    borderRadius: 6,
    position: 'relative',
    transition: 'background 0.2s ease'
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    background: '#ef4444',
    color: 'white',
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 4px',
    borderRadius: 10,
    minWidth: 16,
    textAlign: 'center'
  },
  notificationDropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 320,
    background: '#0f0f0f',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    zIndex: 1000
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #1a1a1a'
  },
  notificationTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  markAllRead: {
    background: 'none',
    border: 'none',
    color: '#00f2ff',
    fontSize: 12,
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4
  },
  notificationList: {
    maxHeight: 300,
    overflowY: 'auto'
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    borderBottom: '1px solid #1a1a1a',
    cursor: 'pointer',
    transition: 'background 0.2s ease'
  },
  notificationRead: {
    opacity: 0.6
  },
  notificationContent: {
    flex: 1,
    minWidth: 0
  },
  notificationMessage: {
    fontSize: 13,
    color: 'var(--text-color)',
    marginBottom: 4
  },
  notificationTime: {
    fontSize: 11,
    color: 'var(--text-muted)'
  },
  notificationDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#00f2ff',
    marginLeft: 8
  },
  profileWrapper: {
    position: 'relative'
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: '1px solid #1a1a1a',
    borderRadius: 8,
    padding: '6px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: 'linear-gradient(135deg, #00f2ff, #6366f1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--bg-color)'
  },
  profileName: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-color)'
  },
  profileArrow: {
    fontSize: 10,
    color: 'var(--text-muted)'
  },
  profileDropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 200,
    background: '#0f0f0f',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    padding: '8px 0'
  },
  profileMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    color: 'var(--text-color)',
    textDecoration: 'none',
    fontSize: 13,
    transition: 'background 0.2s ease'
  },
  profileDivider: {
    height: 1,
    background: 'var(--border-color)',
    margin: '8px 0'
  },
  profileLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'background 0.2s ease'
  },
  rightPanelButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 18,
    cursor: 'pointer',
    padding: 8,
    borderRadius: 6,
    transition: 'background 0.2s ease'
  }
};
