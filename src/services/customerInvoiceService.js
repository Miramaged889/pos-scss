/**
 * Customer Invoice Service - Handles all customer invoice-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

// Helper function to map database schema to frontend format
const mapDbToFrontend = (dbInvoice) => {
  const subTotal =
    dbInvoice.items?.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price || 0),
      0
    ) || 0;

  const total = dbInvoice.total || subTotal;

  return {
    id: dbInvoice.id,
    customerName: dbInvoice.customer_name,
    customerPhone: dbInvoice.customer_phone,
    notes: dbInvoice.notes,
    items: dbInvoice.items || [],
    status: dbInvoice.status || "pending",
    createdAt: dbInvoice.created_at,
    updatedAt: dbInvoice.updated_at,
    issueDate: dbInvoice.issue_date,
    dueDate: dbInvoice.due_date,
    subTotal,
    total,
  };
};

// Helper function to map frontend format to database schema
const mapFrontendToDb = (
  frontendInvoice,
  isPartialUpdate = false,
  excludeItems = false
) => {
  const dbData = {};

  // Only include fields that are actually provided and not undefined/null
  if (
    frontendInvoice.customerName !== undefined &&
    frontendInvoice.customerName !== null
  ) {
    dbData.customer_name = frontendInvoice.customerName;
  }

  if (
    frontendInvoice.customerPhone !== undefined &&
    frontendInvoice.customerPhone !== null
  ) {
    dbData.customer_phone = frontendInvoice.customerPhone;
  }

  if (frontendInvoice.notes !== undefined) {
    dbData.notes = frontendInvoice.notes || "";
  }

  if (frontendInvoice.status !== undefined) {
    dbData.status = frontendInvoice.status || "pending";
  }

  // Handle items array carefully - only include if it exists and has valid items
  if (
    !excludeItems &&
    frontendInvoice.items &&
    Array.isArray(frontendInvoice.items)
  ) {
    const validItems = frontendInvoice.items
      .filter(
        (item) =>
          item &&
          item.productId &&
          item.productId !== "" &&
          item.productId !== null
      ) // Filter out invalid items
      .map((item) => ({
        product_id: item.productId,
        quantity: item.quantity || 1,
        unit_price: item.unitPrice || 0,
      }));

    // Only include items if there are valid ones, or if it's not a partial update
    if (validItems.length > 0 || !isPartialUpdate) {
      dbData.items = validItems;
    }
  }

  // Handle dates if provided
  if (frontendInvoice.issueDate) {
    dbData.issue_date = frontendInvoice.issueDate;
  }

  if (frontendInvoice.dueDate) {
    dbData.due_date = frontendInvoice.dueDate;
  }

  // Handle totals if provided
  if (frontendInvoice.total !== undefined) {
    dbData.total = frontendInvoice.total;
  }

  return dbData;
};

export const customerInvoiceService = {
  // Get all customer invoices
  getCustomerInvoices: async (params = {}) => {
    const response = await apiService.get(
      API_ENDPOINTS.CUSTOMER_INVOICES.LIST,
      params
    );

    // Map the response data if it's an array
    if (Array.isArray(response)) {
      return response.map(mapDbToFrontend);
    }

    // If response has a data property, map that
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(mapDbToFrontend);
    }

    return response;
  },

  // Get customer invoice by ID
  getCustomerInvoice: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.CUSTOMER_INVOICES.GET, {
      id,
    });
    const response = await apiService.get(endpoint);
    return mapDbToFrontend(response);
  },

  // Create new customer invoice
  createCustomerInvoice: async (invoiceData) => {
    const dbData = mapFrontendToDb(invoiceData);
    const response = await apiService.post(
      API_ENDPOINTS.CUSTOMER_INVOICES.CREATE,
      dbData
    );
    return mapDbToFrontend(response);
  },

  // Update customer invoice
  updateCustomerInvoice: async (id, invoiceData) => {
    try {
      const endpoint = replaceUrlParams(
        API_ENDPOINTS.CUSTOMER_INVOICES.UPDATE,
        {
          id,
        }
      );

      // First try with basic fields only (like Postman)
      const basicFields = {};
      if (invoiceData.customerName !== undefined) {
        basicFields.customer_name = invoiceData.customerName;
      }
      if (invoiceData.customerPhone !== undefined) {
        basicFields.customer_phone = invoiceData.customerPhone;
      }
      if (invoiceData.notes !== undefined) {
        basicFields.notes = invoiceData.notes || "";
      }
      if (invoiceData.status !== undefined) {
        basicFields.status = invoiceData.status || "pending";
      }
      if (invoiceData.issueDate !== undefined) {
        basicFields.issue_date = invoiceData.issueDate;
      }
      if (invoiceData.dueDate !== undefined) {
        basicFields.due_date = invoiceData.dueDate;
      }
      if (invoiceData.total !== undefined) {
        basicFields.total = invoiceData.total;
      }

      console.log("Basic fields being sent:", basicFields);

      try {
        // Try basic update first
        const response = await apiService.patch(endpoint, basicFields);
        console.log("Basic update response:", response);
        return mapDbToFrontend(response);
      } catch (basicError) {
        console.log(
          "Basic update failed, trying without items:",
          basicError.message
        );

        try {
          // Try update without items
          const dbDataNoItems = mapFrontendToDb(invoiceData, true, true);

          const response = await apiService.patch(endpoint, dbDataNoItems);
          return mapDbToFrontend(response);
        } catch (noItemsError) {
          console.log(
            "Update without items failed, trying full update:",
            noItemsError.message
          );

          // If that fails, try full update
          const dbData = mapFrontendToDb(invoiceData, true);

          const response = await apiService.patch(endpoint, dbData);
          return mapDbToFrontend(response);
        }
      }
    } catch (error) {
      console.error("Error in updateCustomerInvoice:", error);
      throw error;
    }
  },

  // Simple update for specific fields (like Postman example)
  updateCustomerInvoiceFields: async (id, fields) => {
    try {
      const endpoint = replaceUrlParams(
        API_ENDPOINTS.CUSTOMER_INVOICES.UPDATE,
        {
          id,
        }
      );

      const response = await apiService.patch(endpoint, fields);
      return response;
    } catch (error) {
      console.error("Error in updateCustomerInvoiceFields:", error);
      throw error;
    }
  },

  // Test method that exactly mimics Postman behavior
  testUpdateCustomerName: async (id, customerName) => {
    try {
      const endpoint = replaceUrlParams(
        API_ENDPOINTS.CUSTOMER_INVOICES.UPDATE,
        {
          id,
        }
      );

      const payload = { customer_name: customerName };

      const response = await apiService.patch(endpoint, payload);
      return response;
    } catch (error) {
      console.error("Error in testUpdateCustomerName:", error);
      throw error;
    }
  },

  // Delete customer invoice
  deleteCustomerInvoice: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.CUSTOMER_INVOICES.DELETE, {
      id,
    });
    return await apiService.delete(endpoint);
  },
};

// Make test function available globally for debugging
if (typeof window !== "undefined") {
  window.testCustomerInvoiceUpdate = async (id, customerName = "test name") => {
    try {
      const result = await customerInvoiceService.testUpdateCustomerName(
        id,
        customerName
      );
      return result;
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  };
}

export default customerInvoiceService;
