import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import languageSlice from "./slices/languageSlice";
import ordersSlice from "./slices/ordersSlice";
import inventorySlice from "./slices/inventorySlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    language: languageSlice,
    orders: ordersSlice,
    inventory: inventorySlice,
  },
});

// Export as default for easier importing
export default store;
