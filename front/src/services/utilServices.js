import { api } from "./apiClientService.js";

export const carbonService = {
    calculate: (data) => api.post("/api/carbon/calculate", data),
    getAll: () => api.get("/api/carbon"),
};

export const permitsService = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return api.get(`/api/permits${qs ? `?${qs}` : ""}`);
    },
    getById: (id) => api.get(`/api/permits/${id}`),
    getChecklist: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return api.get(`/api/permits/checklist${qs ? `?${qs}` : ""}`);
    },
};

export const progressService = {
    get: (projectId) => api.get(`/api/progress/${projectId}`),
    createMilestone: (projectId, data) => api.post(`/api/progress/${projectId}/milestones`, data),
    updateMilestone: (milestoneId, data) => api.put(`/api/progress/milestones/${milestoneId}`, data),
    deleteMilestone: (milestoneId) => api.delete(`/api/progress/milestones/${milestoneId}`),
};

export const roiService = {
    calculate: (data) => api.post("/api/roi/calculate", data),
    getAll: () => api.get("/api/roi"),
};

export const documentsService = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return api.get(`/api/documents${qs ? `?${qs}` : ""}`);
    },
    getDownloadUrl: (id) => api.get(`/api/documents/${id}/download`),
    remove: (id) => api.delete(`/api/documents/${id}`),
};

export const usersService = {
    getMyProfile: () => api.get("/api/profiles/me"),
    updateMyProfile: (data) => api.put("/api/profiles/me", data),
    getPublicProfile: (id) => api.get(`/api/profiles/${id}`),
};

export const catalogService = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return api.get(`/api/catalog${qs ? `?${qs}` : ""}`);
    },
    getCategories: () => api.get("/api/catalog/categories"),
    getById: (id) => api.get(`/api/catalog/${id}`),
};

export const reviewsService = {
    getForExpert: (expertId) => api.get(`/api/reviews/expert/${expertId}`),
    create: (data) => api.post("/api/reviews", data),
    remove: (id) => api.delete(`/api/reviews/${id}`),
};
