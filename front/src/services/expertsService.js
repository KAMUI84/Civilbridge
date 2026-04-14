import { api } from "./apiClientService.js";

function toMultipartFormData(data = {}) {
    if (data instanceof FormData) return data;

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        if (value instanceof Blob) {
            formData.append(key, value);
            return;
        }

        if (Array.isArray(value)) {
            const fileItems = value.filter((item) => item instanceof Blob);
            if (fileItems.length) {
                fileItems.forEach((item) => formData.append(key, item));
                return;
            }

            formData.append(key, value.join(","));
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

export const expertsService = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return api.get(`/api/experts${qs ? `?${qs}` : ""}`);
    },
    getById: (id) => api.get(`/api/experts/${id}`),
    getReviewEligibility: (id) => api.get(`/api/experts/${id}/review-eligibility`),
    createReview: (id, data) => api.post(`/api/experts/${id}/reviews`, data),
    updateReview: (reviewId, data) => api.put(`/api/experts/reviews/${reviewId}`, data),
    deleteReview: (reviewId) => api.delete(`/api/experts/reviews/${reviewId}`),
    apply: (data) => api.postForm("/api/experts/apply", toMultipartFormData(data)),
    updateProfile: (data) => api.putForm("/api/experts/profile", toMultipartFormData(data)),
};
