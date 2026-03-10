import { api } from "./apiClientService.js";

export const estimationService = {
  run: (data) => api.post("/api/estimation/run", data),
  checkFeasibility: (data) => api.post("/api/estimation/feasibility", data),
  getAll: () => api.get("/api/estimation"),
  getById: (id) => api.get(`/api/estimation/${id}`),
  remove: (id) => api.delete(`/api/estimation/${id}`),
};