import { createSlice } from "@reduxjs/toolkit";

const generateMockOrders = () => [
  {
    id: 1001,
    customer: "أحمد محمد علي",
    phone: "+966501234567",
    items: 3,
    products: [
      { name: "برجر لحم", nameEn: "Beef Burger", quantity: 2, price: 25 },
      { name: "بطاطس مقلية", nameEn: "French Fries", quantity: 1, price: 15 },
    ],
    total: 65,
    status: "pending",
    priority: "normal",
    createdAt: "2025-01-15T14:30:00.000Z",
    updatedAt: "2025-01-15T14:30:00.000Z",
    assignedDriver: null,
    kitchenNotes: "",
    deliveryAddress: "الرياض، حي النرجس، شارع الملك فهد",
    generalNotes: "تسليم سريع",
  },
  {
    id: 1002,
    customer: "فاطمة السعد",
    phone: "+966502345678",
    items: 2,
    products: [
      { name: "دجاج مشوي", nameEn: "Grilled Chicken", quantity: 1, price: 35 },
      { name: "سلطة خضراء", nameEn: "Green Salad", quantity: 1, price: 20 },
    ],
    total: 55,
    status: "processing",
    priority: "medium",
    createdAt: "2025-01-15T13:15:00.000Z",
    updatedAt: "2025-01-15T13:45:00.000Z",
    assignedDriver: "سعد الأحمد",
    kitchenNotes: "بدون بصل",
    deliveryAddress: "جدة، حي الزهراء، طريق الأمير سلطان",
    generalNotes: "",
  },
  {
    id: 1003,
    customer: "محمد العلي",
    phone: "+966503456789",
    items: 3,
    products: [
      {
        name: "بيتزا مارجريتا",
        nameEn: "Margherita Pizza",
        quantity: 1,
        price: 45,
      },
      { name: "مشروب غازي", nameEn: "Soft Drink", quantity: 2, price: 10 },
    ],
    total: 65,
    status: "completed",
    priority: "normal",
    createdAt: "2025-01-15T12:00:00.000Z",
    updatedAt: "2025-01-15T13:30:00.000Z",
    assignedDriver: "خالد الرشيد",
    kitchenNotes: "",
    deliveryAddress: "الدمام، حي الشاطئ، شارع الكورنيش",
    generalNotes: "عميل VIP",
  },
  {
    id: 1004,
    customer: "سارة الحربي",
    phone: "+966504567890",
    items: 4,
    products: [
      { name: "سلطة سيزر", nameEn: "Caesar Salad", quantity: 2, price: 25 },
      { name: "خبز ثوم", nameEn: "Garlic Bread", quantity: 2, price: 12 },
    ],
    total: 74,
    status: "cancelled",
    priority: "normal",
    createdAt: "2025-01-15T11:00:00.000Z",
    updatedAt: "2025-01-15T11:30:00.000Z",
    assignedDriver: null,
    kitchenNotes: "",
    deliveryAddress: "الرياض، حي العليا، شارع التحلية",
    generalNotes: "إلغاء بطلب العميل",
  },
  {
    id: 1005,
    customer: "عبدالله الشمري",
    phone: "+966505678901",
    items: 5,
    products: [
      { name: "ستيك لحم", nameEn: "Beef Steak", quantity: 1, price: 85 },
      {
        name: "بطاطس مهروسة",
        nameEn: "Mashed Potatoes",
        quantity: 1,
        price: 18,
      },
      {
        name: "خضار مشوية",
        nameEn: "Grilled Vegetables",
        quantity: 1,
        price: 22,
      },
    ],
    total: 125,
    status: "processing",
    priority: "urgent",
    createdAt: "2025-01-15T14:00:00.000Z",
    updatedAt: "2025-01-15T14:15:00.000Z",
    assignedDriver: "أحمد الغامدي",
    kitchenNotes: "ستيك ويل دن",
    deliveryAddress: "مكة المكرمة، حي العزيزية، شارع الحرم",
    generalNotes: "طلب عاجل - مناسبة خاصة",
  },
  {
    id: 1006,
    customer: "نورا القحطاني",
    phone: "+966506789012",
    items: 2,
    products: [
      { name: "سوشي مشكل", nameEn: "Mixed Sushi", quantity: 1, price: 65 },
      { name: "حساء ميسو", nameEn: "Miso Soup", quantity: 1, price: 15 },
    ],
    total: 80,
    status: "pending",
    priority: "medium",
    createdAt: "2025-01-15T14:15:00.000Z",
    updatedAt: "2025-01-15T14:15:00.000Z",
    assignedDriver: null,
    kitchenNotes: "بدون واسابي",
    deliveryAddress: "الرياض، حي الملز، شارع الأمير محمد بن عبدالعزيز",
    generalNotes: "",
  },
  {
    id: 1007,
    customer: "خالد المطيري",
    phone: "+966507890123",
    items: 6,
    products: [
      { name: "وجبة عائلية", nameEn: "Family Meal", quantity: 1, price: 120 },
      {
        name: "مشروبات متنوعة",
        nameEn: "Assorted Drinks",
        quantity: 4,
        price: 8,
      },
    ],
    total: 152,
    status: "completed",
    priority: "normal",
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-01-15T12:30:00.000Z",
    assignedDriver: "محمد الزهراني",
    kitchenNotes: "",
    deliveryAddress: "جدة، حي الروضة، شارع فلسطين",
    generalNotes: "عميل مميز",
  },
  {
    id: 1008,
    customer: "ريم العتيبي",
    phone: "+966508901234",
    items: 3,
    products: [
      {
        name: "باستا كاربونارا",
        nameEn: "Carbonara Pasta",
        quantity: 1,
        price: 42,
      },
      { name: "سلطة إيطالية", nameEn: "Italian Salad", quantity: 1, price: 28 },
      { name: "تيراميسو", nameEn: "Tiramisu", quantity: 1, price: 25 },
    ],
    total: 95,
    status: "processing",
    priority: "normal",
    createdAt: "2025-01-15T13:30:00.000Z",
    updatedAt: "2025-01-15T14:00:00.000Z",
    assignedDriver: "عبدالرحمن الدوسري",
    kitchenNotes: "الباستا الدنتي",
    deliveryAddress: "الدمام، حي الفيصلية، شارع الظهران",
    generalNotes: "",
  },
];

const initialState = {
  orders: generateMockOrders(),
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
      const newOrder = {
        id: Date.now(),
        items: action.payload.products?.length || 0,
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "pending",
        priority: action.payload.priority || "normal",
        assignedDriver: null,
      };
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
      }
    },
    updateOrder: (state, action) => {
      const { orderId, updates } = action.payload;
      const order = state.orders.find((order) => order.id === orderId);
      if (order) {
        Object.assign(order, updates);
        order.updatedAt = new Date().toISOString();
      }
    },
    deleteOrder: (state, action) => {
      const orderId = action.payload;
      state.orders = state.orders.filter((order) => order.id !== orderId);
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
  setFilters,
  clearFilters,
  refreshOrders,
  setLoading,
  setError,
  clearError,
} = ordersSlice.actions;

export default ordersSlice.reducer;
