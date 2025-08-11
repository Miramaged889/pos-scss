import { createSlice } from "@reduxjs/toolkit";

// Mock-only Redux slice for Seller domain
// Placeholder until backend/APIs exist. Keep minimal structure only.

const initialState = {
  customers: [],
  products: [],
  orders: [],
  vouchers: {
    payments: [],
    expenses: [],
    receipts: [],
  },
  invoices: [],
  returns: [],
  loading: false,
  error: null,
};

const sellerSlice = createSlice({
  name: "seller",
  initialState,
  reducers: {
    setSellerCustomers(state, action) {
      state.customers = Array.isArray(action.payload) ? action.payload : [];
    },
    setSellerProducts(state, action) {
      state.products = Array.isArray(action.payload) ? action.payload : [];
    },
    setSellerOrders(state, action) {
      state.orders = Array.isArray(action.payload) ? action.payload : [];
    },
    setSellerVouchers(state, action) {
      state.vouchers = { ...state.vouchers, ...(action.payload || {}) };
    },
    setSellerInvoices(state, action) {
      state.invoices = Array.isArray(action.payload) ? action.payload : [];
    },
    setSellerReturns(state, action) {
      state.returns = Array.isArray(action.payload) ? action.payload : [];
    },
    setSellerLoading(state, action) {
      state.loading = Boolean(action.payload);
    },
    setSellerError(state, action) {
      state.error = action.payload || null;
    },
    clearSellerError(state) {
      state.error = null;
    },
    resetSellerState() {
      return initialState;
    },
  },
});

export const {
  setSellerCustomers,
  setSellerProducts,
  setSellerOrders,
  setSellerVouchers,
  setSellerInvoices,
  setSellerReturns,
  setSellerLoading,
  setSellerError,
  clearSellerError,
  resetSellerState,
} = sellerSlice.actions;

export default sellerSlice.reducer;
