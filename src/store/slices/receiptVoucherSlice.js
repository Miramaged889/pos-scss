import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { receiptVoucherService } from "../../services/receiptVoucherService";

// Async thunks for API calls
export const fetchReceipts = createAsyncThunk(
  "receiptVoucher/fetchReceipts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await receiptVoucherService.getReceipts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch receipts");
    }
  }
);

export const createReceipt = createAsyncThunk(
  "receiptVoucher/createReceipt",
  async (receiptData, { rejectWithValue }) => {
    try {
      const response = await receiptVoucherService.createReceipt(receiptData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create receipt");
    }
  }
);

export const updateReceipt = createAsyncThunk(
  "receiptVoucher/updateReceipt",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await receiptVoucherService.updateReceipt(id, updates);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update receipt");
    }
  }
);

export const deleteReceipt = createAsyncThunk(
  "receiptVoucher/deleteReceipt",
  async (id, { rejectWithValue }) => {
    try {
      await receiptVoucherService.deleteReceipt(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete receipt");
    }
  }
);

const initialState = {
  receipts: [],
  loading: false,
  error: null,
};

const receiptVoucherSlice = createSlice({
  name: "receiptVoucher",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch receipts
      .addCase(fetchReceipts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.loading = false;
        state.receipts = action.payload;
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create receipt
      .addCase(createReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.receipts.unshift(action.payload);
      })
      .addCase(createReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update receipt
      .addCase(updateReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReceipt.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.receipts.findIndex(
          (receipt) => receipt.id === action.payload.id
        );
        if (index !== -1) {
          state.receipts[index] = action.payload;
        }
      })
      .addCase(updateReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete receipt
      .addCase(deleteReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.receipts = state.receipts.filter(
          (receipt) => receipt.id !== action.payload
        );
      })
      .addCase(deleteReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = receiptVoucherSlice.actions;
export default receiptVoucherSlice.reducer;
