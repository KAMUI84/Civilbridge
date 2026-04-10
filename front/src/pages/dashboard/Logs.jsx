import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/apiClientService';

const PAGE_SIZE = 8;

function formatDateTime(value) {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-RW', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function startOfDay(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function endOfDay(value) {
  if (!value) return null;
  const date = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildDetails(log) {
  const fragments = [];
  if (log.entityType) {
    fragments.push(`Entity: ${log.entityType}`);
  }
  if (log.entityId !== null && log.entityId !== undefined) {
    fragments.push(`ID: ${String(log.entityId)}`);
  }
  if (log.metaJson && typeof log.metaJson === 'object') {
    const meta = Object.entries(log.metaJson)
      .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)
      .join(' | ');
    if (meta) {
      fragments.push(meta);
    }
  }
  if (log.userAgent) {
    fragments.push(`Agent: ${log.userAgent}`);
  }
  return fragments.join(' | ') || 'No extra details recorded';
}

function getActionTone(action) {
  const value = String(action || '').toUpperCase();
  if (value.includes('FAIL') || value.includes('REJECT')) return styles.actionDanger;
  if (value.includes('LOGIN') || value.includes('VERIFY') || value.includes('APPROVE')) return styles.actionSuccess;
  if (value.includes('ROLE') || value.includes('CHANGE') || value.includes('UPDATE')) return styles.actionWarn;
  return styles.actionInfo;
}

function LoadingRows() {
  return Array.from({ length: 6 }).map((_, index) => (
    <tr key={index} style={styles.tableRow}>
      <td style={styles.tableCell}><div style={styles.skeletonLineWide} /></td>
      <td style={styles.tableCell}><div style={styles.skeletonChip} /></td>
      <td style={styles.tableCell}><div style={styles.skeletonLine} /></td>
      <td style={styles.tableCell}><div style={styles.skeletonLine} /></td>
      <td style={styles.tableCell}><div style={styles.skeletonLineWide} /></td>
    </tr>
  ));
}

