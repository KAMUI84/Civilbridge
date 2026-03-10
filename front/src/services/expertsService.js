import { api } from "./apiClientService.js";

export const expertsService = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return api.get(`/api/experts${qs ? `?${qs}` : ""}`);
    },
    getById: (id) => api.get(`/api/experts/${id}`),
    apply: (data) => api.post("/api/experts/apply", data),
    updateProfile: (data) => api.put("/api/experts/profile", data),
};
