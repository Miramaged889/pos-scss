/**
 * Return Service - Handles all return-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

// Helper function to map database schema to frontend format
const mapDbToFrontend = (dbReturn, customers = [], orders = []) => {
  // Find customer details
  const customer = customers.find((c) => c.id === dbReturn.customer);

  // Find order details
  const order = orders.find((o) => o.id === dbReturn.order_item);

  return {
    id: dbReturn.id,
    customerId: dbReturn.customer,
    customerName:
      customer?.customer_name ||
      customer?.name ||
      `Customer ${dbReturn.customer}`,
    orderItemId: dbReturn.order_item,
    orderId: order?.id || dbReturn.order_item,
    productName: order?.product_name || "Unknown Product",
    quantity: dbReturn.quantity,
    reason: dbReturn.return_reason,
    returnReason: dbReturn.return_reason,
    description: dbReturn.return_reason,
    returnDate: dbReturn.created_at,
    createdAt: dbReturn.created_at,
    refundAmount: dbReturn.refund_amount || 0,
  };
};

// Helper function to map frontend format to database schema
const mapFrontendToDb = (frontendReturn) => {
  return {
    customer: frontendReturn.customerId,
    order_item: frontendReturn.orderItemId || frontendReturn.orderId,
    quantity: frontendReturn.quantity,
    return_reason: frontendReturn.reason || frontendReturn.returnReason,
  };
};

export const returnService = {
  // Get all returns with customer and order details
  getReturns: async (params = {}) => {
    try {
      // Fetch returns
      const returns = await apiService.get(
        API_ENDPOINTS.CUSTOMER_RETURNS.LIST,
        params
      );

      // Fetch customers
      const customers = await apiService.get(API_ENDPOINTS.CUSTOMERS.LIST);

      // Fetch orders
      const orders = await apiService.get(API_ENDPOINTS.ORDERS.LIST);

      // Map returns to frontend format
      const returnsList = Array.isArray(returns) ? returns : returns.data || [];
      const customersList = Array.isArray(customers)
        ? customers
        : customers.data || [];
      const ordersList = Array.isArray(orders) ? orders : orders.data || [];

      return returnsList.map((ret) =>
        mapDbToFrontend(ret, customersList, ordersList)
      );
    } catch (error) {
      console.error("Error fetching returns:", error);
      throw error;
    }
  },

  // Get return by ID
  getReturn: async (id) => {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.CUSTOMER_RETURNS.GET, {
        id,
      });
      const dbReturn = await apiService.get(endpoint);

      // Fetch customer and order details
      const customers = await apiService.get(API_ENDPOINTS.CUSTOMERS.LIST);
      const orders = await apiService.get(API_ENDPOINTS.ORDERS.LIST);

      const customersList = Array.isArray(customers)
        ? customers
        : customers.data || [];
      const ordersList = Array.isArray(orders) ? orders : orders.data || [];

      return mapDbToFrontend(dbReturn, customersList, ordersList);
    } catch (error) {
      console.error("Error fetching return:", error);
      throw error;
    }
  },

  // Create new return
  createReturn: async (returnData) => {
    try {
      const dbData = mapFrontendToDb(returnData);
      console.log("Creating return with data:", dbData);

      const response = await apiService.post(
        API_ENDPOINTS.CUSTOMER_RETURNS.CREATE,
        dbData
      );

      // Fetch customer and order details for the response
      const customers = await apiService.get(API_ENDPOINTS.CUSTOMERS.LIST);
      const orders = await apiService.get(API_ENDPOINTS.ORDERS.LIST);

      const customersList = Array.isArray(customers)
        ? customers
        : customers.data || [];
      const ordersList = Array.isArray(orders) ? orders : orders.data || [];

      return mapDbToFrontend(response, customersList, ordersList);
    } catch (error) {
      console.error("Error creating return:", error);
      throw error;
    }
  },

  // Update return
  updateReturn: async (id, returnData) => {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.CUSTOMER_RETURNS.UPDATE, {
        id,
      });
      const dbData = mapFrontendToDb(returnData);
      console.log("Updating return with data:", dbData);

      const response = await apiService.patch(endpoint, dbData);

      // Fetch customer and order details for the response
      const customers = await apiService.get(API_ENDPOINTS.CUSTOMERS.LIST);
      const orders = await apiService.get(API_ENDPOINTS.ORDERS.LIST);

      const customersList = Array.isArray(customers)
        ? customers
        : customers.data || [];
      const ordersList = Array.isArray(orders) ? orders : orders.data || [];

      return mapDbToFrontend(response, customersList, ordersList);
    } catch (error) {
      console.error("Error updating return:", error);
      throw error;
    }
  },

  // Delete return
  deleteReturn: async (id) => {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.CUSTOMER_RETURNS.DELETE, {
        id,
      });
      return await apiService.delete(endpoint);
    } catch (error) {
      console.error("Error deleting return:", error);
      throw error;
    }
  },
};

export default returnService;
