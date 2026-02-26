import { apiFetch } from "./apiClientService";

export const registerUser = async (payload) => {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const loginUser = async (payload) => {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};