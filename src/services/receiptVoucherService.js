/**
 * Receipt Voucher Service - Handles all receipt voucher-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

// Helper function to map database schema to frontend format
const mapDbToFrontend = (dbReceipt) => {
  return {
    id: dbReceipt.id,
    receiptType: dbReceipt.type?.toLowerCase() || "customer",
    receivedFrom: dbReceipt.received_from || "",
    receiptNumber: dbReceipt.receipt_number?.toString() || "",
    amount: parseFloat(dbReceipt.amount) || 0,
    paymentMethod: dbReceipt.paymant_way?.toLowerCase() || "cash",
    referenceNumber: dbReceipt.check_no || "",
    bankName: dbReceipt.on_bank || "",
    purpose: dbReceipt.purpose || "",
    receiver: dbReceipt.receiver || "",
    date:
      dbReceipt.date?.split("T")[0] || new Date().toISOString().split("T")[0],
    attachments: dbReceipt.attachment
      ? [
          {
            id: Date.now(),
            name: dbReceipt.attachment.split("/").pop(),
            url: dbReceipt.attachment,
            preview: dbReceipt.attachment,
            status: "completed",
          },
        ]
      : [],
  };
};

// Helper function to map frontend format to database schema
const mapFrontendToDb = (frontendReceipt) => {
  // Convert attachments to a single URL if any exist
  const attachment =
    frontendReceipt.attachments?.length > 0
      ? frontendReceipt.attachments[0].file ||
        frontendReceipt.attachments[0].url
      : null;

  // Ensure all required fields have values
  const type =
    frontendReceipt.receiptType === "customer" ? "Customer" : "Other";
  const received_from = frontendReceipt.receivedFrom || "";
  const amount = frontendReceipt.amount?.toString() || "0";
  const paymant_way =
    frontendReceipt.paymentMethod?.charAt(0).toUpperCase() +
      frontendReceipt.paymentMethod?.slice(1) || "Cash";
  const on_bank = frontendReceipt.bankName || "";
  const receiver = frontendReceipt.receiver || "";

  return {
    type,
    received_from,
    receipt_number: parseInt(frontendReceipt.receiptNumber) || null,
    amount,
    paymant_way,
    check_no: frontendReceipt.referenceNumber || null,
    on_bank,
    purpose: frontendReceipt.purpose || "",
    receiver,
    date: frontendReceipt.date,
    attachment,
  };
};

export const receiptVoucherService = {
  // Get all receipts
  getReceipts: async (params = {}) => {
    const response = await apiService.get(
      API_ENDPOINTS.RECEIPT_VOUCHER.LIST,
      params
    );
    const receipts = Array.isArray(response)
      ? response
      : response.results || response.data || [];
    return receipts.map(mapDbToFrontend);
  },

  // Get receipt by ID
  getReceipt: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.RECEIPT_VOUCHER.GET, {
      id,
    });
    const response = await apiService.get(endpoint);
    return mapDbToFrontend(response);
  },

  // Create new receipt
  createReceipt: async (receiptData) => {
    const dbData = mapFrontendToDb(receiptData);

    const formData = new FormData();

    // Add all required fields
    formData.append("type", dbData.type);
    formData.append("received_from", dbData.received_from);
    formData.append("amount", dbData.amount);
    formData.append("paymant_way", dbData.paymant_way);
    formData.append("on_bank", dbData.on_bank);
    formData.append("receiver", dbData.receiver);
    formData.append("date", dbData.date);

    // Add optional fields
    if (dbData.receipt_number) {
      formData.append("receipt_number", dbData.receipt_number);
    }
    if (dbData.check_no) {
      formData.append("check_no", dbData.check_no);
    }
    if (dbData.purpose) {
      formData.append("purpose", dbData.purpose);
    }

    // Add attachment if exists
    if (dbData.attachment && dbData.attachment instanceof File) {
      formData.append("attachment", dbData.attachment);
    }

    const response = await apiService.post(
      API_ENDPOINTS.RECEIPT_VOUCHER.CREATE,
      formData
    );
    return mapDbToFrontend(response);
  },

  // Update receipt
  updateReceipt: async (id, receiptData) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.RECEIPT_VOUCHER.UPDATE, {
      id,
    });
    const dbData = mapFrontendToDb(receiptData);
    const formData = new FormData();

    // Add all required fields
    formData.append("type", dbData.type);
    formData.append("received_from", dbData.received_from);
    formData.append("amount", dbData.amount);
    formData.append("paymant_way", dbData.paymant_way);
    formData.append("on_bank", dbData.on_bank);
    formData.append("receiver", dbData.receiver);
    formData.append("date", dbData.date);

    // Add optional fields
    if (dbData.receipt_number) {
      formData.append("receipt_number", dbData.receipt_number);
    }
    if (dbData.check_no) {
      formData.append("check_no", dbData.check_no);
    }
    if (dbData.purpose) {
      formData.append("purpose", dbData.purpose);
    }

    // Add attachment if exists
    if (dbData.attachment && dbData.attachment instanceof File) {
      formData.append("attachment", dbData.attachment);
    }

    const response = await apiService.patch(endpoint, formData);
    return mapDbToFrontend(response);
  },

  // Delete receipt
  deleteReceipt: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.RECEIPT_VOUCHER.DELETE, {
      id,
    });
    await apiService.delete(endpoint);
    return id;
  },
};

export default receiptVoucherService;
