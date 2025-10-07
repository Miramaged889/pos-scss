import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { financialService } from "../../services";

// Async thunks for API calls
export const fetchVouchers = createAsyncThunk(
  "manager/fetchVouchers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await financialService.getVouchers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchExpenseVouchers = createAsyncThunk(
  "manager/fetchExpenseVouchers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await financialService.getExpenseVouchers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPaymentVouchers = createAsyncThunk(
  "manager/fetchPaymentVouchers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await financialService.getPaymentVouchers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createVoucher = createAsyncThunk(
  "manager/createVoucher",
  async (voucherData, { rejectWithValue }) => {
    try {
      const response = await financialService.createVoucher(voucherData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVoucher = createAsyncThunk(
  "manager/updateVoucher",
  async ({ id, voucherData }, { rejectWithValue }) => {
    try {
      const response = await financialService.updateVoucher(id, voucherData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteVoucher = createAsyncThunk(
  "manager/deleteVoucher",
  async (id, { rejectWithValue }) => {
    try {
      await financialService.deleteVoucher(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSupplierInvoices = createAsyncThunk(
  "manager/fetchSupplierInvoices",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await financialService.getSupplierInvoices(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createSupplierInvoice = createAsyncThunk(
  "manager/createSupplierInvoice",
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await financialService.createSupplierInvoice(
        invoiceData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSupplierInvoice = createAsyncThunk(
  "manager/updateSupplierInvoice",
  async ({ id, invoiceData }, { rejectWithValue }) => {
    try {
      const response = await financialService.updateSupplierInvoice(
        id,
        invoiceData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSupplierInvoice = createAsyncThunk(
  "manager/deleteSupplierInvoice",
  async (id, { rejectWithValue }) => {
    try {
      await financialService.deleteSupplierInvoice(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPaymentMethods = createAsyncThunk(
  "manager/fetchPaymentMethods",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await financialService.getPaymentMethods(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPaymentMethod = createAsyncThunk(
  "manager/createPaymentMethod",
  async (methodData, { rejectWithValue }) => {
    try {
      const response = await financialService.createPaymentMethod(methodData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePaymentMethod = createAsyncThunk(
  "manager/updatePaymentMethod",
  async ({ id, methodData }, { rejectWithValue }) => {
    try {
      const response = await financialService.updatePaymentMethod(
        id,
        methodData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePaymentMethod = createAsyncThunk(
  "manager/deletePaymentMethod",
  async (id, { rejectWithValue }) => {
    try {
      await financialService.deletePaymentMethod(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSupplierReturns = createAsyncThunk(
  "manager/fetchSupplierReturns",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await financialService.getSupplierReturns(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createSupplierReturn = createAsyncThunk(
  "manager/createSupplierReturn",
  async (returnData, { rejectWithValue }) => {
    try {
      const response = await financialService.createSupplierReturn(returnData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSupplierReturn = createAsyncThunk(
  "manager/updateSupplierReturn",
  async ({ id, returnData }, { rejectWithValue }) => {
    try {
      const response = await financialService.updateSupplierReturn(
        id,
        returnData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSupplierReturn = createAsyncThunk(
  "manager/deleteSupplierReturn",
  async (id, { rejectWithValue }) => {
    try {
      await financialService.deleteSupplierReturn(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFinancialReports = createAsyncThunk(
  "manager/fetchFinancialReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await financialService.getFinancialReports(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  dashboard: {
    metrics: {},
    charts: {},
  },
  vouchers: {
    payments: [],
    expenses: [],
    receipts: [],
  },
  suppliers: [],
  invoices: [],
  returns: [],
  paymentMethods: [],
  reports: {
    sales: null,
    orders: null,
    sellers: null,
    kitchen: null,
    delivery: null,
  },
  loading: false,
  error: null,
};

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {
    setManagerDashboard(state, action) {
      state.dashboard = { ...state.dashboard, ...(action.payload || {}) };
    },
    setManagerVouchers(state, action) {
      state.vouchers = { ...state.vouchers, ...(action.payload || {}) };
    },
    setManagerSuppliers(state, action) {
      state.suppliers = Array.isArray(action.payload) ? action.payload : [];
    },
    setManagerInvoices(state, action) {
      state.invoices = Array.isArray(action.payload) ? action.payload : [];
    },
    setManagerReturns(state, action) {
      state.returns = Array.isArray(action.payload) ? action.payload : [];
    },
    setManagerPaymentMethods(state, action) {
      state.paymentMethods = Array.isArray(action.payload)
        ? action.payload
        : [];
    },
    setManagerReports(state, action) {
      state.reports = { ...state.reports, ...(action.payload || {}) };
    },
    setManagerLoading(state, action) {
      state.loading = Boolean(action.payload);
    },
    setManagerError(state, action) {
      state.error = action.payload || null;
    },
    clearManagerError(state) {
      state.error = null;
    },
    resetManagerState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Vouchers
    builder
      .addCase(fetchVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload;
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Expense Vouchers
      .addCase(fetchExpenseVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers.expenses = action.payload;
      })
      .addCase(fetchExpenseVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Payment Vouchers
      .addCase(fetchPaymentVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers.payments = action.payload;
      })
      .addCase(fetchPaymentVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Voucher
      .addCase(createVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.type === "expense") {
          state.vouchers.expenses.push(action.payload);
        } else if (action.payload.type === "payment") {
          state.vouchers.payments.push(action.payload);
        }
      })
      .addCase(createVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Voucher
      .addCase(updateVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVoucher.fulfilled, (state, action) => {
        state.loading = false;
        const voucher = action.payload;
        if (voucher.type === "expense") {
          const index = state.vouchers.expenses.findIndex(
            (v) => v.id === voucher.id
          );
          if (index !== -1) {
            state.vouchers.expenses[index] = voucher;
          }
        } else if (voucher.type === "payment") {
          const index = state.vouchers.payments.findIndex(
            (v) => v.id === voucher.id
          );
          if (index !== -1) {
            state.vouchers.payments[index] = voucher;
          }
        }
      })
      .addCase(updateVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Voucher
      .addCase(deleteVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVoucher.fulfilled, (state, action) => {
        state.loading = false;
        const voucherId = action.payload;
        state.vouchers.expenses = state.vouchers.expenses.filter(
          (v) => v.id !== voucherId
        );
        state.vouchers.payments = state.vouchers.payments.filter(
          (v) => v.id !== voucherId
        );
      })
      .addCase(deleteVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Supplier Invoices
      .addCase(fetchSupplierInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchSupplierInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Supplier Invoice
      .addCase(createSupplierInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplierInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.push(action.payload);
      })
      .addCase(createSupplierInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Supplier Invoice
      .addCase(updateSupplierInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplierInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex(
          (invoice) => invoice.id === action.payload.id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(updateSupplierInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Supplier Invoice
      .addCase(deleteSupplierInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplierInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.filter(
          (invoice) => invoice.id !== action.payload
        );
      })
      .addCase(deleteSupplierInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Payment Methods
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Payment Method
      .addCase(createPaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods.push(action.payload);
      })
      .addCase(createPaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Payment Method
      .addCase(updatePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.paymentMethods.findIndex(
          (method) => method.id === action.payload.id
        );
        if (index !== -1) {
          state.paymentMethods[index] = action.payload;
        }
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Payment Method
      .addCase(deletePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = state.paymentMethods.filter(
          (method) => method.id !== action.payload
        );
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Supplier Returns
      .addCase(fetchSupplierReturns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierReturns.fulfilled, (state, action) => {
        state.loading = false;
        state.returns = action.payload;
      })
      .addCase(fetchSupplierReturns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Supplier Return
      .addCase(createSupplierReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplierReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.returns.push(action.payload);
      })
      .addCase(createSupplierReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Supplier Return
      .addCase(updateSupplierReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplierReturn.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.returns.findIndex(
          (returnItem) => returnItem.id === action.payload.id
        );
        if (index !== -1) {
          state.returns[index] = action.payload;
        }
      })
      .addCase(updateSupplierReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Supplier Return
      .addCase(deleteSupplierReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplierReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.returns = state.returns.filter(
          (returnItem) => returnItem.id !== action.payload
        );
      })
      .addCase(deleteSupplierReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Financial Reports
      .addCase(fetchFinancialReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = { ...state.reports, ...action.payload };
      })
      .addCase(fetchFinancialReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setManagerDashboard,
  setManagerVouchers,
  setManagerSuppliers,
  setManagerInvoices,
  setManagerReturns,
  setManagerPaymentMethods,
  setManagerReports,
  setManagerLoading,
  setManagerError,
  clearManagerError,
  resetManagerState,
} = managerSlice.actions;

export default managerSlice.reducer;
