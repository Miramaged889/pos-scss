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
import tenantUsersReducer from "./slices/tenantUsersSlice";
import branchesReducer from "./slices/branchesSlice";
import tenantReducer from "./slices/tenantSlice";
import customerInvoiceReducer from "./slices/customerInvoiceSlice";
import receiptVoucherReducer from "./slices/receiptVoucherSlice";
import voucherReducer from "./slices/voucherSlice";

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
    tenantUsers: tenantUsersReducer,
    branches: branchesReducer,
    tenant: tenantReducer,
    customerInvoices: customerInvoiceReducer,
    receiptVouchers: receiptVoucherReducer,
    vouchers: voucherReducer,
  },
});

// Export both as default and named export
export { store };
export default store;
