/**
 * Subcategories Service - Handle all subcategory operations
 * Includes CRUD operations for product subcategories
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

const subcategoriesService = {
  // Get all subcategories
  async getSubcategories(params = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.SUBCATEGORIES.LIST,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch subcategories: ${error.message}`);
    }
  },

  // Get single subcategory
  async getSubcategory(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.SUBCATEGORIES.GET, { id });
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch subcategory: ${error.message}`);
    }
  },

  // Create new subcategory
  async createSubcategory(subcategoryData) {
    try {
      const completeSubcategoryData = {
        name: subcategoryData.name,
        description: subcategoryData.description || null,
        category_id: subcategoryData.category_id,
      };

      const response = await apiService.post(
        API_ENDPOINTS.SUBCATEGORIES.CREATE,
        completeSubcategoryData
      );
      return response.data || response;
    } catch (error) {
      console.error("Subcategory creation error:", error);

      if (error.message.includes("400")) {
        throw new Error(
          "Invalid subcategory data. Please check all required fields."
        );
      }

      throw new Error(`Failed to create subcategory: ${error.message}`);
    }
  },

  // Update subcategory
  async updateSubcategory(id, subcategoryData) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.SUBCATEGORIES.UPDATE, {
        id,
      });
      const response = await apiService.put(endpoint, subcategoryData);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to update subcategory: ${error.message}`);
    }
  },

  // Delete subcategory
  async deleteSubcategory(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.SUBCATEGORIES.DELETE, {
        id,
      });
      await apiService.delete(endpoint);
      return id;
    } catch (error) {
      throw new Error(`Failed to delete subcategory: ${error.message}`);
    }
  },
};

export default subcategoriesService;

