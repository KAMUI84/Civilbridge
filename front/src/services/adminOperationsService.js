import { api } from "./apiClientService.js";

export const adminOperationsService = {
  getVerificationQueue: () => api.get("/api/admin/verification-queue"),
  approveVerification: (userId, payload = {}) => api.post(`/api/admin/verification/${userId}/approve`, payload),
  rejectVerification: (userId, payload = {}) => api.post(`/api/admin/verification/${userId}/reject`, payload),
  listCostBenchmarks: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return api.get(`/api/admin/cost-benchmarks${query ? `?${query}` : ""}`);
  },
  upsertCostBenchmark: (payload) => api.post("/api/admin/cost-benchmarks", payload),

  // Plan approval queue
  getPlanRequests: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/plans/requests/all${qs ? `?${qs}` : ""}`);
  },
  updatePlanRequestStatus: (requestId, payload) => api.patch(`/api/plans/requests/${requestId}/status`, payload),
  approvePlan: (planId, payload) => api.patch(`/api/plans/${planId}/approve`, payload),

  // Lead requests queue
  getLeadRequests: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/listings/requests/all${qs ? `?${qs}` : ""}`);
  },
  updateLeadRequestStatus: (requestId, payload) => api.patch(`/api/listings/requests/${requestId}/status`, payload),
};

export default adminOperationsService;
