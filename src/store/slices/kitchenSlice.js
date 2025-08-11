import { createSlice } from "@reduxjs/toolkit";

// Mock-only Redux slice for Kitchen domain
// This slice is a placeholder until backend APIs are available.
// Do not wire business logic here; keep it minimal and safe to remove/replace later.

const initialState = {
  orders: [],
  settings: {
    autoRefresh: true,
    refreshIntervalSeconds: 30,
    soundNotifications: true,
    showPriorityAlerts: true,
  },
  stats: {
    totalOrders: 0,
    completedOrders: 0,
    averagePreparationMinutes: 0,
  },
  filters: {
    status: "all",
    dateRange: "all",
    sortBy: "newest",
    search: "",
  },
  loading: false,
  error: null,
};

const kitchenSlice = createSlice({
  name: "kitchen",
  initialState,
  reducers: {
    setKitchenOrders(state, action) {
      state.orders = Array.isArray(action.payload) ? action.payload : [];
    },
    setKitchenSettings(state, action) {
      state.settings = { ...state.settings, ...(action.payload || {}) };
    },
    setKitchenStats(state, action) {
      state.stats = { ...state.stats, ...(action.payload || {}) };
    },
    setKitchenFilters(state, action) {
      state.filters = { ...state.filters, ...(action.payload || {}) };
    },
    clearKitchenFilters(state) {
      state.filters = initialState.filters;
    },
    setKitchenLoading(state, action) {
      state.loading = Boolean(action.payload);
    },
    setKitchenError(state, action) {
      state.error = action.payload || null;
    },
    clearKitchenError(state) {
      state.error = null;
    },
    resetKitchenState() {
      return initialState;
    },
  },
});

export const {
  setKitchenOrders,
  setKitchenSettings,
  setKitchenStats,
  setKitchenFilters,
  clearKitchenFilters,
  setKitchenLoading,
  setKitchenError,
  clearKitchenError,
  resetKitchenState,
} = kitchenSlice.actions;

export default kitchenSlice.reducer;
