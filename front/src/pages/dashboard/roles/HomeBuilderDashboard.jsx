import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsService } from '../../../services/documentsService';
import { listingsService } from '../../../services/listingsService';
import paymentsService from '../../../services/paymentsService';
import { plansService } from '../../../services/plansService';
import { progressService } from '../../../services/progressService';
import { projectsService } from '../../../services/projectsService';

function formatMoney(value, currency = 'RWF') {
  return new Intl.NumberFormat('en-RW', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatRequestLabel(type) {
  const lookup = {
    SCHEDULE_VISIT: 'Property visit requested',
    MORE_INFO: 'Information request sent',
    CONNECT_AGENT: 'Direct follow-up requested',
    ASK_EXPERT: 'Plan review requested',
    CUSTOMIZE: 'Plan customization requested',
    BUY_FULL_PACKAGE: 'Full package requested',
  };
  return lookup[String(type || '').toUpperCase()] || 'Follow-up request';
}

function formatRequestStatus(status) {
  return String(status || 'NEW').replaceAll('_', ' ');
}

export default function HomeBuilderDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [progressData, setProgressData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [planRequests, setPlanRequests] = useState([]);
  const [listingRequests, setListingRequests] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  const [detailState, setDetailState] = useState({ loading: false, error: '' });

  const loadDashboard = useCallback(async () => {
    try {
      setState({ loading: true, error: '' });
      const [projectsResponse, paymentsResponse, planRequestsResponse, listingRequestsResponse] = await Promise.all([
        projectsService.getUserProjects(),
        paymentsService.history({ pageSize: 10 }),
        plansService.getMyRequests(),
        listingsService.getMyRequests(),
      ]);
      const nextProjects = Array.isArray(projectsResponse) ? projectsResponse : [];
      setProjects(nextProjects);
      setSelectedProjectId((current) => current || nextProjects[0]?.id || '');
      setPayments(paymentsResponse?.items || []);
      setPlanRequests(planRequestsResponse?.requests || []);
      setListingRequests(listingRequestsResponse?.requests || []);
      setState({ loading: false, error: '' });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Failed to load client dashboard.' });
    }
  }, []);

  const loadProjectDetail = useCallback(async (projectId) => {
    if (!projectId) {
      setProgressData(null);
      setDocuments([]);
      return;
    }

    try {
      setDetailState({ loading: true, error: '' });
      const [progressResponse, documentsResponse] = await Promise.all([
        progressService.getProjectProgress(projectId),
        documentsService.list({ project_id: projectId, review_status: 'APPROVED' }),
      ]);
      setProgressData(progressResponse || null);
      setDocuments(documentsResponse?.documents || []);
      setDetailState({ loading: false, error: '' });
    } catch (error) {
      setProgressData(null);
      setDocuments([]);
      setDetailState({ loading: false, error: error.message || 'Failed to load project tracking details.' });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboard();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadProjectDetail(selectedProjectId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProjectDetail, selectedProjectId]);

  const confirmedTotal = useMemo(
    () => payments.filter((payment) => payment.status === 'CONFIRMED').reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    [payments],
  );
  const upcomingMilestones = useMemo(
    () => payments.filter((payment) => ['PENDING', 'ESCROW'].includes(String(payment.status || '').toUpperCase())),
    [payments],
  );
  const selectedProject = useMemo(
    () => projects.find((project) => String(project.id) === String(selectedProjectId)) || projects[0] || null,
    [projects, selectedProjectId],
  );
  const ongoingRequests = useMemo(() => {
    const planItems = planRequests.map((request) => ({
      id: `plan-${request.id}`,
      sourceType: 'PLAN',
      title: request.plan?.title || 'Plan follow-up',
      label: formatRequestLabel(request.requestType),
      status: formatRequestStatus(request.status),
      createdAt: request.createdAt,
      href: request.plan?.id ? `/plans/${request.plan.id}` : '/plans',
      detail: request.notes || request.plan?.category || 'Awaiting next review step',
    }));

    const listingItems = listingRequests.map((request) => ({
      id: `listing-${request.id}`,
      sourceType: request.listing?.listingType || 'LISTING',
      title: request.listing?.title || 'Property follow-up',
      label: formatRequestLabel(request.requestType),
      status: formatRequestStatus(request.status),
      createdAt: request.createdAt,
      href: request.listing?.id ? `/marketplace/${request.listing.id}` : '/marketplace',
      detail: request.message || request.listing?.region?.name || 'Waiting for follow-up',
    }));

    return [...planItems, ...listingItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [listingRequests, planRequests]);
  const hasWorkspaceData = projects.length > 0 || payments.length > 0 || documents.length > 0 || ongoingRequests.length > 0;

  if (state.loading) {
    return (
      <div style={styles.page}>
        <div style={styles.headerBlock}><h1 style={styles.title}>Client Dashboard</h1><p style={styles.subtitle}>Project tracking, payments, and engineer reporting.</p></div>
        <div style={styles.kpiGrid}>{Array.from({ length: 4 }).map((_, index) => <div key={index} style={styles.skeletonCard} />)}</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={styles.page}>
        <div style={styles.stateCard}>
          <h3 style={styles.sectionTitle}>Could not load client dashboard</h3>
          <p style={styles.stateText}>{state.error}</p>
          <button type="button" onClick={loadDashboard} style={styles.primaryButton}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.heroShell}>
        <div style={styles.heroMain}>
          <div style={styles.heroEyebrow}>Client Workspace</div>
          <h1 style={styles.heroTitle}>A calm project home built around your real construction journey.</h1>
          <p style={styles.heroText}>
            Nothing is prefilled here. As your project advances, this workspace becomes the place to follow progress, download approved reports, and stay clear on payment milestones.
          </p>
          <div style={styles.heroActions}>
            <button type="button" onClick={() => navigate('/dashboard/projects')} style={styles.primaryButton}>Open projects</button>
            <button type="button" onClick={() => navigate('/dashboard/payments')} style={styles.secondaryButton}>Payment center</button>
            <button type="button" onClick={() => navigate('/dashboard/files')} style={styles.secondaryButton}>Project files</button>
          </div>
        </div>
        <div style={styles.heroAside}>
          <div style={styles.pulseCard}>
            <span style={styles.pulseLabel}>Focused project</span>
            <strong style={styles.pulseValue}>{selectedProject?.projectName || selectedProject?.title || 'No project yet'}</strong>
            <span style={styles.pulseHint}>{selectedProject?.status || 'Ready for your first project'}</span>
          </div>
          <div style={styles.pulseCard}>
            <span style={styles.pulseLabel}>Approved reports</span>
            <strong style={styles.pulseValue}>{documents.length}</strong>
            <span style={styles.pulseHint}>files ready for download and review</span>
          </div>
          <div style={styles.pulseCard}>
            <span style={styles.pulseLabel}>Confirmed spend</span>
            <strong style={styles.pulseValue}>{formatMoney(confirmedTotal)}</strong>
            <span style={styles.pulseHint}>captured from actual payments only</span>
          </div>
        </div>
      </section>

      {!hasWorkspaceData ? (
        <div style={styles.freshWorkspaceCard}>
          <div style={styles.freshWorkspaceEyebrow}>Fresh workspace</div>
          <h2 style={styles.freshWorkspaceTitle}>Your dashboard is ready for real work.</h2>
          <p style={styles.freshWorkspaceText}>
            Nothing is prefilled here. As soon as you request a property visit, ask for plan follow-up, receive approved files, or make a payment, this workspace will grow around your actual activity.
          </p>
          <div style={styles.freshWorkspaceActions}>
            <button type="button" onClick={() => navigate('/dashboard/projects')} style={styles.primaryButton}>Open projects</button>
            <button type="button" onClick={() => navigate('/plans')} style={styles.secondaryButton}>Explore plans</button>
            <button type="button" onClick={() => navigate('/marketplace')} style={styles.secondaryButton}>Browse marketplace</button>
          </div>
        </div>
      ) : (
        <>

          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}><span style={styles.kpiLabel}>Projects</span><span style={styles.kpiValue}>{projects.length}</span><span style={styles.kpiFootnote}>workspaces created on your account</span></div>
            <div style={styles.kpiCard}><span style={styles.kpiLabel}>Confirmed payments</span><span style={styles.kpiValue}>{formatMoney(confirmedTotal)}</span><span style={styles.kpiFootnote}>settled transactions only</span></div>
            <div style={styles.kpiCard}><span style={styles.kpiLabel}>Upcoming milestones</span><span style={styles.kpiValue}>{upcomingMilestones.length}</span><span style={styles.kpiFootnote}>next amounts still pending</span></div>
            <div style={styles.kpiCard}><span style={styles.kpiLabel}>Ongoing requests</span><span style={styles.kpiValue}>{ongoingRequests.length}</span><span style={styles.kpiFootnote}>plan follow-up and property interest in motion</span></div>
          </div>

          <section style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div>
                <div style={styles.panelEyebrow}>Ongoing</div>
                <h2 style={styles.sectionTitle}>Requests in motion</h2>
              </div>
              <button type="button" onClick={() => navigate('/plans')} style={styles.inlineButton}>Browse more options</button>
            </div>
            {!ongoingRequests.length ? (
              <div style={styles.emptyState}>When you request a property tour or plan follow-up, it will appear here.</div>
            ) : (
              <div style={styles.stack}>
                {ongoingRequests.slice(0, 8).map((request) => (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => navigate(request.href)}
                    style={{ ...styles.projectRow, background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div>
                      <div style={styles.phaseTitle}>{request.title}</div>
                      <div style={styles.reviewMeta}>{request.label} | {request.detail}</div>
                    </div>
                    <span style={styles.phaseBadge}>{request.status}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <div style={styles.commandGrid}>
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.panelEyebrow}>Project focus</div>
                  <h2 style={styles.sectionTitle}>Project tracking</h2>
                </div>
                <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} style={styles.select}>
                  {projects.length ? projects.map((project) => <option key={project.id} value={project.id}>{project.projectName || project.title || 'Project'}</option>) : <option value="">No projects</option>}
                </select>
              </div>

              {!projects.length ? (
                <div style={styles.emptyState}>No projects are attached to this account yet.</div>
              ) : detailState.loading ? (
                <div style={styles.emptyState}>Loading progress timeline...</div>
              ) : detailState.error ? (
                <div style={styles.emptyState}>{detailState.error}</div>
              ) : !progressData ? (
                <div style={styles.emptyState}>No progress data is available for the selected project yet.</div>
              ) : (
                <div style={styles.stack}>
                  <div style={styles.progressCard}>
                    <div style={styles.progressHeader}>
                      <div>
                        <div style={styles.progressTitle}>{progressData.project?.name || selectedProject?.projectName || 'Project'}</div>
                        <div style={styles.progressMeta}>{progressData.timeline?.status || 'ON_TRACK'}</div>
                      </div>
                      <strong style={styles.progressPercent}>{progressData.summary?.progressPercent || 0}%</strong>
                    </div>
                    <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${progressData.summary?.progressPercent || 0}%` }} /></div>
                    <div style={styles.timelineGrid}>
                      <div><span style={styles.timelineLabel}>Planned start</span><strong>{formatDate(progressData.timeline?.plannedStart)}</strong></div>
                      <div><span style={styles.timelineLabel}>Planned end</span><strong>{formatDate(progressData.timeline?.plannedEnd)}</strong></div>
                      <div><span style={styles.timelineLabel}>Actual start</span><strong>{formatDate(progressData.timeline?.actualStart)}</strong></div>
                      <div><span style={styles.timelineLabel}>Latest progress</span><strong>{formatDate(progressData.timeline?.actualLatest)}</strong></div>
                    </div>
                  </div>

                  <div style={styles.projectSelectorStack}>
                    {projects.map((project) => (
                      <button key={project.id} type="button" onClick={() => setSelectedProjectId(project.id)} style={{ ...styles.projectRow, ...(String(project.id) === String(selectedProjectId) ? styles.projectRowActive : {}) }}>
                        <div>
                          <div style={styles.phaseTitle}>{project.projectName || project.title || 'Project'}</div>
                          <div style={styles.reviewMeta}>{project.status || 'Draft'} | {project.region?.name || 'No region yet'}</div>
                        </div>
                        <span style={styles.phaseBadge}>{String(project.id) === String(selectedProjectId) ? 'Focused' : 'View'}</span>
                      </button>
                    ))}
                  </div>

                  <div style={styles.stack}>
                    {(progressData.phases || []).slice(-5).reverse().map((phase) => (
                      <div key={phase.id} style={styles.phaseRow}>
                        <div>
                          <div style={styles.phaseTitle}>{phase.stage}</div>
                          <div style={styles.reviewMeta}>{phase.notes || 'No notes added'} | {formatDate(phase.actualDate)}</div>
                        </div>
                        <span style={styles.phaseBadge}>{phase.progressPercent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.panelEyebrow}>Approved delivery</div>
                  <h2 style={styles.sectionTitle}>Engineer reports</h2>
                </div>
                <button type="button" onClick={() => navigate('/dashboard/files')} style={styles.inlineButton}>Open files</button>
              </div>
              {!documents.length ? (
                <div style={styles.emptyState}>Approved reports and packages will appear here after review.</div>
              ) : (
                <div style={styles.stack}>
                  {documents.slice(0, 6).map((document) => (
                    <div key={document.id} style={styles.paymentRow}>
                      <div>
                        <div style={styles.phaseTitle}>{document.originalName || 'Project package'}</div>
                        <div style={styles.reviewMeta}>{document.docType || 'DOCUMENT'} | {formatDate(document.reviewedAt || document.createdAt)}</div>
                      </div>
                      <button type="button" onClick={async () => {
                        const response = await documentsService.download(document.id);
                        if (response?.url) window.open(response.url, '_blank', 'noopener,noreferrer');
                      }} style={styles.secondaryButton}>Download</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div style={styles.commandGrid}>
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.panelEyebrow}>Money movement</div>
                  <h2 style={styles.sectionTitle}>Payment history</h2>
                </div>
                <button type="button" onClick={() => navigate('/dashboard/payments')} style={styles.inlineButton}>Open payments</button>
              </div>
              {!payments.length ? (
                <div style={styles.emptyState}>Transaction history will populate after your first payment.</div>
              ) : (
                <div style={styles.stack}>
                  {payments.slice(0, 8).map((payment) => (
                    <div key={payment.id} style={styles.paymentRow}>
                      <div>
                        <div style={styles.phaseTitle}>{formatMoney(payment.amount, payment.currency)}</div>
                        <div style={styles.reviewMeta}>{payment.provider} | {payment.status} | {payment.serviceLabel || payment.serviceType || 'Service payment'}</div>
                      </div>
                      <button type="button" onClick={() => window.open(paymentsService.getInvoiceUrl(payment.id), '_blank', 'noopener,noreferrer')} style={styles.secondaryButton}>Invoice</button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.panelEyebrow}>Next commitments</div>
                  <h2 style={styles.sectionTitle}>Upcoming milestone payments</h2>
                </div>
              </div>
              {!upcomingMilestones.length ? (
                <div style={styles.emptyState}>No upcoming milestone payments are queued right now.</div>
              ) : (
                <div style={styles.stack}>
                  {upcomingMilestones.map((payment) => (
                    <div key={payment.id} style={styles.paymentRow}>
                      <div>
                        <div style={styles.phaseTitle}>{formatMoney(payment.amount, payment.currency)}</div>
                        <div style={styles.reviewMeta}>{payment.status} | {payment.serviceLabel || payment.serviceType || 'Milestone payment'}</div>
                      </div>
                      <span style={styles.phaseBadge}>{payment.provider}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'grid', gap: 24 },
  headerBlock: { display: 'grid', gap: 8 },
  title: { margin: 0, fontSize: 30, color: 'var(--text-color)' },
  subtitle: { margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 },
  heroShell: {
    display: 'grid',
    gridTemplateColumns: '1.22fr 0.86fr',
    gap: 18,
    padding: 22,
    borderRadius: 28,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'linear-gradient(135deg, rgba(9,19,19,0.98), rgba(14,30,25,0.92) 58%, rgba(65,53,20,0.72))',
    boxShadow: '0 28px 60px rgba(0,0,0,0.28)',
  },
  heroMain: { display: 'grid', gap: 14, alignContent: 'space-between', minHeight: 238 },
  heroAside: { display: 'grid', gap: 12 },
  heroEyebrow: { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#fbbf24' },
  heroTitle: { margin: 0, fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.06, color: '#f7fee7', maxWidth: 720 },
  heroText: { margin: 0, color: 'rgba(209,250,229,0.74)', lineHeight: 1.75, fontSize: 15, maxWidth: 720 },
  heroActions: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  pulseCard: {
    borderRadius: 22,
    padding: 18,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'grid',
    gap: 8,
    minHeight: 94,
  },
  pulseLabel: { fontSize: 11, color: 'rgba(209,250,229,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 },
  pulseValue: { fontSize: 24, fontWeight: 800, color: '#f7fee7', lineHeight: 1.25 },
  pulseHint: { color: 'rgba(209,250,229,0.68)', fontSize: 13, lineHeight: 1.5 },
  freshWorkspaceCard: { border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 28, background: 'linear-gradient(135deg, rgba(15,24,28,0.86), rgba(15,24,28,0.42))', display: 'grid', gap: 14 },
  freshWorkspaceEyebrow: { color: '#ecfccb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12 },
  freshWorkspaceTitle: { margin: 0, fontSize: 28, color: 'var(--text-color)' },
  freshWorkspaceText: { margin: 0, maxWidth: 720, color: 'var(--text-muted)', lineHeight: 1.7 },
  freshWorkspaceActions: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  kpiCard: { border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: 20, background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))', display: 'grid', gap: 10 },
  kpiValue: { fontSize: 28, fontWeight: 800, color: 'var(--text-color)' },
  kpiLabel: { color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11 },
  kpiFootnote: { color: 'rgba(209,250,229,0.62)', fontSize: 13, lineHeight: 1.5 },
  skeletonCard: { height: 120, borderRadius: 18, background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))' },
  commandGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, alignItems: 'start' },
  sectionCard: { border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 20, background: 'linear-gradient(180deg, rgba(16,26,29,0.94), rgba(10,17,20,0.82))', display: 'grid', gap: 16, boxShadow: '0 18px 36px rgba(0,0,0,0.18)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  panelEyebrow: { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#fbbf24', marginBottom: 6 },
  sectionTitle: { margin: 0, color: 'var(--text-color)', fontSize: 22 },
  inlineButton: { border: 'none', background: 'transparent', color: '#6ee7b7', cursor: 'pointer', fontWeight: 700 },
  select: { minWidth: 220, padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(8,14,16,0.66)', color: 'var(--text-color)' },
  stack: { display: 'grid', gap: 14 },
  progressCard: { border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 16, background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))', display: 'grid', gap: 14 },
  progressHeader: { display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center' },
  progressTitle: { color: 'var(--text-color)', fontWeight: 700, marginBottom: 6 },
  progressMeta: { color: 'var(--text-muted)', fontSize: 13 },
  progressPercent: { color: '#fef3c7', fontSize: 24 },
  progressBar: { width: '100%', height: 10, borderRadius: 999, background: 'rgba(148,163,184,0.14)', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(135deg, #10b981, #fbbf24)' },
  timelineGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  timelineLabel: { display: 'block', color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 },
  projectSelectorStack: { display: 'grid', gap: 12 },
  phaseRow: { display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 14, background: 'rgba(255,255,255,0.02)' },
  phaseTitle: { color: 'var(--text-color)', fontWeight: 700, marginBottom: 6 },
  phaseBadge: { padding: '6px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.16)', color: '#d1fae5', fontSize: 12, fontWeight: 800 },
  reviewMeta: { color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 },
  paymentRow: { display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 14, background: 'rgba(255,255,255,0.02)' },
  projectRow: { display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 14, background: 'rgba(255,255,255,0.02)', textAlign: 'left', color: 'inherit' },
  projectRowActive: { borderColor: 'rgba(16,185,129,0.34)', boxShadow: '0 0 0 1px rgba(16,185,129,0.12)' },
  emptyState: { minHeight: 140, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 18, padding: 20, lineHeight: 1.6 },
  stateCard: { minHeight: 280, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, background: 'linear-gradient(180deg, rgba(16,26,29,0.94), rgba(10,17,20,0.82))', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24, gap: 12 },
  stateText: { margin: 0, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 540 },
  primaryButton: { minHeight: 42, padding: '0 16px', borderRadius: 14, border: '1px solid rgba(16,185,129,0.28)', background: 'linear-gradient(135deg, #10b981, #fbbf24)', color: '#081210', cursor: 'pointer', fontWeight: 800 },
  secondaryButton: { minHeight: 42, padding: '0 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#ecfccb', cursor: 'pointer', fontWeight: 700 },
};

