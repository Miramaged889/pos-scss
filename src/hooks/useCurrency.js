import { useSelector } from "react-redux";
import { useCallback } from "react";
import { getCurrencyDisplay } from "../utils/formatters";

/**
 * Custom hook to get currency display based on language mode
 * @returns {Object} - Currency utilities
 */
export const useCurrency = () => {
  const { isRTL } = useSelector((state) => state.language);
  const { currencyDetails } = useSelector((state) => state.tenant);

  /**
   * Get the currency display string
   * In Arabic mode: returns symbol (e.g., "د.إ")
   * In English mode: returns code (e.g., "AED")
   */
  const currency = useCallback(() => {
    return getCurrencyDisplay(currencyDetails, isRTL);
  }, [currencyDetails, isRTL]);

  /**
   * Get the full currency object
   */
  const currencyData = useCallback(() => {
    return currencyDetails;
  }, [currencyDetails]);

  /**
   * Get currency symbol
   */
  const currencySymbol = useCallback(() => {
    if (!currencyDetails) return isRTL ? "ر.س" : "$";
    return currencyDetails.symbol || currencyDetails.Currency_code || (isRTL ? "ر.س" : "SAR");
  }, [currencyDetails, isRTL]);

  /**
   * Get currency code
   */
  const currencyCode = useCallback(() => {
    if (!currencyDetails) return "SAR";
    return currencyDetails.code || currencyDetails.Currency_code || "SAR";
  }, [currencyDetails]);

  /**
   * Get currency name
   */
  const currencyName = useCallback(() => {
    if (!currencyDetails) return "Saudi Riyal";
    return currencyDetails.name || currencyDetails.Currency_name || "Saudi Riyal";
  }, [currencyDetails]);

  return {
    currency,
    currencyData,
    currencySymbol,
    currencyCode,
    currencyName,
    isRTL,
  };
};

export default useCurrency;
