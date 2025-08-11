import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOnline: false,
  activeRoute: null,
  deliverySettings: {
    autoAcceptOrders: false,
    soundNotifications: true,
    showEarnings: true,
    vehicleType: "car", // car, motorcycle, bicycle
    vehiclePlate: "",
    licenseNumber: "",
    notificationPreferences: {
      newOrders: true,
      orderStatus: true,
      payment: true,
      locationTracking: true,
    },
  },
  // Mock buckets (placeholders only; no business logic)
  orders: [],
  actions: [],
  payments: [],
  loading: false,
  error: null,
};

const deliverySlice = createSlice({
  name: "delivery",
  initialState,
  reducers: {
    // Toggle online status
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },

    // Set active delivery route
    setActiveRoute: (state, action) => {
      state.activeRoute = action.payload;
    },

    // Update delivery settings
    updateDeliverySettings: (state, action) => {
      state.deliverySettings = {
        ...state.deliverySettings,
        ...action.payload,
      };
    },

    // Update notification preferences
    updateNotificationPreferences: (state, action) => {
      state.deliverySettings.notificationPreferences = {
        ...state.deliverySettings.notificationPreferences,
        ...action.payload,
      };
    },

    // Update vehicle information
    updateVehicleInfo: (state, action) => {
      const { vehicleType, vehiclePlate, licenseNumber } = action.payload;
      state.deliverySettings = {
        ...state.deliverySettings,
        vehicleType: vehicleType || state.deliverySettings.vehicleType,
        vehiclePlate: vehiclePlate || state.deliverySettings.vehiclePlate,
        licenseNumber: licenseNumber || state.deliverySettings.licenseNumber,
      };
    },
    // Mock-only setters for parity across domains
    setDeliveryOrders: (state, action) => {
      state.orders = Array.isArray(action.payload) ? action.payload : [];
    },
    setDeliveryActions: (state, action) => {
      state.actions = Array.isArray(action.payload) ? action.payload : [];
    },
    setDeliveryPayments: (state, action) => {
      state.payments = Array.isArray(action.payload) ? action.payload : [];
    },
    setDeliveryLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setDeliveryError: (state, action) => {
      state.error = action.payload || null;
    },
    clearDeliveryError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setOnlineStatus,
  setActiveRoute,
  updateDeliverySettings,
  updateNotificationPreferences,
  updateVehicleInfo,
  setDeliveryOrders,
  setDeliveryActions,
  setDeliveryPayments,
  setDeliveryLoading,
  setDeliveryError,
  clearDeliveryError,
} = deliverySlice.actions;

export default deliverySlice.reducer;
