/**
 * Branches Service - Handle all branch operations
 * Includes CRUD operations for branches
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

const branchesService = {
  // Get all branches
  async getBranches(params = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.BRANCHES.LIST,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch branches: ${error.message}`);
    }
  },

  // Get single branch
  async getBranch(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.BRANCHES.GET, { id });
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch branch: ${error.message}`);
    }
  },

  // Create new branch
  async createBranch(branchData) {
    try {
      // Ensure all required fields are present
      const completeBranchData = {
        name: branchData.name,
        contact_email: branchData.contact_email,
        contact_phone: branchData.contact_phone,
        status: branchData.status || "active", // Default status
        // Add any other required fields that the API expects
        ...branchData,
      };


      const response = await apiService.post(
        API_ENDPOINTS.BRANCHES.CREATE,
        completeBranchData
      );
      return response.data || response;
    } catch (error) {
      console.error("Branch creation error:", error);

      // Handle specific error cases
      if (error.message.includes("400")) {
        throw new Error(
          "Invalid branch data. Please check all required fields."
        );
      } else if (error.message.includes("Number of branches exceeded")) {
        throw new Error(
          "Number of branches exceeded. Please upgrade your plan."
        );
      }

      throw new Error(`Failed to create branch: ${error.message}`);
    }
  },

  // Update branch
  async updateBranch(id, branchData) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.BRANCHES.UPDATE, {
        id,
      });
      const response = await apiService.put(endpoint, branchData);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to update branch: ${error.message}`);
    }
  },

  // Delete branch
  async deleteBranch(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.BRANCHES.DELETE, {
        id,
      });
      await apiService.delete(endpoint);
      return id;
    } catch (error) {
      throw new Error(`Failed to delete branch: ${error.message}`);
    }
  },
};

export default branchesService;
