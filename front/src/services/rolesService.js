import { api } from "./apiClientService.js";

export const rolesService = {
  getUserRole: (userId) => api.get(`/api/roles/${userId}`),
  assignRole: ({ userId, role }) => api.post("/api/roles/assign", { userId, role }),
};

export default rolesService;
