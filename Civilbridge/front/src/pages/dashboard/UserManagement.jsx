import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui';
import adminUsersService from '../../services/adminUsersService';
import rolesService from '../../services/rolesService';
import SEO from '../../components/seo/SEO';
import { ALL_USER_ROLES, getRoleLabel } from '../../utils/roles';

const ROLES = ALL_USER_ROLES;
const STATUSES = ['VERIFIED', 'PENDING', 'UNVERIFIED', 'REJECTED'];
const EXPERT_VISIBILITY_ROLES = new Set(['ENGINEER', 'ARCHITECT', 'CONTRACTOR', 'SUPPLIER']);

const roleColors = {
  SUPER_ADMIN: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  ADMIN: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  PROFESSIONAL: { bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
  CLIENT: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
  ENGINEER: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  ARCHITECT: { bg: 'rgba(14,165,233,0.1)', color: '#0ea5e9' },
  CONTRACTOR: { bg: 'rgba(249,115,22,0.1)', color: '#f97316' },
  SUPPLIER: { bg: 'rgba(20,184,166,0.1)', color: '#14b8a6' },
  HOME_BUILDER: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  VIEWER: { bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
  AUDITOR: { bg: 'rgba(6,182,212,0.1)', color: '#06b6d4' },
  FINANCE: { bg: 'rgba(168,85,247,0.1)', color: '#a855f7' },
  STUDENT: { bg: 'rgba(217,70,239,0.1)', color: '#d946ef' },
};

const statusColors = {
  VERIFIED: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
  PENDING: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  UNVERIFIED: { bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
  REJECTED: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
};

function Toast({ message, type }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      background: type === 'error' ? '#1a0505' : '#051a0a',
      border: `1px solid ${type === 'error' ? '#ef444440' : '#22c55e40'}`,
      borderRadius: 10,
      padding: '12px 20px',
      color: type === 'error' ? '#ef4444' : '#22c55e',
      fontSize: 14,
      fontWeight: 500,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      {type === 'error' ? 'Warning: ' : 'Success: '}{message}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={styles.tableContainer}>
      <div style={styles.loadingRow}>
        <div style={styles.spinner} />
        <span style={{ color: '#555', fontSize: 14 }}>Loading users...</span>
      </div>
      <div style={styles.skeletonRows}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} style={styles.skeletonRow} />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={styles.stateCard}>
      <div style={styles.stateIcon}>!</div>
      <h3 style={styles.stateTitle}>Failed to load user management data</h3>
      <p style={styles.stateText}>{message}</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
}

function EmptyState({ message, onRetry }) {
  return (
    <div style={styles.stateCard}>
      <div style={styles.stateIcon}>0</div>
      <h3 style={styles.stateTitle}>No users found</h3>
      <p style={styles.stateText}>{message}</p>
      <Button variant="secondary" onClick={onRetry}>Refresh</Button>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [roleModalLoading, setRoleModalLoading] = useState(false);
  const [roleModalError, setRoleModalError] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(null), 3500);
  }, []);

  const loadUsers = useCallback(async (page = 1) => {
    try {
      setState({ loading: true, error: '' });
      const response = await adminUsersService.list({
        page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        role: roleFilter,
        status: statusFilter,
      });

      setUsers(response?.users || []);
      setPagination({
        page: response?.page || page,
        limit: response?.limit || pagination.limit,
        total: response?.total || 0,
        totalPages: response?.totalPages || 1,
      });
      setState({ loading: false, error: '' });
    } catch (error) {
      setUsers([]);
      setState({ loading: false, error: error.message || 'Failed to load users.' });
    }
  }, [pagination.limit, roleFilter, searchTerm, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadUsers(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const openRoleModal = useCallback(async (user) => {
    setSelectedUser({ ...user, newRole: user.role, publishExpertOption: 'later' });
    setShowRoleModal(true);
    setRoleModalLoading(true);
    setRoleModalError('');

    try {
      const response = await rolesService.getUserRole(user.id);
      const latestRole = response?.user?.role || user.role;
      setSelectedUser((current) => current ? { ...current, role: latestRole, newRole: latestRole } : current);
    } catch (error) {
      setRoleModalError(error.message || 'Failed to load the latest role.');
    } finally {
      setRoleModalLoading(false);
    }
  }, []);

  const confirmRoleChange = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(`role-${selectedUser.id}`);
      const response = await rolesService.assignRole({
        userId: selectedUser.id,
        role: selectedUser.newRole,
        publishExpertNow: EXPERT_VISIBILITY_ROLES.has(selectedUser.newRole)
          ? selectedUser.publishExpertOption === 'now'
          : undefined,
      });
      setUsers((current) => current.map((user) => (
        String(user.id) === String(selectedUser.id)
          ? {
              ...user,
              role: response?.user?.role || selectedUser.newRole,
              verificationStatus: response?.user?.verificationStatus || user.verificationStatus,
            }
          : user
      )));
      setShowRoleModal(false);
      setSelectedUser(null);
      showToast('Role updated successfully.');
    } catch (error) {
      setRoleModalError(error.message || 'Failed to update role.');
      showToast(error.message || 'Failed to update role.', 'error');
    } finally {
      setActionLoading('');
    }
  }, [selectedUser, showToast]);

  const isExpertVisibilityRole = selectedUser ? EXPERT_VISIBILITY_ROLES.has(selectedUser.newRole) : false;

  const toggleUserStatus = useCallback(async (user) => {
    try {
      setActionLoading(`toggle-${user.id}`);
      await adminUsersService.toggleActive(user.id, !user.isActive);
      setUsers((current) => current.map((item) => (
        String(item.id) === String(user.id)
          ? { ...item, isActive: !item.isActive }
          : item
      )));
      showToast(`User ${user.isActive ? 'deactivated' : 'activated'} successfully.`);
    } catch (error) {
      showToast(error.message || 'Failed to update user status.', 'error');
    } finally {
      setActionLoading('');
    }
  }, [showToast]);

  const confirmDeactivate = useCallback(async () => {
    if (!showDeactivateModal) return;

    try {
      setActionLoading(`deactivate-${showDeactivateModal.id}`);
      await adminUsersService.toggleActive(showDeactivateModal.id, false);
      setUsers((current) => current.map((item) => (
        String(item.id) === String(showDeactivateModal.id)
          ? { ...item, isActive: false }
          : item
      )));
      showToast('User deactivated successfully.');
      setShowDeactivateModal(null);
    } catch (error) {
      showToast(error.message || 'Failed to deactivate user.', 'error');
    } finally {
      setActionLoading('');
    }
  }, [showDeactivateModal, showToast]);

  const visibleUsers = useMemo(() => users, [users]);

  if (state.error) {
    return <ErrorState message={state.error} onRetry={() => loadUsers(pagination.page)} />;
  }

  return (
    <div style={styles.container}>
      <SEO title="User Management" noindex />
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>User Management</h1>
          <p style={styles.subtitle}>
            {state.loading ? 'Loading...' : `${pagination.total} users � Page ${pagination.page} of ${pagination.totalPages}`}
          </p>
        </div>
        <Button variant="secondary" onClick={() => loadUsers(pagination.page)}>Refresh</Button>
      </div>

      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          style={styles.searchInput}
        />
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} style={styles.select}>
          <option value="all">All Roles</option>
          {ROLES.map((role) => <option key={role} value={role}>{getRoleLabel(role)}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={styles.select}>
          <option value="all">All Statuses</option>
          {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>

      {state.loading ? (
        <LoadingSkeleton />
      ) : !visibleUsers.length ? (
        <EmptyState
          message="Try changing the filters or search term to surface matching users from the real admin directory."
          onRetry={() => loadUsers(1)}
        />
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['User', 'Role', 'Status', 'Active', 'Joined', 'Last Login', 'Actions'].map((heading) => (
                  <th key={heading} style={styles.th}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const roleStyle = roleColors[user.role] || { bg: '#f8fbff', color: '#64748b' };
                const statusStyle = statusColors[user.verificationStatus] || { bg: '#f8fbff', color: '#64748b' };
                return (
                  <tr key={user.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={{ ...styles.avatar, background: roleStyle.bg, color: roleStyle.color }}>
                          {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={styles.userName}>{user.fullName || 'Unknown user'}</div>
                          <div style={styles.userEmail}>{user.email || user.phone || 'No contact info'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: roleStyle.bg, color: roleStyle.color }}>
                        {getRoleLabel(user.role || 'UNKNOWN')}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: statusStyle.bg, color: statusStyle.color }}>
                        {user.verificationStatus || 'UNKNOWN'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(user)}
                        disabled={actionLoading === `toggle-${user.id}`}
                        style={{
                          ...styles.toggleBtn,
                          background: user.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: user.isActive ? '#22c55e' : '#ef4444',
                          borderColor: user.isActive ? '#22c55e30' : '#ef444430',
                          opacity: actionLoading === `toggle-${user.id}` ? 0.7 : 1,
                        }}
                      >
                        {actionLoading === `toggle-${user.id}` ? 'Saving...' : user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ ...styles.td, color: '#666', fontSize: 13 }}>{formatDate(user.createdAt)}</td>
                    <td style={{ ...styles.td, color: '#666', fontSize: 13 }}>{formatDate(user.lastLoginAt)}</td>
                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        <button type="button" onClick={() => openRoleModal(user)} style={styles.actionBtn}>
                          Edit Role
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeactivateModal(user)}
                          style={{ ...styles.actionBtn, background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderColor: '#ef444430' }}
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && !state.loading && !state.error && visibleUsers.length > 0 && (
        <div style={styles.pagination}>
          <button
            type="button"
            onClick={() => loadUsers(pagination.page - 1)}
            disabled={pagination.page <= 1 || state.loading}
            style={{ ...styles.pageBtn, opacity: pagination.page <= 1 ? 0.4 : 1 }}
          >
            Prev
          </button>
          {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => loadUsers(page)}
              style={{
                ...styles.pageBtn,
                background: page === pagination.page ? '#6366f1' : 'transparent',
                color: page === pagination.page ? '#fff' : '#888',
                borderColor: page === pagination.page ? '#6366f1' : '#1f1f1f',
              }}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => loadUsers(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || state.loading}
            style={{ ...styles.pageBtn, opacity: pagination.page >= pagination.totalPages ? 0.4 : 1 }}
          >
            Next
          </button>
        </div>
      )}

      {showRoleModal && selectedUser && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Change User Role</h3>
            <p style={styles.modalDesc}>Updating role for <strong style={{ color: '#e5e5e5' }}>{selectedUser.fullName}</strong></p>
            {roleModalLoading ? (
              <div style={styles.modalState}>Loading latest role...</div>
            ) : (
              <>
                <div style={styles.currentRole}>
                  Current role: <span style={{ color: roleColors[selectedUser.role]?.color || '#888', fontWeight: 700 }}>{selectedUser.role}</span>
                </div>
                <select
                  value={selectedUser.newRole}
                  onChange={(event) => setSelectedUser((current) => {
                    if (!current) return current;
                    const nextRole = event.target.value;
                    return {
                      ...current,
                      newRole: nextRole,
                      publishExpertOption: EXPERT_VISIBILITY_ROLES.has(nextRole) ? current.publishExpertOption || 'later' : 'later',
                    };
                  })}
                  style={styles.modalSelect}
                >
                  {ROLES.map((role) => <option key={role} value={role}>{getRoleLabel(role)}</option>)}
                </select>
                {isExpertVisibilityRole ? (
                  <div style={styles.publishPanel}>
                    <div style={styles.publishTitle}>List as expert now or later?</div>
                    <div style={styles.publishText}>
                      The upgraded user stays hidden from all public expert pages until an admin chooses Publish Now.
                    </div>
                    <div style={styles.publishChoices}>
                      {[
                        { value: 'later', label: 'List later', hint: 'Keep hidden from the website for now.' },
                        { value: 'now', label: 'Publish now', hint: 'Make the expert visible on public pages immediately.' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedUser((current) => current ? { ...current, publishExpertOption: option.value } : current)}
                          style={{
                            ...styles.publishChoice,
                            ...(selectedUser.publishExpertOption === option.value ? styles.publishChoiceActive : {}),
                          }}
                        >
                          <strong>{option.label}</strong>
                          <span>{option.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                {roleModalError ? <div style={styles.modalError}>{roleModalError}</div> : null}
                <div style={styles.modalActions}>
                  <Button onClick={confirmRoleChange} loading={actionLoading === `role-${selectedUser.id}`}>Confirm Change</Button>
                  <Button variant="secondary" onClick={() => { setShowRoleModal(false); setSelectedUser(null); setRoleModalError(''); }}>Cancel</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDeactivateModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ ...styles.modalTitle, color: '#ef4444' }}>Deactivate User</h3>
            <p style={styles.modalDesc}>
              Are you sure you want to deactivate <strong style={{ color: '#e5e5e5' }}>{showDeactivateModal.fullName}</strong>?
            </p>
            <div style={styles.modalActions}>
              <Button
                variant="danger"
                onClick={confirmDeactivate}
                loading={actionLoading === `deactivate-${showDeactivateModal.id}`}
              >
                Yes, Deactivate
              </Button>
              <Button variant="secondary" onClick={() => setShowDeactivateModal(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const styles = {
  container: { maxWidth: '100%' },
  header: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' },
  title: { margin: '0 0 4px', fontSize: 26, fontWeight: 800, color: '#fff' },
  subtitle: { margin: 0, fontSize: 13, color: '#666' },
  filters: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  searchInput: {
    flex: 2, minWidth: 220, padding: '10px 16px',
    background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: 9,
    color: '#e5e5e5', fontSize: 14, outline: 'none',
  },
  select: {
    flex: 1, minWidth: 150, padding: '10px 14px',
    background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: 9,
    color: '#e5e5e5', fontSize: 14, outline: 'none', cursor: 'pointer',
  },
  tableContainer: {
    background: '#ffffff', border: '1px solid #e8eef5', borderRadius: 12, overflow: 'hidden', boxShadow: '0 12px 26px rgba(15,23,42,0.05)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700,
    color: '#64748b', background: '#f8fbff', borderBottom: '1px solid #edf2f8',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  tr: { borderBottom: '1px solid #0f0f0f' },
  td: { padding: '14px 16px', fontSize: 14, color: '#aaa', verticalAlign: 'middle' },
  userCell: { display: 'flex', alignItems: 'center', gap: 12 },
  userName: { fontSize: 14, fontWeight: 600, color: '#e5e5e5' },
  userEmail: { fontSize: 12, color: '#555' },
  avatar: {
    width: 36, height: 36, borderRadius: 9, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  badge: {
    fontSize: 11, fontWeight: 700, padding: '3px 9px',
    borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  toggleBtn: {
    border: '1px solid', borderRadius: 7, padding: '5px 12px',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s',
  },
  actionRow: { display: 'flex', gap: 8 },
  actionBtn: {
    background: '#ffffff', border: '1px solid #e6ecf4', borderRadius: 7,
    padding: '6px 12px', fontSize: 12, color: '#0f172a', cursor: 'pointer',
  },
  loadingRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 14, padding: '28px 0 18px',
  },
  skeletonRows: { padding: '0 18px 24px', display: 'grid', gap: 12 },
  skeletonRow: {
    height: 54,
    borderRadius: 8,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
    border: '1px solid #e8eef5',
  },
  spinner: {
    width: 22, height: 22, border: '2px solid #1f1f1f', borderTop: '2px solid #6366f1',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', paddingTop: 16 },
  pageBtn: {
    padding: '7px 14px', border: '1px solid #1f1f1f', borderRadius: 8,
    background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: 14,
    padding: 28, width: 420, maxWidth: '90vw',
  },
  modalTitle: { margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#fff' },
  modalDesc: { margin: '0 0 16px', fontSize: 14, color: '#888', lineHeight: 1.6 },
  currentRole: { margin: '0 0 14px', fontSize: 13, color: '#666' },
  modalSelect: {
    width: '100%', padding: '11px 14px', background: '#ffffff',
    border: '1px solid #e6ecf4', borderRadius: 9, color: '#0f172a',
    fontSize: 14, marginBottom: 12, outline: 'none',
  },
  publishPanel: {
    display: 'grid',
    gap: 10,
    border: '1px solid #e6ecf4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    background: '#ffffff',
  },
  publishTitle: { color: '#0f172a', fontSize: 14, fontWeight: 700 },
  publishText: { color: '#64748b', fontSize: 12, lineHeight: 1.6 },
  publishChoices: { display: 'grid', gap: 8 },
  publishChoice: {
    display: 'grid',
    gap: 4,
    textAlign: 'left',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #e6ecf4',
    background: '#ffffff',
    color: '#0f172a',
    cursor: 'pointer',
  },
  publishChoiceActive: {
    borderColor: '#10b981',
    background: 'rgba(16,185,129,0.08)',
  },
  modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  modalState: { color: '#888', fontSize: 14, padding: '12px 0' },
  modalError: { color: '#ef4444', marginBottom: 12, fontSize: 13 },
  stateCard: {
    minHeight: '320px',
    borderRadius: '16px',
    border: '1px solid #1a1a1a',
    background: '#070707',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    textAlign: 'center',
    padding: '32px',
  },
  stateIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.12)',
    color: '#818cf8',
    fontSize: '22px',
    fontWeight: 700,
  },
  stateTitle: { margin: 0, color: '#fff', fontSize: '22px' },
  stateText: { margin: 0, maxWidth: '560px', color: '#666', lineHeight: 1.6 },
};
