import { configureStore } from "@reduxjs/toolkit";
import ordersReducer from "./slices/ordersSlice";
import authReducer from "./slices/authSlice";
import languageReducer from "./slices/languageSlice";
import deliveryReducer from "./slices/deliverySlice";
import inventoryReducer from "./slices/inventorySlice";
import kitchenReducer from "./slices/kitchenSlice";
import managerReducer from "./slices/managerSlice";
import sellerReducer from "./slices/sellerSlice";
import customerReducer from "./slices/customerSlice";
import supplierReducer from "./slices/supplierSlice";

// No localStorage persistence - state will be managed by API calls

const store = configureStore({
  reducer: {
    orders: ordersReducer,
    auth: authReducer,
    language: languageReducer,
    delivery: deliveryReducer,
    inventory: inventoryReducer,
    kitchen: kitchenReducer,
    manager: managerReducer,
    seller: sellerReducer,
    customers: customerReducer,
    suppliers: supplierReducer,
  },
});

// Export both as default and named export
export { store };
export default store;
