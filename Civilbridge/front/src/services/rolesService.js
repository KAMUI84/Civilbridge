import { api } from "./apiClientService.js";

export const rolesService = {
  getUserRole: (userId) => api.get(`/api/roles/${userId}`),
  assignRole: ({ userId, role, publishExpertNow }) =>
    api.post("/api/roles/assign", { userId, role, publishExpertNow }),
};

export default rolesService;
