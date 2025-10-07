import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tenantService } from "../../services";

// Initial state
const initialState = {
  tenantInfo: null,
  branchLimits: {
    currentBranches: 0,
    maxBranches: 0,
    remainingBranches: 0,
    canAddBranch: true,
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchTenantInfo = createAsyncThunk(
  "tenant/fetchTenantInfo",
  async (_, { rejectWithValue }) => {
    try {
      const tenantInfo = await tenantService.getTenantInfo();
      return tenantInfo;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkBranchLimits = createAsyncThunk(
  "tenant/checkBranchLimits",
  async (_, { rejectWithValue }) => {
    try {
      const limits = await tenantService.canAddBranch();
      return limits;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTenantInfo = createAsyncThunk(
  "tenant/updateTenantInfo",
  async (tenantData, { rejectWithValue }) => {
    try {
      const updatedTenant = await tenantService.updateTenantInfo(tenantData);
      return updatedTenant;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    clearTenantError: (state) => {
      state.error = null;
    },
    updateBranchCount: (state, action) => {
      const newCount = action.payload;
      state.branchLimits.currentBranches = newCount;
      state.branchLimits.remainingBranches = Math.max(
        0,
        state.branchLimits.maxBranches - newCount
      );
      state.branchLimits.canAddBranch =
        newCount < state.branchLimits.maxBranches;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tenant info
      .addCase(fetchTenantInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenantInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.tenantInfo = action.payload;
        // Update branch limits from tenant info - focus on no_branches field
        const currentBranches = action.payload.current_branches || 0;
        const maxBranches = action.payload.no_branches || 5; // Use no_branches as the limit

        state.branchLimits.currentBranches = currentBranches;
        state.branchLimits.maxBranches = maxBranches;
        state.branchLimits.remainingBranches = Math.max(
          0,
          maxBranches - currentBranches
        );
        state.branchLimits.canAddBranch = currentBranches < maxBranches;
      })
      .addCase(fetchTenantInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check branch limits
      .addCase(checkBranchLimits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkBranchLimits.fulfilled, (state, action) => {
        state.loading = false;
        // Update branch limits with the response from canAddBranch check
        state.branchLimits.currentBranches =
          action.payload.currentBranches || 0;
        state.branchLimits.maxBranches = action.payload.maxBranches || 5;
        state.branchLimits.remainingBranches =
          action.payload.remainingBranches || 0;
        state.branchLimits.canAddBranch = action.payload.canAdd || false;
      })
      .addCase(checkBranchLimits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update tenant info
      .addCase(updateTenantInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTenantInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.tenantInfo = action.payload;
        // Update branch limits from updated tenant info - focus on no_branches field
        const currentBranches = action.payload.current_branches || 0;
        const maxBranches = action.payload.no_branches || 5; // Use no_branches as the limit

        state.branchLimits.currentBranches = currentBranches;
        state.branchLimits.maxBranches = maxBranches;
        state.branchLimits.remainingBranches = Math.max(
          0,
          maxBranches - currentBranches
        );
        state.branchLimits.canAddBranch = currentBranches < maxBranches;
      })
      .addCase(updateTenantInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTenantError, updateBranchCount } = tenantSlice.actions;
export default tenantSlice.reducer;
