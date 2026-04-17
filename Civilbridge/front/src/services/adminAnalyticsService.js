import { api } from "./apiClientService.js";

export const adminAnalyticsService = {
  getOverview: () => api.get("/api/admin/analytics"),
  getRegional: () => api.get("/api/admin/analytics/regional"),
  getExperts: () => api.get("/api/admin/analytics/experts"),
  getPlatformHealth: () => api.get("/api/admin/analytics/platform-health"),
};

export default adminAnalyticsService;
