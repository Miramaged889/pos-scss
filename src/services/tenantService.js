import { API_ENDPOINTS } from "./api";

/**
 * Tenant Service
 * Handles API calls related to tenant management and limits
 */

// Create a separate API service for tenant calls that uses SAAS_BASE_URL
const createTenantApiService = () => {
  const SAAS_BASE_URL = "https://posback.shop";

  // For tenant API calls, we use SAAS_BASE_URL
  const makeRequest = async (endpoint, options = {}) => {
    const url = `${SAAS_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add authentication headers if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Ensure token is a string, not an object
      let tokenString = token;
      if (typeof token === "object" && token !== null) {
        tokenString = JSON.stringify(token);
      }
      config.headers["Authorization"] = `Bearer ${tokenString}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases
        if (response.status === 401) {
          console.warn(
            "Unauthorized access to tenant API - authentication required"
          );
          throw new Error("Authentication required for tenant API access");
        }

        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Tenant API request failed:", error);
      throw error;
    }
  };

  return {
    get: (endpoint, params = {}) => {
      let urlWithParams = endpoint;
      const searchParams = new URLSearchParams();

      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          searchParams.append(key, params[key]);
        }
      });

      if (searchParams.toString()) {
        urlWithParams += `?${searchParams.toString()}`;
      }

      return makeRequest(urlWithParams, { method: "GET" });
    },

    post: (endpoint, data = {}) => {
      return makeRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    put: (endpoint, data = {}) => {
      return makeRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    patch: (endpoint, data = {}) => {
      return makeRequest(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    delete: (endpoint) => {
      return makeRequest(endpoint, { method: "DELETE" });
    },
  };
};

const tenantApiService = createTenantApiService();

// Helper function to replace URL parameters (unused but kept for future use)
// const replaceUrlParams = (url, params) => {
//   return url.replace(/:(\w+)/g, (match, key) => {
//     return params[key] || match;
//   });
// };

const tenantService = {
  // Get tenant ID based on subdomain
  async getTenantIdBySubdomain() {
    try {
      const subdomain = this.getSubdomain();
      if (!subdomain) {
        throw new Error("No subdomain found");
      }

      // First, get all tenants to find the one with matching subdomain
      const response = await tenantApiService.get(API_ENDPOINTS.TENANTS.GET);
      const tenants = response.data || response;

      // Find tenant with matching subdomain
      const tenant = tenants.find((t) => t.subdomain === subdomain);
      if (!tenant) {
        throw new Error(`Tenant not found for subdomain: ${subdomain}`);
      }

      return tenant.id;
    } catch (error) {
      console.error("Failed to get tenant ID:", error);
      throw new Error(`Failed to get tenant ID: ${error.message}`);
    }
  },

  // Get tenant information including branch limits
  async getTenantInfo() {
    try {
      // First get the tenant ID based on subdomain
      const tenantId = await this.getTenantIdBySubdomain();

      // Then get the specific tenant info using the ID
      const endpoint = API_ENDPOINTS.TENANTS.GET_BY_ID.replace(":id", tenantId);
      const response = await tenantApiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      // If authentication is required but not available, return default tenant info
      if (error.message.includes("Authentication required")) {
        console.warn(
          "Tenant API requires authentication, returning default tenant info"
        );
        return {
          current_branches: 0,
          no_branches: 5, // Default limit as specified
          subdomain: this.getSubdomain(),
        };
      }
      throw new Error(`Failed to fetch tenant info: ${error.message}`);
    }
  },

  // Helper method to get subdomain
  getSubdomain() {
    const hostname = window.location.hostname;
    if (hostname.includes(".posback.shop")) {
      return hostname.split(".")[0];
    } else if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }
    return null;
  },

  // Update tenant information (e.g., increase branch limit)
  async updateTenantInfo(tenantData) {
    try {
      const response = await tenantApiService.put(
        API_ENDPOINTS.TENANTS.UPDATE,
        tenantData
      );
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to update tenant info: ${error.message}`);
    }
  },

  // Check if tenant can add more branches
  async canAddBranch() {
    try {
      const tenantInfo = await this.getTenantInfo();
      const currentBranches = tenantInfo.current_branches || 0;
      const maxBranches = tenantInfo.no_branches || 0;

      return {
        canAdd: currentBranches < maxBranches,
        currentBranches,
        maxBranches,
        remainingBranches: Math.max(0, maxBranches - currentBranches),
      };
    } catch (error) {
      console.error("Failed to check branch limit:", error);

      // Handle authentication errors specifically
      if (error.message.includes("Authentication required")) {
        console.warn(
          "Tenant API requires authentication, using default branch limits"
        );
        return {
          canAdd: true,
          currentBranches: 0,
          maxBranches: 5, // Default limit as specified
          remainingBranches: 5,
        };
      }

      // For other errors, still allow the operation (fail open)
      return {
        canAdd: true,
        currentBranches: 0,
        maxBranches: 5, // Default limit as specified
        remainingBranches: 5,
      };
    }
  },
};

export default tenantService;
