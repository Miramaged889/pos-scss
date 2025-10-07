/**
 * Supplier Service - Handles all supplier-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

export const supplierService = {
  // Get all suppliers
  getSuppliers: async (params = {}) => {
    return await apiService.get(API_ENDPOINTS.SUPPLIERS.LIST, params);
  },

  // Get supplier by ID
  getSupplier: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIERS.GET, { id });
    return await apiService.get(endpoint);
  },

  // Create new supplier
  createSupplier: async (supplierData) => {
    return await apiService.post(API_ENDPOINTS.SUPPLIERS.CREATE, supplierData);
  },

  // Update supplier
  updateSupplier: async (id, supplierData) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIERS.UPDATE, { id });
    return await apiService.patch(endpoint, supplierData);
  },

  // Delete supplier
  deleteSupplier: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIERS.DELETE, { id });
    return await apiService.delete(endpoint);
  },

  // Purchase Order Methods
  // Get all purchase orders
  getPurchaseOrders: async (params = {}) => {
    return await apiService.get(API_ENDPOINTS.SUPPLIER_PURCHASE.LIST, params);
  },

  // Get purchase order by ID
  getPurchaseOrder: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIER_PURCHASE.GET, {
      id,
    });
    return await apiService.get(endpoint);
  },

  // Create new purchase order
  createPurchaseOrder: async (purchaseOrderData) => {
    return await apiService.post(
      API_ENDPOINTS.SUPPLIER_PURCHASE.CREATE,
      purchaseOrderData
    );
  },

  // Update purchase order
  updatePurchaseOrder: async (id, purchaseOrderData) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIER_PURCHASE.UPDATE, {
      id,
    });

    // Ensure data is properly formatted
    // For updates, we typically only need to send the fields that can be updated
    // Remove items array as it's likely not expected in update requests
    const { items: _, ...updateFields } = purchaseOrderData;

    const cleanData = {
      ...updateFields,
      // Ensure all string values are trimmed
      notes: purchaseOrderData.notes?.trim() || "",
    };

    return await apiService.patch(endpoint, cleanData);
  },

  // Delete purchase order
  deletePurchaseOrder: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIER_PURCHASE.DELETE, {
      id,
    });
    return await apiService.delete(endpoint);
  },

  // Get items purchased from a specific supplier
  getSupplierItems: async (supplierId) => {
    try {
      // Get all purchase orders for this supplier
      const response = await apiService.get(
        API_ENDPOINTS.SUPPLIER_PURCHASE.LIST,
        {
          supplier: supplierId,
        }
      );
      const purchaseOrders = response.results || response || [];

      // Extract all items from purchase orders with their IDs
      const allItems = [];

      purchaseOrders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            if (item.item_name && item.item_name.trim()) {
              allItems.push({
                id:
                  item.id ||
                  item.purchase_item_id ||
                  `${order.id}_${item.item_name}`, // Use item ID or create a unique identifier
                name: item.item_name,
                lastPrice: item.unit_price || 0,
                lastQuantity: item.quantity || 1,
                purchaseOrderId: order.id,
                purchaseOrderDate: order.created_at || order.expected_delivery,
              });
            }
          });
        }
      });

      // Remove duplicates based on item name, keeping the most recent one
      const itemsMap = new Map();
      allItems.forEach((item) => {
        const itemKey = item.name.toLowerCase();
        if (!itemsMap.has(itemKey)) {
          itemsMap.set(itemKey, item);
        } else {
          // Keep the most recent item based on purchase order date
          const existing = itemsMap.get(itemKey);
          if (item.purchaseOrderDate && existing.purchaseOrderDate) {
            if (
              new Date(item.purchaseOrderDate) >
              new Date(existing.purchaseOrderDate)
            ) {
              itemsMap.set(itemKey, item);
            }
          }
        }
      });

      // Convert map to array
      return Array.from(itemsMap.values());
    } catch (error) {
      console.error("Error fetching supplier items:", error);
      return [];
    }
  },

  // Supplier Returns Methods
  // Get all supplier returns
  getSupplierReturns: async (params = {}) => {
    return await apiService.get(API_ENDPOINTS.SUPPLIER_RETURNS.LIST, params);
  },

  // Get supplier return by ID
  getSupplierReturn: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIER_RETURNS.GET, {
      id,
    });
    return await apiService.get(endpoint);
  },

  // Create new supplier return
  createSupplierReturn: async (returnData) => {
    return await apiService.post(
      API_ENDPOINTS.SUPPLIER_RETURNS.CREATE,
      returnData
    );
  },

  // Update supplier return
  updateSupplierReturn: async (id, returnData) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIER_RETURNS.UPDATE, {
      id,
    });
    return await apiService.patch(endpoint, returnData);
  },

  // Delete supplier return
  deleteSupplierReturn: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIER_RETURNS.DELETE, {
      id,
    });
    return await apiService.delete(endpoint);
  },
};

export default supplierService;
