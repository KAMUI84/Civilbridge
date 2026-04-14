import { api } from "./apiClientService.js";

export const progressService = {
  getProjectProgress: (projectId) => api.get(`/api/progress/${projectId}`),
  createMilestone: (projectId, data) => api.post(`/api/progress/${projectId}/milestones`, data),
  updateMilestone: (milestoneId, data) => api.put(`/api/progress/milestones/${milestoneId}`, data),
  deleteMilestone: (milestoneId) => api.delete(`/api/progress/milestones/${milestoneId}`),
};
