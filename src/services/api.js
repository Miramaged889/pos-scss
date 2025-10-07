/**
 * API Service for Backend Integration
 * This service handles all API calls to the backend
 */

// 1. Get the current hostname
const hostname = window.location.hostname;
// examples: ou2.detalls-sa.com OR ou2.localhost OR localhost

// 2. Extract subdomain if exists
let subdomain = null;

if (hostname.includes(".detalls-sa.com")) {
  subdomain = hostname.split(".")[0]; // ou2
} else if (hostname.includes(".localhost")) {
  subdomain = hostname.split(".")[0]; // ou2 if ou2.localhost
} else {
  subdomain = null; // no subdomain, default SaaS base URL
}

// 3. Build the Base URL dynamically
const SAAS_BASE_URL = "https://detalls-sa.com"; // default SaaS (no trailing slash)
const TENANT_BASE_URL = subdomain
  ? `https://${subdomain}.detalls-sa.com`
  : SAAS_BASE_URL;

// 5. Development mode detection
const isDevelopment =
  hostname.includes("localhost") || hostname.includes("127.0.0.1");

// 4. Final API base URL
const API_BASE_URL = TENANT_BASE_URL;

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/tenuser/login/",
    LOGOUT: "/auth/logout/",
    REFRESH: "/auth/refresh/",
    PROFILE: "/auth/profile/",
  },

  // Tenant Users
  TENANT_USERS: {
    LIST: "/tenuser/tenantusers/",
    CREATE: "/tenuser/tenantusers/",
    UPDATE: "/tenuser/tenantusers/:id/",
    DELETE: "/tenuser/tenantusers/:id/",
    GET: "/tenuser/tenantusers/:id/",
  },

  // Tenants (for getting tenant info and limits)
  TENANTS: {
    GET: "/ten/tenants",
    GET_BY_ID: "/ten/tenants/:id/",
  },

  // Branches
  BRANCHES: {
    LIST: "/tenuser/branches/",
    CREATE: "/tenuser/branches/",
      UPDATE: "/tenuser/branches/:id/",
    DELETE: "/tenuser/branches/:id/",
    GET: "/tenuser/branches/:id/",
  },

  // Products end
  PRODUCTS: {
    LIST: "seller/products/",
    CREATE: "seller/products/",
    UPDATE: "seller/products/:id/",
    DELETE: "seller/products/:id/",
    GET: "seller/products/:id/",
  },

  // Orders end
  ORDERS: {
    LIST: "seller/orders/",
    CREATE: "seller/orders/",
    UPDATE: "seller/orders/:id/",
    DELETE: "seller/orders/:id/",
    GET: "seller/orders/:id/",
  },

  // // Payments
  // PAYMENTS: {
  //   LIST: "/payments",
  //   CREATE: "/payments",
  //   UPDATE: "/payments/:id",
  //   DELETE: "/payments/:id",
  //   GET: "/payments/:id",
  // },

  // // Purchase Orders
  // PURCHASE_ORDERS: {
  //   LIST: "/purchase-orders",
  //   CREATE: "/purchase-orders",
  //   UPDATE: "/purchase-orders/:id",
  //   DELETE: "/purchase-orders/:id",
  //   GET: "/purchase-orders/:id",
  // },

  // supplier purchase
  SUPPLIER_PURCHASE: {
    LIST: "seller/purchasess/",
    CREATE: "seller/purchasess/",
    UPDATE: "seller/purchasess/:id/",
    DELETE: "seller/purchasess/:id/",
    GET: "seller/purchasess/:id/",
  },

  // Suppliers
  SUPPLIERS: {
    LIST: "seller/suppliers/",
    CREATE: "seller/suppliers/",
    UPDATE: "seller/suppliers/:id/",
    DELETE: "seller/suppliers/:id/",
    GET: "seller/suppliers/:id/",
  },

  // Supplier Invoices
  SUPPLIER_INVOICES: {
    LIST: "seller/supinvoices/",
    CREATE: "seller/supinvoices/",
    UPDATE: "seller/supinvoices/:id/",
    DELETE: "seller/supinvoices/:id/",
    GET: "seller/supinvoices/:id/",
  },

  // Supplier Returns
  SUPPLIER_RETURNS: {
    LIST: "seller/returns/",
    CREATE: "seller/returns/",
    UPDATE: "seller/returns/:id/",
    DELETE: "seller/returns/:id/",
    GET: "seller/returns/:id/",
  },

  // Customers
  CUSTOMERS: {
    LIST: "customer/customers/",
    CREATE: "customer/customers/",
    UPDATE: "customer/customers/:id/",
    DELETE: "customer/customers/:id/",
    GET: "customer/customers/:id/",
  },

  // Customer Invoices (for sales)
  CUSTOMER_INVOICES: {
    LIST: "customer/invoices/",
    CREATE: "customer/invoices/",
    UPDATE: "customer/invoices/:id/",
    DELETE: "customer/invoices/:id/",
    GET: "customer/invoices/:id/",
  },
  // Customer Returns
  CUSTOMER_RETURNS: {
    LIST: "customer/returns/",
    CREATE: "customer/returns/",
    UPDATE: "customer/returns/:id/",
    DELETE: "customer/returns/:id/",
    GET: "customer/returns/:id/",
  },

  // Financial Vouchers
  VOUCHERS: {
    LIST: "seller/vouchers/",
    CREATE: "seller/vouchers/",
    UPDATE: "seller/vouchers/:id/",
    DELETE: "seller/vouchers/:id/",
    GET: "seller/vouchers/:id/",
  },

  // Receipt Voucher
  RECEIPT_VOUCHER: {
    LIST: "seller/receipts/",
    CREATE: "seller/receipts/",
    UPDATE: "seller/receipts/:id/",
    DELETE: "seller/receipts/:id/",
    GET: "seller/receipts/:id/",
  },

  // // Payment Methods
  // PAYMENT_METHODS: {
  //   LIST: "/payment-methods",
  //   CREATE: "/payment-methods",
  //   UPDATE: "/payment-methods/:id",
  //   DELETE: "/payment-methods/:id",
  //   GET: "/payment-methods/:id",
  // },

  // // Reports
  // REPORTS: {
  //   SALES: "/reports/sales",
  //   DELIVERY: "/reports/delivery",
  //   FINANCIAL: "/reports/financial",
  //   INVENTORY: "/reports/inventory",
  // },
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

  // Ensure token is a string, not an object
  let tokenString = token;
  if (token) {
    try {
      // Try to parse as JSON in case it's stored as an object
      const parsedToken = JSON.parse(token);
      if (typeof parsedToken === "object") {
        tokenString = parsedToken.access || parsedToken.token || token;
      }
    } catch {
      // If parsing fails, use token as is
      tokenString = token;
    }
  }

  return {
    "Content-Type": "application/json",
    ...(tokenString && { Authorization: `Bearer ${tokenString}` }),
  };
};

