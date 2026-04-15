// Implement project CRUD operations
// projects.service.js
import { api } from './apiClientService.js';

export const projectsService = {
  // Get all projects for the current user
  async getUserProjects() {
    const response = await api.get('/api/projects/user');
    return response;
  },

  // Create a new project
  async createProject(projectData) {
    const response = await api.post('/api/projects', projectData);
    return response;
  },

  // Get project by ID
  async getProjectById(projectId) {
    const response = await api.get(`/api/projects/${projectId}`);
    return response;
  },

  // Update project
  async updateProject(projectId, projectData) {
    const response = await api.put(`/api/projects/${projectId}`, projectData);
    return response;
  },

  // Delete project
  async deleteProject(projectId) {
    const response = await api.delete(`/api/projects/${projectId}`);
    return response;
  }
};