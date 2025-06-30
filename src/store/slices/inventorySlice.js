import { createSlice } from "@reduxjs/toolkit";
import { getProducts, saveProducts } from "../../utils/localStorage";

const initialState = {
  products: getProducts() || [],
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
      saveProducts(state.products);
    },
    updateProduct: (state, action) => {
      const { productId, updates } = action.payload;
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        Object.assign(product, updates);
        product.lastUpdated = new Date().toISOString();
        saveProducts(state.products);
      }
    },
    deleteProduct: (state, action) => {
      const productId = action.payload;
      state.products = state.products.filter((p) => p.id !== productId);
      saveProducts(state.products);
    },
    toggleLowStockAlert: (state) => {
      state.lowStockAlert = !state.lowStockAlert;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  updateStock,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleLowStockAlert,
  setLoading,
  setError,
  clearError,
} = inventorySlice.actions;

export default inventorySlice.reducer;
