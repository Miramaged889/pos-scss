/**
 * Development Utilities
 * Helper functions for development and debugging
 */

// Development utilities object
export const devUtils = {
  /**
   * Get current subdomain from URL
   */
  getCurrentSubdomain: () => {
    const hostname = window.location.hostname;

    if (hostname.includes(".detalls-sa.com")) {
      return hostname.split(".")[0];
    } else if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }

    return null;
  },

  /**
   * Get current API base URL
   */
  getCurrentApiUrl: () => {
    const subdomain = devUtils.getCurrentSubdomain();
    if (subdomain) {
      return `https://${subdomain}.detalls-sa.com`;
    }
    return "https://detalls-sa.com";
  },

  /**
   * Show current configuration
   */
  showConfig: () => {
    const subdomain = devUtils.getCurrentSubdomain();
    const apiUrl = devUtils.getCurrentApiUrl();

    console.log(`
🔧 Current Configuration:
- Hostname: ${window.location.hostname}
- Subdomain: ${subdomain || "none"}
- API Base URL: ${apiUrl}
- Origin: ${window.location.origin}
- Current URL: ${window.location.href}

🌐 Expected API calls:
- Login: ${apiUrl}/auth/login
- Other endpoints: ${apiUrl}/...
    `);

    return { subdomain, apiUrl };
  },

  /**
   * Test API connection
   */
  testConnection: async () => {
    const apiUrl = devUtils.getCurrentApiUrl();
    const testUrl = `${apiUrl}/health`; // or any simple endpoint

    try {
      console.log(`🔍 Testing connection to: ${testUrl}`);
      const response = await fetch(testUrl, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
      });

      console.log("✅ Connection successful:", response.status);
      return true;
    } catch (error) {
      console.error("❌ Connection failed:", error);
      console.log(`
🚨 CORS Error Solutions:
1. Backend must allow origin: ${window.location.origin}
2. Check if backend is running
3. Verify CORS configuration

Current request: ${testUrl}
Origin: ${window.location.origin}
      `);
      return false;
    }
  },

  /**
   * Show help
   */
  showHelp: () => {
    console.log(`
🚀 Development Utilities Help:

Available commands:
- devUtils.showConfig()        // Show current configuration
- devUtils.testConnection()    // Test API connection
- devUtils.getCurrentSubdomain() // Get current subdomain
- devUtils.getCurrentApiUrl()  // Get current API URL
- devUtils.showHelp()          // Show this help

Example usage:
// Check current setup
devUtils.showConfig();

// Test if backend is accessible
devUtils.testConnection();

Current setup:
- URL: ${window.location.href}
- Subdomain: ${devUtils.getCurrentSubdomain() || "none"}
    `);
  },
};

// Make devUtils available globally in development
if (window.location.hostname.includes("localhost")) {
  window.devUtils = devUtils;
  console.log(
    "🔧 Development utilities loaded. Type devUtils.showHelp() for help."
  );

  // Auto-show config on load
  devUtils.showConfig();
}

export default devUtils;
