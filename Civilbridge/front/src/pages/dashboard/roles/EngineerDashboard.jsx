import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsService } from '../../../services/documentsService';
import messagesService from '../../../services/messagesService';
import { plansService } from '../../../services/plansService';
import { progressService } from '../../../services/progressService';
import { projectsService } from '../../../services/projectsService';
import { useAuthStore } from '../../../store/authStore';

function formatDate(value) {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function EngineerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [threads, setThreads] = useState([]);
  const [myPlans, setMyPlans] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [progressForm, setProgressForm] = useState({ phase: 'OTHER', planned_date: '', progressPercent: '0', description: '', cost_estimate: '' });
  const [actionState, setActionState] = useState({ loading: '', message: '', type: '' });
  const [reviewNotes, setReviewNotes] = useState({});
  const [planForm, setPlanForm] = useState({ title: '', category: 'RESIDENTIAL', style: '', bedrooms: '', floors: '1', builtAreaM2: '', estimatedCostMin: '', estimatedCostMax: '', tier: 'FREE', description: '' });
  const [planFiles, setPlanFiles] = useState([]);
  const [planFormState, setPlanFormState] = useState({ loading: false, message: '', type: '' });
  const planFileInputRef = useRef(null);

  const loadDashboard = useCallback(async () => {
    try {
      setState({ loading: true, error: '' });
      const [projectsResponse, documentsResponse, threadsResponse, myPlansResponse] = await Promise.all([
        projectsService.getUserProjects(),
        documentsService.list({ review_status: 'PENDING' }),
        messagesService.listThreads({ limit: 8 }),
        plansService.getMine(),
      ]);
      const nextProjects = Array.isArray(projectsResponse) ? projectsResponse : [];
      setProjects(nextProjects);
      setSelectedProjectId((current) => current || nextProjects[0]?.id || '');
      setReviewQueue(documentsResponse?.documents || []);
      setThreads(threadsResponse?.data || []);
      setMyPlans(Array.isArray(myPlansResponse) ? myPlansResponse : []);
      setState({ loading: false, error: '' });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Failed to load engineer workspace.' });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboard();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const handleReview = useCallback(async (documentId, reviewStatus) => {
    try {
      setActionState({ loading: `${reviewStatus}-${documentId}`, message: '', type: '' });
      await documentsService.review(documentId, { reviewStatus, reviewNotes: reviewNotes[documentId] || null });
      setReviewQueue((current) => current.filter((document) => String(document.id) !== String(documentId)));
      setActionState({ loading: '', message: `Document ${reviewStatus.toLowerCase()} successfully.`, type: 'success' });
    } catch (error) {
      setActionState({ loading: '', message: error.message || 'Failed to update review status.', type: 'error' });
    }
  }, [reviewNotes]);

  const handleProgressSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!selectedProjectId) return;

    try {
      setActionState({ loading: `progress-${selectedProjectId}`, message: '', type: '' });
      await progressService.createMilestone(selectedProjectId, {
        phase: progressForm.phase,
        planned_date: progressForm.planned_date,
        progressPercent: Number(progressForm.progressPercent),
        description: progressForm.description,
        cost_estimate: Number(progressForm.cost_estimate || 0),
      });
      setProgressForm({ phase: 'OTHER', planned_date: '', progressPercent: '0', description: '', cost_estimate: '' });
      setActionState({ loading: '', message: 'Progress update saved successfully.', type: 'success' });
    } catch (error) {
      setActionState({ loading: '', message: error.message || 'Failed to save progress update.', type: 'error' });
    }
  }, [progressForm, selectedProjectId]);

  const handlePlanSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!planForm.title || !planForm.builtAreaM2) {
      setPlanFormState({ loading: false, message: 'Title and built area are required.', type: 'error' });
      return;
    }
    try {
      setPlanFormState({ loading: true, message: '', type: '' });
      await plansService.create({ ...planForm, assets: planFiles });
      setPlanForm({ title: '', category: 'RESIDENTIAL', style: '', bedrooms: '', floors: '1', builtAreaM2: '', estimatedCostMin: '', estimatedCostMax: '', tier: 'FREE', description: '' });
      setPlanFiles([]);
      if (planFileInputRef.current) planFileInputRef.current.value = '';
      const refreshed = await plansService.getMine();
      setMyPlans(Array.isArray(refreshed) ? refreshed : []);
      setPlanFormState({ loading: false, message: 'Plan submitted for admin review.', type: 'success' });
    } catch (err) {
      setPlanFormState({ loading: false, message: err.message || 'Failed to submit plan.', type: 'error' });
    }
  }, [planForm, planFiles]);

  const activeProjects = useMemo(() => projects.filter((project) => !['COMPLETED', 'CANCELLED'].includes(String(project.status || '').toUpperCase())), [projects]);
  const selectedProject = useMemo(
    () => projects.find((project) => String(project.id) === String(selectedProjectId)) || activeProjects[0] || null,
    [activeProjects, projects, selectedProjectId],
  );
  const assignedMembers = Number(selectedProject?._count?.members || 0);
  const hasWorkspaceData = projects.length > 0 || reviewQueue.length > 0 || threads.length > 0;

  if (state.loading) {
    return (
      <div style={styles.page}>
        <div style={styles.headerBlock}>
          <h1 style={styles.title}>Engineer Workspace</h1>
          <p style={styles.subtitle}>Review queue, assigned projects, progress, and client communication.</p>
        </div>
        <div style={styles.kpiGrid}>{Array.from({ length: 4 }).map((_, index) => <div key={index} style={styles.skeletonCard} />)}</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={styles.page}>
        <div style={styles.stateCard}>
          <h3 style={styles.sectionTitle}>Could not load engineer workspace</h3>
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
          <div style={styles.heroEyebrow}>Engineer Workspace</div>
          <h1 style={styles.heroTitle}>Technical control for live reviews, progress, and delivery.</h1>
          <p style={styles.heroText}>
            This desk stays clean until real assignments arrive. Once work starts, it becomes the place for engineering review, project reporting, and client coordination.
          </p>
          <div style={styles.heroActions}>
            <button type="button" onClick={() => navigate('/dashboard/files')} style={styles.primaryButton}>Open review files</button>
            <button type="button" onClick={() => navigate('/dashboard/projects')} style={styles.secondaryButton}>Assigned projects</button>
            <button type="button" onClick={() => navigate('/dashboard/messages')} style={styles.secondaryButton}>Message center</button>
          </div>
        </div>
        <div style={styles.heroAside}>
          <div style={styles.pulseCard}>
            <span style={styles.pulseLabel}>Selected project</span>
            <strong style={styles.pulseValue}>{selectedProject?.projectName || selectedProject?.title || 'No assignment yet'}</strong>
            <span style={styles.pulseHint}>{selectedProject?.status || 'Waiting for work allocation'}</span>
          </div>
          <div style={styles.pulseCard}>
            <span style={styles.pulseLabel}>Review queue</span>
            <strong style={styles.pulseValue}>{reviewQueue.length}</strong>
            <span style={styles.pulseHint}>documents waiting for engineering approval</span>
          </div>
          <div style={styles.pulseCard}>
            <span style={styles.pulseLabel}>Team footprint</span>
            <strong style={styles.pulseValue}>{assignedMembers}</strong>
            <span style={styles.pulseHint}>members attached to the selected project</span>
          </div>
        </div>
      </section>

      {actionState.message ? (
        <div style={{ ...styles.banner, ...(actionState.type === 'error' ? styles.bannerError : styles.bannerSuccess) }}>{actionState.message}</div>
      ) : null}

      {!hasWorkspaceData ? (
        <div style={styles.freshWorkspaceCard}>
          <div style={styles.freshWorkspaceEyebrow}>Fresh workspace</div>
          <h2 style={styles.freshWorkspaceTitle}>No assignments are active yet.</h2>
          <p style={styles.freshWorkspaceText}>
            This workspace stays empty until you are connected to real projects, review requests, or client threads. When work starts, your queue and activity will appear here automatically.
          </p>
          <div style={styles.freshWorkspaceActions}>
            <button type="button" onClick={() => navigate('/dashboard/profile')} style={styles.primaryButton}>Complete profile</button>
            <button type="button" onClick={() => navigate('/dashboard/projects')} style={styles.secondaryButton}>Open projects</button>
            <button type="button" onClick={() => navigate('/dashboard/files')} style={styles.secondaryButton}>Open files</button>
          </div>
        </div>
      ) : (
        <>
          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}><span style={styles.kpiLabel}>Assigned projects</span><span style={styles.kpiValue}>{activeProjects.length}</span><span style={styles.kpiFootnote}>live assignments on your desk</span></div>
            <div style={styles.kpiCard}><span style={styles.kpiLabel}>Awaiting review</span><span style={styles.kpiValue}>{reviewQueue.length}</span><span style={styles.kpiFootnote}>documents needing engineering action</span></div>
            <div style={styles.kpiCard}><span style={styles.kpiLabel}>Communication threads</span><span style={styles.kpiValue}>{threads.length}</span><span style={styles.kpiFootnote}>conversations linked to your work</span></div>
            <div style={styles.kpiCard}><span style={styles.kpiLabel}>Projects in progress</span><span style={styles.kpiValue}>{projects.filter((project) => String(project.status).toUpperCase() === 'IN_PROGRESS').length}</span><span style={styles.kpiFootnote}>active execution now</span></div>
          </div>

          <div style={styles.commandGrid}>
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.panelEyebrow}>Current assignment</div>
                  <h2 style={styles.sectionTitle}>Project command view</h2>
                </div>
                <button type="button" onClick={() => navigate('/dashboard/projects')} style={styles.inlineButton}>Open projects</button>
              </div>
              {!selectedProject ? (
                <div style={styles.emptyState}>No project is selected because there are no active assignments yet.</div>
              ) : (
                <div style={styles.stack}>
                  <div style={styles.focusCard}>
                    <div style={styles.focusTop}>
                      <div>
                        <div style={styles.reviewTitle}>{selectedProject.projectName || selectedProject.title || 'Project'}</div>
                        <div style={styles.reviewMeta}>{selectedProject.status || 'Draft'} | {selectedProject.region?.name || 'No region yet'}</div>
                      </div>
                      <span style={styles.statusBadge}>{selectedProject.projectType || 'PROJECT'}</span>
                    </div>
                    <div style={styles.timelineGrid}>
                      <div><span style={styles.timelineLabel}>Team size</span><strong>{assignedMembers}</strong></div>
                      <div><span style={styles.timelineLabel}>Messages</span><strong>{threads.length}</strong></div>
                      <div><span style={styles.timelineLabel}>Pending reviews</span><strong>{reviewQueue.length}</strong></div>
                      <div><span style={styles.timelineLabel}>Selected phase</span><strong>{progressForm.phase}</strong></div>
                    </div>
                  </div>

                  {!activeProjects.length ? (
                    <div style={styles.emptyState}>No active assignments yet.</div>
                  ) : (
                    activeProjects.map((project) => (
                      <button key={project.id} type="button" onClick={() => setSelectedProjectId(project.id)} style={{ ...styles.projectRow, ...(String(project.id) === String(selectedProjectId) ? styles.projectRowActive : {}) }}>
                        <div>
                          <div style={styles.reviewTitle}>{project.projectName || project.title || 'Project'}</div>
                          <div style={styles.reviewMeta}>{project.status || 'Draft'} | {project.region?.name || 'No region'} | {project._count?.members || 0} team members</div>
                        </div>
                        <span style={styles.phaseBadge}>{String(project.id) === String(selectedProjectId) ? 'Selected' : 'Open'}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </section>

            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.panelEyebrow}>Field reporting</div>
                  <h2 style={styles.sectionTitle}>Progress update</h2>
                </div>
              </div>
              {!projects.length ? (
                <div style={styles.emptyState}>Projects assigned to you will appear here once membership is configured.</div>
              ) : (
                <form onSubmit={handleProgressSubmit} style={styles.formGrid}>
                  <label style={styles.fieldLabel}>
                    <span>Project</span>
                    <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} style={styles.select}>
                      {projects.map((project) => <option key={project.id} value={project.id}>{project.projectName || project.title || 'Project'}</option>)}
                    </select>
                  </label>
                  <label style={styles.fieldLabel}>
                    <span>Phase</span>
                    <select value={progressForm.phase} onChange={(event) => setProgressForm((current) => ({ ...current, phase: event.target.value }))} style={styles.select}>
                      {['FOUNDATION', 'STRUCTURE', 'ROOFING', 'FINISHES', 'PLUMBING', 'ELECTRICAL', 'OTHER'].map((phase) => <option key={phase} value={phase}>{phase}</option>)}
                    </select>
                  </label>
                  <label style={styles.fieldLabel}>
                    <span>Planned date</span>
                    <input type="datetime-local" value={progressForm.planned_date} onChange={(event) => setProgressForm((current) => ({ ...current, planned_date: event.target.value }))} style={styles.input} />
                  </label>
                  <label style={styles.fieldLabel}>
                    <span>Progress percent</span>
                    <input type="number" min="0" max="100" value={progressForm.progressPercent} onChange={(event) => setProgressForm((current) => ({ ...current, progressPercent: event.target.value }))} style={styles.input} />
                  </label>
                  <label style={styles.fieldLabel}>
                    <span>Cost update</span>
                    <input type="number" min="0" value={progressForm.cost_estimate} onChange={(event) => setProgressForm((current) => ({ ...current, cost_estimate: event.target.value }))} style={styles.input} placeholder="Amount spent" />
                  </label>
                  <label style={{ ...styles.fieldLabel, gridColumn: '1 / -1' }}>
                    <span>Report notes</span>
                    <textarea rows={4} value={progressForm.description} onChange={(event) => setProgressForm((current) => ({ ...current, description: event.target.value }))} style={styles.textarea} placeholder="Describe what changed, risks observed, and what the client should know." />
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" style={styles.primaryButton} disabled={actionState.loading === `progress-${selectedProjectId}`}>
                      {actionState.loading === `progress-${selectedProjectId}` ? 'Saving...' : 'Save Progress Update'}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>

          <div style={styles.commandGrid}>
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.panelEyebrow}>Quality gate</div>
                  <h2 style={styles.sectionTitle}>Review queue</h2>
                </div>
                <button type="button" onClick={() => navigate('/dashboard/files')} style={styles.inlineButton}>Open files</button>
              </div>
              {!reviewQueue.length ? (
                <div style={styles.emptyState}>No AI-generated plans or BOQs are waiting for review.</div>
              ) : (
                <div style={styles.stack}>
                  {reviewQueue.map((document) => (
                    <div key={document.id} style={styles.reviewCard}>
                      <div style={styles.reviewTopRow}>
                        <div>
                          <div style={styles.reviewTitle}>{document.originalName || 'Project document'}</div>
                          <div style={styles.reviewMeta}>{document.project?.projectName || 'Project'} | {document.docType || 'DOCUMENT'} | {formatDate(document.createdAt)}</div>
                        </div>
                        <span style={styles.statusBadge}>{document.reviewStatus || 'PENDING'}</span>
                      </div>
                      <textarea
                        rows={3}
                        value={reviewNotes[document.id] || ''}
                        onChange={(event) => setReviewNotes((current) => ({ ...current, [document.id]: event.target.value }))}
                        placeholder="Add approval notes, required edits, or engineering comments."
                        style={styles.textarea}
                      />
                      <div style={styles.actionRow}>
                        <button type="button" onClick={() => handleReview(document.id, 'PENDING')} style={styles.secondaryButton} disabled={Boolean(actionState.loading)}>
                          Save Note
                        </button>
                        <button type="button" onClick={() => handleReview(document.id, 'REJECTED')} style={styles.dangerButton} disabled={Boolean(actionState.loading)}>
                          {actionState.loading === `REJECTED-${document.id}` ? 'Updating...' : 'Reject'}
                        </button>
                        <button type="button" onClick={() => handleReview(document.id, 'APPROVED')} style={styles.primaryButton} disabled={Boolean(actionState.loading)}>
                          {actionState.loading === `APPROVED-${document.id}` ? 'Updating...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.panelEyebrow}>Live communication</div>
                  <h2 style={styles.sectionTitle}>Client communication</h2>
                </div>
                <button type="button" onClick={() => navigate('/dashboard/messages')} style={styles.inlineButton}>Open inbox</button>
              </div>
              {!threads.length ? (
                <div style={styles.emptyState}>Client and stakeholder threads will appear here once messages start.</div>
              ) : (
                <div style={styles.stack}>
                  {threads.slice(0, 6).map((thread) => {
                    const other = String(thread.participantOne?.id) === String(user?.id) ? thread.participantTwo : thread.participantOne;
                    return (
                      <div key={thread.id} style={styles.projectRow}>
                        <div>
                          <div style={styles.reviewTitle}>{other?.fullName || 'Conversation'}</div>
                          <div style={styles.reviewMeta}>{thread.lastMessage?.body || 'Attachment shared'} | {formatDate(thread.lastMessageAt || thread.createdAt)}</div>
                        </div>
                        <button type="button" onClick={() => navigate('/dashboard/messages')} style={styles.secondaryButton}>Reply</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ── Upload Plan ── */}
          <div style={styles.commandGrid}>
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.panelEyebrow}>Plan publishing</div>
                  <h2 style={styles.sectionTitle}>Upload a plan</h2>
                </div>
              </div>
              {planFormState.message ? (
                <div style={{ ...styles.banner, ...(planFormState.type === 'error' ? styles.bannerError : styles.bannerSuccess) }}>{planFormState.message}</div>
              ) : null}
              <form onSubmit={handlePlanSubmit} style={styles.formGrid}>
                <label style={{ ...styles.fieldLabel, gridColumn: '1 / -1' }}>
                  <span>Title</span>
                  <input value={planForm.title} onChange={(e) => setPlanForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Modern 3-Bedroom Villa" style={styles.input} />
                </label>
                <label style={styles.fieldLabel}>
                  <span>Category</span>
                  <select value={planForm.category} onChange={(e) => setPlanForm((f) => ({ ...f, category: e.target.value }))} style={styles.select}>
                    {['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'INFRA'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label style={styles.fieldLabel}>
                  <span>Tier</span>
                  <select value={planForm.tier} onChange={(e) => setPlanForm((f) => ({ ...f, tier: e.target.value }))} style={styles.select}>
                    {['FREE', 'PRO', 'PREMIUM'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label style={styles.fieldLabel}>
                  <span>Built area (m²)</span>
                  <input type="number" min="1" value={planForm.builtAreaM2} onChange={(e) => setPlanForm((f) => ({ ...f, builtAreaM2: e.target.value }))} style={styles.input} />
                </label>
                <label style={styles.fieldLabel}>
                  <span>Floors</span>
                  <input type="number" min="1" value={planForm.floors} onChange={(e) => setPlanForm((f) => ({ ...f, floors: e.target.value }))} style={styles.input} />
                </label>
                <label style={styles.fieldLabel}>
                  <span>Bedrooms</span>
                  <input type="number" min="0" value={planForm.bedrooms} onChange={(e) => setPlanForm((f) => ({ ...f, bedrooms: e.target.value }))} style={styles.input} />
                </label>
                <label style={styles.fieldLabel}>
                  <span>Style</span>
                  <input value={planForm.style} onChange={(e) => setPlanForm((f) => ({ ...f, style: e.target.value }))} placeholder="Modern, Colonial, etc." style={styles.input} />
                </label>
                <label style={styles.fieldLabel}>
                  <span>Est. cost min (RWF)</span>
                  <input type="number" min="0" value={planForm.estimatedCostMin} onChange={(e) => setPlanForm((f) => ({ ...f, estimatedCostMin: e.target.value }))} style={styles.input} />
                </label>
                <label style={styles.fieldLabel}>
                  <span>Est. cost max (RWF)</span>
                  <input type="number" min="0" value={planForm.estimatedCostMax} onChange={(e) => setPlanForm((f) => ({ ...f, estimatedCostMax: e.target.value }))} style={styles.input} />
                </label>
                <label style={{ ...styles.fieldLabel, gridColumn: '1 / -1' }}>
                  <span>Description</span>
                  <textarea rows={3} value={planForm.description} onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe the plan, materials, and any notable features." style={styles.textarea} />
                </label>
                <label style={{ ...styles.fieldLabel, gridColumn: '1 / -1' }}>
                  <span>Drawings / images (PDF, PNG, JPG)</span>
                  <input ref={planFileInputRef} type="file" multiple accept="image/*,application/pdf" onChange={(e) => setPlanFiles(Array.from(e.target.files || []))} style={styles.input} />
                  {planFiles.length > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{planFiles.length} file(s) selected</span>}
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gridColumn: '1 / -1' }}>
                  <button type="submit" style={styles.primaryButton} disabled={planFormState.loading}>
                    {planFormState.loading ? 'Submitting...' : 'Submit for review'}
                  </button>
                </div>
              </form>
            </section>

            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.panelEyebrow}>My contributions</div>
                  <h2 style={styles.sectionTitle}>My plans</h2>
                </div>
                <button type="button" onClick={() => navigate('/plans')} style={styles.inlineButton}>View catalog</button>
              </div>
              {!myPlans.length ? (
                <div style={styles.emptyState}>Plans you upload will appear here. Submitted plans are reviewed by admin before going public.</div>
              ) : (
                <div style={styles.stack}>
                  {myPlans.slice(0, 8).map((plan) => (
                    <button key={plan.id} type="button" onClick={() => navigate(`/plans/${plan.id}`)} style={styles.projectRow}>
                      <div>
                        <div style={styles.reviewTitle}>{plan.title}</div>
                        <div style={styles.reviewMeta}>{plan.category} | {plan.builtAreaM2} m² | {plan.tier}</div>
                      </div>
                      <span style={{ ...styles.phaseBadge, background: plan.isVerified ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)', color: plan.isVerified ? '#86efac' : '#fde68a' }}>
                        {plan.isVerified ? 'Published' : 'Pending review'}
                      </span>
                    </button>
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
    gridTemplateColumns: '1.25fr 0.85fr',
    gap: 16,
    padding: 18,
    borderRadius: 28,
    border: '1px solid var(--border-color)',
    background: 'linear-gradient(135deg, #ffffff, #f8fbff)',
    boxShadow: '0 16px 34px rgba(15,23,42,0.06)',
  },
  heroMain: { display: 'grid', gap: 14, alignContent: 'space-between', minHeight: 238 },
  heroAside: { display: 'grid', gap: 12 },
  heroEyebrow: { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#2563eb' },
  heroTitle: { margin: 0, fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.05, color: '#0f172a', maxWidth: 720 },
  heroText: { margin: 0, color: '#64748b', lineHeight: 1.7, fontSize: 15, maxWidth: 720 },
  heroActions: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  pulseCard: {
    borderRadius: 22,
    padding: 16,
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    display: 'grid',
    gap: 8,
    minHeight: 94,
    boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
  },
  pulseLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 },
  pulseValue: { fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.25 },
  pulseHint: { color: '#64748b', fontSize: 13, lineHeight: 1.5 },
  banner: { padding: '12px 14px', borderRadius: 14, border: '1px solid transparent', fontWeight: 600 },
  bannerSuccess: { background: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.18)', color: '#2563eb' },
  bannerError: { background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  freshWorkspaceCard: { border: '1px solid var(--border-color)', borderRadius: 24, padding: 22, background: 'var(--card-bg)', display: 'grid', gap: 14, boxShadow: '0 14px 28px rgba(15,23,42,0.05)' },
  freshWorkspaceEyebrow: { color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12 },
  freshWorkspaceTitle: { margin: 0, fontSize: 28, color: 'var(--text-color)' },
  freshWorkspaceText: { margin: 0, maxWidth: 720, color: 'var(--text-muted)', lineHeight: 1.7 },
  freshWorkspaceActions: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  kpiCard: { border: '1px solid var(--border-color)', borderRadius: 20, padding: 16, background: 'var(--card-bg)', display: 'grid', gap: 8, boxShadow: '0 10px 22px rgba(15,23,42,0.05)' },
  kpiValue: { fontSize: 32, fontWeight: 800, color: 'var(--text-color)' },
  kpiLabel: { color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11 },
  kpiFootnote: { color: '#64748b', fontSize: 13, lineHeight: 1.5 },
  skeletonCard: { height: 120, borderRadius: 18, background: 'linear-gradient(90deg, rgba(148,163,184,0.08), rgba(148,163,184,0.16), rgba(148,163,184,0.08))' },
  commandGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, alignItems: 'start' },
  sectionCard: { border: '1px solid var(--border-color)', borderRadius: 22, padding: 18, background: 'var(--card-bg)', display: 'grid', gap: 14, boxShadow: '0 14px 28px rgba(15,23,42,0.05)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  panelEyebrow: { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#2563eb', marginBottom: 6 },
  sectionTitle: { margin: 0, color: 'var(--text-color)', fontSize: 22 },
  inlineButton: { border: 'none', background: 'transparent', color: '#2563eb', cursor: 'pointer', fontWeight: 700 },
  stack: { display: 'grid', gap: 14 },
  focusCard: { display: 'grid', gap: 12, border: '1px solid var(--border-color)', borderRadius: 18, padding: 16, background: 'var(--surface-bg)' },
  focusTop: { display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' },
  timelineGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  timelineLabel: { display: 'block', color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 },
  reviewCard: { display: 'grid', gap: 12, border: '1px solid var(--border-color)', borderRadius: 18, padding: 14, background: 'var(--card-bg)' },
  reviewTopRow: { display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  reviewTitle: { color: 'var(--text-color)', fontWeight: 700, marginBottom: 6 },
  reviewMeta: { color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 },
  statusBadge: { alignSelf: 'flex-start', padding: '6px 10px', borderRadius: 999, background: 'rgba(37,99,235,0.08)', color: '#2563eb', fontSize: 12, fontWeight: 800 },
  textarea: { width: '100%', padding: '11px 12px', borderRadius: 12, border: '1px solid #e6ecf4', background: 'var(--card-bg)', color: 'var(--text-color)', resize: 'vertical', fontFamily: 'inherit' },
  actionRow: { display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  fieldLabel: { display: 'grid', gap: 8, color: 'var(--text-color)', fontWeight: 600 },
  select: { padding: '10px 12px', borderRadius: 12, border: '1px solid #e6ecf4', background: 'var(--card-bg)', color: 'var(--text-color)' },
  input: { padding: '10px 12px', borderRadius: 12, border: '1px solid #e6ecf4', background: 'var(--card-bg)', color: 'var(--text-color)' },
  projectRow: { display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 16, padding: 12, background: 'var(--card-bg)', textAlign: 'left', color: 'inherit' },
  projectRowActive: { borderColor: 'rgba(37,99,235,0.34)', boxShadow: '0 0 0 1px rgba(37,99,235,0.12)' },
  phaseBadge: { padding: '6px 10px', borderRadius: 999, background: 'rgba(37,99,235,0.08)', color: '#2563eb', fontSize: 12, fontWeight: 800 },
  emptyState: { minHeight: 140, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed #d9e3ef', borderRadius: 18, padding: 20, lineHeight: 1.6, background: 'var(--surface-bg)' },
  stateCard: { minHeight: 280, border: '1px solid var(--border-color)', borderRadius: 24, background: 'var(--card-bg)', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24, gap: 12, boxShadow: '0 14px 28px rgba(15,23,42,0.05)' },
  stateText: { margin: 0, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 540 },
  primaryButton: { minHeight: 40, padding: '0 15px', borderRadius: 12, border: '1px solid rgba(37,99,235,0.26)', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff', cursor: 'pointer', fontWeight: 800, boxShadow: '0 12px 24px rgba(37,99,235,0.16)' },
  secondaryButton: { minHeight: 40, padding: '0 15px', borderRadius: 12, border: '1px solid #e6ecf4', background: 'var(--card-bg)', color: '#0f172a', cursor: 'pointer', fontWeight: 700 },
  dangerButton: { minHeight: 40, padding: '0 15px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.24)', background: 'rgba(239,68,68,0.06)', color: '#dc2626', cursor: 'pointer', fontWeight: 700 },
};
