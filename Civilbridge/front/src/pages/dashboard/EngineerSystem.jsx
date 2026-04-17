import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import appointmentsService from '../../services/appointmentsService';
import { expertsService } from '../../services/expertsService';

export default function EngineerSystem() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [experts, setExperts] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState([]);
  const [availabilityState, setAvailabilityState] = useState({ loading: false, error: '' });
  const [bookingData, setBookingData] = useState({ calendarSlotId: '', notes: '' });
  const [bookingState, setBookingState] = useState({ submitting: false, message: '', type: '' });

  const loadExperts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await expertsService.getAll();
      const nextExperts = (data?.experts || []).filter((expert) => String(expert.userId) !== String(user?.id));
      setExperts(nextExperts);
      setLoading(false);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load appointment providers.');
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadExperts();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadExperts]);

  const loadAvailability = useCallback(async (providerId) => {
    try {
      setAvailabilityState({ loading: true, error: '' });
      const data = await appointmentsService.getAvailability(providerId);
      setAvailability(data?.availability || []);
      setAvailabilityState({ loading: false, error: '' });
    } catch (loadError) {
      setAvailability([]);
      setAvailabilityState({ loading: false, error: loadError.message || 'Failed to fetch availability.' });
    }
  }, []);

  const openBooking = async (expert) => {
    setSelectedExpert(expert);
    setBookingData({ calendarSlotId: '', notes: '' });
    setBookingState({ submitting: false, message: '', type: '' });
    setShowReviewModal(true);
    await loadAvailability(expert.userId);
  };

  const handleBookAppointment = async () => {
    if (!selectedExpert) return;
    if (!bookingData.calendarSlotId) {
      setBookingState({ submitting: false, message: 'Select an available slot first.', type: 'error' });
      return;
    }

    try {
      setBookingState({ submitting: true, message: '', type: '' });
      const response = await appointmentsService.create({
        providerId: String(selectedExpert.userId),
        calendarSlotId: bookingData.calendarSlotId,
        notes: bookingData.notes,
      });

      const appointment = response?.appointment;
      setBookedAppointments((prev) => [appointment, ...prev]);
      setBookingState({ submitting: false, message: 'Appointment request sent successfully.', type: 'success' });
      await loadAvailability(selectedExpert.userId);
      setBookingData({ calendarSlotId: '', notes: '' });
    } catch (submitError) {
      setBookingState({ submitting: false, message: submitError.message || 'Failed to book appointment.', type: 'error' });
    }
  };

  const dashboardStats = useMemo(() => {
    const totalSlots = experts.length;
    const availableExperts = experts.filter((expert) => expert.verifiedAt).length;
    return {
      availableExperts,
      bookedAppointments: bookedAppointments.length,
      totalProviders: totalSlots,
      completionRate: bookedAppointments.length ? 'Live' : 'Ready',
    };
  }, [bookedAppointments.length, experts]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading engineer dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingContainer}>
        <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>
        <button style={styles.reviewButton} onClick={loadExperts}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Engineer Dashboard</h1>
        <p style={styles.subtitle}>Book consultations and coordinate with verified experts</p>
      </div>

      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <div style={styles.profileAvatar}>
            {(user?.fullName || 'Engineer')
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div style={styles.profileInfo}>
            <h2 style={styles.profileName}>{user?.fullName || 'Engineer'}</h2>
            <p style={styles.profileTitle}>{user?.role || 'PROFESSIONAL'}</p>
            <div style={styles.profileLicense}>Email: {user?.email || 'Not available'}</div>
            <div style={styles.profileStats}>
              <div style={styles.stat}>
                <span style={styles.statValue}>{dashboardStats.availableExperts}</span>
                <span style={styles.statLabel}>Available Experts</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statValue}>{dashboardStats.bookedAppointments}</span>
                <span style={styles.statLabel}>Booked Requests</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statValue}>{dashboardStats.totalProviders}</span>
                <span style={styles.statLabel}>Provider Network</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'dashboard' && styles.tabActive) }}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'pending' && styles.tabActive) }}
          onClick={() => setActiveTab('pending')}
        >
          Available Experts ({experts.length})
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'approved' && styles.tabActive) }}
          onClick={() => setActiveTab('approved')}
        >
          Booked Requests ({bookedAppointments.length})
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div style={styles.dashboardContent}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>EX</div>
              <div style={styles.statInfo}>
                <h3 style={styles.statNumber}>{dashboardStats.availableExperts}</h3>
                <p style={styles.statLabel}>Verified Experts</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>RQ</div>
              <div style={styles.statInfo}>
                <h3 style={styles.statNumber}>{dashboardStats.bookedAppointments}</h3>
                <p style={styles.statLabel}>Appointment Requests</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>NW</div>
              <div style={styles.statInfo}>
                <h3 style={styles.statNumber}>{dashboardStats.totalProviders}</h3>
                <p style={styles.statLabel}>Provider Network</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>OK</div>
              <div style={styles.statInfo}>
                <h3 style={styles.statNumber}>{dashboardStats.completionRate}</h3>
                <p style={styles.statLabel}>Booking Status</p>
              </div>
            </div>
          </div>

          <div style={styles.recentActivity}>
            <h3 style={styles.sectionTitle}>Recent Booking Activity</h3>
            <div style={styles.activityList}>
              {bookedAppointments.length ? (
                bookedAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} style={styles.activityItem}>
                    <div style={styles.activityIcon}>AP</div>
                    <div style={styles.activityContent}>
                      <p style={styles.activityText}>
                        Appointment with {appointment.provider?.fullName || 'provider'}
                      </p>
                      <p style={styles.activityTime}>
                        {new Date(appointment.startsAt).toLocaleString()} • {appointment.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <p>No appointment activity yet. Book your first consultation from the Available Experts tab.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div style={styles.plansList}>
          <h3 style={styles.sectionTitle}>Verified Experts With Bookable Availability</h3>
          {experts.length === 0 ? (
            <div style={styles.emptyState}><p>No experts available right now.</p></div>
          ) : (
            <div style={styles.plansGrid}>
              {experts.map((expert) => (
                <div key={expert.id} style={styles.planCard}>
                  <div style={styles.planHeader}>
                    <h3 style={styles.planTitle}>{expert.user?.fullName}</h3>
                    <span style={{ ...styles.priorityBadge, ...(expert.verifiedAt && styles.approvedBadge) }}>
                      {expert.verifiedAt ? 'Verified' : 'Profile'}
                    </span>
                  </div>
                  <div style={styles.planInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Profession:</span>
                      <span style={styles.infoValue}>{expert.user?.profession || 'Expert'}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Region:</span>
                      <span style={styles.infoValue}>{expert.region || expert.user?.region || 'Rwanda'}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Rating:</span>
                      <span style={styles.infoValue}>{expert.ratingAvg?.toFixed?.(1) || '—'} ({expert.ratingCount || 0})</span>
                    </div>
                  </div>
                  <div style={styles.aiAnalysis}>
                    <h4 style={styles.analysisTitle}>Summary</h4>
                    <div style={styles.analysisGrid}>
                      <div style={styles.analysisItem}>
                        <span style={styles.analysisLabel}>Headline</span>
                        <span style={styles.analysisValue}>{expert.headline || 'Available for consultations'}</span>
                      </div>
                    </div>
                  </div>
                  <div style={styles.planActions}>
                    <button style={styles.reviewButton} onClick={() => openBooking(expert)}>
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'approved' && (
        <div style={styles.plansList}>
          <h3 style={styles.sectionTitle}>Booked Appointment Requests</h3>
          {bookedAppointments.length === 0 ? (
            <div style={styles.emptyState}><p>No booked appointment requests yet.</p></div>
          ) : (
            <div style={styles.plansGrid}>
              {bookedAppointments.map((appointment) => (
                <div key={appointment.id} style={styles.planCard}>
                  <div style={styles.planHeader}>
                    <h3 style={styles.planTitle}>{appointment.provider?.fullName || 'Appointment'}</h3>
                    <span style={styles.approvedBadge}>{appointment.status}</span>
                  </div>
                  <div style={styles.approvalInfo}>
                    <h4 style={styles.approvalTitle}>Appointment Details</h4>
                    <div style={styles.approvalDetails}>
                      <div style={styles.approvalItem}>
                        <span style={styles.approvalLabel}>Starts:</span>
                        <span style={styles.approvalValue}>{new Date(appointment.startsAt).toLocaleString()}</span>
                      </div>
                      <div style={styles.approvalItem}>
                        <span style={styles.approvalLabel}>Ends:</span>
                        <span style={styles.approvalValue}>{new Date(appointment.endsAt).toLocaleString()}</span>
                      </div>
                      <div style={styles.approvalItem}>
                        <span style={styles.approvalLabel}>Notes:</span>
                        <span style={styles.approvalValue}>{appointment.notes || 'None'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showReviewModal && selectedExpert && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.reviewModal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Book Appointment With {selectedExpert.user?.fullName}</h3>
                <button style={styles.modalClose} onClick={() => setShowReviewModal(false)}>X</button>
              </div>

              <div style={styles.modalContent}>
                {bookingState.message ? (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: bookingState.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                    color: bookingState.type === 'error' ? '#ef4444' : '#22c55e',
                  }}>
                    {bookingState.message}
                  </div>
                ) : null}

                <div style={styles.planSummary}>
                  <h4 style={styles.summaryTitle}>Provider Details</h4>
                  <div style={styles.summaryInfo}>
                    <p><strong>Name:</strong> {selectedExpert.user?.fullName}</p>
                    <p><strong>Profession:</strong> {selectedExpert.user?.profession || 'Expert'}</p>
                    <p><strong>Region:</strong> {selectedExpert.region || selectedExpert.user?.region || 'Rwanda'}</p>
                  </div>
                </div>

                <div style={styles.reviewSection}>
                  <h4 style={styles.reviewTitle}>Choose Availability</h4>
                  {availabilityState.loading ? (
                    <div style={styles.emptyState}><p>Loading available slots...</p></div>
                  ) : availabilityState.error ? (
                    <div style={styles.emptyState}>
                      <p>{availabilityState.error}</p>
                      <button style={styles.viewButton} onClick={() => loadAvailability(selectedExpert.userId)}>Retry availability</button>
                    </div>
                  ) : availability.length === 0 ? (
                    <div style={styles.emptyState}><p>No open slots for this expert right now.</p></div>
                  ) : (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {availability.map((slot) => {
                        const selectedSlot = String(bookingData.calendarSlotId) === String(slot.id);
                        return (
                          <label
                            key={slot.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 12px',
                              borderRadius: 10,
                              border: selectedSlot ? '1px solid #00f2ff' : '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            <input
                              type="radio"
                              name="calendarSlotId"
                              value={slot.id}
                              checked={selectedSlot}
                              onChange={(event) => setBookingData((prev) => ({ ...prev, calendarSlotId: event.target.value }))}
                            />
                            <span>{new Date(slot.startsAt).toLocaleString()} - {new Date(slot.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Notes</label>
                    <textarea
                      style={styles.formTextarea}
                      value={bookingData.notes}
                      onChange={(event) => setBookingData((prev) => ({ ...prev, notes: event.target.value }))}
                      placeholder="Add project notes or meeting context..."
                      rows={3}
                    />
                  </div>
                </div>

                <div style={styles.modalActions}>
                  <button style={styles.rejectButton} onClick={() => setShowReviewModal(false)} disabled={bookingState.submitting}>
                    Close
                  </button>
                  <button style={styles.approveButton} onClick={handleBookAppointment} disabled={bookingState.submitting || !availability.length}>
                    {bookingState.submitting ? 'Processing...' : 'Book Appointment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
  profileInfo: { flex: 1 },
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
  stat: { textAlign: 'center' },
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
  statInfo: { flex: 1 },
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
  activityContent: { flex: 1 },
  activityText: {
    fontSize: '14px',
    color: 'var(--text-color)',
    marginBottom: '2px'
  },
  activityTime: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
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
  approvedBadge: {
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
  infoLabel: { color: 'var(--text-muted)' },
  infoValue: {
    color: 'var(--text-color)',
    fontWeight: 500
  },
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
  analysisValue: {
    fontSize: '12px',
    color: 'var(--text-color)',
    minWidth: '30px'
  },
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
  approvalLabel: { color: 'var(--text-muted)' },
  approvalValue: {
    color: 'var(--text-color)',
    fontWeight: 500
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-muted)'
  },
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
  reviewModal: { width: '100%' },
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

