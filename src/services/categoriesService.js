/**
 * Categories Service - Handle all category operations
 * Includes CRUD operations for product categories
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

const categoriesService = {
  // Get all categories
  async getCategories(params = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.CATEGORIES.LIST,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  },

  // Get single category
  async getCategory(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.CATEGORIES.GET, { id });
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch category: ${error.message}`);
    }
  },

  // Create new category
  async createCategory(categoryData) {
    try {
      const completeCategoryData = {
        name: categoryData.name,
        description: categoryData.description || null,
      };

      const response = await apiService.post(
        API_ENDPOINTS.CATEGORIES.CREATE,
        completeCategoryData
      );
      return response.data || response;
    } catch (error) {
      console.error("Category creation error:", error);

      if (error.message.includes("400")) {
        throw new Error(
          "Invalid category data. Please check all required fields."
        );
      }

      throw new Error(`Failed to create category: ${error.message}`);
    }
  },

  // Update category
  async updateCategory(id, categoryData) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.CATEGORIES.UPDATE, {
        id,
      });
      const response = await apiService.put(endpoint, categoryData);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  },

  // Delete category
  async deleteCategory(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.CATEGORIES.DELETE, {
        id,
      });
      await apiService.delete(endpoint);
      return id;
    } catch (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  },
};

export default categoriesService;

