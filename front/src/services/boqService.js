import { api } from "./apiClientService.js";

export const boqService = {
    get: (estimateId) => api.get(`/api/boq/${estimateId}`),
    addItem: (estimateId, item) => api.post(`/api/boq/${estimateId}/items`, item),
    updateItem: (itemId, data) => api.put(`/api/boq/items/${itemId}`, data),
    deleteItem: (itemId) => api.delete(`/api/boq/items/${itemId}`),
};
