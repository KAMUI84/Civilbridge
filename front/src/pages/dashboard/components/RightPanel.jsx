// Right Panel with AI Assistant, Activity Feed, and Quick Actions
import React, { useState, useRef, useEffect } from 'react';

export default function RightPanel({ onClose, user, config }) {
  const [activeTab, setActiveTab] = useState('ai');
  const [aiMessage, setAiMessage] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { 
      id: 1, 
      type: 'ai', 
      message: '🏗️ Hello! I\'m your CivilBridge AI assistant. I can help you with:\n\n• Construction cost estimation in RWF\n• Building permits and regulations in Rwanda\n• Material recommendations and suppliers\n• Project planning and timeline guidance\n• Architectural advice for Rwanda\n\nHow can I assist you today?',
      time: 'Just now'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  // Generate a guest ID if not already stored
  const getGuestId = () => {
    let guestId = localStorage.getItem('civilbridge_guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('civilbridge_guest_id', guestId);
    }
    return guestId;
  };

  const handleAiMessage = async () => {
    if (!aiMessage.trim() || isLoading) return;

    const userMessage = {
      id: aiMessages.length + 1,
      type: 'user',
      message: aiMessage,
      time: 'Just now'
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiMessage('');
    setIsLoading(true);

    try {
      // Call the AI chat API
      const response = await fetch('http://localhost:3000/api/ai/guest/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: aiMessage,
          guest_id: getGuestId(),
          history: aiMessages.slice(-5).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'model',
            content: msg.message
          }))
        })
      });

      const data = await response.json();

      if (data.response) {
        const aiResponse = {
          id: aiMessages.length + 2,
          type: 'ai',
          message: data.response,
          time: 'Just now'
        };
        setAiMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error(data.message || 'No response from AI');
      }
    } catch (error) {
      console.error('AI Error:', error);
      const fallbackResponse = {
        id: aiMessages.length + 2,
        type: 'ai',
        message: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment. In the meantime, I can help you with project analysis, approval workflows, and performance metrics.',
        time: 'Just now'
      };
      setAiMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { id: 1, label: 'New Project', icon: '🏗️', action: 'create-project' },
    { id: 2, label: 'Approve Request', icon: '✅', action: 'approve-request' },
    { id: 3, label: 'Generate Report', icon: '📊', action: 'generate-report' },
    { id: 4, label: 'Add User', icon: '👤', action: 'add-user' }
  ];

  const recentActivity = [
    { id: 1, type: 'project', message: 'New project "Bridge Design A" created', time: '5 min ago', user: 'John Doe' },
    { id: 2, type: 'approval', message: 'Project "Road Construction" approved', time: '15 min ago', user: 'Admin' },
    { id: 3, type: 'payment', message: 'Payment received: $5,000', time: '1 hour ago', user: 'Client ABC' },
    { id: 4, type: 'user', message: 'New user registered: Sarah Wilson', time: '2 hours ago', user: 'System' }
  ];

  const systemInsights = [
    { id: 1, type: 'success', message: 'System performance: Excellent', detail: '99.9% uptime' },
    { id: 2, type: 'warning', message: 'Storage usage: 78%', detail: 'Consider upgrading soon' },
    { id: 3, type: 'info', message: 'Active users: 142', detail: '+12% from last week' }
  ];

  return (
    <div style={styles.rightPanel}>
      {/* Header */}
      <div style={styles.panelHeader}>
        <h3 style={styles.panelTitle}>Assistant</h3>
        <button style={styles.closeButton} onClick={onClose}>×</button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {config.rightPanel?.aiAssistant && (
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'ai' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('ai')}
          >
            🤖 AI
          </button>
        )}
        {config.rightPanel?.activityFeed && (
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'activity' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('activity')}
          >
            📊 Activity
          </button>
        )}
        {config.rightPanel?.quickActions && (
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'actions' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('actions')}
          >
            ⚡ Quick
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {/* AI Assistant Tab */}
        {activeTab === 'ai' && config.rightPanel?.aiAssistant && (
          <div style={styles.aiTab}>
            <div style={styles.aiMessages}>
              {aiMessages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.message,
                    ...(msg.type === 'user' ? styles.userMessage : styles.aiMessage)
                  }}
                >
                  <div style={styles.messageContent}>{msg.message}</div>
                  <div style={styles.messageTime}>{msg.time}</div>
                </div>
              ))}
              
              {isLoading && (
                <div style={{ ...styles.message, ...styles.aiMessage }}>
                  <div style={styles.messageContent}>
                    <div style={styles.loadingDots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div style={styles.aiInputContainer}>
              <input
                type="text"
                placeholder="Ask me anything about construction..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAiMessage()}
                disabled={isLoading}
                style={styles.aiInput}
              />
              <button 
                style={{
                  ...styles.aiSendButton,
                  opacity: isLoading || !aiMessage.trim() ? 0.6 : 1,
                  cursor: isLoading || !aiMessage.trim() ? 'not-allowed' : 'pointer'
                }} 
                onClick={handleAiMessage}
                disabled={isLoading || !aiMessage.trim()}
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Activity Feed Tab */}
        {activeTab === 'activity' && config.rightPanel?.activityFeed && (
          <div style={styles.activityTab}>
            <h4 style={styles.sectionTitle}>Recent Activity</h4>
            <div style={styles.activityList}>
              {recentActivity.map(activity => (
                <div key={activity.id} style={styles.activityItem}>
                  <div style={styles.activityIcon}>
                    {activity.type === 'project' && '🏗️'}
                    {activity.type === 'approval' && '✅'}
                    {activity.type === 'payment' && '💰'}
                    {activity.type === 'user' && '👤'}
                  </div>
                  <div style={styles.activityContent}>
                    <div style={styles.activityMessage}>{activity.message}</div>
                    <div style={styles.activityMeta}>
                      {activity.user} • {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h4 style={styles.sectionTitle}>System Insights</h4>
            <div style={styles.insightsList}>
              {systemInsights.map(insight => (
                <div key={insight.id} style={styles.insightItem}>
                  <div style={{
                    ...styles.insightIcon,
                    ...(insight.type === 'success' && styles.insightSuccess),
                    ...(insight.type === 'warning' && styles.insightWarning),
                    ...(insight.type === 'info' && styles.insightInfo)
                  }}>
                    {insight.type === 'success' && '✓'}
                    {insight.type === 'warning' && '⚠'}
                    {insight.type === 'info' && 'ℹ'}
                  </div>
                  <div style={styles.insightContent}>
                    <div style={styles.insightMessage}>{insight.message}</div>
                    <div style={styles.insightDetail}>{insight.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Tab */}
        {activeTab === 'actions' && config.rightPanel?.quickActions && (
          <div style={styles.actionsTab}>
            <h4 style={styles.sectionTitle}>Quick Actions</h4>
            <div style={styles.quickActionsGrid}>
              {quickActions.map(action => (
                <button key={action.id} style={styles.quickAction}>
                  <div style={styles.quickActionIcon}>{action.icon}</div>
                  <div style={styles.quickActionLabel}>{action.label}</div>
                </button>
              ))}
            </div>

            <h4 style={styles.sectionTitle}>Shortcuts</h4>
            <div style={styles.shortcutsList}>
              <button style={styles.shortcut}>
                <span style={styles.shortcutKey}>Ctrl</span>
                <span style={styles.shortcutKey}>N</span>
                <span style={styles.shortcutLabel}>New Project</span>
              </button>
              <button style={styles.shortcut}>
                <span style={styles.shortcutKey}>Ctrl</span>
                <span style={styles.shortcutKey}>/</span>
                <span style={styles.shortcutLabel}>Search</span>
              </button>
              <button style={styles.shortcut}>
                <span style={styles.shortcutKey}>Ctrl</span>
                <span style={styles.shortcutKey}>R</span>
                <span style={styles.shortcutLabel}>Reports</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  rightPanel: {
    position: 'fixed',
    right: 0,
    top: 0,
    height: '100vh',
    width: 320,
    background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)',
    borderLeft: '1px solid #1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 999
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #1a1a1a'
  },
  panelTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 20,
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
    transition: 'color 0.2s ease'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #1a1a1a'
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    padding: '12px',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  tabActive: {
    color: '#00f2ff',
    borderBottom: '2px solid #00f2ff'
  },
  tabContent: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  aiTab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px'
  },
  aiMessages: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: 16
  },
  message: {
    marginBottom: 12,
    maxWidth: '80%'
  },
  userMessage: {
    alignSelf: 'flex-end',
    background: 'rgba(0, 242, 255, 0.1)',
    border: '1px solid rgba(0, 242, 255, 0.2)',
    borderRadius: '12px 12px 4px 12px'
  },
  aiMessage: {
    alignSelf: 'flex-start',
    background: 'var(--border-color)',
    borderRadius: '12px 12px 12px 4px'
  },
  messageContent: {
    padding: '12px',
    fontSize: 13,
    color: 'var(--text-color)',
    lineHeight: 1.4
  },
  messageTime: {
    padding: '0 12px 8px',
    fontSize: 11,
    color: 'var(--text-muted)'
  },
  loadingDots: {
    display: 'flex',
    gap: 4,
    padding: '12px'
  },
  'loadingDots span': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--text-muted)',
    animation: 'pulse 1.4s infinite ease-in-out both'
  },
  'loadingDots span:nth-child(2)': {
    animationDelay: '0.2s'
  },
  'loadingDots span:nth-child(3)': {
    animationDelay: '0.4s'
  },
  aiInputContainer: {
    display: 'flex',
    gap: 8
  },
  aiInput: {
    flex: 1,
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    color: 'var(--text-color)',
    outline: 'none'
  },
  aiSendButton: {
    background: '#00f2ff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--bg-color)',
    cursor: 'pointer'
  },
  activityTab: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto'
  },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  activityList: {
    marginBottom: 24
  },
  activityItem: {
    display: 'flex',
    gap: 12,
    padding: '12px 0',
    borderBottom: '1px solid #1a1a1a'
  },
  activityIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center'
  },
  activityContent: {
    flex: 1
  },
  activityMessage: {
    fontSize: 13,
    color: 'var(--text-color)',
    marginBottom: 4
  },
  activityMeta: {
    fontSize: 11,
    color: 'var(--text-muted)'
  },
  insightsList: {
    marginBottom: 16
  },
  insightItem: {
    display: 'flex',
    gap: 12,
    padding: '12px 0'
  },
  insightIcon: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600
  },
  insightSuccess: {
    background: '#22c55e',
    color: 'white'
  },
  insightWarning: {
    background: '#f59e0b',
    color: 'white'
  },
  insightInfo: {
    background: '#6366f1',
    color: 'white'
  },
  insightContent: {
    flex: 1
  },
  insightMessage: {
    fontSize: 13,
    color: 'var(--text-color)',
    marginBottom: 2
  },
  insightDetail: {
    fontSize: 11,
    color: 'var(--text-muted)'
  },
  actionsTab: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto'
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 24
  },
  quickAction: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '16px 12px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  quickActionIcon: {
    fontSize: 24
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-color)',
    textAlign: 'center'
  },
  shortcutsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  shortcut: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: 8,
    cursor: 'pointer'
  },
  shortcutKey: {
    background: 'var(--border-color)',
    color: 'var(--text-muted)',
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 4
  },
  shortcutLabel: {
    flex: 1,
    fontSize: 12,
    color: 'var(--text-muted)',
    textAlign: 'left'
  }
};
