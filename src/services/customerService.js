/**
 * Customer Service - Handles all customer-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

export const customerService = {
  // Get all customers
  getCustomers: async (params = {}) => {
    return await apiService.get(API_ENDPOINTS.CUSTOMERS.LIST, params);
  },

  // Get customer by ID
  getCustomer: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.CUSTOMERS.GET, { id });
    return await apiService.get(endpoint);
  },

  // Create new customer
  createCustomer: async (customerData) => {
    return await apiService.post(API_ENDPOINTS.CUSTOMERS.CREATE, customerData);
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.CUSTOMERS.UPDATE, { id });
    return await apiService.put(endpoint, customerData);
  },

  // Delete customer
  deleteCustomer: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.CUSTOMERS.DELETE, { id });
    return await apiService.delete(endpoint);
  },
};

export default customerService;
