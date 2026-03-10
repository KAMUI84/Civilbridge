import { api } from "./apiClientService.js";

const GUEST_ID_KEY = "cb_guest_id";

function getOrCreateGuestId() {
    let id = localStorage.getItem(GUEST_ID_KEY);
    if (!id) {
        id = "guest_" + Math.random().toString(36).substr(2, 12);
        localStorage.setItem(GUEST_ID_KEY, id);
    }
    return id;
}

export const aiService = {
    // Guest chat (no auth required)
    guestChat: (message) => api.post("/api/ai/guest/chat", { message, guest_id: getOrCreateGuestId() }),

    // Authenticated chat
    getThreads: () => api.get("/api/ai/threads"),
    createThread: (data = {}) => api.post("/api/ai/threads", data),
    getMessages: (threadId) => api.get(`/api/ai/threads/${threadId}/messages`),
    sendMessage: (threadId, message) => api.post(`/api/ai/threads/${threadId}/chat`, { message }),
    deleteThread: (threadId) => api.delete(`/api/ai/threads/${threadId}`),

    // Budget analysis
    analyzeBudget: (data) => api.post("/api/budget/analyze", data),
    getStandardPlans: () => api.get("/api/budget/plans"),
};
