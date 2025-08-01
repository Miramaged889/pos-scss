import { createSlice } from "@reduxjs/toolkit";

const ROLES = {
  SELLER: "seller",
  KITCHEN: "kitchen",
  DELIVERY: "delivery",
  MANAGER: "manager",
};

const ROLE_EMAILS = {
  "seller@company.com": ROLES.SELLER,
  "kitchen@company.com": ROLES.KITCHEN,
  "delivery@company.com": ROLES.DELIVERY,
  "manager@company.com": ROLES.MANAGER,
};

const loadAuthFromStorage = () => {
  try {
    const savedAuth = localStorage.getItem("auth");
    return savedAuth ? JSON.parse(savedAuth) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  ...loadAuthFromStorage(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { email } = action.payload;
      const role = ROLE_EMAILS[email];

      if (role) {
        state.user = { email };
        state.role = role;
        state.isAuthenticated = true;

        // Save to localStorage
        localStorage.setItem(
          "auth",
          JSON.stringify({
            user: state.user,
            role: state.role,
            isAuthenticated: state.isAuthenticated,
          })
        );
      }
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth");
    },
    validateEmail: (state, action) => {
      const { email } = action.payload;
      return email in ROLE_EMAILS;
    },
  },
});

export const { login, logout, validateEmail } = authSlice.actions;
export { ROLES, ROLE_EMAILS };
export default authSlice.reducer;
