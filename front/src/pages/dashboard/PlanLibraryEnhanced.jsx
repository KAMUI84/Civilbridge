// Enhanced Plan Library with Stunning Design and Conversation Sidebar
import React, { useState, useEffect } from 'react';

export default function PlanLibrary() {
  const [activeMode, setActiveMode] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [landDetails, setLandDetails] = useState({
    size: '',
    location: '',
    soilType: '',
    topography: '',
    access: '',
    utilities: ''
  });
  const [buildingType, setBuildingType] = useState('');
  const [customFeatures, setCustomFeatures] = useState([]);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  // Building types
  const buildingTypes = [
    { id: 'residential', name: 'Residential House', baseCost: 15000000, time: '6 months', icon: '🏠' },
    { id: 'apartment', name: 'Apartment Building', baseCost: 50000000, time: '12 months', icon: '🏢' },
    { id: 'commercial', name: 'Commercial Building', baseCost: 80000000, time: '18 months', icon: '🏪' },
    { id: 'industrial', name: 'Industrial Facility', baseCost: 120000000, time: '24 months', icon: '🏭' },
    { id: 'mixed', name: 'Mixed-Use Building', baseCost: 60000000, time: '15 months', icon: '🏘️' }
  ];

  // Custom features
  const availableFeatures = [
    { id: 'parking', name: 'Parking Garage', cost: 2000000, time: '+1 month', icon: '🚗' },
    { id: 'pool', name: 'Swimming Pool', cost: 3000000, time: '+2 months', icon: '🏊' },
    { id: 'solar', name: 'Solar Panels', cost: 5000000, time: '+1 month', icon: '☀️' },
    { id: 'garden', name: 'Landscaping', cost: 1500000, time: '+1 month', icon: '🌳' },
    { id: 'security', name: 'Security System', cost: 1000000, time: '+2 weeks', icon: '🔒' },
    { id: 'elevator', name: 'Elevator', cost: 8000000, time: '+2 months', icon: '🛗' }
  ];

  // Mock conversations
  const mockConversations = [
    {
      id: 1,
      name: 'Eng. Marie Mukamana',
      role: 'Structural Engineer',
      avatar: '👷‍♀️',
      lastMessage: 'Your plan looks structurally sound. I recommend increasing the foundation depth.',
      timestamp: '2 hours ago',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'AI Assistant',
      role: 'Planning Assistant',
      avatar: '🤖',
      lastMessage: 'I\'ve analyzed your uploaded plan. The cost estimate is ready for review.',
      timestamp: '5 hours ago',
      unread: 1,
      online: true
    },
    {
      id: 3,
      name: 'John Mugisha',
      role: 'Client',
      avatar: '👤',
      lastMessage: 'Thank you for the detailed analysis. Can we discuss the timeline?',
      timestamp: '1 day ago',
      unread: 0,
      online: false
    }
  ];

  useEffect(() => {
    setConversations(mockConversations);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/dwg'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid architectural plan (JPG, PNG, PDF, or DWG)');
        setUploadedFile(null);
      }
    }
  };

  const handleAnalyzePlan = async () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const mockAnalysis = {
        planType: 'residential',
        dimensions: {
          length: 20,
          width: 15,
          height: 8,
          totalArea: 300
        },
        rooms: [
          { type: 'living_room', size: 40, level: 'ground' },
          { type: 'kitchen', size: 20, level: 'ground' },
          { type: 'bedroom', size: 25, level: 'ground' },
          { type: 'bedroom', size: 20, level: 'ground' },
          { type: 'bathroom', size: 10, level: 'ground' },
          { type: 'master_bedroom', size: 30, level: 'first' },
          { type: 'bathroom', size: 12, level: 'first' },
          { type: 'balcony', size: 15, level: 'first' }
        ],
        materials: {
          bricks: 15000,
          cement: 200,
          steel: 5,
          roofing: 300,
          paint: 50,
          tiles: 400,
          windows: 20,
          doors: 8
        },
        estimatedCost: {
          materials: 18000000,
          labor: 8000000,
          permits: 2000000,
          total: 28000000
        },
        feasibility: {
          score: 85,
          recommendations: [
            'Consider adding more windows for natural light',
            'Structural design is solid for the proposed height',
            'Bathroom placement is optimal for plumbing',
            'Consider adding a storage room'
          ],
          compliance: {
            buildingCode: 'Compliant',
            zoning: 'Approved for residential use',
            setbacks: 'Meets requirements',
            height: 'Within limits'
          }
        },
        timeline: {
          foundation: '2 months',
          structure: '3 months',
          roofing: '1 month',
          finishing: '2 months',
          total: '8 months'
        }
      };
      
      setAnalysisResult(mockAnalysis);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const updatedConversations = conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: newMessage, timestamp: 'Just now' }
          : conv
      );
      setConversations(updatedConversations);
      setNewMessage('');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>AI Plan Intelligence</h1>
          <p style={styles.subtitle}>Advanced construction planning with AI analysis</p>
        </div>
        <button
          style={styles.sidebarToggle}
          onClick={() => setShowSidebar(!showSidebar)}
        >
          💬 {showSidebar ? 'Hide' : 'Show'} Conversations
        </button>
      </div>

      <div style={styles.mainContent}>
        {/* Main Content Area */}
        <div style={{
          ...styles.contentArea,
          width: showSidebar ? 'calc(100% - 380px)' : '100%'
        }}>
          {/* Mode Selection */}
          <div style={styles.modeSelection}>
            <button
              style={{
                ...styles.modeButton,
                ...(activeMode === 'upload' && styles.modeButtonActive)
              }}
              onClick={() => setActiveMode('upload')}
            >
              📁 AI Analysis
            </button>
            <button
              style={{
                ...styles.modeButton,
                ...(activeMode === 'manual' && styles.modeButtonActive)
              }}
              onClick={() => setActiveMode('manual')}
            >
              📝 Manual Planning
            </button>
          </div>

          {/* Upload Mode */}
          {activeMode === 'upload' && (
            <div
              style={styles.modeContent}
            >
              <div style={styles.uploadSection}>
                <div style={styles.uploadArea}>
                  <input
                    type="file"
                    id="plan-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept=".jpg,.jpeg,.png,.pdf,.dwg"
                  />
                  <label htmlFor="plan-upload" style={styles.uploadLabel}>
                    <div
                      style={styles.uploadIcon}
                    >
                      🤖
                    </div>
                    <h3 style={styles.uploadTitle}>AI-Powered Plan Analysis</h3>
                    <p style={styles.uploadText}>
                      Upload your architectural plan for instant AI analysis
                    </p>
                    <p style={styles.uploadSubtext}>
                      Supported: JPG, PNG, PDF, DWG files
                    </p>
                  </label>
                </div>

                {uploadedFile && (
                  <div
                    style={styles.fileInfo}
                  >
                    <p style={styles.fileName}>📄 {uploadedFile.name}</p>
                    <button
                      style={styles.analyzeButton}
                      onClick={handleAnalyzePlan}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? '🤖 Analyzing...' : '🔍 Analyze with AI'}
                    </button>
                  </div>
                )}

                {isAnalyzing && (
                  <div
                    style={styles.analyzing}
                  >
                    <div style={styles.analyzingSpinner}></div>
                    <p style={styles.analyzingText}>AI is analyzing your plan...</p>
                    <p style={styles.analyzingSubtext}>
                      Extracting dimensions, materials, and structural details
                    </p>
                  </div>
                )}

                {analysisResult && (
                  <div
                    style={styles.analysisResult}
                  >
                    <h3 style={styles.resultTitle}>🤖 AI Analysis Results</h3>
                    
                    <div style={styles.resultGrid}>
                      <div style={styles.resultSection}>
                        <h4 style={styles.sectionTitle}>📏 Plan Dimensions</h4>
                        <div style={styles.dimensions}>
                          <div style={styles.dimensionItem}>
                            <span style={styles.dimensionLabel}>Total Area:</span>
                            <span style={styles.dimensionValue}>{analysisResult.dimensions.totalArea} m²</span>
                          </div>
                          <div style={styles.dimensionItem}>
                            <span style={styles.dimensionLabel}>Dimensions:</span>
                            <span style={styles.dimensionValue}>
                              {analysisResult.dimensions.length}m × {analysisResult.dimensions.width}m
                            </span>
                          </div>
                          <div style={styles.dimensionItem}>
                            <span style={styles.dimensionLabel}>Height:</span>
                            <span style={styles.dimensionValue}>{analysisResult.dimensions.height}m</span>
                          </div>
                        </div>
                      </div>

                      <div style={styles.resultSection}>
                        <h4 style={styles.sectionTitle}>💰 Cost Estimation</h4>
                        <div style={styles.costBreakdown}>
                          <div style={styles.costItem}>
                            <span style={styles.costLabel}>Materials:</span>
                            <span style={styles.costValue}>{formatCurrency(analysisResult.estimatedCost.materials)}</span>
                          </div>
                          <div style={styles.costItem}>
                            <span style={styles.costLabel}>Labor:</span>
                            <span style={styles.costValue}>{formatCurrency(analysisResult.estimatedCost.labor)}</span>
                          </div>
                          <div style={styles.costItem}>
                            <span style={styles.costLabel}>Permits:</span>
                            <span style={styles.costValue}>{formatCurrency(analysisResult.estimatedCost.permits)}</span>
                          </div>
                          <div style={styles.costItemTotal}>
                            <span style={styles.costLabel}>Total:</span>
                            <span style={styles.costValue}>{formatCurrency(analysisResult.estimatedCost.total)}</span>
                          </div>
                        </div>
                      </div>

                      <div style={styles.resultSection}>
                        <h4 style={styles.sectionTitle}>📊 Feasibility Score</h4>
                        <div style={styles.feasibilityScore}>
                          <div style={styles.scoreBar}>
                            <div style={{
                              ...styles.scoreFill,
                              width: `${analysisResult.feasibility.score}%`
                            }}></div>
                          </div>
                          <span style={styles.scoreText}>{analysisResult.feasibility.score}%</span>
                        </div>
                        <div style={styles.recommendations}>
                          <h5 style={styles.recommendationsTitle}>AI Recommendations:</h5>
                          {analysisResult.feasibility.recommendations.map((rec, index) => (
                            <p key={index} style={styles.recommendation}>💡 {rec}</p>
                          ))}
                        </div>
                      </div>

                      <div style={styles.resultSection}>
                        <h4 style={styles.sectionTitle}>✅ Compliance Check</h4>
                        <div style={styles.complianceGrid}>
                          {Object.entries(analysisResult.feasibility.compliance).map(([key, value]) => (
                            <div key={key} style={styles.complianceItem}>
                              <span style={styles.complianceLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span style={{
                                ...styles.complianceValue,
                                color: value === 'Compliant' || value === 'Approved' || value === 'Meets requirements' || value === 'Within limits' ? '#22c55e' : '#f59e0b'
                              }}>
                                {value === 'Compliant' || value === 'Approved' ? '✅' : '⚠️'} {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manual Mode */}
          {activeMode === 'manual' && (
            <div
              style={styles.modeContent}
            >
              <div style={styles.manualSection}>
                <h3 style={styles.sectionTitle}>📍 Land Details</h3>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Land Size (m²)</label>
                    <input
                      type="number"
                      style={styles.formInput}
                      value={landDetails.size}
                      onChange={(e) => setLandDetails({ ...landDetails, size: e.target.value })}
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Location</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={landDetails.location}
                      onChange={(e) => setLandDetails({ ...landDetails, location: e.target.value })}
                      placeholder="e.g., Kigali, Gasabo"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Soil Type</label>
                    <select
                      style={styles.formSelect}
                      value={landDetails.soilType}
                      onChange={(e) => setLandDetails({ ...landDetails, soilType: e.target.value })}
                    >
                      <option value="">Select soil type</option>
                      <option value="clay">Clay</option>
                      <option value="sandy">Sandy</option>
                      <option value="loamy">Loamy</option>
                      <option value="rocky">Rocky</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Topography</label>
                    <select
                      style={styles.formSelect}
                      value={landDetails.topography}
                      onChange={(e) => setLandDetails({ ...landDetails, topography: e.target.value })}
                    >
                      <option value="">Select topography</option>
                      <option value="flat">Flat</option>
                      <option value="sloping">Sloping</option>
                      <option value="hilly">Hilly</option>
                      <option value="uneven">Uneven</option>
                    </select>
                  </div>
                </div>

                <h3 style={styles.sectionTitle}>🏗️ Building Type</h3>
                <div style={styles.buildingTypes}>
                  {buildingTypes.map((type) => (
                    <div
                      key={type.id}
                      style={{
                        ...styles.buildingTypeCard,
                        ...(buildingType === type.id && styles.buildingTypeCardActive)
                      }}
                      onClick={() => setBuildingType(type.id)}
                    >
                      <div style={styles.buildingTypeIcon}>{type.icon}</div>
                      <h4 style={styles.buildingTypeName}>{type.name}</h4>
                      <p style={styles.buildingTypeCost}>{formatCurrency(type.baseCost)}</p>
                      <p style={styles.buildingTypeTime}>⏱️ {type.time}</p>
                    </div>
                  ))}
                </div>

                <h3 style={styles.sectionTitle}>🎯 Additional Features</h3>
                <div style={styles.featuresGrid}>
                  {availableFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      style={{
                        ...styles.featureCard,
                        ...(customFeatures.includes(feature.id) && styles.featureCardActive)
                      }}
                      onClick={() => {
                        if (customFeatures.includes(feature.id)) {
                          setCustomFeatures(customFeatures.filter(id => id !== feature.id));
                        } else {
                          setCustomFeatures([...customFeatures, feature.id]);
                        }
                      }}
                    >
                      <div style={styles.featureIcon}>{feature.icon}</div>
                      <h4 style={styles.featureName}>{feature.name}</h4>
                      <p style={styles.featureCost}>{formatCurrency(feature.cost)}</p>
                      <p style={styles.featureTime}>{feature.time}</p>
                    </div>
                  ))}
                </div>

                <button
                  style={styles.generateButton}
                  onClick={() => {
                    // Generate plan logic here
                    alert('Plan generation feature coming soon!');
                  }}
                >
                  🏗️ Generate AI Plan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Conversation Sidebar */}
        {showSidebar && (
            <div
              style={styles.sidebar}
            >
              <div style={styles.sidebarHeader}>
                <h3 style={styles.sidebarTitle}>💬 Conversations</h3>
                <button
                  style={styles.newChatButton}
                  onClick={() => {
                    // Start new conversation logic
                  }}
                >
                  ➕ New Chat
                </button>
              </div>

              <div style={styles.conversationsList}>
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      ...styles.conversationItem,
                      ...(selectedConversation?.id === conv.id && styles.conversationItemActive)
                    }}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div style={styles.conversationAvatar}>
                      {conv.avatar}
                      {conv.online && <div style={styles.onlineIndicator}></div>}
                    </div>
                    <div style={styles.conversationContent}>
                      <div style={styles.conversationHeader}>
                        <span style={styles.conversationName}>{conv.name}</span>
                        <span style={styles.conversationTime}>{conv.timestamp}</span>
                      </div>
                      <div style={styles.conversationRole}>{conv.role}</div>
                      <p style={styles.conversationMessage}>{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div style={styles.unreadBadge}>{conv.unread}</div>
                    )}
                  </div>
                ))}
              </div>

              {selectedConversation && (
                <div style={styles.chatArea}>
                  <div style={styles.chatHeader}>
                    <div style={styles.chatAvatar}>{selectedConversation.avatar}</div>
                    <div style={styles.chatInfo}>
                      <h4 style={styles.chatName}>{selectedConversation.name}</h4>
                      <p style={styles.chatRole}>{selectedConversation.role}</p>
                    </div>
                  </div>

                  <div style={styles.messagesArea}>
                    {/* Messages would go here */}
                    <div style={styles.welcomeMessage}>
                      <p>👋 Welcome to your conversation with {selectedConversation.name}</p>
                      <p>Start discussing your construction plans and get expert advice!</p>
                    </div>
                  </div>

                  <div style={styles.messageInput}>
                    <input
                      type="text"
                      style={styles.messageInputField}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      style={styles.sendButton}
                      onClick={handleSendMessage}
                    >
                      📤
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
    color: 'var(--text-color)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column'
  },
  
  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  headerLeft: {
    flex: 1
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'var(--text-muted)'
  },
  sidebarToggle: {
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    color: 'var(--bg-color)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },

  // Main Content
  mainContent: {
    display: 'flex',
    flex: 1,
    position: 'relative'
  },
  contentArea: {
    padding: '32px',
    overflowY: 'auto'
  },

  // Mode Selection
  modeSelection: {
    display: 'flex',
    gap: '16px',
    marginBottom: '32px',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '8px',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)'
  },
  modeButton: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 24px',
    color: 'var(--text-muted)',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  modeButtonActive: {
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    color: 'var(--bg-color)'
  },

  // Mode Content
  modeContent: {
    minHeight: '600px'
  },

  // Upload Section
  uploadSection: {
    textAlign: 'center'
  },
  uploadArea: {
    border: '3px dashed #262626',
    borderRadius: '20px',
    padding: '60px 40px',
    marginBottom: '32px',
    background: 'rgba(255, 255, 255, 0.02)',
    transition: 'all 0.3s ease'
  },
  uploadLabel: {
    cursor: 'pointer',
    display: 'block'
  },
  uploadIcon: {
    fontSize: '4rem',
    marginBottom: '24px'
  },
  uploadTitle: {
    fontSize: '1.875rem',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '12px'
  },
  uploadText: {
    fontSize: '1.125rem',
    color: 'var(--text-muted)',
    marginBottom: '8px'
  },
  uploadSubtext: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)'
  },
  fileInfo: {
    background: 'rgba(0, 242, 255, 0.1)',
    border: '1px solid rgba(0, 242, 255, 0.2)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '32px'
  },
  fileName: {
    fontSize: '16px',
    color: '#00f2ff',
    marginBottom: '16px'
  },
  analyzeButton: {
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    color: 'var(--bg-color)',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer'
  },

  // Analyzing
  analyzing: {
    textAlign: 'center',
    padding: '60px'
  },
  analyzingSpinner: {
    width: '60px',
    height: '60px',
    border: '4px solid #262626',
    borderTop: '4px solid #00f2ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px'
  },
  analyzingText: {
    fontSize: '1.5rem',
    color: 'var(--text-color)',
    marginBottom: '8px'
  },
  analyzingSubtext: {
    fontSize: '1rem',
    color: 'var(--text-muted)'
  },

  // Analysis Results
  analysisResult: {
    marginTop: '32px'
  },
  resultTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '32px',
    textAlign: 'center'
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  },
  resultSection: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '16px'
  },
  dimensions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  dimensionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px'
  },
  dimensionLabel: {
    color: 'var(--text-muted)'
  },
  dimensionValue: {
    color: 'var(--text-color)',
    fontWeight: 600
  },
  costBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  costItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px'
  },
  costItemTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px',
    background: 'rgba(0, 242, 255, 0.1)',
    border: '1px solid rgba(0, 242, 255, 0.2)',
    borderRadius: '8px'
  },
  costLabel: {
    color: 'var(--text-muted)'
  },
  costValue: {
    color: 'var(--text-color)',
    fontWeight: 600
  },
  feasibilityScore: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px'
  },
  scoreBar: {
    flex: 1,
    height: '8px',
    background: 'var(--border-color)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  scoreFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    transition: 'width 0.3s ease'
  },
  scoreText: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#22c55e'
  },
  recommendations: {
    marginTop: '16px'
  },
  recommendationsTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '8px'
  },
  recommendation: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginBottom: '4px'
  },
  complianceGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  complianceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '6px'
  },
  complianceLabel: {
    color: 'var(--text-muted)'
  },
  complianceValue: {
    fontWeight: 600
  },

  // Manual Section
  manualSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-muted)'
  },
  formInput: {
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px'
  },
  formSelect: {
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px'
  },
  buildingTypes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  buildingTypeCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  buildingTypeCardActive: {
    background: 'rgba(0, 242, 255, 0.1)',
    borderColor: '#00f2ff'
  },
  buildingTypeIcon: {
    fontSize: '3rem',
    marginBottom: '12px'
  },
  buildingTypeName: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '8px'
  },
  buildingTypeCost: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#00f2ff',
    marginBottom: '4px'
  },
  buildingTypeTime: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  featureCardActive: {
    background: 'rgba(0, 242, 255, 0.1)',
    borderColor: '#00f2ff'
  },
  featureIcon: {
    fontSize: '2rem',
    marginBottom: '8px'
  },
  featureName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '4px'
  },
  featureCost: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#00f2ff',
    marginBottom: '2px'
  },
  featureTime: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  generateButton: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    border: 'none',
    borderRadius: '16px',
    padding: '20px 40px',
    color: 'white',
    fontSize: '1.125rem',
    fontWeight: 700,
    cursor: 'pointer',
    alignSelf: 'center',
    marginTop: '32px'
  },

  // Sidebar
  sidebar: {
    width: '380px',
    background: 'rgba(10, 10, 10, 0.95)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    backdropFilter: 'blur(10px)'
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sidebarTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-color)',
    margin: 0
  },
  newChatButton: {
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    color: 'var(--bg-color)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  conversationsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px'
  },
  conversationItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '8px'
  },
  conversationItemActive: {
    background: 'rgba(0, 242, 255, 0.1)'
  },
  conversationAvatar: {
    position: 'relative',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem'
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#22c55e',
    border: '2px solid #0a0a0a'
  },
  conversationContent: {
    flex: 1,
    minWidth: 0
  },
  conversationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  conversationName: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  conversationTime: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  conversationRole: {
    fontSize: '12px',
    color: '#00f2ff',
    marginBottom: '4px'
  },
  conversationMessage: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  unreadBadge: {
    background: '#00f2ff',
    color: 'var(--bg-color)',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 600
  },

  // Chat Area
  chatArea: {
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },
  chatHeader: {
    padding: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  chatAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem'
  },
  chatInfo: {
    flex: 1
  },
  chatName: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-color)',
    margin: '0 0 4px 0'
  },
  chatRole: {
    fontSize: '12px',
    color: '#00f2ff',
    margin: 0
  },
  messagesArea: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto'
  },
  welcomeMessage: {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'var(--text-muted)'
  },
  messageInput: {
    padding: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '12px'
  },
  messageInputField: {
    flex: 1,
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px'
  },
  sendButton: {
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    color: 'var(--bg-color)',
    fontSize: '16px',
    cursor: 'pointer'
  }
};
