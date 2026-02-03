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
  // Get tenant information including branch limits using subdomain
  async getTenantInfo() {
    try {
      const subdomain = this.getSubdomain();
      
      // Get tenant info directly using subdomain: /ten/tenants/{subdomain}/
      const endpoint = `/ten/tenants/${subdomain}/`;
      const response = await tenantApiService.get(endpoint);
      const tenantData = response.data || response;
      
      // Extract currency information
      if (tenantData.Currency) {
        // Fetch full currency details if needed
        if (tenantData.Currency.Currency_id) {
          try {
            const currencyEndpoint = `/ten/currencies/${tenantData.Currency.Currency_id}/`;
            const currencyResponse = await tenantApiService.get(currencyEndpoint);
            tenantData.currencyDetails = currencyResponse.data || currencyResponse;
          } catch (currencyError) {
            console.warn("Failed to fetch currency details:", currencyError);
            // Use the currency data from tenant response
            tenantData.currencyDetails = tenantData.Currency;
          }
        }
      }
      
      return tenantData;
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
          Currency: {
            Currency_id: 1,
            Currency_name: "Saudi Riyal",
            Currency_code: "SAR"
          },
          currencyDetails: {
            id: 1,
            code: "SAR",
            name: "Saudi Riyal",
            symbol: "ر.س",
            is_active: true
          }
        };
      }
      throw new Error(`Failed to fetch tenant info: ${error.message}`);
    }
  },

  // Helper method to get subdomain
  getSubdomain() {
    const hostname = window.location.hostname;
    
    // Handle custom localhost subdomains (e.g., ymy.localhost:5174)
    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }
    
    // Handle production subdomains (e.g., ymy.posback.shop, ymy.detalls-sa.com)
    if (hostname.includes(".posback.shop") || hostname.includes(".detalls-sa.com")) {
      return hostname.split(".")[0];
    }
    
    // Handle regular localhost or Netlify deployment
    if (hostname.includes("localhost") || hostname.includes("127.0.0.1") || hostname.includes("netlify.app")) {
      // Try to get from localStorage first
      const storedTenant = localStorage.getItem("tenant_subdomain");
      if (storedTenant) {
        return storedTenant;
      }
      
      // Try to get from auth user data
      const authData = localStorage.getItem("auth_user");
      if (authData) {
        try {
          const userData = JSON.parse(authData);
          if (userData && userData.tenant) {
            return userData.tenant;
          }
        } catch (e) {
          console.warn("Failed to parse auth_user data:", e);
        }
      }
      
      // Fallback to default tenant for development
      console.warn("No subdomain detected, using fallback tenant 'ymy'");
      return "ymy";
    }
    
    // Handle other custom domains - extract first part if it has multiple dots
    const parts = hostname.split(".");
    if (parts.length > 2) {
      return parts[0];
    }
    
    // Final fallback
    console.warn("Could not determine subdomain from hostname:", hostname);
    return "ymy"; // Default fallback tenant
  },

  // Update tenant information (e.g., increase branch limit)
  async updateTenantInfo(tenantData) {
    try {
      const subdomain = this.getSubdomain();
      
      // Prepare tenant data for API - handle Currency field
      const preparedData = { ...tenantData };
      
      // Handle Currency field - if it's an object, extract the Currency_id
      if (preparedData.Currency !== undefined && preparedData.Currency !== null) {
        if (typeof preparedData.Currency === 'object' && preparedData.Currency !== null) {
          // If Currency is an object with Currency_id, use the Currency_id
          // Support both old format {id, code, name, ...} and new format {Currency_id, Currency_code, Currency_name}
          preparedData.Currency = preparedData.Currency.Currency_id || 
                                   preparedData.Currency.id || 
                                   preparedData.Currency.code || 
                                   preparedData.Currency.Currency_code || 
                                   preparedData.Currency;
        }
        // If Currency is already a string, number, or null, keep it as is
      }
      
      // Update tenant info using subdomain: /ten/tenants/{subdomain}/
      const endpoint = `/ten/tenants/${subdomain}/`;
      const response = await tenantApiService.put(endpoint, preparedData);
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

  // Initialize tenant (used by useTenant hook)
  async initializeTenant() {
    try {
      const subdomain = this.getSubdomain();
      const tenantInfo = await this.getTenantInfo();
      
      return {
        ...tenantInfo,
        subdomain,
        status: "success",
        message: `Connected to ${subdomain} tenant`,
      };
    } catch (error) {
      console.error("Failed to initialize tenant:", error);
      
      // Return fallback tenant info
      const subdomain = this.getSubdomain();
      return {
        subdomain,
        status: "error",
        message: error.message,
        current_branches: 0,
        no_branches: 5,
        Currency: {
          Currency_id: 1,
          Currency_name: "Saudi Riyal",
          Currency_code: "SAR"
        },
        currencyDetails: {
          id: 1,
          code: "SAR",
          name: "Saudi Riyal",
          symbol: "ر.س",
          is_active: true
        }
      };
    }
  },

  // Set tenant for development (used by useTenant hook)
  setTenantForDevelopment(subdomain) {
    if (subdomain) {
      localStorage.setItem("tenant_subdomain", subdomain);
      console.log(`Development tenant set to: ${subdomain}`);
    }
  },
};

export default tenantService;