export default function Logs() {
  const [state, setState] = useState({
    loading: true,
    error: '',
    logs: [],
  });
  const [filters, setFilters] = useState({
    action: 'all',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(1);

  const updateFilters = (updater) => {
    setFilters((current) => (
      typeof updater === 'function' ? updater(current) : updater
    ));
    setPage(1);
  };

  useEffect(() => {
    let cancelled = false;

    const loadLogs = async () => {
      try {
        setState((current) => ({ ...current, loading: true, error: '' }));
        const response = await api.get('/api/admin/stats');
        const recent = Array.isArray(response?.recent_activity) ? response.recent_activity : [];
        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            logs: recent,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message || 'Failed to fetch activity logs.',
            logs: [],
          });
        }
      }
    };

    loadLogs();
    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedLogs = useMemo(() => (
    state.logs.map((log, index) => ({
      id: String(log.id ?? index),
      action: log.action || 'UNKNOWN',
      actor: log.user?.fullName || log.user?.email || 'System',
      role: log.user?.role || '',
      timestamp: log.createdAt || '',
      ipAddress: log.ipAddress || 'Not recorded',
      details: buildDetails(log),
    }))
  ), [state.logs]);

  const actionOptions = useMemo(() => {
    const actions = Array.from(new Set(normalizedLogs.map((log) => log.action))).sort();
    return ['all', ...actions];
  }, [normalizedLogs]);

  const filteredLogs = useMemo(() => {
    const start = startOfDay(filters.startDate);
    const end = endOfDay(filters.endDate);

    return normalizedLogs.filter((log) => {
      const timestamp = log.timestamp ? new Date(log.timestamp) : null;

      if (filters.action !== 'all' && log.action !== filters.action) {
        return false;
      }

      if (start && (!timestamp || timestamp < start)) {
        return false;
      }

      if (end && (!timestamp || timestamp > end)) {
        return false;
      }

      return true;
    });
  }, [filters.action, filters.endDate, filters.startDate, normalizedLogs]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredLogs]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>System Logs</h1>
        <p style={styles.subtitle}>Review recent audit activity from the admin log stream.</p>
      </div>

      <div style={styles.filters}>
        <select
          style={styles.filterSelect}
          value={filters.action}
          onChange={(event) => updateFilters((current) => ({ ...current, action: event.target.value }))}
        >
          {actionOptions.map((action) => (
            <option key={action} value={action}>
              {action === 'all' ? 'All actions' : action}
            </option>
          ))}
        </select>

        <input
          type="date"
          style={styles.filterInput}
          value={filters.startDate}
          max={filters.endDate || undefined}
          onChange={(event) => updateFilters((current) => ({ ...current, startDate: event.target.value }))}
        />

        <input
          type="date"
          style={styles.filterInput}
          value={filters.endDate}
          min={filters.startDate || undefined}
          onChange={(event) => updateFilters((current) => ({ ...current, endDate: event.target.value }))}
        />

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={() => updateFilters({ action: 'all', startDate: '', endDate: '' })}
        >
          Reset filters
        </button>
      </div>

      <div style={styles.summaryBar}>
        <span style={styles.summaryText}>Showing {paginatedLogs.length} of {filteredLogs.length} recent logs</span>
        {normalizedLogs.length ? (
          <span style={styles.summaryText}>Latest entry: {formatDateTime(normalizedLogs[0]?.timestamp)}</span>
        ) : null}
      </div>

      {state.error ? (
        <div style={styles.stateCard}>
          <h3 style={styles.stateTitle}>Unable to load logs</h3>
          <p style={styles.stateText}>{state.error}</p>
        </div>
      ) : null}

      {!state.error ? (
        <div style={styles.logsContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableHeaderCell}>Timestamp</th>
                <th style={styles.tableHeaderCell}>Action</th>
                <th style={styles.tableHeaderCell}>User</th>
                <th style={styles.tableHeaderCell}>IP Address</th>
                <th style={styles.tableHeaderCell}>Details</th>
              </tr>
            </thead>
            <tbody>
              {state.loading ? <LoadingRows /> : null}

              {!state.loading && paginatedLogs.map((log) => (
                <tr key={log.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <div style={styles.timestamp}>{formatDateTime(log.timestamp)}</div>
                    <div style={styles.dateHint}>{formatDateInput(log.timestamp)}</div>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{ ...styles.actionBadge, ...getActionTone(log.action) }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.userName}>{log.actor}</div>
                    {log.role ? <div style={styles.userRole}>{log.role}</div> : null}
                  </td>
                  <td style={styles.tableCell}>{log.ipAddress}</td>
                  <td style={styles.tableCell}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!state.loading && !paginatedLogs.length ? (
            <div style={styles.emptyState}>
              <h3 style={styles.stateTitle}>No logs found</h3>
              <p style={styles.stateText}>Try widening the date range or switching back to all actions.</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {!state.loading && filteredLogs.length > 0 ? (
        <div style={styles.pagination}>
          <button
            type="button"
            style={styles.secondaryButton}
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <span style={styles.pageText}>Page {currentPage} of {totalPages}</span>
          <button
            type="button"
            style={styles.secondaryButton}
            disabled={currentPage === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
  },
  header: {
    marginBottom: '24px',
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
  filters: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px',
  },
  filterInput: {
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px',
  },
  secondaryButton: {
    background: 'transparent',
    border: '1px solid #262626',
    borderRadius: '8px',
    padding: '12px 18px',
    color: 'var(--text-color)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  summaryBar: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  summaryText: {
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  logsContainer: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: 'var(--border-color)',
  },
  tableHeaderCell: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-color)',
    borderBottom: '1px solid #262626',
  },
  tableRow: {
    borderBottom: '1px solid #1a1a1a',
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: 'var(--text-muted)',
    verticalAlign: 'top',
  },
  timestamp: {
    fontSize: '13px',
    color: 'var(--text-color)',
    fontFamily: 'monospace',
  },
  dateHint: {
    marginTop: '4px',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  userName: {
    color: 'var(--text-color)',
    fontWeight: 600,
  },
  userRole: {
    marginTop: '4px',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  actionBadge: {
    display: 'inline-flex',
    fontSize: '11px',
    fontWeight: 700,
    padding: '6px 10px',
    borderRadius: '999px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  actionSuccess: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
  },
  actionWarn: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
  },
  actionDanger: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
  },
  actionInfo: {
    background: 'rgba(99, 102, 241, 0.14)',
    color: '#818cf8',
  },
  stateCard: {
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #262626',
    background: 'var(--card-bg)',
    marginBottom: '18px',
  },
  stateTitle: {
    margin: '0 0 8px',
    fontSize: '20px',
    color: 'var(--text-color)',
  },
  stateText: {
    margin: 0,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  emptyState: {
    padding: '32px 24px',
    textAlign: 'center',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginTop: '18px',
    flexWrap: 'wrap',
  },
  pageText: {
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  skeletonLineWide: {
    width: '90%',
    height: '16px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
  },
  skeletonLine: {
    width: '70%',
    height: '16px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
  },
  skeletonChip: {
    width: '96px',
    height: '28px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
  },
};
