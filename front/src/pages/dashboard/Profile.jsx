import PageShell from "../../components/common/PageShell";
import { useAuthStore } from '../../store/authStore';
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '24px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-color)'
  },
  subtitle: {
    margin: '0 0 32px',
    fontSize: '16px',
    color: 'var(--text-muted)'
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    fontSize: '18px',
    color: 'var(--text-muted)'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    fontSize: '18px',
    color: 'var(--text-muted)'
  },
  header: {
    marginBottom: 24
  },
  profileOverview: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  profileCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 24,
    background: '#f7f9ff',
    border: '1px solid #eef0f4',
    borderRadius: 14
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 24
  },
  avatar: {
    width: 64,
    height: 64,
    background: '#0c1220',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontSize: 24,
    marginRight: 12
  },
  avatarInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  profileName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0c1220',
    marginBottom: 4
  },
  profileRole: {
    fontSize: 14,
    color: 'var(--text-muted)'
  },
  verificationBadges: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 8
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#34c759',
    marginRight: 8
  },
  profileStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0c1220',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    color: 'var(--text-muted)'
  },
  tabs: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    border: '1px solid #eef0f4',
    borderRadius: 14,
    padding: 12
  },
  tab: {
    fontSize: 16,
    color: '#0c1220',
    padding: '12px 24px',
    cursor: 'pointer'
  },
  tabActive: {
    background: '#f7f9ff',
    borderRadius: 12
  },
  tabContent: {
    padding: 24,
    background: '#f7f9ff',
    border: '1px solid #eef0f4',
    borderRadius: 14
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0c1220'
  },
  editButton: {
    fontSize: 14,
    color: '#0c1220',
    background: '#f7f9ff',
    border: '1px solid #eef0f4',
    padding: '8px 16px',
    borderRadius: 12,
    cursor: 'pointer'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridGap: 12
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  formLabel: {
    fontSize: 14,
    color: 'var(--text-muted)',
    marginBottom: 4
  },
  formInput: {
    fontSize: 16,
    color: '#0c1220',
    padding: '12px 16px',
    border: '1px solid #eef0f4',
    borderRadius: 12
  },
  formTextarea: {
    fontSize: 16,
    color: '#0c1220',
    padding: '12px 16px',
    border: '1px solid #eef0f4',
    borderRadius: 12
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12
  },
  saveButton: {
    fontSize: 16,
    color: '#fff',
    background: '#34c759',
    padding: '12px 24px',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer'
  },
  securitySection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  securityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    border: '1px solid #eef0f4',
    borderRadius: 12,
    marginBottom: 12
  },
  securityInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0c1220',
    marginBottom: 4
  },
  securityDescription: {
    fontSize: 14,
    color: 'var(--text-muted)'
  },
  passwordForm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '12px 16px',
    border: '1px solid #eef0f4',
    borderRadius: 12
  },
  notificationSettings: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  notificationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    border: '1px solid #eef0f4',
    borderRadius: 12,
    marginBottom: 12
  },
  notificationInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0c1220',
    marginBottom: 4
  },
  notificationDescription: {
    fontSize: 14,
    color: 'var(--text-muted)'
  },
  toggle: {
    position: 'relative',
    display: 'inline-block',
    width: 60,
    height: 34
  },
  toggleSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#ccc',
    transition: '0.4s'
  }
};

