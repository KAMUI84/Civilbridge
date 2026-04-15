import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import RightPanel from './components/RightPanel';
import { getDashboardConfig } from './utils/dashboardConfig';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1180 : false));

  const dashboardConfig = getDashboardConfig(user?.role);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [navigate, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => {
      setIsCompact(window.innerWidth < 1180);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeSection = React.useMemo(() => {
    const matchingItem = dashboardConfig.navigation.find((item) => location.pathname === item.path);
    return matchingItem?.id || 'overview';
  }, [dashboardConfig.navigation, location.pathname]);

  if (!user) return null;

  return (
    <div
      style={{
        ...styles.dashboardContainer,
        backgroundColor: dashboardConfig.theme.background,
        color: dashboardConfig.theme.text,
        '--bg-color': dashboardConfig.theme.background,
        '--card-bg': dashboardConfig.theme.cardBg,
        '--border-color': dashboardConfig.theme.border,
        '--text-color': dashboardConfig.theme.text,
        '--text-muted': dashboardConfig.theme.textMuted,
        '--surface-bg': dashboardConfig.theme.surface,
        '--surface-border': dashboardConfig.theme.border,
        '--accent-color': dashboardConfig.theme.primary,
        '--accent-soft': dashboardConfig.theme.accentSoft,
        '--accent-secondary': dashboardConfig.theme.accent,
        '--accent-glow': dashboardConfig.theme.primaryGlow,
        '--highlight-color': dashboardConfig.theme.highlight,
        '--sidebar-bg': dashboardConfig.theme.sidebar,
        '--topbar-bg': dashboardConfig.theme.topbar,
        '--background-accent': dashboardConfig.theme.backgroundAccent,
      }}
    >
      <div style={styles.backgroundLayer} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen((current) => !current)}
        config={dashboardConfig}
        activeSection={activeSection}
        onSectionChange={() => {}}
        user={user}
      />

      <div
        style={{
          ...styles.mainContent,
          marginLeft: isCompact ? 0 : sidebarOpen ? dashboardConfig.layout.sidebarWidth : 78,
        }}
      >
        <TopBar
          user={user}
          config={dashboardConfig}
          activeSection={activeSection}
          onToggleSidebar={() => setSidebarOpen((current) => !current)}
          onOpenRightPanel={() => setRightPanelOpen(true)}
        />

        <div style={styles.contentArea}>
          <Outlet context={{ dashboardConfig, activeSection }} />
        </div>
      </div>

      {rightPanelOpen ? (
        <>
          <div style={styles.rightPanelBackdrop} onClick={() => setRightPanelOpen(false)} />
          <RightPanel onClose={() => setRightPanelOpen(false)} user={user} config={dashboardConfig} />
        </>
      ) : null}
    </div>
  );
}

const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-color)',
    fontFamily: "'Inter', sans-serif",
    color: 'var(--text-color)',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundLayer: {
    position: 'fixed',
    inset: 0,
    background: 'var(--background-accent)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.3s ease',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  contentArea: {
    flex: 1,
    padding: 18,
    overflow: 'auto',
    background: 'transparent',
    position: 'relative',
  },
  rightPanelBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(148, 163, 184, 0.16)',
    zIndex: 1100,
  },
};
