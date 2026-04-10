import { api, apiFetch } from './apiClientService.js';

export const profilesService = {
  getMe:  ()     => api.get('/api/profiles/me'),
  updateMe: (data) => api.put('/api/profiles/me', data),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return apiFetch('/api/profiles/me/avatar', { method: 'POST', body: form });
  },
  getPublic: (id) => api.get(`/api/profiles/${id}`),
};
