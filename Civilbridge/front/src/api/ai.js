import { apiFetch } from "../services/apiClientService.js";

export async function aiChat({ message, history }) {
  return apiFetch("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}