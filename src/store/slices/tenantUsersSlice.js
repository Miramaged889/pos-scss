import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tenantUsersService } from "../../services";

// Async thunks for API calls
export const fetchTenantUsers = createAsyncThunk(
  "tenantUsers/fetchTenantUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await tenantUsersService.getTenantUsers(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTenantUser = createAsyncThunk(
  "tenantUsers/createTenantUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await tenantUsersService.createTenantUser(userData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTenantUser = createAsyncThunk(
  "tenantUsers/updateTenantUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await tenantUsersService.updateTenantUser(id, userData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTenantUser = createAsyncThunk(
  "tenantUsers/deleteTenantUser",
  async (id, { rejectWithValue }) => {
    try {
      await tenantUsersService.deleteTenantUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTenantUser = createAsyncThunk(
  "tenantUsers/getTenantUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await tenantUsersService.getTenantUser(id);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

const tenantUsersSlice = createSlice({
  name: "tenantUsers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch tenant users
    builder
      .addCase(fetchTenantUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenantUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTenantUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create tenant user
      .addCase(createTenantUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTenantUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createTenantUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update tenant user
      .addCase(updateTenantUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTenantUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateTenantUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete tenant user
      .addCase(deleteTenantUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTenantUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteTenantUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get single tenant user
      .addCase(getTenantUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTenantUser.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getTenantUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedUser, clearSelectedUser } =
  tenantUsersSlice.actions;

export default tenantUsersSlice.reducer;
