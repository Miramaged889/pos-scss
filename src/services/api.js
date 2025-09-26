/**
 * API Service for Backend Integration
 * This service handles all API calls to the backend
 */

// Base API configuration
const API_BASE_URL =
 "http://localhost:3001/api";

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
  },

  // Customers
  CUSTOMERS: {
    LIST: "/customers",
    CREATE: "/customers",
    UPDATE: "/customers/:id",
    DELETE: "/customers/:id",
    GET: "/customers/:id",
  },

  // Products
  PRODUCTS: {
    LIST: "/products",
    CREATE: "/products",
    UPDATE: "/products/:id",
    DELETE: "/products/:id",
    GET: "/products/:id",
  },

  // Orders
  ORDERS: {
    LIST: "/orders",
    CREATE: "/orders",
    UPDATE: "/orders/:id",
    DELETE: "/orders/:id",
    GET: "/orders/:id",
    UPDATE_STATUS: "/orders/:id/status",
  },

  // Payments
  PAYMENTS: {
    LIST: "/payments",
    CREATE: "/payments",
    UPDATE: "/payments/:id",
    DELETE: "/payments/:id",
    GET: "/payments/:id",
  },

  // Returns
  RETURNS: {
    LIST: "/returns",
    CREATE: "/returns",
    UPDATE: "/returns/:id",
    DELETE: "/returns/:id",
    GET: "/returns/:id",
  },

  // Purchase Orders
  PURCHASE_ORDERS: {
    LIST: "/purchase-orders",
    CREATE: "/purchase-orders",
    UPDATE: "/purchase-orders/:id",
    DELETE: "/purchase-orders/:id",
    GET: "/purchase-orders/:id",
  },

  // Suppliers
  SUPPLIERS: {
    LIST: "/suppliers",
    CREATE: "/suppliers",
    UPDATE: "/suppliers/:id",
    DELETE: "/suppliers/:id",
    GET: "/suppliers/:id",
  },

  // Invoices
  INVOICES: {
    LIST: "/invoices",
    CREATE: "/invoices",
    UPDATE: "/invoices/:id",
    DELETE: "/invoices/:id",
    GET: "/invoices/:id",
  },

  // Vouchers
  VOUCHERS: {
    LIST: "/vouchers",
    CREATE: "/vouchers",
    UPDATE: "/vouchers/:id",
    DELETE: "/vouchers/:id",
    GET: "/vouchers/:id",
  },

  // Reports
  REPORTS: {
    SALES: "/reports/sales",
    DELIVERY: "/reports/delivery",
    FINANCIAL: "/reports/financial",
    INVENTORY: "/reports/inventory",
  },
};

// HTTP methods
const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
};

// Default headers
const getDefaultHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API response handler
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  return await response.text();
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getDefaultHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// API service methods
export const apiService = {
  // GET request
  get: (endpoint, params = {}) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return apiRequest(url.pathname + url.search, {
      method: HTTP_METHODS.GET,
    });
  },

  // POST request
  post: (endpoint, data = {}) => {
    return apiRequest(endpoint, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  // PUT request
  put: (endpoint, data = {}) => {
    return apiRequest(endpoint, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(data),
    });
  },

  // PATCH request
  patch: (endpoint, data = {}) => {
    return apiRequest(endpoint, {
      method: HTTP_METHODS.PATCH,
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  delete: (endpoint) => {
    return apiRequest(endpoint, {
      method: HTTP_METHODS.DELETE,
    });
  },

  // Upload file
  upload: (endpoint, formData) => {
    const token = localStorage.getItem("auth_token");
    return apiRequest(endpoint, {
      method: HTTP_METHODS.POST,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
  },
};

// Helper function to replace URL parameters
export const replaceUrlParams = (endpoint, params) => {
  let url = endpoint;
  Object.keys(params).forEach((key) => {
    url = url.replace(`:${key}`, params[key]);
  });
  return url;
};

export default apiService;
