import { api } from './apiClientService.js';

export const regionsService = {
  // Get all available regions
  async getAllRegions() {
    const response = await api.get('/api/regions');
    return response;
  },

  // Get region details
  async getRegionById(regionId) {
    const response = await api.get(`/api/regions/${regionId}`);
    return response;
  }
};
