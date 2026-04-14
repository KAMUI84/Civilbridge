const KEYS = {
  FAV_LISTINGS: "cb_fav_listings",
  FAV_PLANS: "cb_fav_plans",
  SAVED_ESTIMATES: "cb_saved_estimates",
  LEADS: "cb_leads",
  PROJECT_DRAFTS: "cb_project_drafts",
  EXPERT_REQUESTS: "cb_expert_requests",
};

export function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("cb_ls_changed"));
}

export function toggleInSet(key, id) {
  const arr = readLS(key, []);
  const exists = arr.includes(id);
  const next = exists ? arr.filter((x) => x !== id) : [...arr, id];
  writeLS(key, next);
  return next;
}

export { KEYS };

