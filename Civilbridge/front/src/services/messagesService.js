import { api } from "./apiClientService.js";

export const messagesService = {
  listThreads: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return api.get(`/api/messages/threads${query ? `?${query}` : ""}`);
  },
  createThread: (data) => api.post("/api/messages/threads", data),
  getThreadMessages: (threadId, params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return api.get(`/api/messages/${threadId}${query ? `?${query}` : ""}`);
  },
  markThreadRead: (threadId) => api.post(`/api/messages/${threadId}/read`),
  sendMessage: (threadId, payload = {}) => {
    const formData = new FormData();
    if (payload.body) formData.append("body", payload.body);
    if (payload.attachment) formData.append("attachment", payload.attachment);
    return api.postForm(`/api/messages/${threadId}/send`, formData);
  },
};

export default messagesService;
