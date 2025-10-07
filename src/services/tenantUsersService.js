/**
 * Tenant Users Service - Handle all tenant user operations
 * Includes CRUD operations for tenant users (sellers, kitchen, delivery)
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

const tenantUsersService = {
  // Get all tenant users
  async getTenantUsers(params = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.TENANT_USERS.LIST,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch tenant users: ${error.message}`);
    }
  },

  // Get single tenant user
  async getTenantUser(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.TENANT_USERS.GET, { id });
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch tenant user: ${error.message}`);
    }
  },

  // Create new tenant user
  async createTenantUser(userData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.TENANT_USERS.CREATE,
        userData
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to create tenant user: ${error.message}`);
    }
  },

  // Update tenant user
  async updateTenantUser(id, userData) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.TENANT_USERS.UPDATE, {
        id,
      });
      const response = await apiService.put(endpoint, userData);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to update tenant user: ${error.message}`);
    }
  },

  // Delete tenant user
  async deleteTenantUser(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.TENANT_USERS.DELETE, {
        id,
      });
      await apiService.delete(endpoint);
      return id;
    } catch (error) {
      throw new Error(`Failed to delete tenant user: ${error.message}`);
    }
  },
};

export default tenantUsersService;
