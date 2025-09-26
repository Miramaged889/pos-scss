/**
 * Return Service - Handles all return-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

export const returnService = {
  // Get all returns
  getReturns: async (params = {}) => {
    return await apiService.get(API_ENDPOINTS.RETURNS.LIST, params);
  },

  // Get return by ID
  getReturn: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.RETURNS.GET, { id });
    return await apiService.get(endpoint);
  },

  // Create new return
  createReturn: async (returnData) => {
    return await apiService.post(API_ENDPOINTS.RETURNS.CREATE, returnData);
  },

  // Update return
  updateReturn: async (id, returnData) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.RETURNS.UPDATE, { id });
    return await apiService.put(endpoint, returnData);
  },

  // Delete return
  deleteReturn: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.RETURNS.DELETE, { id });
    return await apiService.delete(endpoint);
  },
};

export default returnService;
