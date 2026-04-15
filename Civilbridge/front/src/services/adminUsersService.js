import { api } from "./apiClientService.js";

function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export const adminUsersService = {
  list(params = {}) {
    return api.get(`/api/admin/users${buildQuery(params)}`);
  },
  toggleActive(userId, isActive) {
    return api.put(`/api/admin/users/${userId}/toggle-active`, { is_active: isActive });
  },
};

export default adminUsersService;
