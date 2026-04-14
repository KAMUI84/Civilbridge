import { api } from "./apiClientService.js";

export const notificationsService = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return api.get(`/api/notifications${query ? `?${query}` : ""}`);
  },
  markRead: (id) => api.patch(`/api/notifications/${id}/read`, {}),
  markAllRead: () => api.patch("/api/notifications/read-all", {}),
};

export default notificationsService;
