import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { voucherService } from "../../services/voucherService";

// Async thunks
export const fetchVouchers = createAsyncThunk(
  "vouchers/fetchVouchers",
  async (params = {}) => {
    const response = await voucherService.getVouchers(params);
    return response;
  }
);

export const fetchVoucher = createAsyncThunk(
  "vouchers/fetchVoucher",
  async (id) => {
    const response = await voucherService.getVoucher(id);
    return response;
  }
);

export const createVoucher = createAsyncThunk(
  "vouchers/createVoucher",
  async (voucherData) => {
    const response = await voucherService.createVoucher(voucherData);
    return response;
  }
);

export const updateVoucher = createAsyncThunk(
  "vouchers/updateVoucher",
  async ({ id, voucherData }) => {
    const response = await voucherService.updateVoucher(id, voucherData);
    return response;
  }
);

export const deleteVoucher = createAsyncThunk(
  "vouchers/deleteVoucher",
  async (id) => {
    const response = await voucherService.deleteVoucher(id);
    return { id, response };
  }
);

const voucherSlice = createSlice({
  name: "vouchers",
  initialState: {
    vouchers: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearVouchers: (state) => {
      state.vouchers = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch vouchers
    builder
      .addCase(fetchVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload.map((voucher) =>
          voucherService.transformVoucherFromAPI(voucher)
        );
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Fetch single voucher
      .addCase(fetchVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVoucher.fulfilled, (state, action) => {
        state.loading = false;
        const transformedVoucher = voucherService.transformVoucherFromAPI(
          action.payload
        );
        const existingIndex = state.vouchers.findIndex(
          (v) => v.id === transformedVoucher.id
        );
        if (existingIndex >= 0) {
          state.vouchers[existingIndex] = transformedVoucher;
        } else {
          state.vouchers.push(transformedVoucher);
        }
      })
      .addCase(fetchVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Create voucher
      .addCase(createVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers.unshift(action.payload);
      })
      .addCase(createVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update voucher
      .addCase(updateVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVoucher.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vouchers.findIndex(
          (v) => v.id === action.payload.id
        );
        if (index !== -1) {
          state.vouchers[index] = action.payload;
        }
      })
      .addCase(updateVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Delete voucher
      .addCase(deleteVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = state.vouchers.filter(
          (v) => v.id !== action.payload.id
        );
      })
      .addCase(deleteVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearVouchers } = voucherSlice.actions;
export default voucherSlice.reducer;
