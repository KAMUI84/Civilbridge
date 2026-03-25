// Professional Engineer Dashboard - Work Hub
import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function ProfessionalDashboard() {
  const { dashboardConfig } = useOutletContext();

  const assignedProjects = [
    { id: 1, title: 'Bridge Design A', client: 'John Doe', progress: 75, deadline: '2024-04-15', status: 'in-progress' },
    { id: 2, title: 'Road Construction B', client: 'ABC Corp', progress: 45, deadline: '2024-05-01', status: 'in-progress' },
    { id: 3, title: 'Infrastructure Audit', client: 'City Council', progress: 90, deadline: '2024-03-30', status: 'review' }
  ];

  const kanbanTasks = {
    todo: [
      { id: 1, title: 'Review blueprints', project: 'Bridge Design A', priority: 'high' },
      { id: 2, title: 'Site inspection', project: 'Road Construction B', priority: 'medium' }
    ],
    inProgress: [
      { id: 3, title: 'Structural analysis', project: 'Bridge Design A', priority: 'high' },
      { id: 4, title: 'Material procurement', project: 'Road Construction B', priority: 'low' }
    ],
    completed: [
      { id: 5, title: 'Initial survey', project: 'Infrastructure Audit', priority: 'medium' }
    ]
  };

  const upcomingDeadlines = [
    { project: 'Infrastructure Audit', deadline: '2024-03-30', daysLeft: 11 },
    { project: 'Bridge Design A', deadline: '2024-04-15', daysLeft: 27 },
    { project: 'Road Construction B', deadline: '2024-05-01', daysLeft: 43 }
  ];

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Work Hub</h1>
        <p style={styles.subtitle}>Manage your projects and tasks efficiently</p>
      </div>

      {/* Projects Overview */}
      <div style={styles.projectsSection}>
        <h3 style={styles.sectionTitle}>My Projects</h3>
        <div style={styles.projectsGrid}>
          {assignedProjects.map(project => (
            <div key={project.id} style={styles.projectCard}>
              <div style={styles.projectHeader}>
                <h4 style={styles.projectTitle}>{project.title}</h4>
                <span style={{
                  ...styles.statusBadge,
                  ...(project.status === 'in-progress' && styles.statusInProgress),
                  ...(project.status === 'review' && styles.statusReview)
                }}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>
              <div style={styles.projectMeta}>
                <span style={styles.clientName}>👤 {project.client}</span>
                <span style={styles.deadline}>📅 {project.deadline}</span>
              </div>
              <div style={styles.progressSection}>
                <div style={styles.progressLabel}>Progress: {project.progress}%</div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${project.progress}%` }} />
                </div>
              </div>
              <div style={styles.projectActions}>
                <button style={styles.actionButton}>📁 Files</button>
                <button style={styles.actionButton}>💬 Messages</button>
                <button style={styles.actionButton}>📊 Report</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board - CRITICAL */}
      <div style={styles.kanbanSection}>
        <h3 style={styles.sectionTitle}>Task Board</h3>
        <div style={styles.kanbanBoard}>
          <div style={styles.kanbanColumn}>
            <div style={styles.columnHeader}>
              <h4 style={styles.columnTitle}>To Do</h4>
              <span style={styles.columnCount}>{kanbanTasks.todo.length}</span>
            </div>
            <div style={styles.taskList}>
              {kanbanTasks.todo.map(task => (
                <div key={task.id} style={styles.taskCard}>
                  <div style={styles.taskHeader}>
                    <h5 style={styles.taskTitle}>{task.title}</h5>
                    <span style={{
                      ...styles.priorityTag,
                      ...(task.priority === 'high' && styles.priorityHigh),
                      ...(task.priority === 'medium' && styles.priorityMedium),
                      ...(task.priority === 'low' && styles.priorityLow)
                    }}>
                      {task.priority}
                    </span>
                  </div>
                  <div style={styles.taskProject}>{task.project}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.kanbanColumn}>
            <div style={styles.columnHeader}>
              <h4 style={styles.columnTitle}>In Progress</h4>
              <span style={styles.columnCount}>{kanbanTasks.inProgress.length}</span>
            </div>
            <div style={styles.taskList}>
              {kanbanTasks.inProgress.map(task => (
                <div key={task.id} style={styles.taskCard}>
                  <div style={styles.taskHeader}>
                    <h5 style={styles.taskTitle}>{task.title}</h5>
                    <span style={{
                      ...styles.priorityTag,
                      ...(task.priority === 'high' && styles.priorityHigh),
                      ...(task.priority === 'medium' && styles.priorityMedium),
                      ...(task.priority === 'low' && styles.priorityLow)
                    }}>
                      {task.priority}
                    </span>
                  </div>
                  <div style={styles.taskProject}>{task.project}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.kanbanColumn}>
            <div style={styles.columnHeader}>
              <h4 style={styles.columnTitle}>Completed</h4>
              <span style={styles.columnCount}>{kanbanTasks.completed.length}</span>
            </div>
            <div style={styles.taskList}>
              {kanbanTasks.completed.map(task => (
                <div key={task.id} style={styles.taskCard}>
                  <div style={styles.taskHeader}>
                    <h5 style={styles.taskTitle}>{task.title}</h5>
                    <span style={{
                      ...styles.priorityTag,
                      ...(task.priority === 'high' && styles.priorityHigh),
                      ...(task.priority === 'medium' && styles.priorityMedium),
                      ...(task.priority === 'low' && styles.priorityLow)
                    }}>
                      {task.priority}
                    </span>
                  </div>
                  <div style={styles.taskProject}>{task.project}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deadlines & Quick Actions */}
      <div style={styles.bottomSection}>
        <div style={styles.deadlinesPanel}>
          <h3 style={styles.sectionTitle}>Upcoming Deadlines</h3>
          <div style={styles.deadlinesList}>
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} style={styles.deadlineItem}>
                <div style={styles.deadlineContent}>
                  <div style={styles.deadlineProject}>{deadline.project}</div>
                  <div style={styles.deadlineDate}>{deadline.deadline}</div>
                </div>
                <div style={{
                  ...styles.daysLeft,
                  ...(deadline.daysLeft <= 14 && styles.daysLeftUrgent)
                }}>
                  {deadline.daysLeft} days
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.quickActionsPanel}>
          <h3 style={styles.sectionTitle}>Quick Actions</h3>
          <div style={styles.quickActionsGrid}>
            <button style={styles.quickActionButton}>
              <div style={styles.actionIcon}>📁</div>
              <div style={styles.actionLabel}>Upload File</div>
            </button>
            <button style={styles.quickActionButton}>
              <div style={styles.actionIcon}>📝</div>
              <div style={styles.actionLabel}>Update Progress</div>
            </button>
            <button style={styles.quickActionButton}>
              <div style={styles.actionIcon}>💬</div>
              <div style={styles.actionLabel}>Send Message</div>
            </button>
            <button style={styles.quickActionButton}>
              <div style={styles.actionIcon}>📊</div>
              <div style={styles.actionLabel}>Generate Report</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    maxWidth: '100%',
    margin: '0 auto'
  },
  header: {
    marginBottom: 32
  },
  title: {
    margin: '0 0 8px',
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-color)'
  },
  subtitle: {
    margin: 0,
    fontSize: 16,
    color: 'var(--text-muted)'
  },
  sectionTitle: {
    margin: '0 0 20px',
    fontSize: 20,
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  projectsSection: {
    marginBottom: 32
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20
  },
  projectCard: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 20
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  projectTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: 6,
    textTransform: 'uppercase'
  },
  statusInProgress: {
    background: 'rgba(0, 242, 255, 0.1)',
    color: '#00f2ff'
  },
  statusReview: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b'
  },
  projectMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  clientName: {
    fontSize: 14,
    color: 'var(--text-muted)'
  },
  deadline: {
    fontSize: 14,
    color: 'var(--text-muted)'
  },
  progressSection: {
    marginBottom: 16
  },
  progressLabel: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginBottom: 8
  },
  progressBar: {
    height: 6,
    background: 'var(--border-color)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00f2ff, #6366f1)',
    transition: 'width 0.3s ease'
  },
  projectActions: {
    display: 'flex',
    gap: 8
  },
  actionButton: {
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 12,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  kanbanSection: {
    marginBottom: 32
  },
  kanbanBoard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20
  },
  kanbanColumn: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 20
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  columnTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  columnCount: {
    background: 'var(--border-color)',
    color: 'var(--text-muted)',
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 12
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  taskCard: {
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: 8,
    padding: 12
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  taskTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-color)'
  },
  priorityTag: {
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 4,
    textTransform: 'uppercase'
  },
  priorityHigh: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444'
  },
  priorityMedium: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b'
  },
  priorityLow: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e'
  },
  taskProject: {
    fontSize: 12,
    color: 'var(--text-muted)'
  },
  bottomSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20
  },
  deadlinesPanel: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 20
  },
  deadlinesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  deadlineItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #1a1a1a'
  },
  deadlineContent: {
    flex: 1
  },
  deadlineProject: {
    fontSize: 14,
    color: 'var(--text-color)',
    marginBottom: 4
  },
  deadlineDate: {
    fontSize: 12,
    color: 'var(--text-muted)'
  },
  daysLeft: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: 6,
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e'
  },
  daysLeftUrgent: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444'
  },
  quickActionsPanel: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 20
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12
  },
  quickActionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  actionIcon: {
    fontSize: 24
  },
  actionLabel: {
    fontSize: 12,
    color: 'var(--text-muted)'
  }
};
