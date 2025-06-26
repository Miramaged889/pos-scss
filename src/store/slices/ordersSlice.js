import { createSlice } from "@reduxjs/toolkit";

const generateMockOrders = () => [
  {
    id: 1,
    customer: "أحمد محمد",
    products: [
      { name: "برجر لحم", quantity: 2, price: 25 },
      { name: "بطاطس مقلية", quantity: 1, price: 15 },
    ],
    total: 65,
    status: "pending",
    createdAt: new Date().toISOString(),
    assignedDriver: null,
    kitchenNotes: "",
    deliveryAddress: "الرياض، حي النرجس",
    customerPhone: "+966501234567",
  },
  {
    id: 2,
    customer: "فاطمة السعد",
    products: [
      { name: "دجاج مشوي", quantity: 1, price: 35 },
      { name: "سلطة خضراء", quantity: 1, price: 20 },
    ],
    total: 55,
    status: "preparing",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    assignedDriver: "سعد الأحمد",
    kitchenNotes: "بدون بصل",
    deliveryAddress: "جدة، حي الزهراء",
    customerPhone: "+966502345678",
  },
  {
    id: 3,
    customer: "محمد العلي",
    products: [
      { name: "بيتزا مارجريتا", quantity: 1, price: 45 },
      { name: "مشروب غازي", quantity: 2, price: 10 },
    ],
    total: 65,
    status: "ready",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    assignedDriver: "خالد الرشيد",
    kitchenNotes: "",
    deliveryAddress: "الدمام، حي الشاطئ",
    customerPhone: "+966503456789",
  },
];

const initialState = {
  orders: generateMockOrders(),
  loading: false,
  error: null,
  filters: {
    status: "all",
    date: "today",
  },
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder: (state, action) => {
      const newOrder = {
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      state.orders.unshift(newOrder);
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status, notes } = action.payload;
      const order = state.orders.find((order) => order.id === orderId);
      if (order) {
        order.status = status;
        if (notes) order.kitchenNotes = notes;
        order.updatedAt = new Date().toISOString();
      }
    },
    assignDriver: (state, action) => {
      const { orderId, driverName } = action.payload;
      const order = state.orders.find((order) => order.id === orderId);
      if (order) {
        order.assignedDriver = driverName;
        order.updatedAt = new Date().toISOString();
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    refreshOrders: (state) => {
      // Simulate auto-refresh
      state.orders = state.orders.map((order) => ({
        ...order,
        lastRefresh: new Date().toISOString(),
      }));
    },
  },
});

export const {
  addOrder,
  updateOrderStatus,
  assignDriver,
  setFilters,
  refreshOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;
