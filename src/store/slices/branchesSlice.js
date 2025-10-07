import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { branchesService } from "../../services";

// Async thunks for API calls
export const fetchBranches = createAsyncThunk(
  "branches/fetchBranches",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await branchesService.getBranches(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBranch = createAsyncThunk(
  "branches/createBranch",
  async (branchData, { rejectWithValue }) => {
    try {
      const response = await branchesService.createBranch(branchData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBranch = createAsyncThunk(
  "branches/updateBranch",
  async ({ id, branchData }, { rejectWithValue }) => {
    try {
      const response = await branchesService.updateBranch(id, branchData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBranch = createAsyncThunk(
  "branches/deleteBranch",
  async (id, { rejectWithValue }) => {
    try {
      await branchesService.deleteBranch(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBranch = createAsyncThunk(
  "branches/getBranch",
  async (id, { rejectWithValue }) => {
    try {
      const response = await branchesService.getBranch(id);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  branches: [],
  selectedBranch: null,
  loading: false,
  error: null,
};

const branchesSlice = createSlice({
  name: "branches",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedBranch: (state, action) => {
      state.selectedBranch = action.payload;
    },
    clearSelectedBranch: (state) => {
      state.selectedBranch = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch branches
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create branch
      .addCase(createBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches.push(action.payload);
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update branch
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.branches.findIndex(
          (branch) => branch.id === action.payload.id
        );
        if (index !== -1) {
          state.branches[index] = action.payload;
        }
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete branch
      .addCase(deleteBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.filter(
          (branch) => branch.id !== action.payload
        );
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get single branch
      .addCase(getBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBranch = action.payload;
      })
      .addCase(getBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedBranch, clearSelectedBranch } =
  branchesSlice.actions;

export default branchesSlice.reducer;
