import React, { useCallback, useEffect, useMemo, useState } from 'react';
import adminAnalyticsService from '../../../services/adminAnalyticsService';

function formatMoney(value) {
  return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatCompact(value) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0));
}

function percentOf(value, total) {
  if (!total) return 0;
  return Math.max(8, (Number(value || 0) / Number(total || 1)) * 100);
}

function StatusBar({ label, value, max, tone }) {
  return (
    <div style={styles.statusRow}>
      <div style={styles.statusRowTop}>
        <span style={styles.statusLabel}>{label}</span>
        <strong style={styles.statusValue}>{formatCompact(value)}</strong>
      </div>
      <div style={styles.statusTrack}>
        <div style={{ ...styles.statusFill, width: `${percentOf(value, max)}%`, background: `linear-gradient(90deg, ${tone}, rgba(255,255,255,0.96))` }} />
      </div>
    </div>
  );
}

function ExecutiveCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...styles.executiveCard, background: `radial-gradient(circle at top right, ${accent}22, transparent 42%), var(--card-bg)` }}>
      <span style={styles.executiveLabel}>{label}</span>
      <strong style={styles.executiveValue}>{value}</strong>
      <span style={styles.executiveSub}>{sub}</span>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [regional, setRegional] = useState(null);
  const [health, setHealth] = useState(null);
  const [experts, setExperts] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });

  const loadDashboard = useCallback(async () => {
    try {
      setState({ loading: true, error: '' });
      const [overviewResponse, regionalResponse, healthResponse, expertResponse] = await Promise.all([
        adminAnalyticsService.getOverview(),
        adminAnalyticsService.getRegional(),
        adminAnalyticsService.getPlatformHealth(),
        adminAnalyticsService.getExperts(),
      ]);
      setOverview(overviewResponse);
      setRegional(regionalResponse);
      setHealth(healthResponse);
      setExperts(expertResponse);
      setState({ loading: false, error: '' });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Unable to fetch control center metrics.' });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboard();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const kpiCards = useMemo(() => ([
    {
      title: 'Platform reach',
      value: formatCompact(overview?.users?.total || 0),
      sub: `${formatCompact(overview?.users?.newThisMonth || 0)} new in 30 days`,
      accent: '#f4c14f',
    },
    {
      title: 'Project portfolio',
      value: formatCompact(overview?.projects?.total || 0),
      sub: `${overview?.projects?.byStatus?.length || 0} active workflow states`,
      accent: '#6bb6ff',
    },
    {
      title: 'Confirmed revenue',
      value: formatMoney(overview?.revenue?.totalConfirmedRWF || 0),
      sub: `${formatCompact(overview?.revenue?.byProvider?.length || 0)} provider streams`,
      accent: '#c89cff',
    },
    {
      title: 'Transaction success',
      value: health?.transactions24h?.successRate || '0%',
      sub: `${formatCompact(health?.transactions24h?.total || 0)} transactions in 24h`,
      accent: '#7ee787',
    },
  ]), [health, overview]);

  const roleBreakdown = useMemo(() => overview?.users?.byRole || [], [overview]);
  const providerBars = useMemo(() => overview?.revenue?.byProvider || [], [overview]);
  const projectStatusBars = useMemo(() => overview?.projects?.byStatus || [], [overview]);
  const revenueByStatus = useMemo(() => overview?.revenue?.byStatus || [], [overview]);
  const regionalDemand = useMemo(() => regional?.projectsByRegion || [], [regional]);
  const regionalUsers = useMemo(() => regional?.usersByRegion || [], [regional]);
  const topExperts = useMemo(() => experts?.topRatedExperts || [], [experts]);
  const expertTypes = useMemo(() => experts?.byType || [], [experts]);
  const recentAuditActions = useMemo(() => health?.recentAuditActivity?.actions || [], [health]);

  const maxRoleCount = Math.max(1, ...roleBreakdown.map((item) => Number(item.count || 0)));
  const maxProviderValue = Math.max(1, ...providerBars.map((item) => Number(item.total || 0)));
  const maxProjectStatus = Math.max(1, ...projectStatusBars.map((item) => Number(item.count || 0)));
  const maxRevenueStatus = Math.max(1, ...revenueByStatus.map((item) => Number(item.count || 0)));
  const maxRegionValue = Math.max(1, ...regionalDemand.map((item) => Number(item.count || 0)), ...regionalUsers.map((item) => Number(item.count || 0)));

  if (state.loading) {
    return (
      <div style={styles.page}>
        <section style={styles.heroShell}>
          <div style={styles.heroMain}>
            <div style={styles.heroEyebrow}>Executive Control</div>
            <h1 style={styles.heroTitle}>Building the super admin control center.</h1>
            <p style={styles.heroText}>Loading system health, regional demand, revenue, and expert performance.</p>
          </div>
          <div style={styles.heroRail}>
            {Array.from({ length: 3 }).map((_, index) => <div key={index} style={styles.skeletonRailCard} />)}
          </div>
        </section>
        <div style={styles.executiveGrid}>{Array.from({ length: 4 }).map((_, index) => <div key={index} style={styles.skeletonCard} />)}</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={styles.page}>
        <div style={styles.stateCard}>
          <h3 style={styles.sectionTitle}>Failed to load trust signals</h3>
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
          <div style={styles.heroEyebrow}>Executive Control</div>
          <h1 style={styles.heroTitle}>Super admin control center with platform trust, flow, and market pressure.</h1>
          <p style={styles.heroText}>
            This is the premium oversight layer for the highest role in CivilBridge. It watches the living system: uptime, payment quality, user growth, regional demand, and expert performance from real admin analytics only.
          </p>
          <div style={styles.heroFooter}>
            <div style={styles.heroSignal}>
              <span style={styles.heroSignalLabel}>Uptime</span>
              <strong style={styles.heroSignalValue}>{health?.uptime?.days || '0.00'} days</strong>
            </div>
            <div style={styles.heroSignal}>
              <span style={styles.heroSignalLabel}>Active users 24h</span>
              <strong style={styles.heroSignalValue}>{formatCompact(health?.activeUsers24h || 0)}</strong>
            </div>
            <div style={styles.heroSignal}>
              <span style={styles.heroSignalLabel}>Expert approval rate</span>
              <strong style={styles.heroSignalValue}>{experts?.totals?.approvalRate || '0%'}</strong>
            </div>
          </div>
        </div>

        <div style={styles.heroRail}>
          <div style={styles.railCard}>
            <span style={styles.railLabel}>Node memory</span>
            <strong style={styles.railValue}>{health?.node?.memoryMB || '0'} MB</strong>
            <span style={styles.railHint}>live runtime load</span>
          </div>
          <div style={styles.railCard}>
            <span style={styles.railLabel}>Audit burst</span>
            <strong style={styles.railValue}>{formatCompact(health?.recentAuditActivity?.last60min || 0)}</strong>
            <span style={styles.railHint}>actions in last 60 minutes</span>
          </div>
          <div style={styles.railCard}>
            <span style={styles.railLabel}>Expert network</span>
            <strong style={styles.railValue}>{formatCompact(experts?.totals?.verified || 0)}</strong>
            <span style={styles.railHint}>verified specialists available</span>
          </div>
        </div>
      </section>

      <div style={styles.executiveGrid}>
        {kpiCards.map((card) => (
          <ExecutiveCard key={card.title} label={card.title} value={card.value} sub={card.sub} accent={card.accent} />
        ))}
      </div>

      <div style={styles.matrixGrid}>
        <section style={styles.commandPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>Population</div>
              <h2 style={styles.sectionTitle}>User role composition</h2>
            </div>
            <span style={styles.sectionMeta}>{formatCompact(overview?.users?.total || 0)} platform accounts</span>
          </div>
          {!roleBreakdown.length ? (
            <div style={styles.emptyState}>Role composition appears when the platform has live accounts.</div>
          ) : (
            <div style={styles.statusStack}>
              {roleBreakdown.map((item, index) => (
                <StatusBar key={item.role} label={item.role.replaceAll('_', ' ')} value={item.count} max={maxRoleCount} tone={index % 2 === 0 ? '#f4c14f' : '#82cfff'} />
              ))}
            </div>
          )}
        </section>

        <section style={styles.commandPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>Money flow</div>
              <h2 style={styles.sectionTitle}>Revenue by provider</h2>
            </div>
            <span style={styles.sectionMeta}>confirmed revenue only</span>
          </div>
          {!providerBars.length ? (
            <div style={styles.emptyState}>Provider streams will appear after confirmed transactions.</div>
          ) : (
            <div style={styles.statusStack}>
              {providerBars.map((item, index) => (
                <div key={item.provider} style={styles.providerRow}>
                  <div style={styles.statusRowTop}>
                    <span style={styles.statusLabel}>{item.provider}</span>
                    <strong style={styles.providerMoney}>{formatMoney(item.total)}</strong>
                  </div>
                  <div style={styles.statusTrack}>
                    <div style={{ ...styles.statusFill, width: `${percentOf(item.total, maxProviderValue)}%`, background: `linear-gradient(90deg, ${index % 2 === 0 ? '#8a6cff' : '#f4c14f'}, rgba(255,255,255,0.96))` }} />
                  </div>
                  <span style={styles.providerMeta}>{formatCompact(item.txCount)} successful payments</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.luminousPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>Health mirror</div>
              <h2 style={styles.sectionTitle}>System vitality</h2>
            </div>
          </div>
          <div style={styles.healthMetricGrid}>
            <div style={styles.healthMetric}><span style={styles.healthMetricLabel}>Successful</span><strong>{formatCompact(health?.transactions24h?.succeeded || 0)}</strong></div>
            <div style={styles.healthMetric}><span style={styles.healthMetricLabel}>Failed</span><strong>{formatCompact(health?.transactions24h?.failed || 0)}</strong></div>
            <div style={styles.healthMetric}><span style={styles.healthMetricLabel}>Node version</span><strong>{health?.node?.version || 'N/A'}</strong></div>
            <div style={styles.healthMetric}><span style={styles.healthMetricLabel}>Process</span><strong>{health?.node?.pid || 'N/A'}</strong></div>
          </div>
          <div style={styles.auditList}>
            {recentAuditActions.length ? recentAuditActions.map((item, index) => (
              <div key={`${item.action}-${item.createdAt}-${index}`} style={styles.auditItem}>
                <div>
                  <div style={styles.auditAction}>{item.action}</div>
                  <div style={styles.auditMeta}>{item.entityType || 'SYSTEM'}</div>
                </div>
                <span style={styles.auditTime}>{new Date(item.createdAt).toLocaleTimeString()}</span>
              </div>
            )) : <div style={styles.microEmpty}>Recent audit activity will show here automatically.</div>}
          </div>
        </section>
      </div>

      <div style={styles.matrixGrid}>
        <section style={styles.commandPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>Execution flow</div>
              <h2 style={styles.sectionTitle}>Project status mix</h2>
            </div>
            <span style={styles.sectionMeta}>{formatCompact(overview?.projects?.total || 0)} total projects</span>
          </div>
          {!projectStatusBars.length ? (
            <div style={styles.emptyState}>Project status distribution will show up once projects are created.</div>
          ) : (
            <div style={styles.statusStack}>
              {projectStatusBars.map((item, index) => (
                <StatusBar key={item.status} label={item.status.replaceAll('_', ' ')} value={item.count} max={maxProjectStatus} tone={index % 2 === 0 ? '#82cfff' : '#f4c14f'} />
              ))}
            </div>
          )}

          <div style={styles.statusDivider} />

          <div style={styles.sectionMiniTitle}>Transaction status mix</div>
          {!revenueByStatus.length ? (
            <div style={styles.microEmpty}>Transaction status bars will appear once payment activity begins.</div>
          ) : (
            <div style={styles.statusStack}>
              {revenueByStatus.map((item, index) => (
                <StatusBar key={item.status} label={item.status.replaceAll('_', ' ')} value={item.count} max={maxRevenueStatus} tone={index % 2 === 0 ? '#7ee787' : '#8a6cff'} />
              ))}
            </div>
          )}
        </section>

        <section style={styles.commandPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>Geographic load</div>
              <h2 style={styles.sectionTitle}>Regional demand field</h2>
            </div>
            <span style={styles.sectionMeta}>projects and users by region</span>
          </div>
          {!regionalDemand.length && !regionalUsers.length ? (
            <div style={styles.emptyState}>Regional load becomes visible once users and projects have region data.</div>
          ) : (
            <div style={styles.regionGrid}>
              {regionalDemand.map((item) => (
                <div key={`project-${item.regionId}`} style={{ ...styles.regionCell, background: `linear-gradient(180deg, rgba(244,193,79,${Math.max(0.16, Number(item.count || 0) / maxRegionValue)}), rgba(255,255,255,0.04))` }}>
                  <span style={styles.regionLabel}>{item.regionName} projects</span>
                  <strong style={styles.regionValue}>{formatCompact(item.count)}</strong>
                </div>
              ))}
              {regionalUsers.map((item) => (
                <div key={`user-${item.regionId}`} style={{ ...styles.regionCell, background: `linear-gradient(180deg, rgba(100,181,255,${Math.max(0.16, Number(item.count || 0) / maxRegionValue)}), rgba(255,255,255,0.04))` }}>
                  <span style={styles.regionLabel}>{item.regionName} users</span>
                  <strong style={styles.regionValue}>{formatCompact(item.count)}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.commandPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.panelEyebrow}>Expert network</div>
              <h2 style={styles.sectionTitle}>Top rated specialists</h2>
            </div>
            <span style={styles.sectionMeta}>{experts?.appointments?.completionRate || '0%'} completion rate</span>
          </div>
          {!topExperts.length ? (
            <div style={styles.emptyState}>Top experts will appear after reviews and appointments accumulate.</div>
          ) : (
            <div style={styles.expertStack}>
              {topExperts.slice(0, 5).map((expert, index) => (
                <div key={expert.id} style={styles.expertRow}>
                  <div style={styles.expertRank}>{String(index + 1).padStart(2, '0')}</div>
                  <div style={styles.expertBody}>
                    <div style={styles.expertName}>{expert.name}</div>
                    <div style={styles.expertMeta}>{expert.type} | {expert.reviewCount} reviews</div>
                  </div>
                  <div style={styles.expertScore}>{expert.avgRating}</div>
                </div>
              ))}
            </div>
          )}

          <div style={styles.statusDivider} />

          <div style={styles.sectionMiniTitle}>Expert type coverage</div>
          {!expertTypes.length ? (
            <div style={styles.microEmpty}>Type coverage will appear once expert profiles are present.</div>
          ) : (
            <div style={styles.statusStack}>
              {expertTypes.map((item, index) => (
                <StatusBar key={item.type} label={item.type} value={item.count} max={Math.max(1, ...expertTypes.map((entry) => Number(entry.count || 0)))} tone={index % 2 === 0 ? '#f4c14f' : '#82cfff'} />
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
    gridTemplateColumns: '1.3fr 0.8fr',
    gap: 16,
    padding: 18,
    borderRadius: 30,
    border: '1px solid var(--border-color)',
    background: 'linear-gradient(135deg, var(--card-bg), var(--surface-bg))',
    boxShadow: '0 16px 34px rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  heroMain: { display: 'grid', gap: 16, minHeight: 260, alignContent: 'space-between' },
  heroRail: { display: 'grid', gap: 12, alignContent: 'stretch' },
  heroEyebrow: { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-color)' },
  heroTitle: { margin: 0, fontSize: 'clamp(30px, 4.3vw, 50px)', color: 'var(--text-color)', lineHeight: 1.03, maxWidth: 760 },
  heroText: { margin: 0, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 760, fontSize: 15 },
  heroFooter: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  heroSignal: {
    minWidth: 180,
    padding: '14px 16px',
    borderRadius: 18,
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    display: 'grid',
    gap: 6,
  },
  heroSignalLabel: { fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 },
  heroSignalValue: { fontSize: 22, color: 'var(--text-color)' },
  railCard: {
    borderRadius: 22,
    padding: 18,
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    display: 'grid',
    gap: 8,
    minHeight: 94,
  },
  skeletonRailCard: {
    minHeight: 94,
    borderRadius: 22,
    background: 'linear-gradient(90deg, rgba(142,182,155,0.06), rgba(142,182,155,0.12), rgba(142,182,155,0.06))',
  },
  railLabel: { fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 },
  railValue: { fontSize: 26, color: 'var(--text-color)', fontWeight: 800 },
  railHint: { fontSize: 13, color: 'var(--text-muted)' },
  executiveGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  executiveCard: {
    borderRadius: 24,
    border: '1px solid var(--border-color)',
    padding: 20,
    display: 'grid',
    gap: 10,
  },
  executiveLabel: { fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 },
  executiveValue: { fontSize: 30, color: 'var(--text-color)', fontWeight: 800 },
  executiveSub: { fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 },
  matrixGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 0.88fr', gap: 18, alignItems: 'start' },
  commandPanel: {
    borderRadius: 26,
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    padding: 18,
    display: 'grid',
    gap: 18,
    boxShadow: '0 14px 28px rgba(0,0,0,0.28)',
  },
  luminousPanel: {
    borderRadius: 26,
    border: '1px solid var(--border-color)',
    background: 'var(--surface-bg)',
    padding: 18,
    display: 'grid',
    gap: 16,
    boxShadow: '0 14px 28px rgba(0,0,0,0.28)',
  },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  panelEyebrow: { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--accent-color)', marginBottom: 6 },
  sectionTitle: { margin: 0, color: 'var(--text-color)', fontSize: 22, lineHeight: 1.2 },
  sectionMeta: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  statusStack: { display: 'grid', gap: 14 },
  statusRow: { display: 'grid', gap: 8 },
  statusRowTop: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  statusLabel: { color: '#334155', fontSize: 13, fontWeight: 600 },
  statusValue: { color: '#0f172a', fontSize: 13 },
  statusTrack: { height: 10, borderRadius: 999, background: 'rgba(148,163,184,0.14)', overflow: 'hidden' },
  statusFill: { height: '100%', borderRadius: 999 },
  providerRow: { display: 'grid', gap: 8 },
  providerMoney: { color: '#0f172a', fontSize: 13 },
  providerMeta: { color: '#64748b', fontSize: 12 },
  healthMetricGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  healthMetric: {
    borderRadius: 18,
    padding: 14,
    border: '1px solid #e8eef5',
    background: '#ffffff',
    display: 'grid',
    gap: 8,
    color: '#0f172a',
  },
  healthMetricLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 },
  auditList: { display: 'grid', gap: 10 },
  auditItem: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '12px 14px', borderRadius: 16, background: '#ffffff', border: '1px solid #e8eef5' },
  auditAction: { color: '#0f172a', fontWeight: 700, marginBottom: 4 },
  auditMeta: { color: '#64748b', fontSize: 12 },
  auditTime: { color: '#2563eb', fontSize: 12, fontWeight: 700 },
  statusDivider: { height: 1, background: '#edf2f8' },
  sectionMiniTitle: { color: '#0f172a', fontSize: 15, fontWeight: 700 },
  regionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 },
  regionCell: {
    minHeight: 118,
    borderRadius: 20,
    border: '1px solid #e8eef5',
    padding: 16,
    display: 'grid',
    alignContent: 'space-between',
    gap: 10,
  },
  regionLabel: { color: '#334155', fontSize: 13, lineHeight: 1.5 },
  regionValue: { color: '#0f172a', fontSize: 24 },
  expertStack: { display: 'grid', gap: 12 },
  expertRow: { display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 14px', borderRadius: 16, background: '#ffffff', border: '1px solid #e8eef5' },
  expertRank: { width: 44, height: 44, borderRadius: 14, background: 'rgba(37,99,235,0.08)', color: '#2563eb', display: 'grid', placeItems: 'center', fontWeight: 800 },
  expertBody: { display: 'grid', gap: 4 },
  expertName: { color: '#0f172a', fontWeight: 700 },
  expertMeta: { color: '#64748b', fontSize: 12 },
  expertScore: { minWidth: 58, textAlign: 'center', padding: '8px 10px', borderRadius: 999, background: 'rgba(37,99,235,0.08)', color: '#2563eb', fontWeight: 800 },
  emptyState: {
    minHeight: 150,
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    color: '#64748b',
    border: '1px dashed #d9e3ef',
    borderRadius: 18,
    padding: 20,
    lineHeight: 1.6,
  },
  microEmpty: { color: '#64748b', fontSize: 13, lineHeight: 1.6 },
  skeletonCard: { height: 136, borderRadius: 24, background: 'linear-gradient(90deg, rgba(148,163,184,0.08), rgba(148,163,184,0.16), rgba(148,163,184,0.08))' },
  stateCard: {
    minHeight: 280,
    border: '1px solid #e8eef5',
    borderRadius: 24,
    background: '#ffffff',
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
};
