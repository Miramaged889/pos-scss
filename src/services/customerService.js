/**
 * Customer Service
 * Handles all customer-related API operations
 */

import { apiService, API_ENDPOINTS } from "./api";

export const customerService = {
  // Get all customers
  getCustomers: async (params = {}) => {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.CUSTOMERS.LIST,
        params
      );
      return response;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  // Get customer by ID
  getCustomer: async (id) => {
    try {
      const endpoint = API_ENDPOINTS.CUSTOMERS.GET.replace(":id", id);
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }
  },

  // Create new customer
  createCustomer: async (customerData) => {
    try {
      // Transform form data to match API schema
      const apiData = {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        customer_address: customerData.address,
        connect_way: customerData.preferredContactMethod,
        status: customerData.status,
        VIP: customerData.vip,
        notes: customerData.notes || "",
        // Optional fields that might be in the form but not in API
        company: customerData.company || "",
        dateOfBirth: customerData.dateOfBirth || "",
      };

      const response = await apiService.post(
        API_ENDPOINTS.CUSTOMERS.CREATE,
        apiData
      );
      return response;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    try {
      // Transform form data to match API schema
      const apiData = {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        customer_address: customerData.address,
        connect_way: customerData.preferredContactMethod,
        status: customerData.status,
        VIP: customerData.vip,
        notes: customerData.notes || "",
        // Optional fields that might be in the form but not in API
        company: customerData.company || "",
        dateOfBirth: customerData.dateOfBirth || "",
      };

      const endpoint = API_ENDPOINTS.CUSTOMERS.UPDATE.replace(":id", id);
      const response = await apiService.put(endpoint, apiData);
      return response;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  // Delete customer
  deleteCustomer: async (id) => {
    try {
      const endpoint = API_ENDPOINTS.CUSTOMERS.DELETE.replace(":id", id);
      const response = await apiService.delete(endpoint);
      return response;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },

  // Helper function to transform API response to frontend format
  transformCustomerFromAPI: (apiCustomer) => {
    return {
      id: apiCustomer.id,
      name: apiCustomer.customer_name,
      email: apiCustomer.customer_email,
      phone: apiCustomer.customer_phone,
      address: apiCustomer.customer_address,
      company: apiCustomer.company || "",
      notes: apiCustomer.notes || "",
      vip: apiCustomer.VIP || false,
      status: apiCustomer.status || "active",
      dateOfBirth: apiCustomer.dateOfBirth || "",
      preferredContactMethod: apiCustomer.connect_way || "phone",
      // Default values for fields that might not exist in API
      totalOrders: apiCustomer.totalOrders || 0,
      totalSpent: apiCustomer.totalSpent || 0,
      createdAt: apiCustomer.created_at || new Date().toISOString(),
    };
  },
};

export default customerService;
