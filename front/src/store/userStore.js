const USER_KEY = "cb_user";

export function isAuthed() {
  return Boolean(localStorage.getItem(USER_KEY));
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth({ token, user }) {
  // Token is stored server-side in an httpOnly cookie; keep only user profile.
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("cb_auth_changed"));
}

export function clearAuth() {
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("cb_auth_changed"));
}