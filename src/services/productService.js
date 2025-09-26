/**
 * Product Service - Handles all product-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

export const productService = {
  // Get all products
  getProducts: async (params = {}) => {
    return await apiService.get(API_ENDPOINTS.PRODUCTS.LIST, params);
  },

  // Get product by ID
  getProduct: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.PRODUCTS.GET, { id });
    return await apiService.get(endpoint);
  },

  // Create new product
  createProduct: async (productData) => {
    return await apiService.post(API_ENDPOINTS.PRODUCTS.CREATE, productData);
  },

  // Update product
  updateProduct: async (id, productData) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.PRODUCTS.UPDATE, { id });
    return await apiService.put(endpoint, productData);
  },

  // Delete product
  deleteProduct: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.PRODUCTS.DELETE, { id });
    return await apiService.delete(endpoint);
  },
};

export default productService;
