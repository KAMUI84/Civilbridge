import { api } from './apiClientService.js';

export const upiService = {
  async lookup(upiCode) {
    return api.get(`/api/upi/lookup?upi=${encodeURIComponent(upiCode)}`);
  },
};
