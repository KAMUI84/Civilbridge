import { getToken } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();

  const isFormData = body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  }
  return data;
}