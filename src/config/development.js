/**
 * Development Configuration
 * This file contains development-specific settings
 */

export const developmentConfig = {
  // Default tenant for development
  defaultTenant: "css",

  // Mock API responses for development (when backend is not available)
  mockApi: true,

  // Mock tenant data
  mockTenantData: {
    subdomain: "css",
    tenant: "CSS",
    status: "success",
    message: "Welcome to CSS tenant (Development)",
  },

  // Mock user data for development
  mockUserData: {
    id: 1,
    name: "Development User",
    email: "dev@example.com",
    role: "MANAGER",
    tenant: "css",
  },

  // Mock authentication data
  mockAuthData: {
    token: "mock-dev-token-" + Date.now(),
    user: "mockUserData",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },

  // Enable console logging for development
  enableLogging: true,

  // API endpoints for development (when mockApi is false)
  apiEndpoints: {
    baseUrl: "http://localhost:3001",
    tenantDiscovery: "https://detalls-sa.com/ten/tenants/",
    login: "https://css.detalls-sa.com/tenuser/login/",
  },
};

// Helper function to get current tenant from URL
export const getCurrentTenantFromUrl = () => {
  const hostname = window.location.hostname;

  // Handle custom localhost subdomains (e.g., css.localhost:5174)
  if (hostname.includes(".localhost")) {
    return hostname.split(".")[0];
  }

  // Handle regular localhost
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    return (
      localStorage.getItem("tenant_subdomain") ||
      developmentConfig.defaultTenant
    );
  }

  // Handle production subdomains (e.g., css.detalls-sa.com)
  const parts = hostname.split(".");
  return parts.length > 2 ? parts[0] : null;
};

// Helper function to set tenant for development
export const setDevelopmentTenant = (tenant) => {
  localStorage.setItem("tenant_subdomain", tenant);
  console.log(`Development tenant set to: ${tenant}`);
};

export default developmentConfig;
