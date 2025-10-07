import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "../../services";

// Async thunks for API calls
export const fetchProducts = createAsyncThunk(
  "inventory/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(params);
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      return rejectWithValue(error.message || "Failed to fetch products");
    }
  }
);

export const createProduct = createAsyncThunk(
  "inventory/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(productData);
      return response;
    } catch (error) {
      console.error("Error creating product:", error);
      return rejectWithValue(error.message || "Failed to create product");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "inventory/updateProduct",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(id, updates);
      return response;
    } catch (error) {
      console.error("Error updating product:", error);
      return rejectWithValue(error.message || "Failed to update product");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "inventory/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error) {
      console.error("Error deleting product:", error);
      return rejectWithValue(error.message || "Failed to delete product");
    }
  }
);

const initialState = {
  products: [],
  loading: false,
  error: null,
  lowStockAlert: true,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    toggleLowStockAlert: (state) => {
      state.lowStockAlert = !state.lowStockAlert;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          (product) => product.id === action.payload.id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (product) => product.id !== action.payload
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { toggleLowStockAlert, clearError } = inventorySlice.actions;

export default inventorySlice.reducer;
