import { api } from './apiClientService.js';

export const contactService = {
  submit: (data) => api.post('/api/support/contact', data),
};
