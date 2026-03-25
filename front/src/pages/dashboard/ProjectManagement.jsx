// Enhanced Project Management with CRUD Operations
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function ProjectManagement() {
  const { dashboardConfig } = useOutletContext();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data with more details
  const mockProjects = [
    { 
      id: 1, 
      title: 'Bridge Design Project', 
      client: 'John Doe', 
      professional: 'Sarah Wilson', 
      status: 'IN_PROGRESS', 
      progress: 75, 
      budget: '$50,000', 
      deadline: '2024-04-15',
      description: 'Design and planning for highway bridge construction',
      priority: 'HIGH',
      createdAt: '2024-03-01'
    },
    { 
      id: 2, 
      title: 'Road Construction', 
      client: 'ABC Corp', 
      professional: 'Mike Johnson', 
      status: 'PLANNING', 
      progress: 25, 
      budget: '$120,000', 
      deadline: '2024-05-01',
      description: 'Major road construction project',
      priority: 'MEDIUM',
      createdAt: '2024-03-05'
    },
    { 
      id: 3, 
      title: 'Infrastructure Audit', 
      client: 'City Council', 
      professional: 'David Chen', 
      status: 'COMPLETED', 
      progress: 100, 
      budget: '$30,000', 
      deadline: '2024-03-30',
      description: 'Comprehensive infrastructure audit',
      priority: 'LOW',
      createdAt: '2024-02-20'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.professional.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: projects.length + 1,
      status: 'PLANNING',
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProjects([...projects, newProject]);
    setShowCreateModal(false);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowCreateModal(true);
  };

  const handleUpdateProject = (projectData) => {
    setProjects(projects.map(p => 
      p.id === editingProject.id ? { ...p, ...projectData } : p
    ));
    setShowCreateModal(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  const handleStatusChange = (project, newStatus) => {
    setProjects(projects.map(p => 
      p.id === project.id ? { ...p, status: newStatus } : p
    ));
  };

  if (loading) {
    return <div style={styles.loading}>Loading projects...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Project Management</h1>
        <p style={styles.subtitle}>Manage all projects and their progress</p>
      </div>

      {/* Actions Bar */}
      <div style={styles.actionsBar}>
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.statusSelect}
          >
            <option value="all">All Status</option>
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={styles.createButton}
        >
          + New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div style={styles.projectsGrid}>
        {filteredProjects.map(project => (
          <div key={project.id} style={styles.projectCard}>
            <div style={styles.projectHeader}>
              <h3 style={styles.projectTitle}>{project.title}</h3>
              <div style={styles.projectActions}>
                <button
                  onClick={() => handleEditProject(project)}
                  style={styles.actionButton}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  style={styles.actionButton}
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div style={styles.projectMeta}>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Client:</span>
                <span style={styles.metaValue}>{project.client}</span>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Professional:</span>
                <span style={styles.metaValue}>{project.professional}</span>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Budget:</span>
                <span style={styles.metaValue}>{project.budget}</span>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Deadline:</span>
                <span style={styles.metaValue}>{project.deadline}</span>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Priority:</span>
                <span style={{
                  ...styles.priorityBadge,
                  ...(project.priority === 'HIGH' && styles.priorityHigh),
                  ...(project.priority === 'MEDIUM' && styles.priorityMedium),
                  ...(project.priority === 'LOW' && styles.priorityLow)
                }}>
                  {project.priority}
                </span>
              </div>
            </div>

            <div style={styles.description}>
              {project.description}
            </div>

            <div style={styles.statusSection}>
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(project, e.target.value)}
                style={styles.statusSelect}
              >
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>

            <div style={styles.progressSection}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Progress</span>
                <span style={styles.progressValue}>{project.progress}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${project.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <ProjectModal
          project={editingProject}
          onSave={editingProject ? handleUpdateProject : handleCreateProject}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}

// Project Modal Component
function ProjectModal({ project, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    client: project?.client || '',
    professional: project?.professional || '',
    budget: project?.budget || '',
    deadline: project?.deadline || '',
    description: project?.description || '',
    priority: project?.priority || 'MEDIUM'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={styles.modalTitle}>
          {project ? 'Edit Project' : 'Create New Project'}
        </h3>
        
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Project Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={styles.formInput}
              required
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Client</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                style={styles.formInput}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Professional</label>
              <input
                type="text"
                value={formData.professional}
                onChange={(e) => setFormData({ ...formData, professional: e.target.value })}
                style={styles.formInput}
                required
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Budget</label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                style={styles.formInput}
                placeholder="$50,000"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                style={styles.formInput}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              style={styles.formSelect}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={styles.formTextarea}
              rows={3}
              placeholder="Project description..."
            />
          </div>

          <div style={styles.modalActions}>
            <button type="submit" style={styles.saveButton}>
              {project ? 'Update Project' : 'Create Project'}
            </button>
            <button type="button" onClick={onCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    color: 'var(--text-muted)'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-color)'
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: 'var(--text-muted)'
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px'
  },
  projectCard: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '24px'
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  projectTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase'
  },
  statusCompleted: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e'
  },
  statusInProgress: {
    background: 'rgba(0, 242, 255, 0.1)',
    color: '#00f2ff'
  },
  statusPlanning: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b'
  },
  projectMeta: {
    marginBottom: '20px'
  },
  metaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  metaLabel: {
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  metaValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-color)'
  },
  progressSection: {
    marginBottom: '20px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  progressLabel: {
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  progressValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#00f2ff'
  },
  progressBar: {
    height: '8px',
    background: 'var(--border-color)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00f2ff, #6366f1)',
    transition: 'width 0.3s ease'
  }
};
