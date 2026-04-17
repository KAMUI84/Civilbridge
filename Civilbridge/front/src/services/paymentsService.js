import { api } from "./apiClientService.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

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

export const paymentsService = {
  history(params = {}) {
    return api.get(`/api/payments/history${buildQuery(params)}`);
  },
  getInvoiceUrl(transactionId) {
    return `${BASE_URL}/api/payments/invoice/${transactionId}`;
  },
};

export default paymentsService;
