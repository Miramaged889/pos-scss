/**
 * Voucher Service
 * Handles all voucher-related API operations
 */

import { apiService, API_ENDPOINTS } from "./api";

// Helper to convert payment method to API format
const convertPaymentMethodToAPI = (method) => {
  const methodMap = {
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    credit_card: "Credit Card",
    check: "Check",
  };
  return methodMap[method] || "Cash";
};

// Helper to convert payment method from API format
const convertPaymentMethodFromAPI = (method) => {
  const methodMap = {
    Cash: "cash",
    "Bank Transfer": "bank_transfer",
    "Credit Card": "credit_card",
    Check: "check",
  };
  return methodMap[method] || "cash";
};

// Helper to determine voucher type based on voucher_type
const getVoucherType = (voucherType) => {
  const typeMap = {
    Supplier: "payment",
    Expense: "expense",
    Customer: "payment",
  };
  return typeMap[voucherType] || "expense";
};

// Helper to map frontend data to API format
const mapFrontendToDb = (frontendVoucher) => {
  const dbData = {
    voucher_number: frontendVoucher.voucherNumber || `VOU-${Date.now()}`,
    voucher_type: frontendVoucher.voucherType || "Supplier",
    date: frontendVoucher.date,
    amount: frontendVoucher.amount.toString(),
    payment_method: convertPaymentMethodToAPI(frontendVoucher.paymentMethod),
    category: frontendVoucher.category || "General",
    recipient: frontendVoucher.recipient || frontendVoucher.supplier,
    description: frontendVoucher.description || "",
    notes: frontendVoucher.notes || "",
  };

  // Add supplier ID if it's a payment voucher and supplierId exists
  if (frontendVoucher.supplierId && frontendVoucher.supplierId !== "") {
    dbData.supplier = parseInt(frontendVoucher.supplierId);
  }

  return dbData;
};

// Helper to map API data to frontend format
const mapDbToFrontend = (dbVoucher) => {
  return {
    id: dbVoucher.id,
    voucherNumber: dbVoucher.voucher_number,
    voucherType: dbVoucher.voucher_type,
    date: dbVoucher.date,
    amount: parseFloat(dbVoucher.amount),
    paymentMethod: convertPaymentMethodFromAPI(dbVoucher.payment_method),
    category: dbVoucher.category,
    recipient: dbVoucher.recipient,
    supplier: dbVoucher.recipient, // For payment vouchers
    supplierId: dbVoucher.supplier,
    description: dbVoucher.description || "",
    notes: dbVoucher.notes || "",
    status: "approved", // Default status
    createdAt: dbVoucher.created_at,
    attachment: dbVoucher.attachment,
    type: getVoucherType(dbVoucher.voucher_type),
  };
};

export const voucherService = {
  // Get all vouchers
  getVouchers: async (params = {}) => {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.VOUCHERS.LIST,
        params
      );
      return response;
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      throw error;
    }
  },

  // Get voucher by ID
  getVoucher: async (id) => {
    try {
      const endpoint = API_ENDPOINTS.VOUCHERS.GET.replace(":id", id);
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error("Error fetching voucher:", error);
      throw error;
    }
  },

  // Create new voucher
  createVoucher: async (voucherData) => {
    try {
      const dbData = mapFrontendToDb(voucherData);

      // Create FormData for file upload
      const formData = new FormData();

      // Append all required fields
      Object.keys(dbData).forEach((key) => {
        formData.append(key, dbData[key]);
      });

      // Add attachment if exists (first photo)
      if (
        voucherData.photos &&
        voucherData.photos.length > 0 &&
        voucherData.photos[0].file
      ) {
        formData.append("attachment", voucherData.photos[0].file);
      }

      const response = await apiService.upload(
        API_ENDPOINTS.VOUCHERS.CREATE,
        formData
      );
      return mapDbToFrontend(response);
    } catch (error) {
      console.error("Error creating voucher:", error);
      throw error;
    }
  },

  // Update voucher
  updateVoucher: async (id, voucherData) => {
    try {
      const dbData = mapFrontendToDb(voucherData);

      // Create FormData for file upload
      const formData = new FormData();

      // Append all required fields
      Object.keys(dbData).forEach((key) => {
        formData.append(key, dbData[key]);
      });

      // Add attachment if exists (first photo) - only if new photo uploaded
      if (
        voucherData.photos &&
        voucherData.photos.length > 0 &&
        voucherData.photos[0].file
      ) {
        formData.append("attachment", voucherData.photos[0].file);
      }

      const endpoint = API_ENDPOINTS.VOUCHERS.UPDATE.replace(":id", id);

      // Use upload method for multipart/form-data with PUT method
      const response = await apiService.upload(endpoint, formData, "PUT");
      return mapDbToFrontend(response);
    } catch (error) {
      console.error("Error updating voucher:", error);
      throw error;
    }
  },

  // Delete voucher
  deleteVoucher: async (id) => {
    try {
      const endpoint = API_ENDPOINTS.VOUCHERS.DELETE.replace(":id", id);
      const response = await apiService.delete(endpoint);
      return response;
    } catch (error) {
      console.error("Error deleting voucher:", error);
      throw error;
    }
  },

  // Helper function to transform API response to frontend format
  transformVoucherFromAPI: (apiVoucher) => {
    return mapDbToFrontend(apiVoucher);
  },
};

export default voucherService;
