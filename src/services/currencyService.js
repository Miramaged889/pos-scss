/**
 * Currency Service - Handle all currency operations
 * Includes CRUD operations for payment currencies
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

const currencyService = {
  // Get all currencies
  async getCurrencies(params = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.CURRENCY.LIST,
        params
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch currencies: ${error.message}`);
    }
  },

  // Get single currency
  async getCurrency(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.CURRENCY.GET, { id });
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch currency: ${error.message}`);
    }
  },

  // Create new currency
  async createCurrency(currencyData) {
    try {
      const completeCurrencyData = {
        name: currencyData.name,
        code: currencyData.code,
        description: currencyData.description || null,
        is_active: currencyData.is_active !== undefined ? currencyData.is_active : true,
        display_order: currencyData.display_order || 0,
        requires_confirmation: currencyData.requires_confirmation !== undefined ? currencyData.requires_confirmation : false,
        icon: currencyData.icon || null,
      };

      const response = await apiService.post(
        API_ENDPOINTS.CURRENCY.CREATE,
        completeCurrencyData
      );
      return response.data || response;
    } catch (error) {
      console.error("Currency creation error:", error);

      if (error.message.includes("400")) {
        throw new Error(
          "Invalid currency data. Please check all required fields."
        );
      }

      throw new Error(`Failed to create currency: ${error.message}`);
    }
  },

  // Update currency
  async updateCurrency(id, currencyData) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.CURRENCY.UPDATE, {
        id,
      });
      const response = await apiService.patch(endpoint, currencyData);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to update currency: ${error.message}`);
    }
  },

  // Delete currency
  async deleteCurrency(id) {
    try {
      const endpoint = replaceUrlParams(API_ENDPOINTS.CURRENCY.DELETE, {
        id,
      });
      await apiService.delete(endpoint);
      return id;
    } catch (error) {
      throw new Error(`Failed to delete currency: ${error.message}`);
    }
  },
};

export default currencyService;

