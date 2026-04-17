import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAnalyticsService from '../../../services/adminAnalyticsService';
import adminOperationsService from '../../../services/adminOperationsService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function formatMoney(value, currency = 'RWF') {
  return new Intl.NumberFormat('en-RW', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatCompact(value) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0));
}

function percentOf(value, total) {
  if (!total) return 0;
  return Math.max(8, (Number(value || 0) / Number(total || 1)) * 100);
}

function SparkBar({ label, value, max, tone = '#f4c14f' }) {
  return (
    <div style={styles.sparkRow}>
      <div style={styles.sparkLabelRow}>
        <span style={styles.sparkLabel}>{label}</span>
        <strong style={styles.sparkValue}>{formatCompact(value)}</strong>
      </div>
      <div style={styles.sparkTrack}>
        <div style={{ ...styles.sparkFill, width: `${percentOf(value, max)}%`, background: `linear-gradient(90deg, ${tone}, rgba(255,255,255,0.95))` }} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, hint, accent }) {
  return (
    <div style={{ ...styles.metricCard, background: `radial-gradient(circle at top right, ${accent}22, transparent 42%), var(--card-bg)` }}>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
      <span style={styles.metricHint}>{hint}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const [planRequests, setPlanRequests] = useState([]);
  const [leadRequests, setLeadRequests] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  const [actionState, setActionState] = useState({ loading: '', message: '', type: '' });
  const [notesByUser, setNotesByUser] = useState({});
  const [benchmarkForm, setBenchmarkForm] = useState({ province: '', district: '', buildingType: '', minCostPerM2: '', maxCostPerM2: '', currency: 'RWF', notes: '' });
  const [benchmarkFilters, setBenchmarkFilters] = useState({ search: '', buildingType: '', updatedSince: '' });

  const loadDashboard = useCallback(async () => {
    try {
      setState({ loading: true, error: '' });
      const [overviewResponse, queueResponse, benchmarkResponse, planRequestsResponse, leadRequestsResponse] = await Promise.all([
        adminAnalyticsService.getOverview(),
        adminOperationsService.getVerificationQueue(),
        adminOperationsService.listCostBenchmarks(),
        adminOperationsService.getPlanRequests({ limit: 20 }),
        adminOperationsService.getLeadRequests({ limit: 20 }),
      ]);
      setOverview(overviewResponse);
      setVerificationQueue(queueResponse?.queue || []);
      setBenchmarks(benchmarkResponse?.data || []);
      setPlanRequests(planRequestsResponse?.requests || []);
      setLeadRequests(leadRequestsResponse?.requests || []);
      setState({ loading: false, error: '' });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Failed to load admin dashboard.' });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboard();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const kpis = useMemo(() => ([
    {
      label: 'Total users',
      value: formatCompact(overview?.users?.total || 0),
      hint: `${formatCompact(overview?.users?.newThisMonth || 0)} joined this month`,
      accent: '#f4c14f',
    },
    {
      label: 'Verified accounts',
      value: formatCompact(overview?.users?.verified || 0),
      hint: `${formatCompact(overview?.users?.active || 0)} active right now`,
      accent: '#7ee787',
    },
    {
      label: 'Projects tracked',
      value: formatCompact(overview?.projects?.total || 0),
      hint: `${overview?.projects?.byStatus?.length || 0} live status channels`,
      accent: '#64b5ff',
    },
    {
      label: 'Confirmed revenue',
      value: formatMoney(overview?.revenue?.totalConfirmedRWF || 0),
      hint: `${overview?.revenue?.byProvider?.length || 0} payment providers contributing`,
      accent: '#c19bff',
    },
  ]), [overview]);

  const roleBreakdown = useMemo(() => overview?.users?.byRole || [], [overview]);
  const providerBars = useMemo(() => overview?.revenue?.byProvider || [], [overview]);
  const projectTypes = useMemo(() => overview?.projects?.byType || [], [overview]);
  const projectStatuses = useMemo(() => overview?.projects?.byStatus || [], [overview]);
  const filteredBenchmarks = useMemo(() => benchmarks.filter((item) => {
    const search = benchmarkFilters.search.trim().toLowerCase();
    const buildingType = benchmarkFilters.buildingType.trim().toLowerCase();
    const updatedSince = benchmarkFilters.updatedSince ? new Date(benchmarkFilters.updatedSince) : null;
    const updatedAt = item?.updatedAt ? new Date(item.updatedAt) : null;
    const haystack = `${item.province || ''} ${item.district || ''} ${item.buildingType || ''} ${item.notes || ''}`.toLowerCase();

    if (search && !haystack.includes(search)) return false;
    if (buildingType && !String(item.buildingType || '').toLowerCase().includes(buildingType)) return false;
    if (updatedSince && updatedAt && updatedAt < updatedSince) return false;
    return true;
  }), [benchmarks, benchmarkFilters]);
  const totalUsers = Number(overview?.users?.total || 0);
  const maxRoleCount = Math.max(1, ...roleBreakdown.map((item) => Number(item.count || 0)));
  const maxProviderValue = Math.max(1, ...providerBars.map((item) => Number(item.total || 0)));
  const maxProjectTypeCount = Math.max(1, ...projectTypes.map((item) => Number(item.count || 0)));
  const topRole = roleBreakdown[0];

  const handleVerification = useCallback(async (userId, action) => {
    try {
      setActionState({ loading: `${action}-${userId}`, message: '', type: '' });
      const payload = action === 'approve'
        ? { notes: notesByUser[userId] || '' }
        : { reason: notesByUser[userId] || 'Credentials need revision' };

      if (action === 'approve') {
        await adminOperationsService.approveVerification(userId, payload);
      } else {
        await adminOperationsService.rejectVerification(userId, payload);
      }

      setVerificationQueue((current) => current.filter((item) => String(item.user?.id) !== String(userId)));
      setActionState({ loading: '', message: `Expert ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, type: 'success' });
    } catch (error) {
      setActionState({ loading: '', message: error.message || 'Failed to update verification state.', type: 'error' });
    }
  }, [notesByUser]);

  const handleBenchmarkSubmit = useCallback(async (event) => {
    event.preventDefault();
    try {
      setActionState({ loading: 'benchmark', message: '', type: '' });
      await adminOperationsService.upsertCostBenchmark(benchmarkForm);
      setBenchmarkForm({ province: '', district: '', buildingType: '', minCostPerM2: '', maxCostPerM2: '', currency: 'RWF', notes: '' });
      await loadDashboard();
      setActionState({ loading: '', message: 'Cost benchmark saved successfully.', type: 'success' });
    } catch (error) {
      setActionState({ loading: '', message: error.message || 'Failed to save cost benchmark.', type: 'error' });
    }
  }, [benchmarkForm, loadDashboard]);

  if (state.loading) {
    return (
      <div style={styles.page}>
        <section style={styles.heroShell}>
          <div style={styles.heroMain}>
            <div style={styles.heroEyebrow}>Admin Command</div>
            <h1 style={styles.heroTitle}>Operations dashboard is loading.</h1>
            <p style={styles.heroText}>Bringing in live users, revenue, moderation, and benchmark signals.</p>
          </div>
          <div style={styles.heroAside}>
            {Array.from({ length: 3 }).map((_, index) => <div key={index} style={styles.skeletonPulseCard} />)}
          </div>
        </section>
        <div style={styles.metricGrid}>{Array.from({ length: 4 }).map((_, index) => <div key={index} style={styles.skeletonCard} />)}</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={styles.page}>
        <div style={styles.stateCard}>
          <h3 style={styles.sectionTitle}>Could not load admin dashboard</h3>
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
          <div style={styles.heroEyebrow}>Admin Command</div>
          <h1 style={styles.heroTitle}>Moderation, benchmarks, and growth in one premium workspace.</h1>
          <p style={styles.heroText}>
            This is the shared admin command layer: review expert credentials, watch platform growth, and keep the Rwanda benchmark data accurate with no filler or mock content.
          </p>
          <div style={styles.heroActions}>
            <button type="button" onClick={() => navigate('/dashboard/users')} style={styles.primaryButton}>User control</button>
            <button type="button" onClick={() => navigate('/dashboard/analytics')} style={styles.secondaryButton}>Open analytics</button>
            <button type="button" onClick={() => navigate('/dashboard/projects')} style={styles.secondaryButton}>Projects</button>
          </div>
        </div>

        <div style={styles.heroAside}>
          <div style={styles.pulseCard}>
            <span style={styles.pulseLabel}>Queue pressure</span>
            <strong style={styles.pulseValue}>{formatCompact(verificationQueue.length)}</strong>
            <span style={styles.pulseHint}>experts waiting for review</span>
          </div>
          <div style={styles.pulseCard}>
            <span style={styles.pulseLabel}>Top user segment</span>
            <strong style={styles.pulseValue}>{topRole?.role ? topRole.role.replaceAll('_', ' ') : 'N/A'}</strong>
            <span style={styles.pulseHint}>{topRole ? `${formatCompact(topRole.count)} accounts` : 'no distribution yet'}</span>
          </div>
          <div style={styles.pulseCard}>
            <span style={styles.pulseLabel}>Benchmark coverage</span>
            <strong style={styles.pulseValue}>{formatCompact(benchmarks.length)}</strong>
            <span style={styles.pulseHint}>province and district entries saved</span>
          </div>
        </div>
      </section>

      {actionState.message ? <div style={{ ...styles.banner, ...(actionState.type === 'error' ? styles.bannerError : styles.bannerSuccess) }}>{actionState.message}</div> : null}

      <div style={styles.metricGrid}>
        {kpis.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} hint={item.hint} accent={item.accent} />
        ))}
      </div>

      <div style={styles.topInsightGrid}>
        <section style={styles.premiumPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>User composition</div>
              <h2 style={styles.sectionTitle}>Role distribution</h2>
            </div>
            <span style={styles.sectionMeta}>{formatCompact(totalUsers)} total accounts</span>
          </div>
          {!roleBreakdown.length ? (
            <div style={styles.emptyState}>User role composition will appear once accounts are created.</div>
          ) : (
            <div style={styles.sparkStack}>
              {roleBreakdown.slice(0, 6).map((item, index) => (
                <SparkBar
                  key={item.role}
                  label={item.role.replaceAll('_', ' ')}
                  value={item.count}
                  max={maxRoleCount}
                  tone={index % 2 === 0 ? '#f4c14f' : '#9fd2ff'}
                />
              ))}
            </div>
          )}
        </section>

        <section style={styles.premiumPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>Revenue pulse</div>
              <h2 style={styles.sectionTitle}>Provider mix</h2>
            </div>
            <span style={styles.sectionMeta}>{providerBars.length ? 'confirmed only' : 'awaiting payments'}</span>
          </div>
          {!providerBars.length ? (
            <div style={styles.emptyState}>Provider revenue bars will appear once confirmed payments land.</div>
          ) : (
            <div style={styles.sparkStack}>
              {providerBars.map((item, index) => (
                <div key={item.provider} style={styles.providerRow}>
                  <div style={styles.providerTop}>
                    <span style={styles.sparkLabel}>{item.provider}</span>
                    <strong style={styles.providerValue}>{formatMoney(item.total)}</strong>
                  </div>
                  <div style={styles.sparkTrack}>
                    <div style={{ ...styles.sparkFill, width: `${percentOf(item.total, maxProviderValue)}%`, background: `linear-gradient(90deg, ${index % 2 === 0 ? '#8a6cff' : '#f4c14f'}, rgba(255,255,255,0.96))` }} />
                  </div>
                  <span style={styles.providerMeta}>{formatCompact(item.txCount)} confirmed transactions</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.spotlightPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>Live operating notes</div>
              <h2 style={styles.sectionTitle}>Admin spotlight</h2>
            </div>
          </div>
          <div style={styles.spotlightMetric}>
            <span style={styles.spotlightLabel}>Verification queue</span>
            <strong style={styles.spotlightValue}>{verificationQueue.length ? `${verificationQueue.length} waiting` : 'Clear'}</strong>
          </div>
          <div style={styles.spotlightMetric}>
            <span style={styles.spotlightLabel}>Dominant project type</span>
            <strong style={styles.spotlightValue}>{projectTypes[0]?.type?.replaceAll('_', ' ') || 'No projects yet'}</strong>
          </div>
          <div style={styles.spotlightMetric}>
            <span style={styles.spotlightLabel}>Most common project stage</span>
            <strong style={styles.spotlightValue}>{projectStatuses[0]?.status?.replaceAll('_', ' ') || 'No status mix yet'}</strong>
          </div>
        </section>
      </div>

      <div style={styles.bottomGrid}>
        <section style={styles.premiumPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>Credential review</div>
              <h2 style={styles.sectionTitle}>Expert verification workflow</h2>
            </div>
            <span style={styles.sectionMeta}>{verificationQueue.length} in queue</span>
          </div>
          {!verificationQueue.length ? (
            <div style={styles.emptyState}>No experts are waiting for verification right now.</div>
          ) : (
            <div style={styles.stack}>
              {verificationQueue.map((provider) => (
                <div key={provider.id} style={styles.queueCard}>
                  <div style={styles.queueHeader}>
                    <div>
                      <div style={styles.rowTitle}>{provider.user?.fullName || 'Expert'}</div>
                      <div style={styles.rowMeta}>
                        {provider.user?.profile?.profession || provider.providerType} | {provider.region?.name || 'No region'} | {provider.user?.email || 'No email'}
                      </div>
                    </div>
                    <span style={styles.statusBadge}>{provider.verificationStatus}</span>
                  </div>
                  <div style={styles.detailGrid}>
                    <div><span style={styles.detailLabel}>Company</span><strong>{provider.user?.profile?.companyName || 'Independent'}</strong></div>
                    <div><span style={styles.detailLabel}>License</span><strong>{provider.user?.profile?.licenseNumber || 'Not provided'}</strong></div>
                    <div>
                      <span style={styles.detailLabel}>Verification document</span>
                      {provider.verificationDocument?.url ? (
                        <a href={`${API_BASE_URL}${provider.verificationDocument.url}`} target="_blank" rel="noreferrer" style={styles.linkButton}>
                          Open document
                        </a>
                      ) : (
                        <strong>Not uploaded</strong>
                      )}
                    </div>
                    <div>
                      <span style={styles.detailLabel}>Submitted</span>
                      <strong>{provider.verificationDocument?.createdAt ? new Date(provider.verificationDocument.createdAt).toLocaleString() : 'No file date'}</strong>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={notesByUser[provider.user?.id] || ''}
                    onChange={(event) => setNotesByUser((current) => ({ ...current, [provider.user?.id]: event.target.value }))}
                    placeholder="Add approval notes or the exact corrections required before approval."
                    style={styles.textarea}
                  />
                  <div style={styles.actionRow}>
                    <button type="button" onClick={() => handleVerification(provider.user?.id, 'reject')} style={styles.dangerButton} disabled={Boolean(actionState.loading)}>
                      {actionState.loading === `reject-${provider.user?.id}` ? 'Updating...' : 'Reject'}
                    </button>
                    <button type="button" onClick={() => handleVerification(provider.user?.id, 'approve')} style={styles.primaryButton} disabled={Boolean(actionState.loading)}>
                      {actionState.loading === `approve-${provider.user?.id}` ? 'Updating...' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.premiumPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>Market intelligence</div>
              <h2 style={styles.sectionTitle}>Cost benchmark editor</h2>
            </div>
            <span style={styles.sectionMeta}>{filteredBenchmarks.length} visible rows</span>
          </div>
          <form onSubmit={handleBenchmarkSubmit} style={styles.formGrid}>
            <input value={benchmarkForm.province} onChange={(event) => setBenchmarkForm((current) => ({ ...current, province: event.target.value }))} placeholder="Province" style={styles.input} />
            <input value={benchmarkForm.district} onChange={(event) => setBenchmarkForm((current) => ({ ...current, district: event.target.value }))} placeholder="District" style={styles.input} />
            <input value={benchmarkForm.buildingType} onChange={(event) => setBenchmarkForm((current) => ({ ...current, buildingType: event.target.value }))} placeholder="Building type" style={styles.input} />
            <input type="number" min="0" value={benchmarkForm.minCostPerM2} onChange={(event) => setBenchmarkForm((current) => ({ ...current, minCostPerM2: event.target.value }))} placeholder="Min cost per sqm" style={styles.input} />
            <input type="number" min="0" value={benchmarkForm.maxCostPerM2} onChange={(event) => setBenchmarkForm((current) => ({ ...current, maxCostPerM2: event.target.value }))} placeholder="Max cost per sqm" style={styles.input} />
            <input value={benchmarkForm.currency} onChange={(event) => setBenchmarkForm((current) => ({ ...current, currency: event.target.value }))} placeholder="Currency" style={styles.input} />
            <textarea rows={3} value={benchmarkForm.notes} onChange={(event) => setBenchmarkForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes for this benchmark entry" style={{ ...styles.textarea, gridColumn: '1 / -1' }} />
            <div style={styles.formFooter}>
              <div style={styles.formFootnote}>Keep regional pricing current so estimations stay trustworthy.</div>
              <button type="submit" style={styles.primaryButton} disabled={actionState.loading === 'benchmark'}>
                {actionState.loading === 'benchmark' ? 'Saving...' : 'Save Benchmark'}
              </button>
            </div>
          </form>

          <div style={styles.formGrid}>
            <input
              value={benchmarkFilters.search}
              onChange={(event) => setBenchmarkFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search province, district, or notes"
              style={styles.input}
            />
            <input
              value={benchmarkFilters.buildingType}
              onChange={(event) => setBenchmarkFilters((current) => ({ ...current, buildingType: event.target.value }))}
              placeholder="Filter building type"
              style={styles.input}
            />
            <input
              type="date"
              value={benchmarkFilters.updatedSince}
              onChange={(event) => setBenchmarkFilters((current) => ({ ...current, updatedSince: event.target.value }))}
              style={styles.input}
            />
          </div>

          {!filteredBenchmarks.length ? (
            <div style={styles.emptyState}>No cost benchmarks have been saved yet.</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Province</th>
                    <th style={styles.th}>District</th>
                    <th style={styles.th}>Building type</th>
                    <th style={styles.th}>Range</th>
                    <th style={styles.th}>Volatility</th>
                    <th style={styles.th}>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBenchmarks.slice(0, 12).map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>{item.province}</td>
                      <td style={styles.td}>{item.district || 'All districts'}</td>
                      <td style={styles.td}>{item.buildingType}</td>
                      <td style={styles.td}>{formatMoney(item.minCostPerM2, item.currency)} - {formatMoney(item.maxCostPerM2, item.currency)}</td>
                      <td style={styles.td}>{item.volatility?.label || 'History building'}</td>
                      <td style={styles.td}>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Unknown'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={styles.projectTypeWrap}>
            <div style={styles.sectionMiniTitle}>Project type mix</div>
            {!projectTypes.length ? (
              <div style={styles.microEmpty}>Project-type bars will appear once live projects exist.</div>
            ) : (
              <div style={styles.sparkStack}>
                {projectTypes.map((item, index) => (
                  <SparkBar
                    key={item.type}
                    label={item.type.replaceAll('_', ' ')}
                    value={item.count}
                    max={maxProjectTypeCount}
                    tone={index % 2 === 0 ? '#64b5ff' : '#f4c14f'}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Plan Approval Queue ── */}
      <div style={styles.commandGrid}>
        <section style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>Content review</div>
              <h2 style={styles.sectionTitle}>Plan approval queue</h2>
            </div>
            <button type="button" onClick={() => navigate('/plans?status=PENDING')} style={styles.inlineButton}>View all</button>
          </div>
          {!planRequests.length ? (
            <div style={styles.emptyState}>No pending plan submissions at the moment.</div>
          ) : (
            <div style={styles.stack}>
              {planRequests.slice(0, 8).map((req) => (
                <div key={req.id} style={styles.queueRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.queueTitle}>{req.plan?.title || 'Plan'}</div>
                    <div style={styles.queueMeta}>
                      {req.plan?.category} · Requested by {req.requester?.fullName || req.requester?.email || 'user'} · {String(req.requestType).replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      type="button"
                      style={styles.approveBtn}
                      disabled={Boolean(actionState.loading)}
                      onClick={async () => {
                        try {
                          setActionState({ loading: `plan-approve-${req.plan?.id}`, message: '', type: '' });
                          await adminOperationsService.approvePlan(req.plan?.id, { status: 'APPROVED' });
                          await adminOperationsService.updatePlanRequestStatus(req.id, { status: 'ACCEPTED' });
                          setPlanRequests((prev) => prev.filter((r) => r.id !== req.id));
                          setActionState({ loading: '', message: 'Plan approved and published.', type: 'success' });
                        } catch (err) {
                          setActionState({ loading: '', message: err.message || 'Failed to approve plan.', type: 'error' });
                        }
                      }}
                    >
                      {actionState.loading === `plan-approve-${req.plan?.id}` ? '…' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      style={styles.rejectBtn}
                      disabled={Boolean(actionState.loading)}
                      onClick={async () => {
                        try {
                          setActionState({ loading: `plan-reject-${req.plan?.id}`, message: '', type: '' });
                          await adminOperationsService.approvePlan(req.plan?.id, { status: 'REJECTED' });
                          await adminOperationsService.updatePlanRequestStatus(req.id, { status: 'REJECTED' });
                          setPlanRequests((prev) => prev.filter((r) => r.id !== req.id));
                          setActionState({ loading: '', message: 'Plan rejected.', type: 'error' });
                        } catch (err) {
                          setActionState({ loading: '', message: err.message || 'Failed to reject plan.', type: 'error' });
                        }
                      }}
                    >
                      {actionState.loading === `plan-reject-${req.plan?.id}` ? '…' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Lead Requests (property / land inquiries) ── */}
        <section style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>Marketplace inquiries</div>
              <h2 style={styles.sectionTitle}>Property &amp; land requests</h2>
            </div>
          </div>
          {!leadRequests.length ? (
            <div style={styles.emptyState}>No property or land inquiries are pending.</div>
          ) : (
            <div style={styles.stack}>
              {leadRequests.slice(0, 8).map((req) => (
                <div key={req.id} style={styles.queueRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.queueTitle}>{req.listing?.title || 'Listing'}</div>
                    <div style={styles.queueMeta}>
                      {req.listing?.listingType} · {String(req.requestType).replace(/_/g, ' ')} · {req.requester?.fullName || req.name || 'Guest'} · {req.status}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      type="button"
                      style={styles.approveBtn}
                      disabled={Boolean(actionState.loading)}
                      onClick={async () => {
                        try {
                          setActionState({ loading: `lead-contact-${req.id}`, message: '', type: '' });
                          await adminOperationsService.updateLeadRequestStatus(req.id, { status: 'CONTACTED' });
                          setLeadRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: 'CONTACTED' } : r));
                          setActionState({ loading: '', message: 'Marked as contacted.', type: 'success' });
                        } catch (err) {
                          setActionState({ loading: '', message: err.message || 'Failed to update.', type: 'error' });
                        }
                      }}
                    >
                      {actionState.loading === `lead-contact-${req.id}` ? '…' : 'Mark contacted'}
                    </button>
                    <button
                      type="button"
                      style={styles.rejectBtn}
                      disabled={Boolean(actionState.loading)}
                      onClick={async () => {
                        try {
                          setActionState({ loading: `lead-close-${req.id}`, message: '', type: '' });
                          await adminOperationsService.updateLeadRequestStatus(req.id, { status: 'CLOSED' });
                          setLeadRequests((prev) => prev.filter((r) => r.id !== req.id));
                          setActionState({ loading: '', message: 'Request closed.', type: 'error' });
                        } catch (err) {
                          setActionState({ loading: '', message: err.message || 'Failed to close.', type: 'error' });
                        }
                      }}
                    >
                      {actionState.loading === `lead-close-${req.id}` ? '…' : 'Close'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'grid', gap: 24 },
  heroShell: {
    display: 'grid',
    gridTemplateColumns: '1.35fr 0.9fr',
    gap: 16,
    padding: 18,
    borderRadius: 28,
    border: '1px solid var(--border-color)',
    background: 'linear-gradient(135deg, var(--card-bg), var(--surface-bg))',
    boxShadow: '0 16px 34px rgba(15,23,42,0.06)',
    overflow: 'hidden',
    position: 'relative',
  },
  heroMain: { display: 'grid', gap: 14, alignContent: 'space-between', minHeight: 240, position: 'relative', zIndex: 1 },
  heroAside: { display: 'grid', gap: 12, alignContent: 'stretch', position: 'relative', zIndex: 1 },
  heroEyebrow: { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#2563eb' },
  heroTitle: { margin: 0, fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.05, color: '#0f172a', maxWidth: 760 },
  heroText: { margin: 0, maxWidth: 720, color: '#64748b', lineHeight: 1.7, fontSize: 15 },
  heroActions: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 },
  pulseCard: {
    borderRadius: 22,
    padding: 16,
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    display: 'grid',
    gap: 8,
    minHeight: 92,
  },
  skeletonPulseCard: {
    minHeight: 92,
    borderRadius: 22,
    background: 'linear-gradient(90deg, rgba(148,163,184,0.08), rgba(148,163,184,0.16), rgba(148,163,184,0.08))',
  },
  pulseLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 },
  pulseValue: { fontSize: 26, color: '#0f172a', fontWeight: 800 },
  pulseHint: { fontSize: 13, color: '#64748b', lineHeight: 1.5 },
  banner: { padding: '12px 14px', borderRadius: 16, border: '1px solid transparent', fontWeight: 600 },
  bannerSuccess: { background: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.18)', color: '#2563eb' },
  bannerError: { background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  metricCard: {
    borderRadius: 22,
    border: '1px solid var(--border-color)',
    padding: 20,
    display: 'grid',
    gap: 10,
    boxShadow: '0 10px 22px rgba(15,23,42,0.05)',
  },
  metricLabel: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' },
  metricValue: { fontSize: 28, fontWeight: 800, color: '#0f172a' },
  metricHint: { color: '#64748b', lineHeight: 1.5, fontSize: 13 },
  topInsightGrid: { display: 'grid', gridTemplateColumns: '1.05fr 1.05fr 0.7fr', gap: 18, alignItems: 'start' },
  bottomGrid: { display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: 18, alignItems: 'start' },
  premiumPanel: {
    borderRadius: 26,
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    padding: 18,
    display: 'grid',
    gap: 18,
    boxShadow: '0 14px 28px rgba(15,23,42,0.05)',
  },
  spotlightPanel: {
    borderRadius: 26,
    border: '1px solid var(--border-color)',
    background: 'var(--surface-bg)',
    padding: 18,
    display: 'grid',
    gap: 16,
    minHeight: '100%',
  },
  commandGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, alignItems: 'start' },
  sectionCard: { border: '1px solid var(--border-color)', borderRadius: 22, padding: 18, background: 'var(--card-bg)', display: 'grid', gap: 14, boxShadow: '0 14px 28px rgba(15,23,42,0.05)' },
  inlineButton: { border: 'none', background: 'transparent', color: '#2563eb', cursor: 'pointer', fontWeight: 700, fontSize: 13 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  panelEyebrow: { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#2563eb', marginBottom: 6 },
  sectionTitle: { margin: 0, color: '#0f172a', fontSize: 22, lineHeight: 1.2 },
  sectionMeta: { fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' },
  sparkStack: { display: 'grid', gap: 14 },
  sparkRow: { display: 'grid', gap: 8 },
  sparkLabelRow: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  sparkLabel: { color: '#334155', fontSize: 13, fontWeight: 600 },
  sparkValue: { color: '#0f172a', fontSize: 13 },
  sparkTrack: { height: 10, borderRadius: 999, background: 'rgba(148,163,184,0.14)', overflow: 'hidden' },
  sparkFill: { height: '100%', borderRadius: 999 },
  providerRow: { display: 'grid', gap: 8 },
  providerTop: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  providerValue: { color: '#0f172a', fontSize: 13 },
  providerMeta: { color: '#64748b', fontSize: 12 },
  spotlightMetric: { padding: '12px 0', borderBottom: '1px solid #edf2f8', display: 'grid', gap: 6 },
  spotlightLabel: { color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 },
  spotlightValue: { color: '#0f172a', fontSize: 22, lineHeight: 1.25 },
  stack: { display: 'grid', gap: 14 },
  queueCard: {
    display: 'grid',
    gap: 12,
    border: '1px solid var(--border-color)',
    borderRadius: 18,
    padding: 16,
    background: 'var(--card-bg)',
  },
  queueHeader: { display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  rowTitle: { color: '#0f172a', fontWeight: 700, marginBottom: 6 },
  rowMeta: { color: '#64748b', fontSize: 13, lineHeight: 1.6 },
  statusBadge: { alignSelf: 'flex-start', padding: '6px 10px', borderRadius: 999, background: 'rgba(37,99,235,0.08)', color: '#2563eb', fontSize: 12, fontWeight: 800 },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  detailLabel: { display: 'block', color: '#64748b', fontSize: 12, marginBottom: 6 },
  linkButton: { color: '#2563eb', fontWeight: 700, textDecoration: 'none' },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 14,
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    color: '#0f172a',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  actionRow: { display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  input: {
    padding: '12px 14px',
    borderRadius: 14,
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    color: '#0f172a',
  },
  formFooter: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', gridColumn: '1 / -1' },
  formFootnote: { color: '#64748b', fontSize: 13, lineHeight: 1.5 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid #edf2f8' },
  td: { padding: '12px', color: '#0f172a', borderBottom: '1px solid #f1f5f9' },
  projectTypeWrap: { display: 'grid', gap: 14, paddingTop: 6 },
  sectionMiniTitle: { color: '#0f172a', fontSize: 15, fontWeight: 700 },
  microEmpty: { color: '#64748b', fontSize: 13, lineHeight: 1.6 },
  emptyState: {
    minHeight: 140,
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    color: '#64748b',
    border: '1px dashed #d9e3ef',
    borderRadius: 18,
    padding: 20,
    lineHeight: 1.6,
  },
  skeletonCard: { height: 132, borderRadius: 22, background: 'linear-gradient(90deg, rgba(148,163,184,0.08), rgba(148,163,184,0.16), rgba(148,163,184,0.08))' },
  stateCard: {
    minHeight: 280,
    border: '1px solid var(--border-color)',
    borderRadius: 24,
    background: 'var(--card-bg)',
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    padding: 24,
    gap: 12,
  },
  stateText: { margin: 0, color: '#64748b', lineHeight: 1.6, maxWidth: 540 },
  primaryButton: {
    minHeight: 42,
    padding: '0 16px',
    borderRadius: 14,
    border: '1px solid rgba(37,99,235,0.26)',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 800,
  },
  secondaryButton: {
    minHeight: 42,
    padding: '0 15px',
    borderRadius: 12,
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    color: '#0f172a',
    cursor: 'pointer',
    fontWeight: 700,
  },
  dangerButton: {
    minHeight: 42,
    padding: '0 16px',
    borderRadius: 14,
    border: '1px solid rgba(248,113,113,0.28)',
    background: 'rgba(239,68,68,0.08)',
    color: '#fca5a5',
    cursor: 'pointer',
    fontWeight: 700,
  },
  queueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 14px',
    borderRadius: 16,
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
  },
  queueTitle: { color: 'var(--text-color)', fontWeight: 700, fontSize: 14, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  queueMeta: { color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5 },
  approveBtn: {
    minHeight: 34,
    padding: '0 14px',
    borderRadius: 10,
    border: '1px solid rgba(37,99,235,0.18)',
    background: 'rgba(37,99,235,0.08)',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
  rejectBtn: {
    minHeight: 34,
    padding: '0 14px',
    borderRadius: 10,
    border: '1px solid rgba(239,68,68,0.2)',
    background: 'rgba(239,68,68,0.06)',
    color: '#dc2626',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
};
