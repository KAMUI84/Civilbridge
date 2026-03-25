// User Management Component for Admin/Super Admin
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function UserManagement() {
  const { dashboardConfig } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Mock data - replace with API call
  const mockUsers = [
    { id: 1, fullName: 'Samuel Nizeyimana', email: 'samuelnizeyimana505@gmail.com', role: 'SUPER_ADMIN', status: 'VERIFIED', isActive: true, createdAt: '2024-03-19' },
    { id: 2, fullName: 'John Doe', email: 'john@example.com', role: 'CLIENT', status: 'VERIFIED', isActive: true, createdAt: '2024-03-18' },
    { id: 3, fullName: 'Sarah Wilson', email: 'sarah@example.com', role: 'ENGINEER', status: 'VERIFIED', isActive: true, createdAt: '2024-03-17' },
    { id: 4, fullName: 'Mike Johnson', email: 'mike@example.com', role: 'ADMIN', status: 'PENDING', isActive: true, createdAt: '2024-03-16' },
    { id: 5, fullName: 'David Chen', email: 'david@example.com', role: 'ENGINEER', status: 'VERIFIED', isActive: false, createdAt: '2024-03-15' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = (user, newRole) => {
    setSelectedUser({ ...user, newRole });
    setShowRoleModal(true);
  };

  const confirmRoleChange = () => {
    // API call to change role
    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, role: selectedUser.newRole }
        : user
    ));
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const handleStatusToggle = (user) => {
    // API call to toggle status
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, isActive: !u.isActive }
        : u
    ));
  };

  const roles = ['SUPER_ADMIN', 'ADMIN', 'ENGINEER', 'CLIENT', 'VIEWER', 'AUDITOR', 'FINANCE', 'STUDENT'];
  const statuses = ['VERIFIED', 'PENDING', 'SUSPENDED'];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>Loading users...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>User Management</h1>
        <p style={styles.subtitle}>Manage users, roles, and permissions</p>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterGroup}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div style={styles.filterGroup}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <button style={styles.addButton}>
          + Add User
        </button>
      </div>

      {/* Users Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableHeaderCell}>User</th>
              <th style={styles.tableHeaderCell}>Role</th>
              <th style={styles.tableHeaderCell}>Status</th>
              <th style={styles.tableHeaderCell}>Active</th>
              <th style={styles.tableHeaderCell}>Joined</th>
              <th style={styles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <div style={styles.userInfo}>
                    <div style={styles.userAvatar}>
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.userDetails}>
                      <div style={styles.userName}>{user.fullName}</div>
                      <div style={styles.userEmail}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.roleBadge,
                    ...(user.role === 'SUPER_ADMIN' && styles.roleSuperAdmin),
                    ...(user.role === 'ADMIN' && styles.roleAdmin),
                    ...(user.role === 'ENGINEER' && styles.roleEngineer),
                    ...(user.role === 'CLIENT' && styles.roleHomeBuilder)
                  }}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.statusBadge,
                    ...(user.status === 'VERIFIED' && styles.statusVerified),
                    ...(user.status === 'PENDING' && styles.statusPending),
                    ...(user.status === 'SUSPENDED' && styles.statusSuspended)
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <button
                    onClick={() => handleStatusToggle(user)}
                    style={{
                      ...styles.toggleButton,
                      ...(user.isActive ? styles.toggleActive : styles.toggleInactive)
                    }}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.dateCell}>{user.createdAt}</div>
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => handleRoleChange(user, user.role)}
                      style={styles.actionButton}
                    >
                      Edit Role
                    </button>
                    <button style={styles.actionButton}>View</button>
                    <button style={styles.actionButtonDanger}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Change User Role</h3>
            <p style={styles.modalText}>
              Change role for <strong>{selectedUser.fullName}</strong> from <strong>{selectedUser.role}</strong> to:
            </p>
            <select
              value={selectedUser.newRole}
              onChange={(e) => setSelectedUser({ ...selectedUser, newRole: e.target.value })}
              style={styles.modalSelect}
            >
              {roles.map(role => (
                <option key={role} value={role}>{role.replace('_', ' ')}</option>
              ))}
            </select>
            <div style={styles.modalActions}>
              <button
                onClick={confirmRoleChange}
                style={styles.modalButtonPrimary}
              >
                Confirm Change
              </button>
              <button
                onClick={() => setShowRoleModal(false)}
                style={styles.modalButtonSecondary}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  },
  spinner: {
    fontSize: '18px',
    color: 'var(--text-muted)'
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
  filters: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  filterGroup: {
    flex: 1,
    minWidth: '200px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px'
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px'
  },
  addButton: {
    background: '#00f2ff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    color: 'var(--bg-color)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  tableContainer: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: 'var(--border-color)'
  },
  tableHeaderCell: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-color)',
    borderBottom: '1px solid #262626'
  },
  tableRow: {
    borderBottom: '1px solid #1a1a1a'
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #00f2ff, #6366f1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--bg-color)'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '4px'
  },
  userEmail: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  roleBadge: {
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase'
  },
  roleSuperAdmin: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444'
  },
  roleAdmin: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b'
  },
  roleEngineer: {
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1'
  },
  roleHomeBuilder: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e'
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: '6px'
  },
  statusVerified: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e'
  },
  statusPending: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b'
  },
  statusSuspended: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444'
  },
  toggleButton: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer'
  },
  toggleActive: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e'
  },
  toggleInactive: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444'
  },
  dateCell: {
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  actionButton: {
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    cursor: 'pointer'
  },
  actionButtonDanger: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    color: '#ef4444',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '24px',
    width: '400px',
    maxWidth: '90%'
  },
  modalTitle: {
    margin: '0 0 16px',
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  modalText: {
    margin: '0 0 16px',
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  modalSelect: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px',
    marginBottom: '20px'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  modalButtonPrimary: {
    background: '#00f2ff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    color: 'var(--bg-color)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  modalButtonSecondary: {
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    padding: '10px 16px',
    color: 'var(--text-muted)',
    fontSize: '14px',
    cursor: 'pointer'
  }
};
