/**
 * Payment Service - Handles all payment-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

export const paymentService = {
  // Get all payments
  getPayments: async (params = {}) => {
    return await apiService.get(API_ENDPOINTS.PAYMENTS.LIST, params);
  },

  // Get payment by ID
  getPayment: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.PAYMENTS.GET, { id });
    return await apiService.get(endpoint);
  },

  // Create new payment
  createPayment: async (paymentData) => {
    return await apiService.post(API_ENDPOINTS.PAYMENTS.CREATE, paymentData);
  },

  // Update payment
  updatePayment: async (id, paymentData) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.PAYMENTS.UPDATE, { id });
    return await apiService.put(endpoint, paymentData);
  },

  // Delete payment
  deletePayment: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.PAYMENTS.DELETE, { id });
    return await apiService.delete(endpoint);
  },
};

export default paymentService;
