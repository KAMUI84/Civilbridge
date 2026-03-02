const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function aiChat({ message, history }) {
  const res = await fetch(`${API_BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "AI request failed");
  return data; 
}