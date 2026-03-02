
export function setSession({ token, user }) {
  if (token) localStorage.setItem("cb_token", token);
  if (user) localStorage.setItem("cb_user_profile", JSON.stringify(user));
  window.dispatchEvent(new Event("cb_ls_changed"));
}

export function logout() {
  localStorage.removeItem("cb_token");
  localStorage.removeItem("cb_user_profile");
  window.dispatchEvent(new Event("cb_ls_changed"));
}

export function getUser() {
  try {
    const raw = localStorage.getItem("cb_user_profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("cb_token");
}

export function isAuthed() {
  return Boolean(localStorage.getItem("cb_token"));
}

// Alias so login/register can import { setAuth } from this file
export const setAuth = setSession;

// Matches writeLS used in login/register
export function writeLS(key, value) {
  localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  window.dispatchEvent(new Event("cb_ls_changed"));
}