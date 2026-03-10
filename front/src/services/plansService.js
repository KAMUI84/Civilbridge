import { api } from "./apiClientService.js";

export const plansService = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return api.get(`/api/plans${qs ? `?${qs}` : ""}`);
    },
    getById: (id) => api.get(`/api/plans/${id}`),
    getMine: () => api.get("/api/plans/me"),
    create: (data) => api.post("/api/plans", data),
    update: (id, data) => api.put(`/api/plans/${id}`, data),
};
