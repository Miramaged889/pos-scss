/**
 * Measure Units Service - Handle all measure units operations
 * Fetches measurement units from the backend
 * Note: This endpoint uses the base domain without subdomain
 */

const measureUnitsService = {
  // Get all measure units
  async getMeasureUnits(params = {}) {
    try {
      // Use base domain without subdomain for measure units
      const baseUrl = "https://posback.shop";
      const endpoint = `${baseUrl}/ten/measure-units/`;
      
      const token = localStorage.getItem("auth_token");
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

      // Build URL with search params
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

      const response = await fetch(urlWithParams, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(tokenString && { Authorization: `Bearer ${tokenString}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      throw new Error(`Failed to fetch measure units: ${error.message}`);
    }
  },

  // Get single measure unit
  async getMeasureUnit(id) {
    try {
      // Use base domain without subdomain for measure units
      const baseUrl = "https://posback.shop";
      const endpoint = `${baseUrl}/ten/measure-units/${id}/`;
      
      const token = localStorage.getItem("auth_token");
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

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(tokenString && { Authorization: `Bearer ${tokenString}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      throw new Error(`Failed to fetch measure unit: ${error.message}`);
    }
  },
};

export default measureUnitsService;

