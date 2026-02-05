/**
 * Return Service - Handles all return-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

// Helper function to map database schema to frontend format
const mapDbToFrontend = (
  dbReturn,
  customers = [],
  orders = [],
  products = []
) => {
  // Find customer details - try multiple field names
  const customerId = dbReturn.customer || dbReturn.customer_id || dbReturn.customerId;
  const customer = customers.find((c) => 
    c.id === customerId || 
    c.id === parseInt(customerId) ||
    parseInt(c.id) === parseInt(customerId)
  );

  // Find order details - try multiple field names (order_id_display is the API format)
  const orderId = dbReturn.order_id_display || dbReturn.order_id || dbReturn.orderId || dbReturn.order_item || dbReturn.order_item_id;
  const order = orders.find((o) => 
    o.id === orderId || 
    o.id === parseInt(orderId) ||
    parseInt(o.id) === parseInt(orderId)
  );

  // Find product details - try multiple field names (product_id_display is the API format)
  const productId = dbReturn.product_id_display || dbReturn.product_id || dbReturn.productId || dbReturn.product;
  const productIdNum = productId ? parseInt(productId) : null;
  
  // Find product in products list - normalize IDs for comparison
  const product = productIdNum !== null ? products.find((p) => {
    const pId = parseInt(p.id);
    return pId === productIdNum || p.id === productIdNum || p.id === productId;
  }) : null;

  // Get product name from product object - API uses arabic_name and english_name
  let productName = product?.arabic_name || product?.english_name || product?.name || product?.nameEn || product?.name_ar || product?.name_en;
  
  // If product not found in products list, try to get it from order items
  if (!productName && order && productIdNum !== null) {
    // Check if order has items array
    if (order.items && Array.isArray(order.items)) {
      const orderItem = order.items.find((item) => {
        const itemProductId = parseInt(item.product_id || item.productId || item.product || 0);
        return itemProductId === productIdNum;
      });
      if (orderItem) {
        // Try to find the product from the order item's product_id
        const orderItemProductId = parseInt(orderItem.product_id || orderItem.productId || orderItem.product || 0);
        const orderProduct = products.find((p) => {
          const pId = parseInt(p.id);
          return pId === orderItemProductId;
        });
        productName = orderProduct?.arabic_name || orderProduct?.english_name || orderProduct?.name || orderProduct?.nameEn || orderProduct?.name_ar || orderProduct?.name_en 
          || orderItem.product_name || orderItem.name || orderItem.productName;
      }
    }
    // Check if order has products array
    else if (order.products && Array.isArray(order.products)) {
      const orderProduct = order.products.find((p) => {
        const pId = parseInt(p.id || p.product_id || 0);
        return pId === productIdNum;
      });
      if (orderProduct) {
        // Try to find full product details
        const orderProductId = parseInt(orderProduct.id || orderProduct.product_id || 0);
        const fullProduct = products.find((p) => {
          const pId = parseInt(p.id);
          return pId === orderProductId;
        });
        productName = fullProduct?.arabic_name || fullProduct?.english_name || fullProduct?.name || fullProduct?.nameEn || fullProduct?.name_ar || fullProduct?.name_en
          || orderProduct.arabic_name || orderProduct.english_name || orderProduct.name || orderProduct.nameEn || orderProduct.name_ar || orderProduct.name_en;
      }
    }
    // Check if order has direct product_id field (single product order)
    else if (order.product_id || order.productId) {
      const orderProductId = parseInt(order.product_id || order.productId);
      if (orderProductId === productIdNum) {
        const fullProduct = products.find((p) => {
          const pId = parseInt(p.id);
          return pId === productIdNum;
        });
        productName = fullProduct?.arabic_name || fullProduct?.english_name || fullProduct?.name || fullProduct?.nameEn || fullProduct?.name_ar || fullProduct?.name_en
          || order.product_name || order.productName;
      }
    }
  }
  
  // Final fallback - if still no name, try to get from return data itself
  if (!productName && dbReturn.product_name) {
    productName = dbReturn.product_name;
  }

  // Get product names in both languages
  const productArabicName = product?.arabic_name || product?.name_ar || product?.name || "";
  const productEnglishName = product?.english_name || product?.name_en || product?.nameEn || product?.name || "";
  
  // Default product name (use Arabic if available, otherwise English, otherwise fallback)
  const defaultProductName = productArabicName || productEnglishName || productName || `Product ${productId}` || "Unknown Product";

  return {
    id: dbReturn.id,
    customerId: customerId,
    customerName:
      customer?.customer_name ||
      customer?.name ||
      `Customer ${customerId}`,
    orderItemId: dbReturn.order_item || dbReturn.order_item_id || orderId,
    orderId: order?.id || orderId,
    productId: productId,
    productName: defaultProductName, // Keep for backward compatibility
    productArabicName: productArabicName || defaultProductName,
    productEnglishName: productEnglishName || defaultProductName,
    quantity: dbReturn.quantity,
    reason: dbReturn.return_reason || dbReturn.reason,
    returnReason: dbReturn.return_reason || dbReturn.reason,
    description: dbReturn.return_reason || dbReturn.reason || dbReturn.description,
    returnDate: dbReturn.created_at || dbReturn.returnDate || dbReturn.createdAt,
    createdAt: dbReturn.created_at || dbReturn.createdAt,
    refundAmount: dbReturn.refund_amount || dbReturn.refundAmount || 0,
  };
};

// Helper function to map frontend format to new API schema
const mapFrontendToDb = (frontendReturn) => {
  // Check if this is the new format with items array
  if (frontendReturn.items && Array.isArray(frontendReturn.items)) {
    // New format: { order_id, items: [{ product_id, quantity, return_reason }] }
    const orderId = frontendReturn.order_id || frontendReturn.orderId;
    
    if (!orderId) {
      throw new Error("order_id is required");
    }

    const mappedData = {
      order_id: parseInt(orderId),
      items: frontendReturn.items.map((item) => ({
        product_id: parseInt(item.product_id || item.productId),
        quantity: parseInt(item.quantity),
        return_reason: item.return_reason || item.reason || "No reason provided",
      })),
    };

    return mappedData;
  }

  // Legacy format: single item return (convert to new format)
  const orderId = frontendReturn.orderId || frontendReturn.order_id;
  
  if (!orderId) {
    throw new Error("order_id is required");
  }

  if (!frontendReturn.productId && !frontendReturn.product_id) {
    throw new Error("product_id is required");
  }

  const mappedData = {
    order_id: parseInt(orderId),
    items: [
      {
        product_id: parseInt(frontendReturn.productId || frontendReturn.product_id),
        quantity: parseInt(frontendReturn.quantity || 1),
        return_reason:
          frontendReturn.reason ||
          frontendReturn.returnReason ||
          frontendReturn.return_reason ||
          frontendReturn.description ||
          "No reason provided",
      },
    ],
  };

  return mappedData;
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

      // Fetch products
      const products = await apiService.get(API_ENDPOINTS.PRODUCTS.LIST);

      // Map returns to frontend format
      const returnsList = Array.isArray(returns) ? returns : returns.data || [];
      const customersList = Array.isArray(customers)
        ? customers
        : customers.data || [];
      const ordersList = Array.isArray(orders) ? orders : orders.data || [];
      const productsList = Array.isArray(products)
        ? products
        : products.data || [];


      const mappedReturns = returnsList.map((ret) => {
        const mapped = mapDbToFrontend(ret, customersList, ordersList, productsList);
        // Log if product name is still unknown
        if (!mapped.productName || mapped.productName === "Unknown Product" || mapped.productName.startsWith("Product ")) {
          console.warn("Could not find product name for return:", mapped.id, mapped.productId, ret);
        }
        return mapped;
      });

      return mappedReturns;
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

      // Fetch customer, order, and product details
      const customers = await apiService.get(API_ENDPOINTS.CUSTOMERS.LIST);
      const orders = await apiService.get(API_ENDPOINTS.ORDERS.LIST);
      const products = await apiService.get(API_ENDPOINTS.PRODUCTS.LIST);

      const customersList = Array.isArray(customers)
        ? customers
        : customers.data || [];
      const ordersList = Array.isArray(orders) ? orders : orders.data || [];
      const productsList = Array.isArray(products)
        ? products
        : products.data || [];

      return mapDbToFrontend(dbReturn, customersList, ordersList, productsList);
    } catch (error) {
      console.error("Error fetching return:", error);
      throw error;
    }
  },

  // Create new return
  createReturn: async (returnData) => {
    try {
      const dbData = mapFrontendToDb(returnData);

      const response = await apiService.post(
        API_ENDPOINTS.CUSTOMER_RETURNS.CREATE,
        dbData
      );

      // Fetch customer, order, and product details for the response
      const customers = await apiService.get(API_ENDPOINTS.CUSTOMERS.LIST);
      const orders = await apiService.get(API_ENDPOINTS.ORDERS.LIST);
      const products = await apiService.get(API_ENDPOINTS.PRODUCTS.LIST);

      const customersList = Array.isArray(customers)
        ? customers
        : customers.data || [];
      const ordersList = Array.isArray(orders) ? orders : orders.data || [];
      const productsList = Array.isArray(products)
        ? products
        : products.data || [];

      // Handle response - could be single return or array of returns
      if (Array.isArray(response)) {
        // If response is an array, map each return
        return response.map((ret) =>
          mapDbToFrontend(ret, customersList, ordersList, productsList)
        );
      } else if (response.data && Array.isArray(response.data)) {
        // If response has data array
        return response.data.map((ret) =>
          mapDbToFrontend(ret, customersList, ordersList, productsList)
        );
      } else {
        // Single return
        return mapDbToFrontend(response, customersList, ordersList, productsList);
      }
    } catch (error) {
      console.error("Error creating return:", error);
      console.error("Error details:", error.response?.data || error.message);
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

      const response = await apiService.patch(endpoint, dbData);

      // Fetch customer, order, and product details for the response
      const customers = await apiService.get(API_ENDPOINTS.CUSTOMERS.LIST);
      const orders = await apiService.get(API_ENDPOINTS.ORDERS.LIST);
      const products = await apiService.get(API_ENDPOINTS.PRODUCTS.LIST);

      const customersList = Array.isArray(customers)
        ? customers
        : customers.data || [];
      const ordersList = Array.isArray(orders) ? orders : orders.data || [];
      const productsList = Array.isArray(products)
        ? products
        : products.data || [];

      return mapDbToFrontend(response, customersList, ordersList, productsList);
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
