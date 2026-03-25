// Super Admin Dashboard - Control Center
import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const { dashboardConfig } = useOutletContext();

  const kpiCards = [
    { title: 'Total Users', value: '1,247', change: '+12%', trend: 'up' },
    { title: 'Active Projects', value: '89', change: '+23%', trend: 'up' },
    { title: 'Revenue', value: '$124,500', change: '+18%', trend: 'up' },
    { title: 'System Health', value: '99.9%', change: '0%', trend: 'stable' }
  ];

  const recentActivity = [
    { id: 1, type: 'user', message: 'New admin assigned: Sarah Wilson', time: '2 min ago', priority: 'high' },
    { id: 2, type: 'system', message: 'Database backup completed', time: '15 min ago', priority: 'normal' },
    { id: 3, type: 'security', message: 'Failed login attempt detected', time: '1 hour ago', priority: 'high' },
    { id: 4, type: 'payment', message: 'Payment gateway synced', time: '2 hours ago', priority: 'normal' }
  ];

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Control Center</h1>
        <p style={styles.subtitle}>Complete system overview and management</p>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        {kpiCards.map((kpi, index) => (
          <div key={index} style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <h3 style={styles.kpiTitle}>{kpi.title}</h3>
              <span style={{
                ...styles.kpiChange,
                ...(kpi.trend === 'up' && styles.kpiChangeUp),
                ...(kpi.trend === 'down' && styles.kpiChangeDown)
              }}>
                {kpi.change}
              </span>
            </div>
            <div style={styles.kpiValue}>{kpi.value}</div>
            <div style={styles.kpiSparkline}>
              {/* Simple sparkline visualization */}
              <div style={styles.sparkline} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={styles.contentGrid}>
        {/* Recent Activity */}
        <div style={styles.activityPanel}>
          <h3 style={styles.panelTitle}>Recent Activity</h3>
          <div style={styles.activityList}>
            {recentActivity.map(activity => (
              <div key={activity.id} style={styles.activityItem}>
                <div style={{
                  ...styles.priorityIndicator,
                  ...(activity.priority === 'high' && styles.priorityHigh),
                  ...(activity.priority === 'normal' && styles.priorityNormal)
                }} />
                <div style={styles.activityContent}>
                  <div style={styles.activityMessage}>{activity.message}</div>
                  <div style={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div style={styles.healthPanel}>
          <h3 style={styles.panelTitle}>System Health</h3>
          <div style={styles.healthMetrics}>
            <div style={styles.healthMetric}>
              <div style={styles.healthLabel}>Server Uptime</div>
              <div style={styles.healthValue}>99.9%</div>
              <div style={styles.healthBar}>
                <div style={{ ...styles.healthBarFill, width: '99.9%' }} />
              </div>
            </div>
            <div style={styles.healthMetric}>
              <div style={styles.healthLabel}>Database</div>
              <div style={styles.healthValue}>Optimal</div>
              <div style={styles.healthBar}>
                <div style={{ ...styles.healthBarFill, width: '95%' }} />
              </div>
            </div>
            <div style={styles.healthMetric}>
              <div style={styles.healthLabel}>API Response</div>
              <div style={styles.healthValue}>124ms</div>
              <div style={styles.healthBar}>
                <div style={{ ...styles.healthBarFill, width: '88%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={styles.chartsSection}>
        <div style={styles.chartPanel}>
          <h3 style={styles.panelTitle}>User Growth</h3>
          <div style={styles.chartPlaceholder}>
            📊 User growth chart would go here
          </div>
        </div>
        <div style={styles.chartPanel}>
          <h3 style={styles.panelTitle}>Revenue Trends</h3>
          <div style={styles.chartPlaceholder}>
            💰 Revenue chart would go here
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    maxWidth: '100%',
    margin: '0 auto'
  },
  header: {
    marginBottom: 32
  },
  title: {
    margin: '0 0 8px',
    fontSize: 32,
    fontWeight: 700,
    color: 'var(--text-color)'
  },
  subtitle: {
    margin: 0,
    fontSize: 16,
    color: 'var(--text-muted)'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 20,
    marginBottom: 32
  },
  kpiCard: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 24,
    transition: 'all 0.2s ease'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  kpiTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-muted)'
  },
  kpiChange: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: 6
  },
  kpiChangeUp: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e'
  },
  kpiChangeDown: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444'
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: 12
  },
  kpiSparkline: {
    height: 40
  },
  sparkline: {
    height: '100%',
    background: 'linear-gradient(90deg, transparent, #00f2ff, transparent)',
    borderRadius: 4,
    opacity: 0.3
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    marginBottom: 32
  },
  activityPanel: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 24
  },
  healthPanel: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 24
  },
  panelTitle: {
    margin: '0 0 20px',
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '12px 0',
    borderBottom: '1px solid #1a1a1a'
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginTop: 6,
    flexShrink: 0
  },
  priorityHigh: {
    background: '#ef4444'
  },
  priorityNormal: {
    background: '#22c55e'
  },
  activityContent: {
    flex: 1
  },
  activityMessage: {
    fontSize: 14,
    color: 'var(--text-color)',
    marginBottom: 4
  },
  activityTime: {
    fontSize: 12,
    color: 'var(--text-muted)'
  },
  healthMetrics: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  healthMetric: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  healthLabel: {
    fontSize: 14,
    color: 'var(--text-muted)'
  },
  healthValue: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  healthBar: {
    height: 6,
    background: 'var(--border-color)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  healthBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00f2ff, #6366f1)',
    transition: 'width 0.3s ease'
  },
  chartsSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20
  },
  chartPanel: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 24
  },
  chartPlaceholder: {
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--border-color)',
    borderRadius: 8,
    color: 'var(--text-muted)',
    fontSize: 14
  }
};
