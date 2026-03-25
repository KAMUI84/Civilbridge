// Dashboard Configuration based on user roles
export const getDashboardConfig = (userRole) => {
  const themes = {
    ADMIN: {
       background: '#000000', cardBg: '#0a0a0a', border: '#1a1a1a', text: '#ffffff', textMuted: '#a0a0a0', primary: '#3b82f6'
    },
    SUPER_ADMIN: {
       background: '#000000', cardBg: '#0a0a0a', border: '#1a1a1a', text: '#ffffff', textMuted: '#a0a0a0', primary: '#3b82f6'
    },
    ENGINEER: {
       background: '#000000', cardBg: '#0a0a0a', border: '#1a1a1a', text: '#ffffff', textMuted: '#a0a0a0', primary: '#3b82f6'
    },
    CLIENT: {
       background: '#000000', cardBg: '#0a0a0a', border: '#1a1a1a', text: '#ffffff', textMuted: '#a0a0a0', primary: '#3b82f6'
    },
    STUDENT: {
       background: '#000000', cardBg: '#0a0a0a', border: '#1a1a1a', text: '#ffffff', textMuted: '#a0a0a0', primary: '#3b82f6'
    },
    VIEWER: {
       background: '#000000', cardBg: '#0a0a0a', border: '#1a1a1a', text: '#ffffff', textMuted: '#a0a0a0', primary: '#3b82f6'
    },
    PROFESSIONAL: {
       background: '#000000', cardBg: '#0a0a0a', border: '#1a1a1a', text: '#ffffff', textMuted: '#a0a0a0', primary: '#3b82f6'
    },
    AUDITOR: {
       background: '#000000', cardBg: '#0a0a0a', border: '#1a1a1a', text: '#ffffff', textMuted: '#a0a0a0', primary: '#3b82f6'
    },
    FINANCE: {
       background: '#000000', cardBg: '#0a0a0a', border: '#1a1a1a', text: '#ffffff', textMuted: '#a0a0a0', primary: '#3b82f6'
    }
  };

  const activeTheme = themes[userRole?.toUpperCase()] || themes.CLIENT;

  const baseConfig = {
    theme: {
      primary: activeTheme.primary,
      secondary: '#6366f1',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      ...activeTheme
    },
    layout: {
      sidebarWidth: 240,
      rightPanelWidth: 320,
      topBarHeight: 64
    }
  };

  const roleConfigs = {
    SUPER_ADMIN: {
      navigation: [
        { id: 'overview', label: 'Dashboard Overview', icon: '📊', path: '/dashboard' },
        { id: 'users', label: 'User Management', icon: '👥', path: '/dashboard/users' },
        { id: 'projects', label: 'All Projects', icon: '🏗️', path: '/dashboard/projects' },
        { id: 'analytics', label: 'Analytics', icon: '📈', path: '/dashboard/analytics' },
        { id: 'payments', label: 'Payments & Revenue', icon: '💰', path: '/dashboard/payments' },
        { id: 'settings', label: 'System Settings', icon: '⚙️', path: '/dashboard/settings' },
        { id: 'logs', label: 'Logs & Security', icon: '🔒', path: '/dashboard/logs' }
      ],
      widgets: [
        'kpiCards',
        'revenueChart',
        'userGrowthChart',
        'activityFeed',
        'systemHealth',
        'recentAlerts'
      ],
      permissions: [
        'manage_users',
        'view_all_projects',
        'system_settings',
        'view_analytics',
        'manage_transactions',
        'view_logs'
      ],
      rightPanel: {
        aiAssistant: true,
        activityFeed: true,
        quickActions: true,
        notifications: true
      }
    },

    ADMIN: {
      navigation: [
        { id: 'overview', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'users', label: 'Users', icon: '👥', path: '/dashboard/users' },
        { id: 'projects', label: 'Projects', icon: '🏗️', path: '/dashboard/projects' },
        { id: 'requests', label: 'Requests & Approvals', icon: '✅', path: '/dashboard/requests' },
        { id: 'reports', label: 'Reports', icon: '📋', path: '/dashboard/reports' }
      ],
      widgets: [
        'pendingApprovals',
        'activeUsers',
        'projectStats',
        'recentActivity',
        'issuesReported'
      ],
      permissions: [
        'manage_users',
        'view_all_projects',
        'approve_requests',
        'moderate_content',
        'view_reports'
      ],
      rightPanel: {
        aiAssistant: true,
        activityFeed: true,
        quickActions: true,
        notifications: true
      }
    },

    ENGINEER: {
      navigation: [
        { id: 'overview', label: 'My Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'projects', label: 'My Projects', icon: '🏗️', path: '/dashboard/projects' },
        { id: 'tasks', label: 'Tasks & Jobs', icon: '✅', path: '/dashboard/tasks' },
        { id: 'messages', label: 'Messages', icon: '💬', path: '/dashboard/messages' },
        { id: 'files', label: 'Files & Uploads', icon: '📁', path: '/dashboard/files' },
        { id: 'profile', label: 'Profile', icon: '👤', path: '/dashboard/profile' }
      ],
      widgets: [
        'assignedProjects',
        'deadlineTracker',
        'progressBars',
        'taskKanban',
        'recentFiles'
      ],
      permissions: [
        'create_project',
        'edit_own_project',
        'view_own_project',
        'upload_files',
        'communicate_clients'
      ],
      rightPanel: {
        aiAssistant: true,
        activityFeed: false,
        quickActions: true,
        notifications: true
      }
    },

    CLIENT: {
      navigation: [
        { id: 'overview', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'projects', label: 'My Projects', icon: '🏗️', path: '/dashboard/projects' },
        { id: 'requests', label: 'Requests', icon: '📝', path: '/dashboard/requests' },
        { id: 'messages', label: 'Messages', icon: '💬', path: '/dashboard/messages' },
        { id: 'payments', label: 'Payments', icon: '💰', path: '/dashboard/payments' },
        { id: 'reviews', label: 'Reviews', icon: '⭐', path: '/dashboard/reviews' }
      ],
      widgets: [
        'activeProjects',
        'projectProgress',
        'notifications',
        'quickRequest',
        'paymentStatus'
      ],
      permissions: [
        'create_project',
        'edit_own_project',
        'view_own_project',
        'communicate_clients',
        'view_payment_history'
      ],
      rightPanel: {
        aiAssistant: false,
        activityFeed: false,
        quickActions: true,
        notifications: true
      }
    },

    STUDENT: {
      navigation: [
        { id: 'overview', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'projects', label: 'Projects & Resources', icon: '📚', path: '/dashboard/projects' }
      ],
      widgets: [
        'learningProgress',
        'savedResources'
      ],
      permissions: [
        'browse_public',
        'login_access',
        'view_study_materials'
      ],
      rightPanel: {
        aiAssistant: true,
        activityFeed: false,
        quickActions: false,
        notifications: true
      }
    },

    VIEWER: {
      navigation: [
        { id: 'overview', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'projects', label: 'Projects', icon: '🏗️', path: '/dashboard/projects' }
      ],
      widgets: [
        'publicProjects',
        'basicStats'
      ],
      permissions: [
        'browse_public',
        'login_access'
      ],
      rightPanel: {
        aiAssistant: false,
        activityFeed: false,
        quickActions: false,
        notifications: false
      }
    },

    AUDITOR: {
      navigation: [
        { id: 'overview', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'projects', label: 'All Projects', icon: '🏗️', path: '/dashboard/projects' },
        { id: 'reports', label: 'Audit Reports', icon: '📋', path: '/dashboard/reports' },
        { id: 'compliance', label: 'Compliance', icon: '✅', path: '/dashboard/compliance' }
      ],
      widgets: [
        'projectAudit',
        'complianceStatus',
        'riskAssessment',
        'auditLogs'
      ],
      permissions: [
        'view_any_project',
        'view_reports',
        'view_analytics',
        'view_logs'
      ],
      rightPanel: {
        aiAssistant: false,
        activityFeed: false,
        quickActions: false,
        notifications: true
      }
    },

    FINANCE: {
      navigation: [
        { id: 'overview', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'transactions', label: 'Transactions', icon: '💰', path: '/dashboard/transactions' },
        { id: 'reports', label: 'Financial Reports', icon: '📋', path: '/dashboard/reports' },
        { id: 'invoices', label: 'Invoices', icon: '🧾', path: '/dashboard/invoices' }
      ],
      widgets: [
        'revenueOverview',
        'transactionStats',
        'paymentMethods',
        'financialReports'
      ],
      permissions: [
        'manage_transactions',
        'view_payment_history',
        'generate_reports',
        'view_analytics'
      ],
      rightPanel: {
        aiAssistant: false,
        activityFeed: false,
        quickActions: true,
        notifications: true
      }
    }
  };

  return {
    ...baseConfig,
    ...roleConfigs[userRole?.toUpperCase()] || roleConfigs.CLIENT
  };
};

// Helper function to check if user has permission
export const hasPermission = (userRole, permission) => {
  const config = getDashboardConfig(userRole);
  return config.permissions.includes(permission);
};

// Helper function to get navigation items for role
export const getNavigationItems = (userRole) => {
  const config = getDashboardConfig(userRole);
  return config.navigation;
};

// Helper function to get widgets for role
export const getWidgets = (userRole) => {
  const config = getDashboardConfig(userRole);
  return config.widgets;
};
