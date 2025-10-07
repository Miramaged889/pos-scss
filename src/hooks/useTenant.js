/**
 * Custom hook for tenant management
 */

import { useState, useEffect } from "react";
import { tenantService } from "../services";

export const useTenant = () => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeTenant = async () => {
      try {
        setLoading(true);
        setError(null);

        const tenantInfo = await tenantService.initializeTenant();
        setTenant(tenantInfo);
      } catch (err) {
        console.error("Failed to initialize tenant:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeTenant();
  }, []);

  const refreshTenant = async () => {
    try {
      setLoading(true);
      setError(null);

      const tenantInfo = await tenantService.initializeTenant();
      setTenant(tenantInfo);
    } catch (err) {
      console.error("Failed to refresh tenant:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setTenantForDevelopment = (subdomain) => {
    tenantService.setTenantForDevelopment(subdomain);
    refreshTenant();
  };

  return {
    tenant,
    loading,
    error,
    refreshTenant,
    setTenantForDevelopment,
    isTenantValid: tenant && tenant.status === "success",
  };
};

export default useTenant;