// API response handler
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      // If we can't parse JSON, try to get text
      try {
        const errorText = await response.text();
        errorData = { detail: errorText };
      } catch {
        errorData = {};
      }
    }
    throw new Error(
      errorData.message ||
        errorData.detail ||
        errorData.error ||
        `HTTP error! status: ${response.status} - ${response.statusText}`
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  return await response.text();
};

// Generic API request function
const apiRequest = async (url, options = {}) => {
  // Check if the URL is already a full URL (contains protocol) or starts with /
  // If it starts with /, it's already been processed by the service methods
  const finalUrl =
    url.startsWith("http") || url.startsWith("/")
      ? url
      : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

  const config = {
    ...options,
  };

  // Only add default headers if body is not FormData
  if (!(options.body instanceof FormData)) {
    config.headers = {
      ...getDefaultHeaders(),
      ...options.headers,
    };
  } else {
    // For FormData, only add Authorization header if it exists
    const defaultHeaders = getDefaultHeaders();
    config.headers = {
      ...(defaultHeaders.Authorization && {
        Authorization: defaultHeaders.Authorization,
      }),
      ...options.headers,
    };
  }

  // Add CORS handling for development
  if (isDevelopment) {
    config.mode = "cors";
    config.credentials = "omit";
  }

  try {
    const response = await fetch(finalUrl, config);
    return await handleResponse(response);
  } catch (error) {
    // For development, provide more helpful error messages
    if (isDevelopment && error.message.includes("Failed to fetch")) {
      const corsError =
        new Error(`CORS Error: Unable to connect to ${finalUrl}. 
      
Possible solutions:
1. Backend needs to allow origin: ${window.location.origin}
2. Check if backend is running on the correct port
3. Verify CORS configuration includes your domain

Current request: ${finalUrl}
Origin: ${window.location.origin}`);
      corsError.originalError = error;
      throw corsError;
    }

    throw error;
  }
};

