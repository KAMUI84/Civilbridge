import { api } from "./apiClientService.js";

export const documentsService = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return api.get(`/api/documents${query ? `?${query}` : ""}`);
  },
  uploadToProject: (projectId, files) => {
    const formData = new FormData();
    Array.from(files || []).forEach((file) => formData.append("documents", file));
    return api.postForm(`/api/projects/${projectId}/documents`, formData);
  },
  download: (documentId) => api.get(`/api/documents/${documentId}/download`),
  remove: (documentId) => api.delete(`/api/documents/${documentId}`),
  review: (documentId, body) => api.put(`/api/documents/${documentId}/review`, body),
  regenerate: (documentId) => api.post(`/api/documents/${documentId}/regenerate`, {}),
  generateProjectPackage: (projectId, body = {}) =>
    api.post(`/api/documents/projects/${projectId}/package`, body),
};

export default documentsService;
