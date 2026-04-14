import { getRoleDashboardKey } from '../../../utils/roles';

const defaultNavigation = {
  expert: [
    { id: 'overview', label: 'Overview', shortLabel: 'OV', path: '/dashboard' },
    { id: 'projects', label: 'Projects', shortLabel: 'PJ', path: '/dashboard/projects' },
    { id: 'uploads', label: 'Uploads', shortLabel: 'UP', path: '/uploads' },
    { id: 'messages', label: 'Messages', shortLabel: 'MS', path: '/dashboard/messages' },
    { id: 'files', label: 'Files', shortLabel: 'FL', path: '/dashboard/files' },
    { id: 'engineer-system', label: 'Expert Network', shortLabel: 'EN', path: '/dashboard/engineer-system' },
    { id: 'profile', label: 'Profile', shortLabel: 'PR', path: '/dashboard/profile' },
  ],
  client: [
    { id: 'overview', label: 'Overview', shortLabel: 'OV', path: '/dashboard' },
    { id: 'projects', label: 'Projects', shortLabel: 'PJ', path: '/dashboard/projects' },
    { id: 'messages', label: 'Messages', shortLabel: 'MS', path: '/dashboard/messages' },
    { id: 'payments', label: 'Payments', shortLabel: 'PM', path: '/dashboard/payments' },
    { id: 'files', label: 'Files', shortLabel: 'FL', path: '/dashboard/files' },
    { id: 'profile', label: 'Profile', shortLabel: 'PR', path: '/dashboard/profile' },
  ],
};

