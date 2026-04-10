import { api } from './apiClientService.js';

export const tasksService = {
  list: (status) => api.get(`/api/tasks${status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : ''}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.patch(`/api/tasks/${id}`, data),
  remove: (id) => api.delete(`/api/tasks/${id}`),
};
