/**
 * Supplier Service - Handles all supplier-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

export const supplierService = {
  // Get all suppliers
  getSuppliers: async (params = {}) => {
    return await apiService.get(API_ENDPOINTS.SUPPLIERS.LIST, params);
  },

  // Get supplier by ID
  getSupplier: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIERS.GET, { id });
    return await apiService.get(endpoint);
  },

  // Create new supplier
  createSupplier: async (supplierData) => {
    return await apiService.post(API_ENDPOINTS.SUPPLIERS.CREATE, supplierData);
  },

  // Update supplier
  updateSupplier: async (id, supplierData) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIERS.UPDATE, { id });
    return await apiService.put(endpoint, supplierData);
  },

  // Delete supplier
  deleteSupplier: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIERS.DELETE, { id });
    return await apiService.delete(endpoint);
  },
};

export default supplierService;
