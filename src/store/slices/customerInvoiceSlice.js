import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customerInvoiceService } from "../../services/customerInvoiceService";

// Async thunks for API calls
export const fetchCustomerInvoices = createAsyncThunk(
  "customerInvoices/fetchCustomerInvoices",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await customerInvoiceService.getCustomerInvoices(params);
      return response;
    } catch (error) {
      console.error("Error fetching customer invoices:", error);
      return rejectWithValue(
        error.message || "Failed to fetch customer invoices"
      );
    }
  }
);

export const createCustomerInvoice = createAsyncThunk(
  "customerInvoices/createCustomerInvoice",
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await customerInvoiceService.createCustomerInvoice(
        invoiceData
      );
      return response;
    } catch (error) {
      console.error("Error creating customer invoice:", error);
      return rejectWithValue(
        error.message || "Failed to create customer invoice"
      );
    }
  }
);

export const updateCustomerInvoice = createAsyncThunk(
  "customerInvoices/updateCustomerInvoice",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await customerInvoiceService.updateCustomerInvoice(
        id,
        updates
      );
      return response;
    } catch (error) {
      console.error("Error updating customer invoice:", error);
      return rejectWithValue(
        error.message || "Failed to update customer invoice"
      );
    }
  }
);

export const deleteCustomerInvoice = createAsyncThunk(
  "customerInvoices/deleteCustomerInvoice",
  async (id, { rejectWithValue }) => {
    try {
      await customerInvoiceService.deleteCustomerInvoice(id);
      return id;
    } catch (error) {
      console.error("Error deleting customer invoice:", error);
      return rejectWithValue(
        error.message || "Failed to delete customer invoice"
      );
    }
  }
);

const initialState = {
  customerInvoices: [],
  loading: false,
  error: null,
};

const customerInvoiceSlice = createSlice({
  name: "customerInvoices",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch customer invoices
    builder
      .addCase(fetchCustomerInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.customerInvoices = action.payload;
      })
      .addCase(fetchCustomerInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create customer invoice
      .addCase(createCustomerInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomerInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.customerInvoices.push(action.payload);
      })
      .addCase(createCustomerInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update customer invoice
      .addCase(updateCustomerInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customerInvoices.findIndex(
          (invoice) => invoice.id === action.payload.id
        );
        if (index !== -1) {
          state.customerInvoices[index] = action.payload;
        }
      })
      .addCase(updateCustomerInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete customer invoice
      .addCase(deleteCustomerInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomerInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.customerInvoices = state.customerInvoices.filter(
          (invoice) => invoice.id !== action.payload
        );
      })
      .addCase(deleteCustomerInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = customerInvoiceSlice.actions;
export default customerInvoiceSlice.reducer;
