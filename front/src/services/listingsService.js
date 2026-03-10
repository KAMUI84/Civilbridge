import { api } from "./apiClientService.js";

export const listingsService = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return api.get(`/api/listings${qs ? `?${qs}` : ""}`);
    },
    getById: (id) => api.get(`/api/listings/${id}`),
    getMine: () => api.get("/api/listings/me"),
    create: (data) => api.post("/api/listings", data),
    update: (id, data) => api.put(`/api/listings/${id}`, data),
    remove: (id) => api.delete(`/api/listings/${id}`),
};