// API service methods
export const apiService = {
  // GET request
  get: (endpoint, params = {}) => {
    // Ensure endpoint starts with / to avoid double slashes
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // Handle development mode where API_BASE_URL might be empty
    let fullUrl;
    if (API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
    } else {
      // In development with proxy, use just the endpoint
      fullUrl = cleanEndpoint;
    }

    // Build URL with search params
    let urlWithParams = fullUrl;
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });

    if (searchParams.toString()) {
      urlWithParams += `?${searchParams.toString()}`;
    }

    return apiRequest(urlWithParams, {
      method: HTTP_METHODS.GET,
    });
  },

  // POST request
  post: (endpoint, data = {}, config = {}) => {
    // Ensure endpoint starts with / to avoid double slashes
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // Handle development mode where API_BASE_URL might be empty
    let fullUrl;
    if (API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
    } else {
      // In development with proxy, use just the endpoint
      fullUrl = cleanEndpoint;
    }

    const requestOptions = {
      method: HTTP_METHODS.POST,
      ...config,
      body: data instanceof FormData ? data : JSON.stringify(data),
    };

    return apiRequest(fullUrl, requestOptions);
  },

  // PUT request
  put: (endpoint, data = {}) => {
    // Ensure endpoint starts with / to avoid double slashes
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // Handle development mode where API_BASE_URL might be empty
    let fullUrl;
    if (API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
    } else {
      // In development with proxy, use just the endpoint
      fullUrl = cleanEndpoint;
    }

    return apiRequest(fullUrl, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(data),
    });
  },

  // PATCH request
  patch: (endpoint, data = {}, config = {}) => {
    // Ensure endpoint starts with / to avoid double slashes
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // Handle development mode where API_BASE_URL might be empty
    let fullUrl;
    if (API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
    } else {
      // In development with proxy, use just the endpoint
      fullUrl = cleanEndpoint;
    }

    const requestOptions = {
      method: HTTP_METHODS.PATCH,
      ...config,
      body: data instanceof FormData ? data : JSON.stringify(data),
    };

    return apiRequest(fullUrl, requestOptions);
  },

  // DELETE request
  delete: (endpoint) => {
    // Ensure endpoint starts with / to avoid double slashes
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // Handle development mode where API_BASE_URL might be empty
    let fullUrl;
    if (API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
    } else {
      // In development with proxy, use just the endpoint
      fullUrl = cleanEndpoint;
    }

    return apiRequest(fullUrl, {
      method: HTTP_METHODS.DELETE,
    });
  },

  // Upload file (supports both POST and PUT)
  upload: (endpoint, formData, method = "POST") => {
    // Ensure endpoint starts with / to avoid double slashes
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // Handle development mode where API_BASE_URL might be empty
    let fullUrl;
    if (API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
    } else {
      // In development with proxy, use just the endpoint
      fullUrl = cleanEndpoint;
    }

    const token = localStorage.getItem("auth_token");

    // Ensure token is a string, not an object
    let tokenString = token;
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        if (typeof parsedToken === "object") {
          tokenString = parsedToken.access || parsedToken.token || token;
        }
      } catch {
        tokenString = token;
      }
    }

    return apiRequest(fullUrl, {
      method: HTTP_METHODS[method] || HTTP_METHODS.POST,
      headers: {
        ...(tokenString && { Authorization: `Bearer ${tokenString}` }),
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
