import { api } from "./apiClientService.js";

function toMultipartFormData(payload = {}) {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value == null || value === "") return;

        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item instanceof File || item instanceof Blob) {
                    formData.append(key, item);
                } else if (item != null && item !== "") {
                    formData.append(key, String(item));
                }
            });
            return;
        }

        if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
            return;
        }

        if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
            return;
        }

        formData.append(key, String(value));
    });

    return formData;
}

export const listingsService = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return api.get(`/api/listings${qs ? `?${qs}` : ""}`);
    },
    getById: (id) => api.get(`/api/listings/${id}`),
    getMine: () => api.get("/api/listings/me"),
    getMyRequests: () => api.get("/api/listings/requests/mine"),
    create: (data) => api.postForm("/api/listings", toMultipartFormData(data)),
    update: (id, data) => api.putForm(`/api/listings/${id}`, toMultipartFormData(data)),
    inquire: (id, data) => api.post(`/api/listings/${id}/inquire`, data),
    remove: (id) => api.delete(`/api/listings/${id}`),
};
