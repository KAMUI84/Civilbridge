import { api } from "./apiClientService.js";

export const appointmentsService = {
  listMine: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return api.get(`/api/appointments/my${query ? `?${query}` : ""}`);
  },
  getAvailability: (providerId) => api.get(`/api/appointments/availability/${providerId}`),
  create: (data) => api.post("/api/appointments", data),
  confirm: (appointmentId) => api.put(`/api/appointments/${appointmentId}/confirm`, {}),
  cancel: (appointmentId, data = {}) => api.put(`/api/appointments/${appointmentId}/cancel`, data),
};

export default appointmentsService;
