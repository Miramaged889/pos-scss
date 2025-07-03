import { configureStore } from "@reduxjs/toolkit";
import ordersReducer from "./slices/ordersSlice";
import authReducer from "./slices/authSlice";
import languageReducer from "./slices/languageSlice";
import deliveryReducer from "./slices/deliverySlice";
import inventoryReducer from "./slices/inventorySlice";

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("appState");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading state from localStorage:", err);
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("appState", serializedState);
  } catch (err) {
    console.error("Error saving state to localStorage:", err);
    // Handle errors here
  }
};

const preloadedState = loadState();

const store = configureStore({
  reducer: {
    orders: ordersReducer,
    auth: authReducer,
    language: languageReducer,
    delivery: deliveryReducer,
    inventory: inventoryReducer,
  },
  preloadedState,
});

// Subscribe to store changes and save to localStorage
store.subscribe(() => {
  saveState(store.getState());
});

// Export both as default and named export
export { store };
export default store;
