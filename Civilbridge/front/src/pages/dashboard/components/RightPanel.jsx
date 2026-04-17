import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentsService from '../../../services/appointmentsService';
import messagesService from '../../../services/messagesService';
import authService from '../../../services/authService';
import { projectsService } from '../../../services/projectsService';
import { useAuthStore } from '../../../store/authStore';

function getInitials(value) {
  return (value || 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDateTime(value) {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeRole(role) {
  return String(role || 'CLIENT').replaceAll('_', ' ');
}

export default function RightPanel({ onClose, user, config }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [state, setState] = useState({ loading: true, error: '' });
  const [projects, setProjects] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [threads, setThreads] = useState([]);

  const loadPanel = useCallback(async () => {
    try {
      setState({ loading: true, error: '' });
      const [projectsResponse, appointmentsResponse, threadsResponse] = await Promise.all([
        projectsService.getUserProjects(),
        appointmentsService.listMine(),
        messagesService.listThreads({ limit: 6 }),
      ]);

      setProjects(Array.isArray(projectsResponse) ? projectsResponse : []);
      setAppointments(appointmentsResponse?.appointments || []);
      setThreads(threadsResponse?.data || []);
      setState({ loading: false, error: '' });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Failed to load your account panel.' });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadPanel();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPanel]);

  const activeProjects = useMemo(
    () => projects.filter((project) => !['COMPLETED', 'CANCELLED'].includes(String(project.status || '').toUpperCase())).slice(0, 5),
    [projects],
  );
  const pendingAppointments = useMemo(
    () => appointments.filter((appointment) => ['REQUESTED', 'CONFIRMED'].includes(String(appointment.status || '').toUpperCase())).slice(0, 5),
    [appointments],
  );
  const unreadThreads = useMemo(
    () => threads.filter((thread) => thread.lastMessage && String(thread.lastMessage.recipientId) === String(user?.id) && thread.lastMessage.status !== 'READ'),
    [threads, user?.id],
  );
  const hasActivity = activeProjects.length > 0 || pendingAppointments.length > 0 || unreadThreads.length > 0;

  const quickActions = useMemo(() => {
    const role = String(user?.role || 'CLIENT').toUpperCase();
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      return [
        { label: 'Open users', path: '/dashboard/users' },
        { label: 'Open analytics', path: '/dashboard/analytics' },
        { label: 'Open projects', path: '/dashboard/projects' },
      ];
    }
    if (role === 'PROFESSIONAL' || role === 'ENGINEER') {
      return [
        { label: 'Review files', path: '/dashboard/files' },
        { label: 'Open messages', path: '/dashboard/messages' },
        { label: 'Open projects', path: '/dashboard/projects' },
      ];
    }
    return [
      { label: 'Track projects', path: '/dashboard/projects' },
      { label: 'View payments', path: '/dashboard/payments' },
      { label: 'Browse experts', path: '/experts' },
    ];
  }, [user?.role]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue clearing local state even if the API logout call fails.
    }
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside style={styles.panel}>
      <div style={styles.header}>
        <div style={styles.headerIdentity}>
          <div style={styles.avatar}>{getInitials(user?.fullName || user?.email)}</div>
          <div>
            <div style={styles.panelEyebrow}>{config?.workspaceLabel || 'Workspace'}</div>
            <div style={styles.userName}>{user?.fullName || 'CivilBridge user'}</div>
            <div style={styles.userRole}>{formatRelativeRole(user?.role)}</div>
          </div>
        </div>
        <button type="button" onClick={onClose} style={styles.closeButton}>Close</button>
      </div>

      <div style={styles.accountActions}>
        <button type="button" onClick={() => navigate('/dashboard/profile')} style={styles.headerAction}>Profile</button>
        <button type="button" onClick={() => navigate('/dashboard/messages')} style={styles.headerAction}>Messages</button>
        <button type="button" onClick={handleLogout} style={styles.headerAction}>Logout</button>
      </div>

      {state.loading ? (
        <div style={styles.body}>
          {Array.from({ length: 4 }).map((_, index) => <div key={index} style={styles.skeleton} />)}
        </div>
      ) : state.error ? (
        <div style={styles.body}>
          <div style={styles.stateCard}>
            <h3 style={styles.stateTitle}>Could not load account details</h3>
            <p style={styles.stateText}>{state.error}</p>
            <button type="button" onClick={loadPanel} style={styles.retryButton}>Retry</button>
          </div>
        </div>
      ) : (
        <div style={styles.body}>
          {!hasActivity ? (
            <section style={styles.freshStateCard}>
              <div style={styles.freshStateEyebrow}>Fresh workspace</div>
              <h3 style={styles.freshStateTitle}>Nothing is waiting for you yet.</h3>
              <p style={styles.freshStateText}>
                This side panel fills itself with real projects, appointments, and unread messages only after activity begins on your account.
              </p>
            </section>
          ) : (
            <>
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>Active projects</h3>
                  <button type="button" onClick={() => navigate('/dashboard/projects')} style={styles.inlineLink}>View all</button>
                </div>
                {activeProjects.length ? activeProjects.map((project) => (
                  <button key={project.id} type="button" onClick={() => navigate('/dashboard/projects')} style={styles.listRowButton}>
                    <div>
                      <div style={styles.rowTitle}>{project.projectName || project.title || 'Project'}</div>
                      <div style={styles.rowMeta}>{project.status || 'Draft'} | {project.region?.name || 'No region'}</div>
                    </div>
                    <div style={styles.countBadge}>{project._count?.progressLogs || 0}</div>
                  </button>
                )) : <div style={styles.emptyCopy}>No active projects are linked to your account yet.</div>}
              </section>

              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>Pending appointments</h3>
                  <button type="button" onClick={() => navigate('/dashboard/engineer-system')} style={styles.inlineLink}>Manage</button>
                </div>
                {pendingAppointments.length ? pendingAppointments.map((appointment) => (
                  <div key={appointment.id} style={styles.listRow}>
                    <div>
                      <div style={styles.rowTitle}>{appointment.provider?.fullName || appointment.client?.fullName || 'Appointment'}</div>
                      <div style={styles.rowMeta}>{formatDateTime(appointment.startsAt)} | {appointment.status}</div>
                    </div>
                    <div style={styles.countBadge}>{appointment.meetingType || 'LIVE'}</div>
                  </div>
                )) : <div style={styles.emptyCopy}>No pending appointments right now.</div>}
              </section>

              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>Unread messages</h3>
                  <button type="button" onClick={() => navigate('/dashboard/messages')} style={styles.inlineLink}>Open inbox</button>
                </div>
                {unreadThreads.length ? unreadThreads.map((thread) => {
                  const other = String(thread.participantOne?.id) === String(user?.id) ? thread.participantTwo : thread.participantOne;
                  return (
                    <div key={thread.id} style={styles.listRow}>
                      <div>
                        <div style={styles.rowTitle}>{other?.fullName || 'Conversation'}</div>
                        <div style={styles.rowMeta}>{thread.lastMessage?.body || 'New message received'}</div>
                      </div>
                      <div style={styles.countBadge}>New</div>
                    </div>
                  );
                }) : <div style={styles.emptyCopy}>No unread messages waiting for you.</div>}
              </section>
            </>
          )}

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Quick actions</h3>
            </div>
            <div style={styles.quickActions}>
              {config?.quickAction ? (
                <button type="button" onClick={() => navigate(config.quickAction.path)} style={styles.primaryQuickAction}>
                  {config.quickAction.label}
                </button>
              ) : null}
              {quickActions.map((action) => (
                <button key={action.path} type="button" onClick={() => navigate(action.path)} style={styles.quickActionButton}>
                  {action.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}

const styles = {
  panel: {
    position: 'fixed',
    right: 0,
    top: 0,
    height: '100vh',
    width: 360,
    maxWidth: '100vw',
    background: '#ffffff',
    borderLeft: '1px solid #e8eef5',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1200,
    boxShadow: '-22px 0 48px rgba(15,23,42,0.1)',
    backdropFilter: 'blur(24px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '18px 18px 12px',
    borderBottom: '1px solid #edf2f8',
  },
  headerIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))',
    color: '#ffffff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800,
  },
  panelEyebrow: {
    color: 'var(--text-muted)',
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: 4,
  },
  userName: {
    color: '#0f172a',
    fontWeight: 700,
  },
  userRole: {
    color: '#64748b',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginTop: 4,
  },
  closeButton: {
    height: 38,
    padding: '0 12px',
    borderRadius: 12,
    border: '1px solid #e5ebf3',
    background: '#ffffff',
    color: '#0f172a',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(15,23,42,0.04)',
  },
  accountActions: {
    display: 'flex',
    gap: 10,
    padding: '12px 18px 14px',
    borderBottom: '1px solid #edf2f8',
  },
  headerAction: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    border: '1px solid #e5ebf3',
    background: '#f8fbff',
    color: 'var(--accent-color)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: 18,
    display: 'grid',
    gap: 14,
  },
  section: {
    border: '1px solid #e8eef5',
    borderRadius: 18,
    padding: 14,
    background: '#ffffff',
    display: 'grid',
    gap: 10,
    boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
  },
  freshStateCard: {
    border: '1px solid #e8eef5',
    borderRadius: 18,
    padding: 16,
    background: '#f8fbff',
    display: 'grid',
    gap: 10,
  },
  freshStateEyebrow: {
    color: 'var(--highlight-color)',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  freshStateTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: 18,
  },
  freshStateText: {
    margin: 0,
    color: '#64748b',
    lineHeight: 1.6,
    fontSize: 13,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: '#0f172a',
  },
  inlineLink: {
    background: 'transparent',
    border: 'none',
    color: 'var(--accent-color)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  listRowButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
  },
  listRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  rowTitle: {
    color: '#0f172a',
    fontWeight: 700,
    marginBottom: 4,
  },
  rowMeta: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 1.5,
  },
  countBadge: {
    minWidth: 42,
    height: 28,
    borderRadius: 999,
    background: 'var(--accent-soft)',
    color: 'var(--accent-color)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 800,
    padding: '0 10px',
  },
  primaryQuickAction: {
    minHeight: 42,
    borderRadius: 14,
    border: '1px solid var(--accent-glow)',
    background: 'var(--accent-color)',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 12px 22px rgba(29,78,216,0.16)',
  },
  quickActions: {
    display: 'grid',
    gap: 10,
  },
  quickActionButton: {
    minHeight: 42,
    borderRadius: 14,
    border: '1px solid #e5ebf3',
    background: '#f8fbff',
    color: '#0f172a',
    fontWeight: 700,
    cursor: 'pointer',
  },
  emptyCopy: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 1.6,
  },
  stateCard: {
    border: '1px solid #e8eef5',
    borderRadius: 18,
    padding: 18,
    textAlign: 'center',
    display: 'grid',
    gap: 12,
  },
  stateTitle: {
    margin: 0,
    color: '#0f172a',
  },
  stateText: {
    margin: 0,
    color: '#64748b',
    lineHeight: 1.6,
  },
  retryButton: {
    height: 40,
    borderRadius: 12,
    border: '1px solid #e5ebf3',
    background: '#f8fbff',
    color: 'var(--accent-color)',
    fontWeight: 700,
    cursor: 'pointer',
  },
  skeleton: {
    height: 110,
    borderRadius: 18,
    background: 'linear-gradient(90deg, rgba(148,163,184,0.08), rgba(148,163,184,0.16), rgba(148,163,184,0.08))',
  },
};


