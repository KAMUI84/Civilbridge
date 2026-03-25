// Enhanced Engineer Role System
import React, { useState, useEffect } from 'react';

export default function EngineerSystem() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingPlans, setPendingPlans] = useState([]);
  const [approvedPlans, setApprovedPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [engineerProfile, setEngineerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockPendingPlans = [
    {
      id: 1,
      title: 'Modern Residential House - Kigali',
      client: 'Jean Mugisha',
      submittedDate: '2024-03-18',
      status: 'pending_review',
      priority: 'high',
      planType: 'ai_generated',
      estimatedCost: 28000000,
      timeline: '8 months',
      feasibilityScore: 85,
      location: 'Kigali, Gasabo',
      description: '3-bedroom residential house with modern amenities',
      documents: [
        { name: 'Architectural Plan.pdf', type: 'pdf', size: '2.4MB' },
        { name: 'Material Breakdown.xlsx', type: 'excel', size: '156KB' },
        { name: 'Cost Estimate.pdf', type: 'pdf', size: '890KB' }
      ],
      aiAnalysis: {
        structuralIntegrity: 92,
        complianceScore: 88,
        materialEfficiency: 85,
        costOptimization: 78
      },
      clientInfo: {
        name: 'Jean Mugisha',
        email: 'jean.mugisha@email.com',
        phone: '+250788123456',
        company: 'Mugisha Enterprises'
      }
    },
    {
      id: 2,
      title: 'Commercial Office Building - Remera',
      client: 'Sarah Uwimana',
      submittedDate: '2024-03-17',
      status: 'pending_review',
      priority: 'medium',
      planType: 'manual',
      estimatedCost: 65000000,
      timeline: '15 months',
      feasibilityScore: 78,
      location: 'Kigali, Kicukiro',
      description: '4-story commercial office building with parking',
      documents: [
        { name: 'Floor Plans.dwg', type: 'dwg', size: '4.2MB' },
        { name: 'Structural Analysis.pdf', type: 'pdf', size: '1.8MB' }
      ],
      aiAnalysis: {
        structuralIntegrity: 85,
        complianceScore: 92,
        materialEfficiency: 80,
        costOptimization: 75
      },
      clientInfo: {
        name: 'Sarah Uwimana',
        email: 'sarah.uwimana@company.rw',
        phone: '+250787987654',
        company: 'Uwimana Construction'
      }
    }
  ];

  const mockApprovedPlans = [
    {
      id: 3,
      title: 'Apartment Complex - Nyarugenge',
      client: 'Joseph Niyonzima',
      approvedDate: '2024-03-15',
      status: 'approved',
      priority: 'high',
      estimatedCost: 120000000,
      timeline: '18 months',
      feasibilityScore: 91,
      location: 'Kigali, Nyarugenge',
      engineerApproval: {
        approvedBy: 'Eng. Marie Mukamana',
        approvedDate: '2024-03-15',
        licenseNumber: 'REB/ENG/2023/0456',
        comments: 'Structural design is sound and meets all building codes. Recommended for construction.',
        stamp: 'APPROVED'
      }
    }
  ];

  const mockEngineerProfile = {
    name: 'Marie Mukamana',
    title: 'Senior Structural Engineer',
    licenseNumber: 'REB/ENG/2023/0456',
    specializations: ['Structural Engineering', 'Building Codes', 'Project Management'],
    experience: '12 years',
    approvedProjects: 47,
    rating: 4.9,
    certifications: [
      'Rwanda Engineers Board Certified',
      'Structural Engineering Masters',
      'Project Management Professional'
    ],
    contact: {
      email: 'marie.mukamana@eng.rw',
      phone: '+250785456789',
      office: 'Kigali, Kacyiru'
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setPendingPlans(mockPendingPlans);
      setApprovedPlans(mockApprovedPlans);
      setEngineerProfile(mockEngineerProfile);
      setLoading(false);
    }, 1000);
  }, []);

  const handleReviewPlan = (plan) => {
    setSelectedPlan(plan);
    setShowReviewModal(true);
  };

  const handleApprovePlan = (planId, reviewData) => {
    const plan = pendingPlans.find(p => p.id === planId);
    const approvedPlan = {
      ...plan,
      status: 'approved',
      engineerApproval: {
        approvedBy: engineerProfile.name,
        approvedDate: new Date().toISOString().split('T')[0],
        licenseNumber: engineerProfile.licenseNumber,
        comments: reviewData.comments,
        recommendations: reviewData.recommendations,
        stamp: 'APPROVED'
      }
    };
    
    setPendingPlans(pendingPlans.filter(p => p.id !== planId));
    setApprovedPlans([...approvedPlans, approvedPlan]);
    setShowReviewModal(false);
    setSelectedPlan(null);
  };

  const handleRejectPlan = (planId, reviewData) => {
    const plan = pendingPlans.find(p => p.id === planId);
    const rejectedPlan = {
      ...plan,
      status: 'rejected',
      engineerApproval: {
        approvedBy: engineerProfile.name,
        approvedDate: new Date().toISOString().split('T')[0],
        licenseNumber: engineerProfile.licenseNumber,
        comments: reviewData.comments,
        reasons: reviewData.reasons,
        stamp: 'REJECTED'
      }
    };
    
    setPendingPlans(pendingPlans.filter(p => p.id !== planId));
    setShowReviewModal(false);
    setSelectedPlan(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading engineer dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Engineer Dashboard</h1>
        <p style={styles.subtitle}>Review and validate construction plans</p>
      </div>

      {/* Engineer Profile Card */}
      {engineerProfile && (
        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.profileAvatar}>
              {engineerProfile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={styles.profileInfo}>
              <h2 style={styles.profileName}>{engineerProfile.name}</h2>
              <p style={styles.profileTitle}>{engineerProfile.title}</p>
              <div style={styles.profileLicense}>
                License: {engineerProfile.licenseNumber}
              </div>
              <div style={styles.profileStats}>
                <div style={styles.stat}>
                  <span style={styles.statValue}>{engineerProfile.approvedProjects}</span>
                  <span style={styles.statLabel}>Projects Approved</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statValue}>{engineerProfile.rating}</span>
                  <span style={styles.statLabel}>Rating</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statValue}>{engineerProfile.experience}</span>
                  <span style={styles.statLabel}>Experience</span>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.profileDetails}>
            <div style={styles.detailSection}>
              <h4 style={styles.detailTitle}>Specializations</h4>
              <div style={styles.specializations}>
                {engineerProfile.specializations.map((spec, index) => (
                  <span key={index} style={styles.specialization}>{spec}</span>
                ))}
              </div>
            </div>
            <div style={styles.detailSection}>
              <h4 style={styles.detailTitle}>Certifications</h4>
              <div style={styles.certifications}>
                {engineerProfile.certifications.map((cert, index) => (
                  <div key={index} style={styles.certification}>
                    ✓ {cert}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'dashboard' && styles.tabActive)
          }}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'pending' && styles.tabActive)
          }}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending Review ({pendingPlans.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'approved' && styles.tabActive)
          }}
          onClick={() => setActiveTab('approved')}
        >
          ✅ Approved ({approvedPlans.length})
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div style={styles.dashboardContent}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>⏳</div>
              <div style={styles.statInfo}>
                <h3 style={styles.statNumber}>{pendingPlans.length}</h3>
                <p style={styles.statLabel}>Pending Reviews</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>✅</div>
              <div style={styles.statInfo}>
                <h3 style={styles.statNumber}>{approvedPlans.length}</h3>
                <p style={styles.statLabel}>Approved Plans</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📈</div>
              <div style={styles.statInfo}>
                <h3 style={styles.statNumber}>91%</h3>
                <p style={styles.statLabel}>Avg. Approval Rate</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>⏱️</div>
              <div style={styles.statInfo}>
                <h3 style={styles.statNumber}>2.5 days</h3>
                <p style={styles.statLabel}>Avg. Review Time</p>
              </div>
            </div>
          </div>

          <div style={styles.recentActivity}>
            <h3 style={styles.sectionTitle}>Recent Activity</h3>
            <div style={styles.activityList}>
              {[...pendingPlans, ...approvedPlans].slice(0, 5).map((plan, index) => (
                <div key={plan.id} style={styles.activityItem}>
                  <div style={styles.activityIcon}>
                    {plan.status === 'approved' ? '✅' : '⏳'}
                  </div>
                  <div style={styles.activityContent}>
                    <p style={styles.activityText}>
                      {plan.title} - {plan.client}
                    </p>
                    <p style={styles.activityTime}>
                      {plan.status === 'approved' ? 'Approved' : 'Submitted'} on {plan.status === 'approved' ? plan.approvedDate : plan.submittedDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pending Reviews Tab */}
      {activeTab === 'pending' && (
        <div style={styles.plansList}>
          <h3 style={styles.sectionTitle}>Plans Pending Review</h3>
          {pendingPlans.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No plans pending review</p>
            </div>
          ) : (
            <div style={styles.plansGrid}>
              {pendingPlans.map((plan, index) => (
                <div
                  key={plan.id}
                  style={styles.planCard}
                >
                  <div style={styles.planHeader}>
                    <h3 style={styles.planTitle}>{plan.title}</h3>
                    <span style={{
                      ...styles.priorityBadge,
                      ...(plan.priority === 'high' && styles.priorityHigh)
                    }}>
                      {plan.priority}
                    </span>
                  </div>
                  
                  <div style={styles.planInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Client:</span>
                      <span style={styles.infoValue}>{plan.client}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Location:</span>
                      <span style={styles.infoValue}>{plan.location}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Cost:</span>
                      <span style={styles.infoValue}>{formatCurrency(plan.estimatedCost)}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Timeline:</span>
                      <span style={styles.infoValue}>{plan.timeline}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Feasibility:</span>
                      <span style={styles.infoValue}>{plan.feasibilityScore}%</span>
                    </div>
                  </div>

                  <div style={styles.aiAnalysis}>
                    <h4 style={styles.analysisTitle}>AI Analysis</h4>
                    <div style={styles.analysisGrid}>
                      {Object.entries(plan.aiAnalysis).map(([key, value]) => (
                        <div key={key} style={styles.analysisItem}>
                          <span style={styles.analysisLabel}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div style={styles.analysisBar}>
                            <div style={{
                              ...styles.analysisFill,
                              width: `${value}%`,
                              background: value >= 90 ? '#22c55e' : value >= 80 ? '#f59e0b' : '#ef4444'
                            }}></div>
                          </div>
                          <span style={styles.analysisValue}>{value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={styles.planDocuments}>
                    <h4 style={styles.documentsTitle}>Documents</h4>
                    <div style={styles.documentsList}>
                      {plan.documents.map((doc, index) => (
                        <div key={index} style={styles.documentItem}>
                          <span style={styles.documentIcon}>
                            {doc.type === 'pdf' ? '📄' : doc.type === 'excel' ? '📊' : '📐'}
                          </span>
                          <span style={styles.documentName}>{doc.name}</span>
                          <span style={styles.documentSize}>{doc.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={styles.planActions}>
                    <button
                      style={styles.reviewButton}
                      onClick={() => handleReviewPlan(plan)}
                    >
                      🔍 Review Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approved Plans Tab */}
      {activeTab === 'approved' && (
        <div style={styles.plansList}>
          <h3 style={styles.sectionTitle}>Approved Plans</h3>
          {approvedPlans.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No approved plans yet</p>
            </div>
          ) : (
            <div style={styles.plansGrid}>
              {approvedPlans.map((plan, index) => (
                <div
                  key={plan.id}
                  style={styles.planCard}
                >
                  <div style={styles.planHeader}>
                    <h3 style={styles.planTitle}>{plan.title}</h3>
                    <span style={styles.approvedBadge}>✅ APPROVED</span>
                  </div>
                  
                  <div style={styles.approvalInfo}>
                    <h4 style={styles.approvalTitle}>Engineer Approval</h4>
                    <div style={styles.approvalDetails}>
                      <div style={styles.approvalItem}>
                        <span style={styles.approvalLabel}>Approved by:</span>
                        <span style={styles.approvalValue}>{plan.engineerApproval.approvedBy}</span>
                      </div>
                      <div style={styles.approvalItem}>
                        <span style={styles.approvalLabel}>License:</span>
                        <span style={styles.approvalValue}>{plan.engineerApproval.licenseNumber}</span>
                      </div>
                      <div style={styles.approvalItem}>
                        <span style={styles.approvalLabel}>Date:</span>
                        <span style={styles.approvalValue}>{plan.engineerApproval.approvedDate}</span>
                      </div>
                    </div>
                    <div style={styles.approvalComments}>
                      <p style={styles.commentsText}>{plan.engineerApproval.comments}</p>
                    </div>
                  </div>

                  <div style={styles.planActions}>
                    <button style={styles.viewButton}>
                      📄 View Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedPlan && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <ReviewModal
              plan={selectedPlan}
              engineerProfile={engineerProfile}
              onApprove={handleApprovePlan}
              onReject={handleRejectPlan}
              onClose={() => setShowReviewModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Review Modal Component
function ReviewModal({ plan, engineerProfile, onApprove, onReject, onClose }) {
  const [reviewData, setReviewData] = useState({
    comments: '',
    recommendations: '',
    reasons: []
  });
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!reviewData.comments.trim()) {
      alert('Please provide comments for approval');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      onApprove(plan.id, reviewData);
      setLoading(false);
    }, 1000);
  };

  const handleReject = async () => {
    if (!reviewData.comments.trim()) {
      alert('Please provide reasons for rejection');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      onReject(plan.id, reviewData);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={styles.reviewModal}>
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>Review Construction Plan</h3>
        <button style={styles.modalClose} onClick={onClose}>×</button>
      </div>

      <div style={styles.modalContent}>
        <div style={styles.planSummary}>
          <h4 style={styles.summaryTitle}>Plan Details</h4>
          <div style={styles.summaryInfo}>
            <p><strong>Title:</strong> {plan.title}</p>
            <p><strong>Client:</strong> {plan.client}</p>
            <p><strong>Location:</strong> {plan.location}</p>
            <p><strong>Cost:</strong> {new Intl.NumberFormat('rw-RW', {
              style: 'currency',
              currency: 'RWF',
              minimumFractionDigits: 0
            }).format(plan.estimatedCost)}</p>
            <p><strong>Feasibility Score:</strong> {plan.feasibilityScore}%</p>
          </div>
        </div>

        <div style={styles.reviewSection}>
          <h4 style={styles.reviewTitle}>Engineer Review</h4>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Comments *</label>
            <textarea
              style={styles.formTextarea}
              value={reviewData.comments}
              onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
              placeholder="Provide your professional assessment..."
              rows={4}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Recommendations</label>
            <textarea
              style={styles.formTextarea}
              value={reviewData.recommendations}
              onChange={(e) => setReviewData({ ...reviewData, recommendations: e.target.value })}
              placeholder="Suggestions for improvement..."
              rows={3}
            />
          </div>
        </div>

        <div style={styles.modalActions}>
          <button
            style={styles.rejectButton}
            onClick={handleReject}
            disabled={loading}
          >
            {loading ? 'Processing...' : '❌ Reject Plan'}
          </button>
          <button
            style={styles.approveButton}
            onClick={handleApprove}
            disabled={loading}
          >
            {loading ? 'Processing...' : '✅ Approve Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  
  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: 'var(--text-muted)'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #262626',
    borderTop: '4px solid #00f2ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },

  // Header
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'var(--text-color)',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'var(--text-muted)'
  },

  // Profile Card
  profileCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '32px'
  },
  profileHeader: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px'
  },
  profileAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 700,
    color: 'var(--bg-color)'
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '4px'
  },
  profileTitle: {
    fontSize: '16px',
    color: '#00f2ff',
    marginBottom: '8px'
  },
  profileLicense: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '16px'
  },
  profileStats: {
    display: 'flex',
    gap: '32px'
  },
  stat: {
    textAlign: 'center'
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  profileDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px'
  },
  detailSection: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '16px'
  },
  detailTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '12px'
  },
  specializations: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  specialization: {
    fontSize: '12px',
    background: 'rgba(0, 242, 255, 0.1)',
    color: '#00f2ff',
    padding: '4px 8px',
    borderRadius: '6px'
  },
  certifications: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  certification: {
    fontSize: '13px',
    color: '#22c55e'
  },

  // Tabs
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '32px',
    borderBottom: '1px solid #262626'
  },
  tab: {
    background: 'none',
    border: 'none',
    padding: '12px 20px',
    fontSize: '14px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease'
  },
  tabActive: {
    color: '#00f2ff',
    borderBottomColor: '#00f2ff'
  },

  // Dashboard
  dashboardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  statIcon: {
    fontSize: '24px',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px'
  },
  statInfo: {
    flex: 1
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '4px'
  },
  recentActivity: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '16px'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px'
  },
  activityIcon: {
    fontSize: '16px'
  },
  activityContent: {
    flex: 1
  },
  activityText: {
    fontSize: '14px',
    color: 'var(--text-color)',
    marginBottom: '2px'
  },
  activityTime: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },

  // Plans List
  plansList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  plansGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  },
  planCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px'
  },
  planHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  planTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-color)',
    margin: 0
  },
  priorityBadge: {
    fontSize: '10px',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b'
  },
  priorityHigh: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444'
  },
  approvedBadge: {
    fontSize: '10px',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e'
  },
  planInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px'
  },
  infoLabel: {
    color: 'var(--text-muted)'
  },
  infoValue: {
    color: 'var(--text-color)',
    fontWeight: 500
  },

  // AI Analysis
  aiAnalysis: {
    background: 'rgba(0, 242, 255, 0.05)',
    border: '1px solid rgba(0, 242, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px'
  },
  analysisTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#00f2ff',
    marginBottom: '12px'
  },
  analysisGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  analysisItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  analysisLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    minWidth: '120px'
  },
  analysisBar: {
    flex: 1,
    height: '6px',
    background: 'var(--border-color)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  analysisFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  analysisValue: {
    fontSize: '12px',
    color: 'var(--text-color)',
    minWidth: '30px',
    textAlign: 'right'
  },

  // Documents
  planDocuments: {
    marginBottom: '16px'
  },
  documentsTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '8px'
  },
  documentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  documentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  documentIcon: {
    fontSize: '16px'
  },
  documentName: {
    flex: 1
  },
  documentSize: {
    color: 'var(--text-muted)'
  },

  // Actions
  planActions: {
    display: 'flex',
    gap: '12px'
  },
  reviewButton: {
    flex: 1,
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    color: 'var(--bg-color)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  viewButton: {
    flex: 1,
    background: 'transparent',
    border: '1px solid #262626',
    borderRadius: '8px',
    padding: '12px 20px',
    color: 'var(--text-color)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },

  // Approval Info
  approvalInfo: {
    background: 'rgba(34, 197, 94, 0.05)',
    border: '1px solid rgba(34, 197, 94, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px'
  },
  approvalTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#22c55e',
    marginBottom: '12px'
  },
  approvalDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px'
  },
  approvalItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px'
  },
  approvalLabel: {
    color: 'var(--text-muted)'
  },
  approvalValue: {
    color: 'var(--text-color)',
    fontWeight: 500
  },
  approvalComments: {
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px'
  },
  commentsText: {
    fontSize: '13px',
    color: '#22c55e',
    margin: 0
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-muted)'
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  reviewModal: {
    width: '100%'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-color)',
    margin: 0
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: 'var(--text-muted)',
    cursor: 'pointer'
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  planSummary: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '20px'
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '12px'
  },
  summaryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  reviewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  reviewTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-color)'
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
  formTextarea: {
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  modalActions: {
    display: 'flex',
    gap: '12px'
  },
  rejectButton: {
    flex: 1,
    background: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  approveButton: {
    flex: 1,
    background: '#22c55e',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  }
};
