import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClientService';

export default function VerificationQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/admin/verification-queue');
      setQueue(res.queue || []);
    } catch (err) {
      setError(err.message || 'Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this professional?")) return;
    try {
      await api.post(`/api/admin/verification/${id}/approve`);
      setQueue(queue.filter(q => q.id !== id));
    } catch (err) {
      alert(err.message || "Failed to approve verification");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter reason for rejection (required):");
    if (reason === null) return; // Cancelled
    if (!reason.trim()) return alert("Rejection reason is required.");
    
    try {
      await api.post(`/api/admin/verification/${id}/reject`, { reason });
      setQueue(queue.filter(q => q.id !== id));
    } catch (err) {
      alert(err.message || "Failed to reject verification");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Verification Queue</h1>
        <p style={styles.subtitle}>Review and approve pending expert registrations.</p>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Loading queue...</div>
      ) : queue.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>Inbox Zero! 🎉</div>
          <div>No professionals are pending verification right now.</div>
        </div>
      ) : (
        <div style={styles.grid}>
          {queue.map((req) => (
            <div key={req.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.userBox}>
                  <div style={styles.avatar}>
                    {req.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 style={styles.name}>{req.user?.fullName || 'Unknown User'}</h3>
                    <div style={styles.email}>{req.user?.email}</div>
                  </div>
                </div>
                <div style={styles.roleBadge}>{req.providerType}</div>
              </div>

              <div style={styles.details}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Company:</span>
                  <span style={styles.detailValue}>{req.companyName || 'Independant'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>License #:</span>
                  <span style={styles.detailValue}>{req.licenseNumber || 'Not provided'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Exp. Years:</span>
                  <span style={styles.detailValue}>{req.yearsOfExperience || 0}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Requested At:</span>
                  <span style={styles.detailValue}>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {req.portfolioUrl && (
                <div style={styles.portfolioBox}>
                  <strong>Portfolio:</strong> <a href={req.portfolioUrl} target="_blank" rel="noreferrer" style={styles.link}>{req.portfolioUrl}</a>
                </div>
              )}

              <div style={styles.actions}>
                <button 
                  onClick={() => handleReject(req.id)}
                  style={{ ...styles.btn, ...styles.btnReject }}
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleApprove(req.id)}
                  style={{ ...styles.btn, ...styles.btnApprove }}
                >
                  Approve Expert
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 1200, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { margin: 0, fontSize: 24, fontWeight: 800, color: "#0c1220", letterSpacing: "-0.5px" },
  subtitle: { margin: "4px 0 0", color: "#64708a", fontSize: 14 },
  
  error: { padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 8, marginBottom: 20 },
  loading: { padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 15 },
  emptyState: { 
    background: '#fff', padding: 60, textAlign: 'center', borderRadius: 16, border: '1px solid #f0f0f4',
    color: '#64708a', fontSize: 16, fontWeight: 500
  },

  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20
  },
  card: {
    background: '#fff', borderRadius: 16, border: '1px solid #f0f0f4', padding: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 16
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
  },
  userBox: { display: 'flex', gap: 12, alignItems: 'center' },
  avatar: {
    width: 44, height: 44, borderRadius: '50%', background: '#1a1a2e', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16
  },
  name: { margin: 0, fontSize: 16, fontWeight: 700, color: '#0c1220' },
  email: { color: '#64708a', fontSize: 13, marginTop: 2 },
  
  roleBadge: {
    background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: 6,
    fontSize: 11, fontWeight: 800, color: '#334155', letterSpacing: '0.5px'
  },

  details: {
    background: '#f8fafc', padding: 14, borderRadius: 10, display: 'grid', gap: 8 
  },
  detailRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13 },
  detailLabel: { color: '#64708a', fontWeight: 500 },
  detailValue: { color: '#0c1220', fontWeight: 600, textAlign: 'right' },
  
  portfolioBox: {
    fontSize: 13, background: '#f0fdfa', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #ccfbf1', color: '#115e59'
  },
  link: { color: '#0d9488', textDecoration: 'underline' },

  actions: {
    display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 8
  },
  btn: {
    flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    border: 'none', transition: '0.2s'
  },
  btnApprove: { background: '#16a34a', color: '#fff' },
  btnReject: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
};
