// Admin Dashboard - Clean Professional Workspace
import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function AdminDashboard() {
  const { dashboardConfig } = useOutletContext();

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Workspace</h1>
        <p style={styles.subtitle}>Manage platform operations and user activities</p>
      </div>

      {/* Empty State */}
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          <svg viewBox="0 0 24 24" fill="none" width="64" height="64">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 style={styles.emptyTitle}>Platform Management Ready</h2>
        <p style={styles.emptyDescription}>
          Your admin workspace is ready. Manage users, monitor platform activity,
          and ensure smooth operations across the CivilBridge ecosystem.
        </p>

        <div style={styles.emptyActions}>
          <button style={styles.primaryButton}>
            <div style={styles.buttonIcon}>👥</div>
            <div style={styles.buttonText}>User Management</div>
          </button>

          <button style={styles.secondaryButton}>
            <div style={styles.buttonIcon}>📊</div>
            <div style={styles.buttonText}>View Analytics</div>
          </button>

          <button style={styles.secondaryButton}>
            <div style={styles.buttonIcon}>⚙️</div>
            <div style={styles.buttonText}>System Settings</div>
          </button>
        </div>
      </div>

      {/* Admin Features */}
      <div style={styles.featuresSection}>
        <h3 style={styles.sectionTitle}>Admin Tools</h3>
        <div style={styles.featuresGrid}>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>👥</div>
            <div style={styles.featureContent}>
              <h4 style={styles.featureTitle}>User Management</h4>
              <p style={styles.featureDescription}>Manage user accounts, roles, and permissions</p>
            </div>
          </div>

          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>📋</div>
            <div style={styles.featureContent}>
              <h4 style={styles.featureTitle}>Project Approvals</h4>
              <p style={styles.featureDescription}>Review and approve project submissions</p>
            </div>
          </div>

          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>📊</div>
            <div style={styles.featureContent}>
              <h4 style={styles.featureTitle}>Platform Analytics</h4>
              <p style={styles.featureDescription}>Monitor platform usage and performance</p>
            </div>
          </div>

          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>🔒</div>
            <div style={styles.featureContent}>
              <h4 style={styles.featureTitle}>Security & Compliance</h4>
              <p style={styles.featureDescription}>Ensure platform security and compliance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  },
  header: {
    textAlign: 'center',
    marginBottom: 64
  },
  title: {
    margin: '0 0 16px',
    fontSize: 32,
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    margin: 0,
    fontSize: 18,
    color: '#a0a0a0',
    lineHeight: 1.5
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: 16,
    marginBottom: 64
  },
  emptyIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    background: '#000000',
    border: '2px solid #1a1a1a',
    borderRadius: '50%',
    marginBottom: 32,
    color: '#ef4444'
  },
  emptyTitle: {
    margin: '0 0 16px',
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff'
  },
  emptyDescription: {
    margin: '0 0 40px',
    fontSize: 16,
    color: '#a0a0a0',
    lineHeight: 1.6,
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  emptyActions: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#ef4444',
    border: 'none',
    borderRadius: 12,
    padding: '16px 32px',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'transparent',
    border: '2px solid #1a1a1a',
    borderRadius: 12,
    padding: '16px 32px',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  buttonIcon: {
    fontSize: 20
  },
  buttonText: {
    fontSize: 16
  },

  // Features Section
  featuresSection: {
    marginBottom: 32
  },
  sectionTitle: {
    margin: '0 0 32px',
    fontSize: 24,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20
  },
  featureItem: {
    display: 'flex',
    gap: 16,
    padding: 20,
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: 12
  },
  featureIcon: {
    fontSize: 24,
    flexShrink: 0,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000000',
    border: '1px solid #1a1a1a',
    borderRadius: 8
  },
  featureContent: {
    flex: 1
  },
  featureTitle: {
    margin: '0 0 8px',
    fontSize: 16,
    fontWeight: 600,
    color: '#ffffff'
  },
  featureDescription: {
    margin: 0,
    fontSize: 14,
    color: '#a0a0a0',
  }
};
