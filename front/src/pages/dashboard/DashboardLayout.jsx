// Global Dashboard Layout Component
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  // Get dashboard configuration based on user role
  const dashboardConfig = getDashboardConfig(user?.role);

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Set active section based on current route
    const path = location.pathname.split('/').pop();
    if (path && dashboardConfig.navigation.some(item => item.id === path)) {
      setActiveSection(path);
    }
  }, [user, navigate, location, dashboardConfig]);

  if (!user) return null;

  return (
    <div style={{
      ...styles.dashboardContainer,
      backgroundColor: dashboardConfig.theme.background,
      color: dashboardConfig.theme.text,
      '--bg-color': dashboardConfig.theme.background,
      '--card-bg': dashboardConfig.theme.cardBg,
      '--border-color': dashboardConfig.theme.border,
      '--text-color': dashboardConfig.theme.text,
      '--text-muted': dashboardConfig.theme.textMuted
    }}>
      {/* Left Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        config={dashboardConfig}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
      />

      {/* Main Content Area */}
      <div style={{ ...styles.mainContent, marginLeft: sidebarOpen ? 240 : 0 }}>
        {/* Top Bar */}
        <TopBar 
          user={user}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
        />

        {/* Page Content */}
        <div style={styles.contentArea}>
          <Outlet context={{ dashboardConfig, activeSection }} />
        </div>
      </div>

      {/* Right Panel */}
      {rightPanelOpen && (
        <RightPanel 
          onClose={() => setRightPanelOpen(false)}
          user={user}
          config={dashboardConfig}
        />
      )}
    </div>
  );
}

const styles = {
  dashboardContainer: {
    display: 'flex',
    height: '100vh',
    background: 'var(--bg-color)',
    fontFamily: "'Inter', sans-serif",
    color: 'var(--text-color)'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.3s ease',
    overflow: 'hidden'
  },
  contentArea: {
    flex: 1,
    padding: '24px',
    overflow: 'auto',
    background: 'var(--bg-color)'
  }
};
