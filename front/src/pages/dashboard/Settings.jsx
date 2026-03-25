// Settings Component
import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Settings() {
  const { dashboardConfig } = useOutletContext();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>System configuration and preferences</p>
      </div>

      <div style={styles.settingsGrid}>
        <div style={styles.settingsCard}>
          <h3 style={styles.cardTitle}>General Settings</h3>
          <div style={styles.settingItem}>
            <label style={styles.settingLabel}>Platform Name</label>
            <input type="text" defaultValue="CivilBridge" style={styles.settingInput} />
          </div>
          <div style={styles.settingItem}>
            <label style={styles.settingLabel}>Default Language</label>
            <select style={styles.settingSelect}>
              <option>English</option>
              <option>French</option>
              <option>Kinyarwanda</option>
            </select>
          </div>
        </div>

        <div style={styles.settingsCard}>
          <h3 style={styles.cardTitle}>Email Configuration</h3>
          <div style={styles.settingItem}>
            <label style={styles.settingLabel}>SMTP Host</label>
            <input type="text" placeholder="smtp.example.com" style={styles.settingInput} />
          </div>
          <div style={styles.settingItem}>
            <label style={styles.settingLabel}>SMTP Port</label>
            <input type="number" defaultValue="587" style={styles.settingInput} />
          </div>
        </div>

        <div style={styles.settingsCard}>
          <h3 style={styles.cardTitle}>Security Settings</h3>
          <div style={styles.settingItem}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked />
              Two-Factor Authentication
            </label>
          </div>
          <div style={styles.settingItem}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked />
              Email Verification Required
            </label>
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.saveButton}>Save Changes</button>
        <button style={styles.resetButton}>Reset to Default</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-color)'
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: 'var(--text-muted)'
  },
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  settingsCard: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '24px'
  },
  cardTitle: {
    margin: '0 0 20px',
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  settingItem: {
    marginBottom: '16px'
  },
  settingLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  settingInput: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px'
  },
  settingSelect: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: 'var(--text-color)',
    cursor: 'pointer'
  },
  actions: {
    display: 'flex',
    gap: '12px'
  },
  saveButton: {
    background: '#00f2ff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    color: 'var(--bg-color)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  resetButton: {
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    padding: '12px 24px',
    color: 'var(--text-muted)',
    fontSize: '14px',
    cursor: 'pointer'
  }
};
