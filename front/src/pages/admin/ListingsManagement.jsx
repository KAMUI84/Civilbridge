import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClientService';

export default function ListingsManagement() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/admin/listings');
      setListings(res.listings || []);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }

  const handleModerate = async (id, action) => {
    if (!window.confirm(`Are you sure you want to change status to ${action}?`)) return;
    try {
      await api.put(`/api/admin/listings/${id}/moderate`, { action });
      setListings(listings.map(l => l.id === id ? { ...l, status: action } : l));
    } catch (err) {
      alert(err.message || "Failed to moderate listing");
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Listings Moderation</h1>
          <p style={styles.subtitle}>Review and moderate real estate marketplace listings.</p>
        </div>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      {/* Table */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loading}>Loading listings...</div>
        ) : listings.length === 0 ? (
          <div style={styles.loading}>No listings found.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Property</th>
                  <th style={styles.th}>Agent</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(listing => (
                  <tr key={listing.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.listingTitle}>{listing.title}</div>
                      <div style={styles.metaData}>{listing.propertyType} • {listing.listingType}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.agent}>{listing.agent?.fullName || 'Unknown'}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.price}>${listing.price}</div>
                    </td>
                    <td style={styles.td}>
                       <span style={{ 
                         ...styles.statusPill, 
                         color: listing.status === 'ACTIVE' ? '#16a34a' : listing.status === 'PENDING' ? '#d97706' : '#dc2626',
                         background: listing.status === 'ACTIVE' ? '#f0fdf4' : listing.status === 'PENDING' ? '#fffbeb' : '#fef2f2',
                       }}>
                         {listing.status}
                       </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                       <div style={styles.actions}>
                         {listing.status !== 'ACTIVE' && (
                           <button 
                             onClick={() => handleModerate(listing.id, 'ACTIVE')}
                             style={{ ...styles.btnOutline, color: '#16a34a', borderColor: '#bbf7d0' }}
                           >
                             Approve
                           </button>
                         )}
                         {listing.status !== 'INACTIVE' && (
                           <button 
                             onClick={() => handleModerate(listing.id, 'INACTIVE')}
                             style={{ ...styles.btnOutline, color: '#d97706', borderColor: '#fde68a' }}
                           >
                             Suspend
                           </button>
                         )}
                         {listing.status !== 'REJECTED' && (
                           <button 
                             onClick={() => handleModerate(listing.id, 'REJECTED')}
                             style={{ ...styles.btnOutline, color: '#dc2626', borderColor: '#fecaca' }}
                           >
                             Reject
                           </button>
                         )}
                       </div>
                    </td>
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

const styles = {
  container: { maxWidth: 1200, paddingBottom: 40 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
  },
  title: { margin: 0, fontSize: 24, fontWeight: 800, color: "#0c1220", letterSpacing: "-0.5px" },
  subtitle: { margin: "4px 0 0", color: "#64708a", fontSize: 14 },
  
  error: { padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 8, marginBottom: 20 },
  loading: { padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 15 },
  
  tableCard: {
    background: "#fff", borderRadius: 12, border: "1px solid #f0f0f4", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", overflow: 'hidden'
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 },
  th: { padding: "14px 20px", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontWeight: 600, fontSize: 13, background: '#f8fafc' },
  td: { padding: "16px 20px", borderBottom: "1px solid #f3f4f6", color: "#1f2937", verticalAlign: 'middle' },
  tr: { transition: "background 0.2s" },

  listingTitle: { fontWeight: 700, color: '#0c1220', fontSize: 15 },
  metaData: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  agent: { fontSize: 14, color: '#374151', fontWeight: 600 },
  price: { fontWeight: 700, color: '#047857' },
  
  statusPill: { padding: '4px 8px', borderRadius: 100, fontSize: 11, fontWeight: 800, display: 'inline-block' },
  
  actions: { display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' },
  btnOutline: {
    padding: "6px 12px", borderRadius: 6, border: "1px solid", background: "#fff", 
    fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "0.2s"
  },
};