export const getDashboardConfig = (userRole) => {
  const normalizedRole = String(userRole || '').toUpperCase();
  const dashboardRole = getRoleDashboardKey(userRole);

  const createSoftTheme = (highlight = '#1d4ed8') => ({
    background: '#ffffff',
    backgroundAccent: 'radial-gradient(circle at top right, rgba(37,99,235,0.05), transparent 32%), radial-gradient(circle at top left, rgba(56,189,248,0.04), transparent 24%)',
    cardBg: '#ffffff',
    border: '#e8eef5',
    text: '#0f172a',
    textMuted: '#64748b',
    primary: '#2563eb',
    primaryGlow: 'rgba(37,99,235,0.16)',
    accent: '#3b82f6',
    accentSoft: 'rgba(37,99,235,0.08)',
    surface: '#ffffff',
    sidebar: 'rgba(255,255,255,0.96)',
    topbar: 'rgba(255,255,255,0.94)',
    highlight,
  });

  const themes = {
    SUPER_ADMIN: createSoftTheme('#1e3a8a'),
    ADMIN: createSoftTheme('#1d4ed8'),
    ENGINEER: createSoftTheme('#2563eb'),
    PROFESSIONAL: createSoftTheme('#2563eb'),
    HOME_BUILDER: createSoftTheme('#1d4ed8'),
    CLIENT: createSoftTheme('#1d4ed8'),
    STUDENT: createSoftTheme('#2563eb'),
    VIEWER: createSoftTheme('#334155'),
    ARCHITECT: createSoftTheme('#2563eb'),
    CONTRACTOR: createSoftTheme('#1d4ed8'),
    SUPPLIER: createSoftTheme('#2563eb'),
    AUDITOR: createSoftTheme('#334155'),
    FINANCE: createSoftTheme('#1d4ed8'),
  };

  const activeTheme = themes[normalizedRole] || themes[dashboardRole] || themes.CLIENT;

  const baseConfig = {
    theme: {
      primary: activeTheme.primary,
      secondary: '#475569',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#38bdf8',
      ...activeTheme,
    },
    layout: {
      sidebarWidth: 248,
      rightPanelWidth: 380,
      topBarHeight: 76,
    },
  };

  const roleConfigs = {
    SUPER_ADMIN: {
      workspaceLabel: 'Executive Control',
      workspaceDescription: 'System-wide revenue, trust, users, and operational pressure.',
      quickAction: { label: 'Open analytics', path: '/dashboard/analytics' },
      navigation: [
        { id: 'overview', label: 'Overview', shortLabel: 'OV', path: '/dashboard' },
        { id: 'users', label: 'Users', shortLabel: 'US', path: '/dashboard/users' },
        { id: 'projects', label: 'Projects', shortLabel: 'PJ', path: '/dashboard/projects' },
        { id: 'uploads', label: 'Catalog', shortLabel: 'CT', path: '/uploads' },
        { id: 'analytics', label: 'Analytics', shortLabel: 'AN', path: '/dashboard/analytics' },
        { id: 'payments', label: 'Payments', shortLabel: 'PM', path: '/dashboard/payments' },
        { id: 'logs', label: 'Logs', shortLabel: 'LG', path: '/dashboard/logs' },
        { id: 'settings', label: 'Settings', shortLabel: 'ST', path: '/dashboard/settings' },
      ],
      permissions: ['manage_users', 'view_all_projects', 'system_settings', 'view_analytics', 'manage_transactions', 'view_logs'],
      rightPanel: { notifications: true },
    },
    ADMIN: {
      workspaceLabel: 'Admin Command',
      workspaceDescription: 'Moderation, verification, benchmarks, and platform operations.',
      quickAction: { label: 'Open users', path: '/dashboard/users' },
      navigation: [
        { id: 'overview', label: 'Overview', shortLabel: 'OV', path: '/dashboard' },
        { id: 'users', label: 'Users', shortLabel: 'US', path: '/dashboard/users' },
        { id: 'projects', label: 'Projects', shortLabel: 'PJ', path: '/dashboard/projects' },
        { id: 'uploads', label: 'Catalog', shortLabel: 'CT', path: '/uploads' },
        { id: 'analytics', label: 'Analytics', shortLabel: 'AN', path: '/dashboard/analytics' },
        { id: 'payments', label: 'Payments', shortLabel: 'PM', path: '/dashboard/payments' },
        { id: 'files', label: 'Files', shortLabel: 'FL', path: '/dashboard/files' },
      ],
      permissions: ['manage_users', 'view_all_projects', 'approve_requests', 'moderate_content', 'view_reports'],
      rightPanel: { notifications: true },
    },
    ENGINEER: {
      workspaceLabel: 'Engineer Workspace',
      workspaceDescription: 'Reviews, project progress, assigned work, and client delivery.',
      quickAction: { label: 'Review files', path: '/dashboard/files' },
      navigation: defaultNavigation.expert,
      permissions: ['create_project', 'edit_own_project', 'view_own_project', 'upload_files', 'communicate_clients'],
      rightPanel: { notifications: true },
    },
    PROFESSIONAL: {
      workspaceLabel: 'Expert Workspace',
      workspaceDescription: 'Assignments, coordination, and delivery across live projects.',
      quickAction: { label: 'Open projects', path: '/dashboard/projects' },
      navigation: defaultNavigation.expert,
      permissions: ['create_project', 'edit_own_project', 'view_own_project', 'upload_files', 'communicate_clients'],
      rightPanel: { notifications: true },
    },
    ARCHITECT: {
      workspaceLabel: 'Architect Workspace',
      workspaceDescription: 'Design review, plans, and coordination for active work.',
      quickAction: { label: 'Open files', path: '/dashboard/files' },
      navigation: defaultNavigation.expert,
      permissions: ['create_project', 'edit_own_project', 'view_own_project', 'upload_files', 'communicate_clients'],
      rightPanel: { notifications: true },
    },
    CONTRACTOR: {
      workspaceLabel: 'Contractor Workspace',
      workspaceDescription: 'Delivery, execution, and field updates tied to live projects.',
      quickAction: { label: 'Open projects', path: '/dashboard/projects' },
      navigation: defaultNavigation.expert,
      permissions: ['create_project', 'edit_own_project', 'view_own_project', 'upload_files', 'communicate_clients'],
      rightPanel: { notifications: true },
    },
    SUPPLIER: {
      workspaceLabel: 'Supplier Workspace',
      workspaceDescription: 'Requests, files, and coordination from actual demand only.',
      quickAction: { label: 'Open messages', path: '/dashboard/messages' },
      navigation: defaultNavigation.expert,
      permissions: ['create_project', 'edit_own_project', 'view_own_project', 'upload_files', 'communicate_clients'],
      rightPanel: { notifications: true },
    },
    HOME_BUILDER: {
      workspaceLabel: 'Project Home',
      workspaceDescription: 'Your live projects, approvals, payments, and construction progress.',
      quickAction: { label: 'Open projects', path: '/dashboard/projects' },
      navigation: defaultNavigation.client,
      permissions: ['create_project', 'edit_own_project', 'view_own_project', 'communicate_clients', 'view_payment_history'],
      rightPanel: { notifications: true },
    },
    CLIENT: {
      workspaceLabel: 'Client Workspace',
      workspaceDescription: 'Your live projects, approvals, payments, and construction progress.',
      quickAction: { label: 'Open payments', path: '/dashboard/payments' },
      navigation: defaultNavigation.client,
      permissions: ['create_project', 'edit_own_project', 'view_own_project', 'communicate_clients', 'view_payment_history'],
      rightPanel: { notifications: true },
    },
    STUDENT: {
      workspaceLabel: 'Learning Workspace',
      workspaceDescription: 'A clean space that grows only as you start working.',
      quickAction: { label: 'Open projects', path: '/dashboard/projects' },
      navigation: [
        { id: 'overview', label: 'Overview', shortLabel: 'OV', path: '/dashboard' },
        { id: 'projects', label: 'Projects', shortLabel: 'PJ', path: '/dashboard/projects' },
      ],
      permissions: ['browse_public', 'login_access', 'view_study_materials'],
      rightPanel: { notifications: true },
    },
    VIEWER: {
      workspaceLabel: 'Workspace',
      workspaceDescription: 'A simple environment focused on real access only.',
      quickAction: { label: 'Open projects', path: '/dashboard/projects' },
      navigation: [
        { id: 'overview', label: 'Overview', shortLabel: 'OV', path: '/dashboard' },
        { id: 'projects', label: 'Projects', shortLabel: 'PJ', path: '/dashboard/projects' },
      ],
      permissions: ['browse_public', 'login_access'],
      rightPanel: { notifications: false },
    },
    AUDITOR: {
      workspaceLabel: 'Audit Workspace',
      workspaceDescription: 'Oversight, logs, analytics, and review signals.',
      quickAction: { label: 'Open logs', path: '/dashboard/logs' },
      navigation: [
        { id: 'overview', label: 'Overview', shortLabel: 'OV', path: '/dashboard' },
        { id: 'projects', label: 'Projects', shortLabel: 'PJ', path: '/dashboard/projects' },
        { id: 'analytics', label: 'Analytics', shortLabel: 'AN', path: '/dashboard/analytics' },
        { id: 'logs', label: 'Logs', shortLabel: 'LG', path: '/dashboard/logs' },
      ],
      permissions: ['view_any_project', 'view_reports', 'view_analytics', 'view_logs'],
      rightPanel: { notifications: true },
    },
    FINANCE: {
      workspaceLabel: 'Finance Workspace',
      workspaceDescription: 'Revenue, transactions, and payment movement from live activity.',
      quickAction: { label: 'Open payments', path: '/dashboard/payments' },
      navigation: [
        { id: 'overview', label: 'Overview', shortLabel: 'OV', path: '/dashboard' },
        { id: 'payments', label: 'Payments', shortLabel: 'PM', path: '/dashboard/payments' },
        { id: 'analytics', label: 'Analytics', shortLabel: 'AN', path: '/dashboard/analytics' },
        { id: 'files', label: 'Files', shortLabel: 'FL', path: '/dashboard/files' },
      ],
      permissions: ['manage_transactions', 'view_payment_history', 'generate_reports', 'view_analytics'],
      rightPanel: { notifications: true },
    },
  };

  return {
    ...baseConfig,
    ...(roleConfigs[normalizedRole] || roleConfigs[dashboardRole] || roleConfigs.CLIENT),
  };
};

export const hasPermission = (userRole, permission) => {
  const config = getDashboardConfig(userRole);
  return config.permissions.includes(permission);
};

export const getNavigationItems = (userRole) => {
  const config = getDashboardConfig(userRole);
  return config.navigation;
};
