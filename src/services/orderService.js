/**
 * Order Service - Handles all order-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

// Helper function to map database schema to frontend format
const mapDbToFrontend = (dbOrder) => {
  return {
    id: dbOrder.id,
    customer: dbOrder.customer_name || `Customer #${dbOrder.customer}`,
    customerId: dbOrder.customer,
    phone: dbOrder.customer_phone || "",
    sellerId: dbOrder.seller,
    status: dbOrder.status || "pending",
    payment_type: dbOrder.payment_type || "cash",
    delivery_option: dbOrder.delivery_option || "pickup",
    deliveryAddress: dbOrder.delivery_address || "",
    createdAt: dbOrder.date || dbOrder.created_at,
    items: dbOrder.items?.length || 0,
    products:
      dbOrder.items?.map((item) => ({
        id: item.product_id,
        name: item.product_name || item.product?.arabic_name || "",
        nameEn: item.product?.english_name || "",
        quantity: item.quantity,
        price: parseFloat(item.product?.price || item.price || 0),
      })) || [],
    total_amount: parseFloat(dbOrder.total_amount || 0),
    discount: parseFloat(dbOrder.discount || 0),
    subtotal: parseFloat(dbOrder.subtotal || 0),
    kitchenNotes: dbOrder.kitchen_notes || "",
    generalNotes: dbOrder.notes || "",
    priority: dbOrder.priority || "normal",
  };
};

// Helper function to map frontend format to database schema
const mapFrontendToDb = (frontendOrder, sellerId) => {
  return {
    customer: frontendOrder.customerId || frontendOrder.customer,
    seller: sellerId,
    status: frontendOrder.status || "pending",
    payment_type: frontendOrder.payment_type || "cash",
    delivery_option: frontendOrder.delivery_option || "pickup",
    delivery_address: frontendOrder.deliveryAddress || "",
    items:
      frontendOrder.products?.map((product) => ({
        product_id: product.id,
        quantity: product.quantity,
      })) ||
      frontendOrder.items ||
      [],
    discount: frontendOrder.discount || 0,
    subtotal: frontendOrder.subtotal || 0,
    kitchen_notes: frontendOrder.kitchenNotes || "",
    notes: frontendOrder.generalNotes || frontendOrder.notes || "",
    priority: frontendOrder.priority || "normal",
  };
};

export const orderService = {
  // Get all orders
  getOrders: async (params = {}) => {
    const response = await apiService.get(API_ENDPOINTS.ORDERS.LIST, params);
    const orders = Array.isArray(response)
      ? response
      : response.results || response.data || [];
    return orders.map(mapDbToFrontend);
  },

  // Get order by ID
  getOrder: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.ORDERS.GET, { id });
    const response = await apiService.get(endpoint);
    return mapDbToFrontend(response);
  },

  // Create new order
  createOrder: async (orderData, sellerId) => {
    const dbData = mapFrontendToDb(orderData, sellerId);

    // Validate that items have product_id
    if (!dbData.items || dbData.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    const invalidItems = dbData.items.filter(
      (item) => !item.product_id || !item.quantity
    );
    if (invalidItems.length > 0) {
      console.error("Invalid items found:", invalidItems);
      throw new Error("All items must have a valid product ID and quantity");
    }

    console.log("Creating order with data:", JSON.stringify(dbData, null, 2));
    const response = await apiService.post(API_ENDPOINTS.ORDERS.CREATE, dbData);
    return mapDbToFrontend(response);
  },

  // Update order
  updateOrder: async (id, orderData, sellerId) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.ORDERS.UPDATE, { id });
    const dbData = mapFrontendToDb(orderData, sellerId);
    const response = await apiService.patch(endpoint, dbData);
    return mapDbToFrontend(response);
  },

  // Update order status
  updateOrderStatus: async (id, updateData) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.ORDERS.UPDATE, { id });

    // Handle both old format (status string) and new format (updateData object)
    const dataToSend =
      typeof updateData === "string" ? { status: updateData } : updateData;

    const response = await apiService.patch(endpoint, dataToSend);
    return mapDbToFrontend(response);
  },

  // Delete order
  deleteOrder: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.ORDERS.DELETE, { id });
    await apiService.delete(endpoint);
    return id;
  },
};

export default orderService;
