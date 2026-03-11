import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Helper to read cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export async function apiFetch(path, options = {}) {
  const csrfToken = getCookie('csrf');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // Include cookies
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      // Send CSRF token for state-changing methods
      ...(options.method && ['POST','PUT','PATCH','DELETE'].includes(options.method) && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
       useAuthStore.getState().logout();
    }
    const message = data?.message || "Request failed";
    throw new Error(message);
  }

  return data;
}

// Create a structured API client
export const api = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => apiFetch(path, { method: 'DELETE' })
};
