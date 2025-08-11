import { createSlice } from "@reduxjs/toolkit";

// Mock-only Redux slice for Manager domain
// Placeholder until backend/APIs exist. Keep minimal, no real business logic.

const initialState = {
  dashboard: {
    metrics: {},
    charts: {},
  },
  vouchers: {
    payments: [],
    expenses: [],
    receipts: [],
  },
  suppliers: [],
  invoices: [],
  returns: [],
  loading: false,
  error: null,
};

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {
    setManagerDashboard(state, action) {
      state.dashboard = { ...state.dashboard, ...(action.payload || {}) };
    },
    setManagerVouchers(state, action) {
      state.vouchers = { ...state.vouchers, ...(action.payload || {}) };
    },
    setManagerSuppliers(state, action) {
      state.suppliers = Array.isArray(action.payload) ? action.payload : [];
    },
    setManagerInvoices(state, action) {
      state.invoices = Array.isArray(action.payload) ? action.payload : [];
    },
    setManagerReturns(state, action) {
      state.returns = Array.isArray(action.payload) ? action.payload : [];
    },
    setManagerLoading(state, action) {
      state.loading = Boolean(action.payload);
    },
    setManagerError(state, action) {
      state.error = action.payload || null;
    },
    clearManagerError(state) {
      state.error = null;
    },
    resetManagerState() {
      return initialState;
    },
  },
});

export const {
  setManagerDashboard,
  setManagerVouchers,
  setManagerSuppliers,
  setManagerInvoices,
  setManagerReturns,
  setManagerLoading,
  setManagerError,
  clearManagerError,
  resetManagerState,
} = managerSlice.actions;

export default managerSlice.reducer;
