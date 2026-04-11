// Thin delegation layer — all calls go through apiClientService,
// which is the single authoritative HTTP client (credentials + CSRF).
export { apiFetch as api } from "../services/apiClientService.js";