export default function Profile() {
  const { dashboardConfig } = useOutletContext();
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock user data
  const mockUserData = {
    id: 1,
    fullName: 'Samuel Nizeyimana',
    email: 'samuelnizeyimana505@gmail.com',
    phone: '+250790850144',
    role: 'SUPER_ADMIN',
    avatar: 'SN',
    bio: 'Civil engineering professional with expertise in bridge design and infrastructure management.',
    location: 'Kigali, Rwanda',
    website: 'https://civilbridge.com',
    linkedin: 'https://linkedin.com/in/samuelnizeyimana',
    joinedAt: '2024-03-01',
    lastLogin: '2024-03-19 20:39:33',
    emailVerified: true,
    phoneVerified: true,
    twoFactorEnabled: true,
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showProfile: true,
      allowMessages: true
    },
    statistics: {
      projectsCompleted: 12,
      totalRevenue: '$124,500',
      clientRating: 4.8,
      responseTime: '2 hours',
      projectsActive: 3
    }
  };

  useEffect(() => {
    setFormData(mockUserData);
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser(formData);
      setEditMode(false);
      setLoading(false);
    }, 1000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLoading(false);
      alert('Password changed successfully');
    }, 1000);
  };

  const handleNotificationChange = (key, value) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [key]: value
      }
    });
  };

  const handlePrivacyChange = (key, value) => {
    setFormData({
      ...formData,
      privacy: {
        ...formData.privacy,
        [key]: value
      }
    });
  };

  if (!formData.id) {
    return <div style={styles.loading}>Loading profile...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Profile Settings</h1>
        <p style={styles.subtitle}>Manage your account settings and preferences</p>
      </div>

      {/* Profile Overview */}
      <div style={styles.profileOverview}>
        <div style={styles.profileCard}>
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {formData.avatar}
            </div>
            <div style={styles.avatarInfo}>
              <h2 style={styles.profileName}>{formData.fullName}</h2>
              <p style={styles.profileRole}>{formData.role.replace('_', ' ')}</p>
              <div style={styles.verificationBadges}>
                {formData.emailVerified && <span style={styles.verifiedBadge}>✓ Email Verified</span>}
                {formData.phoneVerified && <span style={styles.verifiedBadge}>✓ Phone Verified</span>}
                {formData.twoFactorEnabled && <span style={styles.verifiedBadge}>✓ 2FA Enabled</span>}
              </div>
            </div>
          </div>

          <div style={styles.profileStats}>
            <div style={styles.stat}>
              <div style={styles.statValue}>{formData.statistics?.projectsCompleted}</div>
              <div style={styles.statLabel}>Projects Completed</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>{formData.statistics?.totalRevenue}</div>
              <div style={styles.statLabel}>Total Revenue</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>{formData.statistics?.clientRating}</div>
              <div style={styles.statLabel}>Client Rating</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>{formData.statistics?.responseTime}</div>
              <div style={styles.statLabel}>Response Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'overview' && styles.tabActive)
          }}
          onClick={() => setActiveTab('overview')}
        >
          👤 Overview
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'security' && styles.tabActive)
          }}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'notifications' && styles.tabActive)
          }}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'privacy' && styles.tabActive)
          }}
          onClick={() => setActiveTab('privacy')}
        >
          🛡️ Privacy
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'billing' && styles.tabActive)
          }}
          onClick={() => setActiveTab('billing')}
        >
          💳 Billing
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Personal Information</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                style={styles.editButton}
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={styles.formInput}
                  disabled={!editMode}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={styles.formInput}
                  disabled={!editMode}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={styles.formInput}
                  disabled={!editMode}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={styles.formInput}
                  disabled={!editMode}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                style={styles.formTextarea}
                rows={4}
                disabled={!editMode}
              />
            </div>

            {editMode && (
              <div style={styles.formActions}>
                <button
                  onClick={handleSaveProfile}
                  style={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Security Settings</h3>
            </div>

            <div style={styles.securitySection}>
              <div style={styles.securityItem}>
                <div style={styles.securityInfo}>
                  <h4 style={styles.securityTitle}>Change Password</h4>
                  <p style={styles.securityDescription}>Update your password to keep your account secure</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} style={styles.passwordForm}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    style={styles.formInput}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    style={styles.formInput}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    style={styles.formInput}
                    required
                  />
                </div>

                <button type="submit" style={styles.saveButton} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Notification Preferences</h3>
            </div>

            <div style={styles.notificationSettings}>
              <div style={styles.notificationItem}>
                <div style={styles.notificationInfo}>
                  <h4 style={styles.notificationTitle}>Email Notifications</h4>
                  <p style={styles.notificationDescription}>Receive updates and alerts via email</p>
                </div>
                <label style={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={formData.notifications?.email}
                    onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  />
                  <span style={styles.toggleSlider}></span>
                </label>
              </div>

              <div style={styles.notificationItem}>
                <div style={styles.notificationInfo}>
                  <h4 style={styles.notificationTitle}>Push Notifications</h4>
                  <p style={styles.notificationDescription}>Receive real-time notifications in your browser</p>
                </div>
                <label style={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={formData.notifications?.push}
                    onChange={(e) => handleNotificationChange('push', e.target.checked)}
                  />
                  <span style={styles.toggleSlider}></span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Line({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderRadius: 14, border: "1px solid #eef0f4", background: "#f7f9ff" }}>
      <b style={{ color: "#0c1220" }}>{k}</b>
      <span>{v}</span>
    </div>
  );
}