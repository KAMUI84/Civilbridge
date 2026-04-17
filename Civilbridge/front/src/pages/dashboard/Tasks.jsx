import React, { useState, useEffect, useCallback } from 'react';
import { tasksService } from '../../services/tasksService';
import SEO from '../../components/seo/SEO';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={styles.taskCard}>
      <div style={{ ...sk.block, width: '70%', height: 16, marginBottom: 10 }} />
      <div style={{ ...sk.block, width: '100%', height: 12, marginBottom: 6 }} />
      <div style={{ ...sk.block, width: '60%', height: 12, marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ ...sk.block, width: 80, height: 28, borderRadius: 6 }} />
        <div style={{ ...sk.block, width: 80, height: 28, borderRadius: 6 }} />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onNew }) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>📋</div>
      <h3 style={styles.emptyTitle}>No tasks yet</h3>
      <p style={styles.emptyText}>Create your first task to start tracking work.</p>
      <button onClick={onNew} style={styles.createButton}>+ New Task</button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Tasks() {
  const [tasks, setTasks]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [view, setView]                 = useState('board');
  const [filter, setFilter]             = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patchingId, setPatchingId]     = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await tasksService.list(filter);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter);

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setPatchingId(taskId);
    try {
      await tasksService.update(taskId, { status: newStatus });
    } catch {
      // Revert on failure
      fetchTasks();
    } finally {
      setPatchingId(null);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const data = await tasksService.create(taskData);
      setTasks(prev => [data.task, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      alert(err.message || 'Failed to create task');
    }
  };

  const getPriorityColor = (priority) => ({
    high: '#ef4444', medium: '#f59e0b', low: '#22c55e'
  }[priority] || '#6b7280');

  return (
    <div style={styles.container}>
      <SEO title="Tasks" noindex />

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Task Management</h1>
        <p style={styles.subtitle}>Manage and track all project tasks</p>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <div style={styles.viewSwitcher}>
            {['board', 'list'].map(v => (
              <button
                key={v}
                style={{ ...styles.viewButton, ...(view === v && styles.viewButtonActive) }}
                onClick={() => setView(v)}
              >
                {v === 'board' ? '📋 Board' : '📝 List'}
              </button>
            ))}
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button onClick={() => setShowCreateModal(true)} style={styles.createButton}>
          + New Task
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button onClick={fetchTasks} style={styles.retryBtn}>Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={styles.board}>
          {['To Do', 'In Progress', 'Completed'].map(col => (
            <div key={col} style={styles.column}>
              <div style={styles.columnHeader}>
                <div style={{ ...sk.block, width: 80, height: 16 }} />
              </div>
              <div style={styles.taskList}>
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && tasks.length === 0 && (
        <EmptyState onNew={() => setShowCreateModal(true)} />
      )}

      {/* Board view */}
      {!loading && !error && tasks.length > 0 && view === 'board' && (
        <div style={styles.board}>
          {[
            { key: 'todo', label: 'To Do' },
            { key: 'in-progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' },
          ].map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} style={styles.column}>
                <div style={styles.columnHeader}>
                  <h3 style={styles.columnTitle}>{col.label}</h3>
                  <span style={styles.columnCount}>{colTasks.length}</span>
                </div>
                <div style={styles.taskList}>
                  {colTasks.length === 0 && (
                    <p style={styles.colEmpty}>No tasks</p>
                  )}
                  {colTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      patching={patchingId === task.id}
                      onStatusChange={handleStatusChange}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {!loading && !error && tasks.length > 0 && view === 'list' && (
        <div style={styles.listContainer}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  {['Task', 'Assignee', 'Project', 'Priority', 'Due Date', 'Status'].map(h => (
                    <th key={h} style={styles.tableHeaderCell}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.taskTitle}>{task.title}</div>
                      <div style={styles.taskDescription}>{task.description}</div>
                    </td>
                    <td style={styles.tableCell}>{task.assignee || '—'}</td>
                    <td style={styles.tableCell}>{task.project || '—'}</td>
                    <td style={styles.tableCell}>
                      <span style={{ ...styles.priorityBadge, backgroundColor: getPriorityColor(task.priority) }}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{task.dueDate || '—'}</td>
                    <td style={styles.tableCell}>
                      <select
                        value={task.status}
                        disabled={patchingId === task.id}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        style={styles.statusSelect}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateTask}
        />
      )}
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, patching, onStatusChange, getPriorityColor }) {
  return (
    <div style={{ ...styles.taskCard, opacity: patching ? 0.6 : 1 }}>
      <div style={styles.taskHeader}>
        <h4 style={styles.taskTitle}>{task.title}</h4>
        <span style={{ ...styles.priorityBadge, backgroundColor: getPriorityColor(task.priority) }}>
          {task.priority}
        </span>
      </div>

      {task.description && <p style={styles.taskDescription}>{task.description}</p>}

      <div style={styles.taskMeta}>
        {task.assignee && (
          <div style={styles.taskMetaItem}>
            <span>👤</span>
            <span style={styles.metaValue}>{task.assignee}</span>
          </div>
        )}
        {task.project && (
          <div style={styles.taskMetaItem}>
            <span>🏗️</span>
            <span style={styles.metaValue}>{task.project}</span>
          </div>
        )}
        {task.dueDate && (
          <div style={styles.taskMetaItem}>
            <span>📅</span>
            <span style={styles.metaValue}>{task.dueDate}</span>
          </div>
        )}
      </div>

      {task.tags?.length > 0 && (
        <div style={styles.taskTags}>
          {task.tags.map(tag => <span key={tag} style={styles.taskTag}>{tag}</span>)}
        </div>
      )}

      <select
        value={task.status}
        disabled={patching}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
        style={styles.statusSelect}
      >
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateTaskModal({ onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', assignee: '', projectName: '',
    priority: 'medium', dueDate: '', tags: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSaving(true);
    await onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setSaving(false);
  };

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={styles.modalTitle}>Create New Task</h3>
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Task Title *</label>
            <input
              type="text" value={formData.title} onChange={set('title')}
              style={styles.formInput} required autoFocus
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Description</label>
            <textarea
              value={formData.description} onChange={set('description')}
              style={styles.formTextarea} rows={3}
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Assignee</label>
              <input type="text" value={formData.assignee} onChange={set('assignee')} style={styles.formInput} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Project</label>
              <input type="text" value={formData.projectName} onChange={set('projectName')} style={styles.formInput} />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Priority</label>
              <select value={formData.priority} onChange={set('priority')} style={styles.formSelect}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Due Date</label>
              <input type="date" value={formData.dueDate} onChange={set('dueDate')} style={styles.formInput} />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Tags (comma-separated)</label>
            <input
              type="text" value={formData.tags} onChange={set('tags')}
              style={styles.formInput} placeholder="urgent, review, design"
            />
          </div>

          <div style={styles.modalActions}>
            <button type="submit" disabled={saving} style={styles.saveButton}>
              {saving ? 'Creating…' : 'Create Task'}
            </button>
            <button type="button" onClick={onClose} style={styles.cancelButton}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Skeleton blocks ──────────────────────────────────────────────────────────
const sk = {
  block: {
    background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)',
    backgroundSize: '200% 100%',
    animation: 'cb-shimmer 1.4s infinite',
    borderRadius: 4,
    display: 'block',
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  container: { maxWidth: '100%', margin: '0 auto', padding: '24px' },
  header: { marginBottom: 8 },
  title: { margin: '0 0 8px', fontSize: '28px', fontWeight: 700, color: 'var(--text-color)' },
  subtitle: { margin: '0 0 32px', fontSize: '16px', color: 'var(--text-muted)' },

  toolbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24, gap: 12, flexWrap: 'wrap',
  },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  viewSwitcher: { display: 'flex', gap: 4, background: '#111', borderRadius: 8, padding: 4 },
  viewButton: {
    background: 'transparent', border: 'none', color: 'var(--text-muted)',
    padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
  },
  viewButtonActive: { background: '#1a1a1a', color: '#00f2ff' },
  filterSelect: {
    background: '#111', border: '1px solid #222', color: 'var(--text-color)',
    padding: '8px 12px', borderRadius: 8, fontSize: 14, cursor: 'pointer',
  },
  createButton: {
    background: '#00f2ff', color: '#000', border: 'none',
    padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
  },

  errorBanner: {
    background: 'rgba(239,68,68,0.12)', border: '1px solid #ef4444',
    color: '#ef4444', borderRadius: 8, padding: '12px 16px',
    marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  retryBtn: {
    background: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
    padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
  },

  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '80px 20px', gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-color)' },
  emptyText: { margin: 0, color: 'var(--text-muted)', fontSize: 15 },

  board: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  column: {
    background: '#0d0d0d', borderRadius: 12, border: '1px solid #1a1a1a',
    padding: 16, minHeight: 200,
  },
  columnHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  columnTitle: { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-color)' },
  columnCount: {
    background: '#1a1a1a', color: '#00f2ff', borderRadius: 12,
    padding: '2px 10px', fontSize: 12, fontWeight: 600,
  },
  taskList: { display: 'flex', flexDirection: 'column', gap: 12 },
  colEmpty: { color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', margin: '20px 0' },

  taskCard: {
    background: '#111', border: '1px solid #1a1a1a', borderRadius: 10,
    padding: 14, transition: 'border-color 0.2s',
  },
  taskHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: 8, marginBottom: 8,
  },
  taskTitle: { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-color)', lineHeight: 1.4 },
  taskDescription: { margin: '0 0 10px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 },
  taskMeta: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 },
  taskMetaItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 },
  metaValue: { color: 'var(--text-muted)' },
  taskTags: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  taskTag: {
    background: 'rgba(0,242,255,0.08)', color: '#00f2ff',
    fontSize: 11, padding: '2px 8px', borderRadius: 4,
  },

  priorityBadge: {
    color: '#fff', fontSize: 11, fontWeight: 600,
    padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0,
  },

  listContainer: { background: '#0d0d0d', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  tableHeader: { background: '#111' },
  tableHeaderCell: {
    padding: '12px 16px', textAlign: 'left', fontSize: 12,
    fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid #1a1a1a',
  },
  tableRow: { borderBottom: '1px solid #111' },
  tableCell: { padding: '12px 16px', fontSize: 14, color: 'var(--text-color)', verticalAlign: 'middle' },

  statusSelect: {
    background: '#1a1a1a', border: '1px solid #222', color: 'var(--text-color)',
    padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', width: '100%',
  },

  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#111', border: '1px solid #1a1a1a', borderRadius: 16,
    padding: 28, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto',
  },
  modalTitle: { margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: 'var(--text-color)' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: 16 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  formRow: { display: 'flex', gap: 16 },
  formLabel: { fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' },
  formInput: {
    background: '#0d0d0d', border: '1px solid #222', color: 'var(--text-color)',
    padding: '10px 12px', borderRadius: 8, fontSize: 14, outline: 'none',
  },
  formTextarea: {
    background: '#0d0d0d', border: '1px solid #222', color: 'var(--text-color)',
    padding: '10px 12px', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical',
  },
  formSelect: {
    background: '#0d0d0d', border: '1px solid #222', color: 'var(--text-color)',
    padding: '10px 12px', borderRadius: 8, fontSize: 14, cursor: 'pointer',
  },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  saveButton: {
    background: '#00f2ff', color: '#000', border: 'none',
    padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
  },
  cancelButton: {
    background: 'transparent', border: '1px solid #333', color: 'var(--text-muted)',
    padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
  },
};
