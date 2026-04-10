import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui';
import { projectsService } from '../../services/projectsService';
import { progressService } from '../../services/progressService';
import SEO from '../../components/seo/SEO';

function formatDate(value) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value).toLocaleString() : '0';
}

function getProgressColor(progress) {
  if (progress >= 100) return '#22c55e';
  if (progress >= 60) return '#00f2ff';
  if (progress >= 30) return '#f59e0b';
  return '#6366f1';
}

function getTimelineTone(status) {
  if (status === 'DELAYED') return { background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' };
  if (status === 'AHEAD') return { background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e' };
  return { background: 'rgba(0, 242, 255, 0.12)', color: '#00f2ff' };
}

function ProjectSkeleton() {
  return (
    <div style={styles.loadingWrap}>
      <div style={styles.loadingGrid}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} style={styles.skeletonCard} />
        ))}
      </div>
      <div style={styles.skeletonPanel} />
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={styles.stateCard}>
      <div style={styles.stateIcon}>!</div>
      <h3 style={styles.stateTitle}>Failed to load project progress</h3>
      <p style={styles.stateText}>{message}</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
}

function EmptyState({ title, message, onRetry, actionLabel = 'Refresh' }) {
  return (
    <div style={styles.stateCard}>
      <div style={styles.stateIcon}>0</div>
      <h3 style={styles.stateTitle}>{title}</h3>
      <p style={styles.stateText}>{message}</p>
      <Button variant="secondary" onClick={onRetry}>{actionLabel}</Button>
    </div>
  );
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectState, setProjectState] = useState({ loading: true, error: '' });
  const [progressState, setProgressState] = useState({ loading: false, error: '' });
  const [progressData, setProgressData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadProjects = useCallback(async () => {
    try {
      setProjectState({ loading: true, error: '' });
      const response = await projectsService.getUserProjects();
      const nextProjects = Array.isArray(response)
        ? response
        : Array.isArray(response?.projects)
          ? response.projects
          : [];

      setProjects(nextProjects);
      setSelectedProjectId((current) => {
        if (current && nextProjects.some((project) => String(project.id) === String(current))) {
          return current;
        }
        return nextProjects[0]?.id || null;
      });
      setProjectState({ loading: false, error: '' });
    } catch (error) {
      setProjects([]);
      setProjectState({ loading: false, error: error.message || 'Failed to load projects.' });
    }
  }, []);

  const loadProgress = useCallback(async (projectId) => {
    if (!projectId) {
      setProgressData(null);
      return;
    }

    try {
      setProgressState({ loading: true, error: '' });
      const response = await progressService.getProjectProgress(projectId);
      setProgressData(response);
      setProgressState({ loading: false, error: '' });
    } catch (error) {
      setProgressData(null);
      setProgressState({ loading: false, error: error.message || 'Failed to load project progress.' });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadProjects();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProjects]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (selectedProjectId) {
        loadProgress(selectedProjectId);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProgress, selectedProjectId]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = [project.projectName, project.projectType, project.region?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const selectedProject = filteredProjects.find((project) => String(project.id) === String(selectedProjectId))
    || projects.find((project) => String(project.id) === String(selectedProjectId))
    || null;

  const phases = progressData?.phases || progressData?.milestones || [];
  const summary = progressData?.summary || {
    progressPercent: progressData?.progress_percent || 0,
    completedPhases: progressData?.completed || 0,
    totalPhases: progressData?.total || 0,
    totalSpent: 0,
  };
  const timeline = progressData?.timeline || null;

  if (projectState.loading) {
    return <ProjectSkeleton />;
  }

  if (projectState.error) {
    return <ErrorState message={projectState.error} onRetry={loadProjects} />;
  }

  if (!projects.length) {
    return (
      <EmptyState
        title="No projects yet"
        message="Projects will appear here once they are created so you can track live progress and phase updates."
        onRetry={loadProjects}
      />
    );
  }

  return (
    <div style={styles.container}>
      <SEO title="Project Management" noindex />
      <div style={styles.header}>
        <h1 style={styles.title}>Project Management</h1>
        <p style={styles.subtitle}>Track phase updates and compare planned versus actual delivery timelines.</p>
      </div>

      <div style={styles.actionsBar}>
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={styles.searchInput}
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={styles.statusSelect}
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="ESTIMATED">Estimated</option>
            <option value="DOCUMENTS">Documents</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <Button onClick={loadProjects}>Refresh</Button>
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No matching projects"
          message="Try changing the search term or status filter to find the project you want to track."
          onRetry={() => {
            setSearchTerm('');
            setStatusFilter('all');
          }}
          actionLabel="Clear filters"
        />
      ) : (
        <div style={styles.projectsGrid}>
          {filteredProjects.map((project) => {
            const isActive = String(project.id) === String(selectedProjectId);
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProjectId(project.id)}
                style={{
                  ...styles.projectCard,
                  ...(isActive ? styles.projectCardActive : {}),
                }}
              >
                <div style={styles.projectHeader}>
                  <h3 style={styles.projectTitle}>{project.projectName}</h3>
                  <span style={{ ...styles.statusBadge, ...styles[`status${project.status}`] }}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={styles.projectMeta}>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Type</span>
                    <span style={styles.metaValue}>{project.projectType}</span>
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Region</span>
                    <span style={styles.metaValue}>{project.region?.name || 'Unknown region'}</span>
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Created</span>
                    <span style={styles.metaValue}>{formatDate(project.createdAt)}</span>
                  </div>
                </div>

                <div style={styles.cardStats}>
                  <div style={styles.statChip}>Members {formatNumber(project._count?.members)}</div>
                  <div style={styles.statChip}>Docs {formatNumber(project._count?.documents)}</div>
                  <div style={styles.statChip}>Updates {formatNumber(project._count?.progressLogs)}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedProject && (
        <div style={styles.detailsPanel}>
          <div style={styles.detailsHeader}>
            <div>
              <h2 style={styles.detailsTitle}>{selectedProject.projectName}</h2>
              <p style={styles.detailsSubtitle}>
                {selectedProject.projectType} in {selectedProject.region?.name || 'Unknown region'}
              </p>
            </div>
            <Button variant="secondary" onClick={() => loadProgress(selectedProject.id)}>Refresh timeline</Button>
          </div>

          {progressState.loading ? (
            <div style={styles.progressLoadingWrap}>
              <div style={styles.skeletonSummaryRow}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} style={styles.skeletonSummaryCard} />
                ))}
              </div>
              <div style={styles.skeletonPanel} />
            </div>
          ) : progressState.error ? (
            <ErrorState message={progressState.error} onRetry={() => loadProgress(selectedProject.id)} />
          ) : !phases.length ? (
            <EmptyState
              title="No phase updates yet"
              message="This project has not recorded any progress logs yet, so the live timeline is still empty."
              onRetry={() => loadProgress(selectedProject.id)}
            />
          ) : (
            <>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Overall progress</span>
                  <strong style={styles.summaryValue}>{formatNumber(summary.progressPercent)}%</strong>
                </div>
                <div style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Completed phases</span>
                  <strong style={styles.summaryValue}>{formatNumber(summary.completedPhases)} / {formatNumber(summary.totalPhases)}</strong>
                </div>
                <div style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Amount spent</span>
                  <strong style={styles.summaryValue}>RWF {formatNumber(summary.totalSpent)}</strong>
                </div>
                <div style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Last update</span>
                  <strong style={styles.summaryValue}>{formatDate(timeline?.actualLatest)}</strong>
                </div>
              </div>

              {timeline && (
                <div style={styles.timelineCard}>
                  <div style={styles.timelineHeader}>
                    <h3 style={styles.timelineTitle}>Actual vs planned timeline</h3>
                    <span style={{ ...styles.timelineBadge, ...getTimelineTone(timeline.status) }}>
                      {timeline.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={styles.timelineGrid}>
                    <div style={styles.timelineItem}>
                      <span style={styles.timelineLabel}>Planned start</span>
                      <strong style={styles.timelineValue}>{formatDate(timeline.plannedStart)}</strong>
                    </div>
                    <div style={styles.timelineItem}>
                      <span style={styles.timelineLabel}>Planned end</span>
                      <strong style={styles.timelineValue}>{formatDate(timeline.plannedEnd)}</strong>
                    </div>
                    <div style={styles.timelineItem}>
                      <span style={styles.timelineLabel}>Actual start</span>
                      <strong style={styles.timelineValue}>{formatDate(timeline.actualStart)}</strong>
                    </div>
                    <div style={styles.timelineItem}>
                      <span style={styles.timelineLabel}>Actual latest</span>
                      <strong style={styles.timelineValue}>{formatDate(timeline.actualLatest)}</strong>
                    </div>
                    <div style={styles.timelineItemWide}>
                      <span style={styles.timelineLabel}>Variance</span>
                      <strong style={styles.timelineValue}>{timeline.varianceDays > 0 ? '+' : ''}{formatNumber(timeline.varianceDays)} days</strong>
                    </div>
                  </div>
                </div>
              )}

              <div style={styles.phaseList}>
                {phases.map((phase) => {
                  const progress = Number(phase.progressPercent || 0);
                  return (
                    <div key={phase.id} style={styles.phaseCard}>
                      <div style={styles.phaseHeader}>
                        <div>
                          <h3 style={styles.phaseTitle}>{phase.stage.replace('_', ' ')}</h3>
                          <p style={styles.phaseMeta}>{formatDate(phase.plannedDate)} planned · {formatDate(phase.actualDate)} logged</p>
                        </div>
                        <span style={styles.phaseStatus}>{phase.status.replace('_', ' ')}</span>
                      </div>

                      <div style={styles.progressSection}>
                        <div style={styles.progressHeader}>
                          <span style={styles.progressLabel}>Progress</span>
                          <span style={{ ...styles.progressValue, color: getProgressColor(progress) }}>{formatNumber(progress)}%</span>
                        </div>
                        <div style={styles.progressBar}>
                          <div style={{ ...styles.progressFill, width: `${Math.min(progress, 100)}%`, background: getProgressColor(progress) }} />
                        </div>
                      </div>

                      <div style={styles.phaseFooter}>
                        <span style={styles.phaseSpend}>Spent RWF {formatNumber(phase.amountSpent)}</span>
                        <span style={styles.phaseNotes}>{phase.notes || 'No notes added for this update.'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-color)',
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: 'var(--text-muted)',
  },
  actionsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    flex: 1,
  },
  searchInput: {
    minWidth: '240px',
    flex: 1,
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #1a1a1a',
    background: 'var(--card-bg)',
    color: 'var(--text-color)',
  },
  statusSelect: {
    minWidth: '180px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #1a1a1a',
    background: 'var(--card-bg)',
    color: 'var(--text-color)',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },
  projectCard: {
    textAlign: 'left',
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '22px',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, transform 0.2s ease',
  },
  projectCardActive: {
    borderColor: '#00f2ff',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 30px rgba(0, 242, 255, 0.08)',
  },
  projectHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '18px',
  },
  projectTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-color)',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '6px 8px',
    borderRadius: '999px',
    textTransform: 'uppercase',
  },
  statusDRAFT: { background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8' },
  statusESTIMATED: { background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' },
  statusDOCUMENTS: { background: 'rgba(14, 165, 233, 0.12)', color: '#38bdf8' },
  statusIN_PROGRESS: { background: 'rgba(0, 242, 255, 0.12)', color: '#00f2ff' },
  statusON_HOLD: { background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' },
  statusCOMPLETED: { background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e' },
  statusARCHIVED: { background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8' },
  projectMeta: {
    display: 'grid',
    gap: '10px',
    marginBottom: '18px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  metaLabel: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  metaValue: {
    fontSize: '14px',
    color: 'var(--text-color)',
    fontWeight: 600,
    textAlign: 'right',
  },
  cardStats: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  statChip: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: 'var(--text-muted)',
    fontSize: '12px',
  },
  detailsPanel: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '16px',
    padding: '28px',
  },
  detailsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '24px',
  },
  detailsTitle: {
    margin: '0 0 6px',
    fontSize: '24px',
    color: 'var(--text-color)',
  },
  detailsSubtitle: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '15px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  summaryLabel: {
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  summaryValue: {
    color: 'var(--text-color)',
    fontSize: '24px',
  },
  timelineCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '24px',
  },
  timelineHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '18px',
  },
  timelineTitle: {
    margin: 0,
    fontSize: '18px',
    color: 'var(--text-color)',
  },
  timelineBadge: {
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
  },
  timelineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  timelineItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  timelineItemWide: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    gridColumn: 'span 2',
  },
  timelineLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  timelineValue: {
    fontSize: '16px',
    color: 'var(--text-color)',
  },
  phaseList: {
    display: 'grid',
    gap: '16px',
  },
  phaseCard: {
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '14px',
    padding: '18px',
  },
  phaseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  phaseTitle: {
    margin: '0 0 6px',
    color: 'var(--text-color)',
    fontSize: '17px',
  },
  phaseMeta: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  phaseStatus: {
    color: '#00f2ff',
    fontWeight: 700,
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  progressSection: {
    marginBottom: '16px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  progressLabel: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  progressValue: {
    fontSize: '14px',
    fontWeight: 600,
  },
  progressBar: {
    height: '8px',
    background: 'var(--border-color)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  phaseFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  phaseSpend: {
    color: 'var(--text-color)',
    fontWeight: 600,
    fontSize: '14px',
  },
  phaseNotes: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    flex: 1,
    minWidth: '220px',
  },
  stateCard: {
    minHeight: '320px',
    borderRadius: '16px',
    border: '1px solid #1a1a1a',
    background: 'var(--card-bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    textAlign: 'center',
    padding: '32px',
  },
  stateIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 242, 255, 0.12)',
    color: '#00f2ff',
    fontSize: '22px',
    fontWeight: 700,
  },
  stateTitle: {
    margin: 0,
    color: 'var(--text-color)',
    fontSize: '22px',
  },
  stateText: {
    margin: 0,
    maxWidth: '560px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  loadingWrap: {
    display: 'grid',
    gap: '24px',
  },
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  skeletonCard: {
    height: '220px',
    borderRadius: '12px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
    border: '1px solid #1a1a1a',
  },
  skeletonPanel: {
    height: '300px',
    borderRadius: '16px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
    border: '1px solid #1a1a1a',
  },
  progressLoadingWrap: {
    display: 'grid',
    gap: '20px',
  },
  skeletonSummaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  skeletonSummaryCard: {
    height: '110px',
    borderRadius: '12px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.06)',
  },
};

