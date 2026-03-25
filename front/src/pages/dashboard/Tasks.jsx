// Enhanced Tasks Management System
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Tasks() {
  const { dashboardConfig } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board'); // board, list, calendar
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Mock tasks data
  const mockTasks = [
    {
      id: 1,
      title: 'Review bridge design blueprints',
      description: 'Review and approve the structural design for the new bridge project',
      status: 'todo',
      priority: 'high',
      assignee: 'Sarah Wilson',
      project: 'Bridge Design Project',
      dueDate: '2024-03-25',
      createdAt: '2024-03-19',
      tags: ['review', 'urgent', 'design']
    },
    {
      id: 2,
      title: 'Site inspection preparation',
      description: 'Prepare equipment and documentation for site visit',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Mike Johnson',
      project: 'Road Construction',
      dueDate: '2024-03-28',
      createdAt: '2024-03-18',
      tags: ['inspection', 'preparation']
    },
    {
      id: 3,
      title: 'Client meeting - project kickoff',
      description: 'Initial meeting with client to discuss project requirements',
      status: 'completed',
      priority: 'high',
      assignee: 'David Chen',
      project: 'Infrastructure Audit',
      dueDate: '2024-03-20',
      createdAt: '2024-03-15',
      tags: ['meeting', 'client']
    },
    {
      id: 4,
      title: 'Update project documentation',
      description: 'Update all project documentation with latest changes',
      status: 'todo',
      priority: 'low',
      assignee: 'John Doe',
      project: 'Bridge Design Project',
      dueDate: '2024-04-01',
      createdAt: '2024-03-19',
      tags: ['documentation', 'update']
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleCreateTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: tasks.length + 1,
      status: 'todo',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks([...tasks, newTask]);
    setShowCreateModal(false);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': '#ef4444',
      'medium': '#f59e0b',
      'low': '#22c55e'
    };
    return colors[priority] || 'var(--text-muted)';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'completed': 'Completed'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div style={styles.loading}>Loading tasks...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Task Management</h1>
        <p style={styles.subtitle}>Manage and track all project tasks</p>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <div style={styles.viewSwitcher}>
            <button
              style={{
                ...styles.viewButton,
                ...(view === 'board' && styles.viewButtonActive)
              }}
              onClick={() => setView('board')}
            >
              📋 Board
            </button>
            <button
              style={{
                ...styles.viewButton,
                ...(view === 'list' && styles.viewButtonActive)
              }}
              onClick={() => setView('list')}
            >
              📝 List
            </button>
            <button
              style={{
                ...styles.viewButton,
                ...(view === 'calendar' && styles.viewButtonActive)
              }}
              onClick={() => setView('calendar')}
            >
              📅 Calendar
            </button>
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

        <button
          onClick={() => setShowCreateModal(true)}
          style={styles.createButton}
        >
          + New Task
        </button>
      </div>

      {/* Task Board */}
      {view === 'board' && (
        <div style={styles.board}>
          <div style={styles.column}>
            <div style={styles.columnHeader}>
              <h3 style={styles.columnTitle}>To Do</h3>
              <span style={styles.columnCount}>
                {filteredTasks.filter(t => t.status === 'todo').length}
              </span>
            </div>
            <div style={styles.taskList}>
              {filteredTasks.filter(t => t.status === 'todo').map(task => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </div>

          <div style={styles.column}>
            <div style={styles.columnHeader}>
              <h3 style={styles.columnTitle}>In Progress</h3>
              <span style={styles.columnCount}>
                {filteredTasks.filter(t => t.status === 'in-progress').length}
              </span>
            </div>
            <div style={styles.taskList}>
              {filteredTasks.filter(t => t.status === 'in-progress').map(task => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </div>

          <div style={styles.column}>
            <div style={styles.columnHeader}>
              <h3 style={styles.columnTitle}>Completed</h3>
              <span style={styles.columnCount}>
                {filteredTasks.filter(t => t.status === 'completed').length}
              </span>
            </div>
            <div style={styles.taskList}>
              {filteredTasks.filter(t => t.status === 'completed').map(task => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      {view === 'list' && (
        <div style={styles.listContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableHeaderCell}>Task</th>
                <th style={styles.tableHeaderCell}>Assignee</th>
                <th style={styles.tableHeaderCell}>Project</th>
                <th style={styles.tableHeaderCell}>Priority</th>
                <th style={styles.tableHeaderCell}>Due Date</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <div style={styles.taskCell}>
                      <div style={styles.taskTitle}>{task.title}</div>
                      <div style={styles.taskDescription}>{task.description}</div>
                    </div>
                  </td>
                  <td style={styles.tableCell}>{task.assignee}</td>
                  <td style={styles.tableCell}>{task.project}</td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.priorityBadge,
                      backgroundColor: getPriorityColor(task.priority)
                    }}>
                      {task.priority}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{task.dueDate}</td>
                  <td style={styles.tableCell}>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={styles.statusSelect}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td style={styles.tableCell}>
                    <button style={styles.actionButton}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div style={styles.calendarContainer}>
          <div style={styles.calendarHeader}>
            <h3 style={styles.calendarTitle}>March 2024</h3>
            <div style={styles.calendarActions}>
              <button style={styles.calendarButton}>Previous</button>
              <button style={styles.calendarButton}>Today</button>
              <button style={styles.calendarButton}>Next</button>
            </div>
          </div>
          <div style={styles.calendarGrid}>
            <div style={styles.calendarDays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={styles.calendarDayHeader}>{day}</div>
              ))}
            </div>
            <div style={styles.calendarDates}>
              {Array.from({ length: 35 }, (_, i) => (
                <div key={i} style={styles.calendarDate}>
                  <div style={styles.calendarDateNumber}>
                    {i - 3 > 0 && i - 3 <= 31 ? i - 3 : ''}
                  </div>
                  {i === 25 && (
                    <div style={styles.calendarTask}>
                      <div style={styles.calendarTaskDot} />
                      Bridge review
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateTask}
        />
      )}
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onStatusChange }) {
  const getPriorityColor = (priority) => {
    const colors = {
      'high': '#ef4444',
      'medium': '#f59e0b',
      'low': '#22c55e'
    };
    return colors[priority] || 'var(--text-muted)';
  };

  return (
    <div style={styles.taskCard}>
      <div style={styles.taskHeader}>
        <h4 style={styles.taskTitle}>{task.title}</h4>
        <span style={{
          ...styles.priorityBadge,
          backgroundColor: getPriorityColor(task.priority)
        }}>
          {task.priority}
        </span>
      </div>
      
      <p style={styles.taskDescription}>{task.description}</p>
      
      <div style={styles.taskMeta}>
        <div style={styles.taskMetaItem}>
          <span style={styles.metaLabel}>👤</span>
          <span style={styles.metaValue}>{task.assignee}</span>
        </div>
        <div style={styles.taskMetaItem}>
          <span style={styles.metaLabel}>🏗️</span>
          <span style={styles.metaValue}>{task.project}</span>
        </div>
        <div style={styles.taskMetaItem}>
          <span style={styles.metaLabel}>📅</span>
          <span style={styles.metaValue}>{task.dueDate}</span>
        </div>
      </div>

      <div style={styles.taskTags}>
        {task.tags.map(tag => (
          <span key={tag} style={styles.taskTag}>{tag}</span>
        ))}
      </div>

      <select
        value={task.status}
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

// Create Task Modal
function CreateTaskModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    project: '',
    priority: 'medium',
    dueDate: '',
    tags: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    });
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={styles.modalTitle}>Create New Task</h3>
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Task Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={styles.formInput}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={styles.formTextarea}
              rows={3}
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Assignee</label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                style={styles.formInput}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Project</label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                style={styles.formInput}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={styles.formSelect}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                style={styles.formInput}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              style={styles.formInput}
              placeholder="urgent, review, design"
            />
          </div>

          <div style={styles.modalActions}>
            <button type="submit" style={styles.saveButton}>Create Task</button>
            <button type="button" onClick={onClose} style={styles.cancelButton}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '24px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-color)'
  },
  subtitle: {
    margin: '0 0 32px',
    fontSize: '16px',
    color: 'var(--text-muted)'
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    fontSize: '18px',
    color: 'var(--text-muted)'
  }
};
