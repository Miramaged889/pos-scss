import { createSlice } from "@reduxjs/toolkit";
import {
  getOrders,
  saveOrders,
  addOrder as addOrderToStorage,
} from "../../utils/localStorage";

const initialState = {
  orders: [],
  loading: false,
  error: null,
  filters: {
    status: "all",
    date: "all",
    priority: "all",
  },
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder: (state, action) => {
      // Use localStorage function to add order with unique ID and auto-create customer
      const newOrder = addOrderToStorage({
        items: action.payload.products?.length || 0,
        ...action.payload,
        status: "pending",
        priority: action.payload.priority || "normal",
        assignedDriver: null,
      });

      // Add to Redux state
      state.orders.unshift(newOrder);
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status, notes, driverName } = action.payload;
      const order = state.orders.find((order) => order.id === orderId);
      if (order) {
        order.status = status;
        if (notes) order.kitchenNotes = notes;
        if (driverName) order.assignedDriver = driverName;
        order.updatedAt = new Date().toISOString();
        saveOrders(state.orders);
      }
    },
    assignDriver: (state, action) => {
      const { orderId, driverName } = action.payload;
      const order = state.orders.find((order) => order.id === orderId);
      if (order) {
        order.assignedDriver = driverName;
        order.updatedAt = new Date().toISOString();
        // Auto-update status if assigning driver to ready order
        if (order.status === "ready") {
          order.status = "out_for_delivery";
        }
        saveOrders(state.orders);
      }
    },
    updateOrder: (state, action) => {
      const { orderId, updates } = action.payload;
      const order = state.orders.find((order) => order.id === orderId);
      if (order) {
        Object.assign(order, updates);
        order.updatedAt = new Date().toISOString();
        saveOrders(state.orders);
      }
    },
    deleteOrder: (state, action) => {
      const orderId = action.payload;
      state.orders = state.orders.filter((order) => order.id !== orderId);
      saveOrders(state.orders);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: "all",
        date: "all",
        priority: "all",
      };
    },
    loadOrdersFromStorage: (state) => {
      const orders = getOrders();
      state.orders = orders || [];
    },
    refreshOrders: (state) => {
      // Simulate auto-refresh with updated timestamps
      state.orders = state.orders.map((order) => ({
        ...order,
        lastRefresh: new Date().toISOString(),
      }));
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addOrder,
  updateOrderStatus,
  assignDriver,
  updateOrder,
  deleteOrder,
  loadOrdersFromStorage,
  setFilters,
  clearFilters,
  refreshOrders,
  setLoading,
  setError,
  clearError,
} = ordersSlice.actions;

export default ordersSlice.reducer;
