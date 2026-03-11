import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClientService';

const ROLES = ["HOME_BUILDER", "ENGINEER", "CONTRACTOR", "SUPPLIER", "STUDENT", "ADMIN"];

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ role: '', status: '' });
  
  const limit = 20;

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, filters.role, filters.status]);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError('');
      const query = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status })
      });
      const res = await api.get(`/api/admin/users?${query.toString()}`);
      setUsers(res.users);
      setTotal(res.total);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.message || "Failed to change role");
    }
  };

  const handleToggleActive = async (userId, currentState) => {
    try {
      await api.put(`/api/admin/users/${userId}/toggle-active`, { is_active: !currentState });
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentState } : u));
    } catch (err) {
      alert(err.message || "Failed to toggle status");
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Users Management</h1>
          <p style={styles.subtitle}>View, search, and manage platform users.</p>
        </div>
      </header>

      {/* Controls Container */}
      <div style={styles.controls}>
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.btn}>Search</button>
        </form>

        <div style={styles.filterGroup}>
          <select 
            value={filters.role} 
            onChange={(e) => { setFilters(f => ({ ...f, role: e.target.value })); setPage(1); }}
            style={styles.select}
          >
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select 
            value={filters.status} 
            onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
            style={styles.select}
          >
            <option value="">All Verification Status</option>
            <option value="UNVERIFIED">Unverified</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Table */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loading}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={styles.loading}>No users found.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Contact Info</th>
                  <th style={styles.th}>Role / Status</th>
                  <th style={styles.th}>Account Status</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>{user.fullName.charAt(0).toUpperCase()}</div>
                        <div style={styles.name}>{user.fullName}</div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.contactEmail}>{user.email}</div>
                      <div style={styles.contactPhone}>{user.phone || 'N/A'}</div>
                    </td>
                    <td style={styles.td}>
                      <div><span style={styles.rolePill}>{user.role}</span></div>
                      <div style={styles.statusPill(user.verificationStatus)}>{user.verificationStatus}</div>
                    </td>
                    <td style={styles.td}>
                       <span style={{ 
                         ...styles.activeIndicator, 
                         color: user.isActive ? '#16a34a' : '#dc2626',
                         background: user.isActive ? '#f0fdf4' : '#fef2f2',
                       }}>
                         {user.isActive ? '● Active' : '○ Disabled'}
                       </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                       <div style={styles.actions}>
                         <select 
                           value={user.role}
                           onChange={(e) => handleRoleChange(user.id, e.target.value)}
                           style={{ ...styles.select, padding: '4px 8px', fontSize: 12, height: 'auto' }}
                         >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                         </select>
                         <button 
                           onClick={() => handleToggleActive(user.id, user.isActive)}
                           style={{
                             ...styles.btnOutline,
                             color: user.isActive ? '#dc2626' : '#16a34a',
                             borderColor: user.isActive ? '#fecaca' : '#bbf7d0',
                           }}
                         >
                           {user.isActive ? 'Disable' : 'Enable'}
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && total > limit && (
        <div style={styles.pagination}>
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={styles.pageBtn}
          >
            ← Previous
          </button>
          <span style={styles.pageInfo}>
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button 
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => setPage(p => p + 1)}
            style={styles.pageBtn}
          >
            Next →
          </button>
        </div>
      )}
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
  
  controls: {
    display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20, justifyContent: 'space-between'
  },
  searchForm: { display: 'flex', gap: 8, flex: '1 1 300px' },
  searchInput: {
    flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: 'none'
  },
  filterGroup: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  select: {
    padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: 'none', background: '#fff'
  },
  btn: {
    padding: "10px 16px", borderRadius: 8, border: "none", background: "#0c1220", color: "#fff", 
    fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "0.2s"
  },
  btnOutline: {
    padding: "6px 12px", borderRadius: 6, border: "1px solid", background: "#fff", 
    fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "0.2s"
  },
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

  userCell: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { 
    width: 36, height: 36, borderRadius: '50%', background: '#2563eb', color: '#fff', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0
  },
  name: { fontWeight: 700, color: '#0c1220' },
  contactEmail: { fontSize: 14, color: '#374151', fontWeight: 500 },
  contactPhone: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  
  rolePill: { 
    background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700, display: "inline-block", marginBottom: 4 
  },
  statusPill: (status) => ({
    fontSize: 11, fontWeight: 700,
    color: status === 'VERIFIED' ? '#16a34a' : status === 'PENDING' ? '#d97706' : status === 'REJECTED' ? '#dc2626' : '#6b7280',
  }),
  activeIndicator: { padding: '4px 8px', borderRadius: 100, fontSize: 12, fontWeight: 700 },
  
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' },
  
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 },
  pageBtn: { padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 600, cursor: "pointer", color: '#374151' },
  pageInfo: { fontSize: 14, fontWeight: 600, color: '#6b7280' },
};
