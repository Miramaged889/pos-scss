/**
 * Order Service - Handles all order-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

export const orderService = {
  // Get all orders
  getOrders: async (params = {}) => {
    return await apiService.get(API_ENDPOINTS.ORDERS.LIST, params);
  },

  // Get order by ID
  getOrder: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.ORDERS.GET, { id });
    return await apiService.get(endpoint);
  },

  // Create new order
  createOrder: async (orderData) => {
    return await apiService.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
  },

  // Update order
  updateOrder: async (id, orderData) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.ORDERS.UPDATE, { id });
    return await apiService.put(endpoint, orderData);
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.ORDERS.UPDATE_STATUS, {
      id,
    });
    return await apiService.patch(endpoint, { status });
  },

  // Delete order
  deleteOrder: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.ORDERS.DELETE, { id });
    return await apiService.delete(endpoint);
  },
};

export default orderService;
