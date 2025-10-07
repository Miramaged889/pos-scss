import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService, API_ENDPOINTS } from "../../services";

const ROLES = {
  SELLER: "seller",
  KITCHEN: "kitchen",
  DELIVERY: "delivery",
  MANAGER: "manager",
};

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      // Clear any existing invalid token before login
      localStorage.removeItem("auth_token");
      const response = await apiService.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Handle the actual backend response structure
      // Backend returns: { role, token: { access, refresh }, msg }
      const { role, token } = response.data || response;

      // Extract access token from token object
      const accessToken = token?.access || token;

      // Store access token in localStorage
      localStorage.setItem("auth_token", accessToken);

      // Store refresh token separately (optional)
      if (token?.refresh) {
        localStorage.setItem("refresh_token", token.refresh);
      }

      // Create user object from credentials and role
      // Backend only returns role and token, not full user details
      const user = {
        id: Date.now(), // Temporary ID
        email: credentials.email,
        name: credentials.email.split("@")[0], // Extract name from email
        role: role,
      };

      return { user, role };
    } catch (error) {
      // Handle CORS errors more gracefully
      if (error.message.includes("CORS Error")) {
        return rejectWithValue(
          `CORS Error: Backend not accessible. Please check if the server is running and CORS is configured to allow ${window.location.origin}`
        );
      }

      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      return true;
    } catch (error) {
      // Even if API call fails, clear local tokens
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      return rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshTokenValue = localStorage.getItem("refresh_token");

      const response = await apiService.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh: refreshTokenValue,
      });

      const { token } = response.data || response;
      const accessToken = token?.access || token;

      localStorage.setItem("auth_token", accessToken);

      // Update refresh token if provided
      if (token?.refresh) {
        localStorage.setItem("refresh_token", token.refresh);
      }

      return accessToken;
    } catch (error) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      return rejectWithValue(error.message);
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(API_ENDPOINTS.AUTH.PROFILE);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Still clear auth state even if API call fails
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
      })

      // Refresh token
      .addCase(refreshToken.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
      })

      // Get profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export { ROLES };
export default authSlice.reducer;
