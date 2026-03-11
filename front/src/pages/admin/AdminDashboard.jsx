import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClientService';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch stats from multiple endpoints
        const [usersRes, plansRes, listingsRes, projectsRes, expertsRes] = await Promise.allSettled([
          api.get('/api/admin/users'),
          api.get('/api/admin/plans'),
          api.get('/api/admin/listings'),
          api.get('/api/admin/projects'),
          api.get('/api/admin/experts'),
        ]);

        const users = usersRes.status === 'fulfilled' ? usersRes.value || [] : [];
        const plans = plansRes.status === 'fulfilled' ? plansRes.value || [] : [];
        const listings = listingsRes.status === 'fulfilled' ? listingsRes.value || [] : [];
        const projects = projectsRes.status === 'fulfilled' ? projectsRes.value || [] : [];
        const experts = expertsRes.status === 'fulfilled' ? expertsRes.value || [] : [];

        setStats({
          total_users: users.length,
          verified_professionals: experts.filter(e => e.verifiedAt).length,
          pending_verification: experts.filter(e => !e.verifiedAt).length,
          total_plans: plans.length,
          total_listings: listings.length,
          total_projects: projects.length,
        });

        setActivity([]); // TODO: implement audit logs
      } catch (err) {
        setError(err.message || "Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', ...styles.container }}>
        <p style={{ color: "#64708a", fontWeight: 600 }}>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ padding: 20, color: '#dc2626', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.total_users || 0, color: "#2563eb", icon: "👥" },
    { label: "Verified Pros", value: stats?.verified_professionals || 0, color: "#16a34a", icon: "✅" },
    { label: "Pending Verifs", value: stats?.pending_verification || 0, color: "#d97706", icon: "⏳" },
    { label: "Total Plans", value: stats?.total_plans || 0, color: "#7c3aed", icon: "📐" },
    { label: "Total Listings", value: stats?.total_listings || 0, color: "#0d9488", icon: "🏠" },
    { label: "Total Projects", value: stats?.total_projects || 0, color: "#db2777", icon: "🏗️" },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Admin Overview</h1>
        <p style={styles.subtitle}>Platform-wide statistics and recent activity.</p>
      </header>

      {/* Stats Grid */}
      <div style={styles.grid}>
        {statCards.map((card, idx) => (
          <div key={idx} style={styles.card}>
            <div style={{ ...styles.iconPlaceholder, background: `${card.color}15`, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <div style={styles.cardValue}>{card.value}</div>
              <div style={styles.cardLabel}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionGrid}>
          <QuickAction label="Manage Users" onClick={() => navigate('/admin/users')} />
          <QuickAction label="Verification Queue" onClick={() => navigate('/admin/verification')} />
          <QuickAction label="Moderate Plans" onClick={() => navigate('/admin/plans')} />
          <QuickAction label="Moderate Listings" onClick={() => navigate('/admin/listings')} />
          <QuickAction label="Manage Catalog" onClick={() => navigate('/admin/catalog')} />
          <QuickAction label="Audit Logs" onClick={() => navigate('/admin/audit')} />
        </div>
      </div>

      {/* Recent Activity Table */}
      <div style={styles.activitySection}>
        <h2 style={styles.sectionTitle}>Recent Audit Logs</h2>
        {activity.length === 0 ? (
          <p style={styles.noData}>No recent activity found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Entity</th>
                  <th style={styles.th}>User ID</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((log) => (
                  <tr key={log.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.actionPill}>{log.action}</span>
                    </td>
                    <td style={styles.td}>{log.entityType} #{log.entityId}</td>
                    <td style={styles.td}>{log.userId}</td>
                    <td style={styles.td}>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickAction({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 600,
        color: '#374151',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'center',
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f9fafb';
        e.target.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = '#fff';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      {label}
    </button>
  );
}

const styles = {
  container: {
    maxWidth: 1200,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "#0c1220",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#64708a",
    fontSize: 15,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    marginBottom: 40,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
    border: "1px solid #f0f0f4",
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0c1220",
    lineHeight: 1.2,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#6b7280",
    marginTop: 2,
  },
  activitySection: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
    border: "1px solid #f0f0f4",
  },
  quickActions: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
    border: "1px solid #f0f0f4",
    marginBottom: 32,
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
  },
  sectionTitle: {
    margin: "0 0 20px",
    fontSize: 18,
    fontWeight: 700,
    color: "#0c1220",
    letterSpacing: "-0.3px",
  },
  noData: {
    color: "#6b7280",
    fontSize: 14,
    margin: 0,
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: 14,
  },
  th: {
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    color: "#6b7280",
    fontWeight: 600,
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #f3f4f6",
    color: "#1f2937",
    fontWeight: 500,
  },
  tr: {
    transition: "background 0.2s",
  },
  actionPill: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "4px 10px",
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 700,
    display: "inline-block",
  },
};