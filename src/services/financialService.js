/**
 * Financial Service - Handle all financial operations
 * Includes vouchers, invoices, payment methods, and returns
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

const financialService = {
  // Vouchers
  async getVouchers(params = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.VOUCHERS.LIST,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch vouchers: ${error.message}`);
    }
  },

  async createVoucher(voucherData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.VOUCHERS.CREATE,
        voucherData
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to create voucher: ${error.message}`);
    }
  },

  async updateVoucher(id, voucherData) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.VOUCHERS.UPDATE, { id });
      const response = await apiService.put(endpoint, voucherData);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to update voucher: ${error.message}`);
    }
  },

  async deleteVoucher(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.VOUCHERS.DELETE, { id });
      await apiService.delete(endpoint);
      return id;
    } catch (error) {
      throw new Error(`Failed to delete voucher: ${error.message}`);
    }
  },

  // Expense Vouchers
  async getExpenseVouchers(params = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.VOUCHERS.EXPENSE_VOUCHERS.LIST,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch expense vouchers: ${error.message}`);
    }
  },

  async createExpenseVoucher(voucherData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.VOUCHERS.EXPENSE_VOUCHERS.CREATE,
        voucherData
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to create expense voucher: ${error.message}`);
    }
  },

  // Payment Vouchers
  async getPaymentVouchers(params = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.VOUCHERS.PAYMENT_VOUCHERS.LIST,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch payment vouchers: ${error.message}`);
    }
  },

  async createPaymentVoucher(voucherData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.VOUCHERS.PAYMENT_VOUCHERS.CREATE,
        voucherData
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to create payment voucher: ${error.message}`);
    }
  },

  // Supplier Invoices
  async getSupplierInvoices(params = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.SUPPLIER_INVOICES.LIST,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch supplier invoices: ${error.message}`);
    }
  },

  async createSupplierInvoice(invoiceData) {
    try {
      // Transform data to match API schema
      const transformedData = {
        supplier: parseInt(invoiceData.supplier) || invoiceData.supplier,
        order_id: invoiceData.order_id,
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date,
        status: invoiceData.status,
        payment_method: invoiceData.payment_method,
        notes: invoiceData.notes || "",
        tax: parseFloat(invoiceData.tax) || 0,
        items: (invoiceData.items || []).map((item) => ({
          item_name: item.item_name,
          quantity: parseInt(item.quantity) || 0,
          unit_price: parseFloat(item.unit_price) || 0,
        })),
      };

      console.log("Creating supplier invoice with data:", {
        originalData: invoiceData,
        transformedData,
      });

      const response = await apiService.post(
        API_ENDPOINTS.SUPPLIER_INVOICES.CREATE,
        transformedData
      );
      return response.data || response;
    } catch (error) {
      console.error("Create supplier invoice error:", error);
      throw new Error(`Failed to create supplier invoice: ${error.message}`);
    }
  },

  async updateSupplierInvoice(id, invoiceData) {
    try {
      const endpoint = replaceUrlParams(
        API_ENDPOINTS.SUPPLIER_INVOICES.UPDATE,
        { id }
      );

      // Transform data to match API schema
      const transformedData = {
        supplier: parseInt(invoiceData.supplier) || invoiceData.supplier,
        order_id: invoiceData.order_id,
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date,
        status: invoiceData.status,
        payment_method: invoiceData.payment_method,
        notes: invoiceData.notes || "",
        tax: parseFloat(invoiceData.tax) || 0,
        items: (invoiceData.items || []).map((item) => ({
          item_name: item.item_name,
          quantity: parseInt(item.quantity) || 0,
          unit_price: parseFloat(item.unit_price) || 0,
        })),
      };

      // Try sending only the fields that are commonly updated
      const updateData = {
        status: transformedData.status,
        payment_method: transformedData.payment_method,
        notes: transformedData.notes,
      };

      const response = await apiService.patch(endpoint, updateData);
      return response.data || response;
    } catch (error) {
      console.error("Update supplier invoice error:", error);
      throw new Error(`Failed to update supplier invoice: ${error.message}`);
    }
  },

  async deleteSupplierInvoice(id) {
    try {
      const endpoint = replaceUrlParams(
        API_ENDPOINTS.SUPPLIER_INVOICES.DELETE,
        { id }
      );
      await apiService.delete(endpoint);
      return id;
    } catch (error) {
      throw new Error(`Failed to delete supplier invoice: ${error.message}`);
    }
  },

  // Payment Methods
  async getPaymentMethods(params = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.PAYMENT_METHODS.LIST,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch payment methods: ${error.message}`);
    }
  },

  async createPaymentMethod(methodData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.PAYMENT_METHODS.CREATE,
        methodData
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to create payment method: ${error.message}`);
    }
  },

  async updatePaymentMethod(id, methodData) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.PAYMENT_METHODS.UPDATE, {
        id,
      });
      const response = await apiService.put(endpoint, methodData);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to update payment method: ${error.message}`);
    }
  },

  async deletePaymentMethod(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.PAYMENT_METHODS.DELETE, {
        id,
      });
      await apiService.delete(endpoint);
      return id;
    } catch (error) {
      throw new Error(`Failed to delete payment method: ${error.message}`);
    }
  },

  // Supplier Returns
  async getSupplierReturns(params = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.SUPPLIER_RETURNS.LIST,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch supplier returns: ${error.message}`);
    }
  },

  async createSupplierReturn(returnData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.SUPPLIER_RETURNS.CREATE,
        returnData
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to create supplier return: ${error.message}`);
    }
  },

  async updateSupplierReturn(id, returnData) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIER_RETURNS.UPDATE, {
        id,
      });
      const response = await apiService.put(endpoint, returnData);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to update supplier return: ${error.message}`);
    }
  },

  async deleteSupplierReturn(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.SUPPLIER_RETURNS.DELETE, {
        id,
      });
      await apiService.delete(endpoint);
      return id;
    } catch (error) {
      throw new Error(`Failed to delete supplier return: ${error.message}`);
    }
  },

  // Reports
  async getFinancialReports(params = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.REPORTS.FINANCIAL,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch financial reports: ${error.message}`);
    }
  },

  async exportReport(reportType, params = {}) {
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.REPORTS.FINANCIAL}/${reportType}/export`,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to export report: ${error.message}`);
    }
  },
};

export default financialService;
