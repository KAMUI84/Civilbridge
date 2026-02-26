const BASE_URL = ""; // proxy handles it

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message || "Request failed";
    throw new Error(message);
  }

  return data;
}
