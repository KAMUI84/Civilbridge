// Clean Professional Dashboard - Empty State
import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function ClientDashboard() {
  const { dashboardConfig } = useOutletContext();
  const [aiMessage, setAiMessage] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { 
      id: 1, 
      type: 'ai', 
      message: '🏗️ Hello! I\'m your CivilBridge AI assistant. I can help you with:\n\n• Construction cost estimation in RWF\n• Building permits and regulations in Rwanda\n• Material recommendations and suppliers\n• Project planning and timeline guidance\n\nHow can I assist you today?',
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
        message: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        time: 'Just now'
      };
      setAiMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Welcome to Your Workspace</h1>
        <p style={styles.subtitle}>Start building your construction projects with confidence</p>
      </div>

      {/* Empty State */}
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          <svg viewBox="0 0 24 24" fill="none" width="64" height="64">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" 
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" 
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h2 style={styles.emptyTitle}>Create Your First Project</h2>
        <p style={styles.emptyDescription}>
          Begin your construction journey by creating your first project. 
          Our platform provides everything you need to manage your building projects efficiently.
        </p>
        
        <div style={styles.emptyActions}>
          <button style={styles.primaryButton}>
            <div style={styles.buttonIcon}>🏗️</div>
            <div style={styles.buttonText}>Create New Project</div>
          </button>
          
          <button style={styles.secondaryButton}>
            <div style={styles.buttonIcon}>�</div>
            <div style={styles.buttonText}>Browse Templates</div>
          </button>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div style={styles.guideSection}>
        <h3 style={styles.sectionTitle}>Quick Start Guide</h3>
        <div style={styles.guideGrid}>
          <div style={styles.guideCard}>
            <div style={styles.guideIcon}>📝</div>
            <h4 style={styles.guideTitle}>1. Define Your Project</h4>
            <p style={styles.guideDescription}>
              Start by outlining your project requirements, scope, and timeline.
            </p>
          </div>
          
          <div style={styles.guideCard}>
            <div style={styles.guideIcon}>👥</div>
            <h4 style={styles.guideTitle}>2. Find Professionals</h4>
            <p style={styles.guideDescription}>
              Connect with qualified engineers, contractors, and suppliers.
            </p>
          </div>
          
          <div style={styles.guideCard}>
            <div style={styles.guideIcon}>📊</div>
            <h4 style={styles.guideTitle}>3. Track Progress</h4>
            <p style={styles.guideDescription}>
              Monitor project milestones, budgets, and timelines in real-time.
            </p>
          </div>
          
          <div style={styles.guideCard}>
            <div style={styles.guideIcon}>✅</div>
            <h4 style={styles.guideTitle}>4. Complete Successfully</h4>
            <p style={styles.guideDescription}>
              Ensure quality standards and deliver your project on time.
            </p>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div style={styles.featuresSection}>
        <h3 style={styles.sectionTitle}>Everything You Need</h3>
        <div style={styles.featuresGrid}>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>📐</div>
            <div style={styles.featureContent}>
              <h4 style={styles.featureTitle}>Project Planning</h4>
              <p style={styles.featureDescription}>Comprehensive planning tools and templates</p>
            </div>
          </div>
          
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>💰</div>
            <div style={styles.featureContent}>
              <h4 style={styles.featureTitle}>Budget Management</h4>
              <p style={styles.featureDescription}>Track costs and manage payments efficiently</p>
            </div>
          </div>
          
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>📅</div>
            <div style={styles.featureContent}>
              <h4 style={styles.featureTitle}>Timeline Tracking</h4>
              <p style={styles.featureDescription}>Monitor milestones and deadlines</p>
            </div>
          </div>
          
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>🤝</div>
            <div style={styles.featureContent}>
              <h4 style={styles.featureTitle}>Team Collaboration</h4>
              <p style={styles.featureDescription}>Work seamlessly with your project team</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Section */}
      <div style={styles.aiSection}>
        <h3 style={styles.sectionTitle}>AI Assistant</h3>
        <div style={styles.aiContainer}>
          <div style={styles.aiMessages}>
            {aiMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  ...styles.aiMessage,
                  ...(msg.type === 'user' ? styles.userMessage : styles.aiAssistantMessage)
                }}
              >
                <div style={styles.messageContent}>{msg.message}</div>
                <div style={styles.messageTime}>{msg.time}</div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ ...styles.aiMessage, ...styles.aiAssistantMessage }}>
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
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  },
  header: {
    textAlign: 'center',
    marginBottom: 64
  },
  title: {
    margin: '0 0 16px',
    fontSize: 32,
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    margin: 0,
    fontSize: 18,
    color: '#a0a0a0',
    lineHeight: 1.5
  },
  
  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: 16,
    marginBottom: 64
  },
  emptyIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    background: '#000000',
    border: '2px solid #1a1a1a',
    borderRadius: '50%',
    marginBottom: 32,
    color: '#3b82f6'
  },
  emptyTitle: {
    margin: '0 0 16px',
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff'
  },
  emptyDescription: {
    margin: '0 0 40px',
    fontSize: 16,
    color: '#a0a0a0',
    lineHeight: 1.6,
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  emptyActions: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#3b82f6',
    border: 'none',
    borderRadius: 12,
    padding: '16px 32px',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'transparent',
    border: '2px solid #1a1a1a',
    borderRadius: 12,
    padding: '16px 32px',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  buttonIcon: {
    fontSize: 20
  },
  buttonText: {
    fontSize: 16
  },
  
  // Guide Section
  guideSection: {
    marginBottom: 64
  },
  sectionTitle: {
    margin: '0 0 32px',
    fontSize: 24,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center'
  },
  guideGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24
  },
  guideCard: {
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 32,
    textAlign: 'center',
    transition: 'all 0.2s ease'
  },
  guideIcon: {
    fontSize: 32,
    marginBottom: 16
  },
  guideTitle: {
    margin: '0 0 12px',
    fontSize: 18,
    fontWeight: 600,
    color: '#ffffff'
  },
  guideDescription: {
    margin: 0,
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 1.5
  },
  
  // Features Section
  featuresSection: {
    marginBottom: 32
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20
  },
  featureItem: {
    display: 'flex',
    gap: 16,
    padding: 20,
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: 12
  },
  featureIcon: {
    fontSize: 24,
    flexShrink: 0,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000000',
    border: '1px solid #1a1a1a',
    borderRadius: 8
  },
  featureContent: {
    flex: 1
  },
  featureTitle: {
    margin: '0 0 8px',
    fontSize: 16,
    fontWeight: 600,
    color: '#ffffff'
  },
  featureDescription: {
    margin: 0,
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 1.4
  },

  // AI Section
  aiSection: {
    marginBottom: 32
  },
  aiContainer: {
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: 16,
    padding: 24,
    maxWidth: '800px',
    margin: '0 auto'
  },
  aiMessages: {
    height: '300px',
    overflowY: 'auto',
    marginBottom: 16,
    padding: '8px 0'
  },
  aiMessage: {
    marginBottom: 12,
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.4
  },
  userMessage: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#ffffff',
    marginLeft: 'auto',
    borderBottomRightRadius: 4
  },
  aiAssistantMessage: {
    alignSelf: 'flex-start',
    background: '#000000',
    border: '1px solid #1a1a1a',
    color: '#ffffff',
    borderBottomLeftRadius: 4
  },
  messageContent: {
    whiteSpace: 'pre-wrap'
  },
  messageTime: {
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
    opacity: 0.7
  },
  loadingDots: {
    display: 'flex',
    gap: 4,
    padding: '4px 0'
  },
  'loadingDots span': {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#666666',
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
    gap: 12
  },
  aiInput: {
    flex: 1,
    background: '#000000',
    border: '1px solid #1a1a1a',
    borderRadius: 8,
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  aiSendButton: {
    background: '#3b82f6',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  }
};
