import { createSlice } from "@reduxjs/toolkit";

const generateMockInventory = () => [
  {
    id: 1,
    name: "برجر لحم",
    nameEn: "Beef Burger",
    category: "main",
    stock: 25,
    minStock: 10,
    price: 25,
    supplier: "مؤسسة اللحوم الطازجة",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 2,
    name: "دجاج مشوي",
    nameEn: "Grilled Chicken",
    category: "main",
    stock: 15,
    minStock: 8,
    price: 35,
    supplier: "مزرعة الدواجن الذهبية",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 3,
    name: "بطاطس مقلية",
    nameEn: "French Fries",
    category: "side",
    stock: 30,
    minStock: 15,
    price: 15,
    supplier: "مستودع الخضار",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 4,
    name: "سلطة خضراء",
    nameEn: "Green Salad",
    category: "side",
    stock: 5,
    minStock: 10,
    price: 20,
    supplier: "مستودع الخضار",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 5,
    name: "بيتزا مارجريتا",
    nameEn: "Margherita Pizza",
    category: "main",
    stock: 12,
    minStock: 5,
    price: 45,
    supplier: "مطعم الإيطالي",
    lastUpdated: new Date().toISOString(),
  },
];

const initialState = {
  products: generateMockInventory(),
  loading: false,
  error: null,
  lowStockAlert: true,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    updateStock: (state, action) => {
      const { productId, quantity, operation } = action.payload;
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        if (operation === "add") {
          product.stock += quantity;
        } else if (operation === "subtract") {
          product.stock = Math.max(0, product.stock - quantity);
        } else {
          product.stock = quantity;
        }
        product.lastUpdated = new Date().toISOString();
      }
    },
    addProduct: (state, action) => {
      const newProduct = {
        id: Date.now(),
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
      state.products.push(newProduct);
    },
    updateProduct: (state, action) => {
      const { productId, updates } = action.payload;
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        Object.assign(product, updates);
        product.lastUpdated = new Date().toISOString();
      }
    },
    deleteProduct: (state, action) => {
      const productId = action.payload;
      state.products = state.products.filter((p) => p.id !== productId);
    },
    toggleLowStockAlert: (state) => {
      state.lowStockAlert = !state.lowStockAlert;
    },
  },
});

export const {
  updateStock,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleLowStockAlert,
} = inventorySlice.actions;

export default inventorySlice.reducer;
