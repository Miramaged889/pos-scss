import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for auto-refresh functionality
 * @param {Function} callback - The function to call on each refresh
 * @param {number} interval - The refresh interval in milliseconds
 * @param {boolean} enabled - Whether auto-refresh is enabled
 * @returns {object} - Control functions and state
 */
const useAutoRefresh = (callback, interval = 30000, enabled = true) => {
  const [isActive, setIsActive] = useState(enabled);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const intervalRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Start/stop auto-refresh based on isActive state
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        callbackRef.current();
        setLastRefresh(new Date());
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, interval]);

  // Manual refresh function
  const refresh = () => {
    callbackRef.current();
    setLastRefresh(new Date());
  };

  // Start auto-refresh
  const start = () => setIsActive(true);

  // Stop auto-refresh
  const stop = () => setIsActive(false);

  // Toggle auto-refresh
  const toggle = () => setIsActive((prev) => !prev);

  return {
    isActive,
    lastRefresh,
    refresh,
    start,
    stop,
    toggle,
  };
};

export default useAutoRefresh;
