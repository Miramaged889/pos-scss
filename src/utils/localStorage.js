/**
 * Local Storage Utility for Form Data Management
 */

// Storage keys
const STORAGE_KEYS = {
  CUSTOMERS: "sales_app_customers",
  ORDERS: "sales_app_orders",
  PRODUCTS: "sales_app_products",
  RETURNS: "sales_app_returns",
  PURCHASE_ORDERS: "sales_app_purchase_orders",
  FORM_DRAFTS: "sales_app_form_drafts",
};

/**
 * Generic local storage functions
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Customer Management Functions
 */
export const getCustomers = () => {
  return getFromStorage(STORAGE_KEYS.CUSTOMERS, []);
};

export const saveCustomers = (customers) => {
  return setToStorage(STORAGE_KEYS.CUSTOMERS, customers);
};

export const addCustomer = (customer) => {
  const customers = getCustomers();

  // Generate sequential customer ID starting from 3
  const maxId =
    customers.length > 0
      ? Math.max(
          ...customers
            .map((c) => c.id)
            .filter((id) => id.startsWith("CUST-"))
            .map((id) => parseInt(id.replace("CUST-", "")) || 0)
        )
      : 2; // Start from 2 so next ID will be 3

  const newCustomer = {
    ...customer,
    id: customer.id || `CUST-${maxId + 1}`,
    joinDate: customer.joinDate || new Date().toISOString(),
    totalOrders: customer.totalOrders || 0,
    totalSpent: customer.totalSpent || 0,
    lastOrder: customer.lastOrder || null,
  };
  customers.push(newCustomer);
  saveCustomers(customers);
  return newCustomer;
};

export const updateCustomer = (customerId, updates) => {
  const customers = getCustomers();
  const index = customers.findIndex((c) => c.id === customerId);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...updates };
    saveCustomers(customers);
    return customers[index];
  }
  return null;
};

export const deleteCustomer = (customerId) => {
  const customers = getCustomers();
  const filteredCustomers = customers.filter((c) => c.id !== customerId);
  saveCustomers(filteredCustomers);
  return filteredCustomers;
};

/**
 * Order Management Functions
 */
export const getOrders = () => {
  return getFromStorage(STORAGE_KEYS.ORDERS, []);
};

export const saveOrders = (orders) => {
  return setToStorage(STORAGE_KEYS.ORDERS, orders);
};

export const generateUniqueOrderId = () => {
  const orders = getOrders();

  // Generate sequential order ID starting from 1
  const validOrderIds = orders
    .map((o) => o.id)
    .filter((id) => id && typeof id === "string" && id.startsWith("ORD-"))
    .map((id) => parseInt(id.replace("ORD-", "")) || 0);

  const maxId = validOrderIds.length > 0 ? Math.max(...validOrderIds) : 0;

  return `ORD-${String(maxId + 1).padStart(3, "0")}`;
};

export const addOrder = (order) => {
  const orders = getOrders();
  const newOrder = {
    ...order,
    id: order.id || generateUniqueOrderId(),
    createdAt: order.createdAt || new Date().toISOString(),
    status: order.status || "pending",
  };
  orders.push(newOrder);
  saveOrders(orders);

  // Auto-create customer if not exists
  if (order.customer && order.phone) {
    const customers = getCustomers();
    const existingCustomer = customers.find(
      (c) =>
        c.name.toLowerCase() === order.customer.toLowerCase() ||
        c.phone === order.phone
    );

    if (!existingCustomer) {
      const newCustomer = {
        name: order.customer,
        phone: order.phone,
        address: order.address || "",
        email: order.email || "",
        notes: "تم إنشاؤه تلقائياً من الطلب / Auto-created from order",
        totalOrders: 1,
        totalSpent: order.total || 0,
        lastOrder: newOrder.id,
      };
      addCustomer(newCustomer);
    }
  }

  return newOrder;
};

export const updateOrder = (orderId, updates) => {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    saveOrders(orders);
    return orders[index];
  }
  return null;
};

export const deleteOrder = (orderId) => {
  const orders = getOrders();
  const filteredOrders = orders.filter((o) => o.id !== orderId);
  saveOrders(filteredOrders);
  return filteredOrders;
};

/**
 * Product Management Functions
 */
export const getProducts = () => {
  return getFromStorage(STORAGE_KEYS.PRODUCTS, []);
};

export const saveProducts = (products) => {
  return setToStorage(STORAGE_KEYS.PRODUCTS, products);
};

export const addProduct = (product) => {
  const products = getProducts();
  const newProduct = {
    ...product,
    id: product.id || Date.now(),
    createdAt: product.createdAt || new Date().toISOString(),
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProduct = (productId, updates) => {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    saveProducts(products);
    return products[index];
  }
  return null;
};

export const deleteProduct = (productId) => {
  const products = getProducts();
  const filteredProducts = products.filter((p) => p.id !== productId);
  saveProducts(filteredProducts);
  return filteredProducts;
};

/**
 * Payment Management Functions
 */
export const getPayments = () => {
  return getFromStorage("payments", []);
};

export const savePayments = (payments) => {
  return setToStorage("payments", payments);
};

export const generateUniqueTransactionId = () => {
  const payments = getPayments();
  let transactionId;
  let isUnique = false;

  while (!isUnique) {
    // Generate transaction ID like TXN-001, TXN-002, etc.
    const validTransactionIds = payments
      .map((p) => p.transactionId)
      .filter((id) => id && typeof id === "string" && id.startsWith("TXN-"))
      .map((id) => parseInt(id.replace("TXN-", "")) || 0);

    const maxId =
      validTransactionIds.length > 0 ? Math.max(...validTransactionIds) : 0;

    transactionId = `TXN-${String(maxId + 1).padStart(3, "0")}`;

    // Check if this ID already exists
    isUnique = !payments.some((p) => p.transactionId === transactionId);
  }

  return transactionId;
};

export const addPayment = (paymentData) => {
  const payments = getPayments();

  const newPayment = {
    ...paymentData,
    id: paymentData.id || `PAY-${Date.now()}`,
    transactionId: paymentData.transactionId || generateUniqueTransactionId(),
    paymentDate: paymentData.paymentDate || new Date().toISOString(),
    status: paymentData.status || "completed",
  };

  payments.push(newPayment);
  savePayments(payments);
  return newPayment;
};

export const updatePayment = (paymentId, updates) => {
  const payments = getPayments();
  const index = payments.findIndex((p) => p.id === paymentId);
  if (index !== -1) {
    payments[index] = { ...payments[index], ...updates };
    savePayments(payments);
    return payments[index];
  }
  return null;
};

export const deletePayment = (paymentId) => {
  const payments = getPayments();
  const filteredPayments = payments.filter((p) => p.id !== paymentId);
  savePayments(filteredPayments);
  return filteredPayments;
};

/**
 * Return Management Functions
 */

/**
 * Migrate old timestamp-based return IDs to sequential format
 */
export const migrateReturnIds = () => {
  const returns = getFromStorage(STORAGE_KEYS.RETURNS, []);
  let hasChanges = false;

  // Check if migration is needed
  const needsMigration = returns.some((r) => {
    if (typeof r.id === "string" && r.id.startsWith("RTN-")) {
      const idPart = r.id.replace("RTN-", "");
      return idPart.length > 10; // Timestamp-based IDs are much longer
    }
    return false;
  });

  if (!needsMigration) {
    return returns; // No migration needed
  }

  console.log("Migrating return IDs from timestamp to RTN-001 format...");

  // Sort returns by creation date to maintain chronological order
  const sortedReturns = [...returns].sort((a, b) => {
    const dateA = new Date(a.returnDate || a.createdAt || 0);
    const dateB = new Date(b.returnDate || b.createdAt || 0);
    return dateA - dateB;
  });

  // Assign new sequential IDs
  const migratedReturns = sortedReturns.map((returnItem, index) => {
    const currentId = returnItem.id;

    // Only migrate timestamp-based IDs
    if (typeof currentId === "string" && currentId.startsWith("RTN-")) {
      const idPart = currentId.replace("RTN-", "");
      if (idPart.length > 10) {
        // It's a timestamp
        const newId = `RTN-${String(index + 1).padStart(3, "0")}`;
        console.log(`Migrating return ID: ${currentId} → ${newId}`);
        hasChanges = true;
        return {
          ...returnItem,
          id: newId,
          // Keep original ID as reference if needed
          originalId: currentId,
        };
      }
    }

    return returnItem;
  });

  if (hasChanges) {
    saveReturns(migratedReturns);
    console.log("Return ID migration completed successfully");
    return migratedReturns;
  }

  return returns;
};

export const getReturns = () => {
  // Auto-migrate on every access to ensure data consistency
  return migrateReturnIds();
};

export const saveReturns = (returns) => {
  return setToStorage(STORAGE_KEYS.RETURNS, returns);
};

export const generateUniqueReturnId = () => {
  const returns = getReturns();

  // Generate sequential return ID starting from 1
  const validReturnIds = returns
    .map((r) => r.id)
    .filter((id) => id && typeof id === "string" && id.startsWith("RTN-"))
    .map((id) => {
      const numPart = parseInt(id.replace("RTN-", ""));
      return isNaN(numPart) ? 0 : numPart;
    })
    .filter((num) => num > 0); // Only valid sequential numbers

  const maxId = validReturnIds.length > 0 ? Math.max(...validReturnIds) : 0;

  return `RTN-${String(maxId + 1).padStart(3, "0")}`;
};

export const addReturn = (returnData) => {
  const returns = getReturns();
  const newReturn = {
    ...returnData,
    id: returnData.id || generateUniqueReturnId(),
    returnDate: returnData.returnDate || new Date().toISOString(),
    status: returnData.status || "pending",
  };
  returns.push(newReturn);
  saveReturns(returns);
  return newReturn;
};

export const updateReturn = (returnId, updates) => {
  const returns = getReturns();
  const index = returns.findIndex((r) => r.id === returnId);
  if (index !== -1) {
    returns[index] = { ...returns[index], ...updates };
    saveReturns(returns);
    return returns[index];
  }
  return null;
};

export const deleteReturn = (returnId) => {
  const returns = getReturns();
  const filteredReturns = returns.filter((r) => r.id !== returnId);
  saveReturns(filteredReturns);
  return filteredReturns;
};

/**
 * Purchase Order Management Functions
 */
export const getPurchaseOrders = () => {
  return getFromStorage(STORAGE_KEYS.PURCHASE_ORDERS, []);
};

export const savePurchaseOrders = (purchaseOrders) => {
  return setToStorage(STORAGE_KEYS.PURCHASE_ORDERS, purchaseOrders);
};

export const generateUniquePurchaseOrderId = () => {
  const purchaseOrders = getPurchaseOrders();

  // Generate sequential purchase order ID starting from 1
  const validPOIds = purchaseOrders
    .map((po) => po.id)
    .filter((id) => id && typeof id === "string" && id.startsWith("PO-"))
    .map((id) => parseInt(id.replace("PO-", "")) || 0);

  const maxId = validPOIds.length > 0 ? Math.max(...validPOIds) : 0;

  return `PO-${String(maxId + 1).padStart(3, "0")}`;
};

export const addPurchaseOrder = (purchaseOrderData) => {
  const purchaseOrders = getPurchaseOrders();
  const newPurchaseOrder = {
    ...purchaseOrderData,
    id: purchaseOrderData.id || generateUniquePurchaseOrderId(),
    poNumber: purchaseOrderData.poNumber || generateUniquePurchaseOrderId(),
    orderDate: purchaseOrderData.orderDate || new Date().toISOString(),
    status: purchaseOrderData.status || "pending",
  };
  purchaseOrders.push(newPurchaseOrder);
  savePurchaseOrders(purchaseOrders);
  return newPurchaseOrder;
};

export const updatePurchaseOrder = (purchaseOrderId, updates) => {
  const purchaseOrders = getPurchaseOrders();
  const index = purchaseOrders.findIndex((po) => po.id === purchaseOrderId);
  if (index !== -1) {
    purchaseOrders[index] = { ...purchaseOrders[index], ...updates };
    savePurchaseOrders(purchaseOrders);
    return purchaseOrders[index];
  }
  return null;
};

export const deletePurchaseOrder = (purchaseOrderId) => {
  const purchaseOrders = getPurchaseOrders();
  const filteredPurchaseOrders = purchaseOrders.filter(
    (po) => po.id !== purchaseOrderId
  );
  savePurchaseOrders(filteredPurchaseOrders);
  return filteredPurchaseOrders;
};

/**
 * Form Draft Management Functions
 */
export const getFormDraft = (formType) => {
  const drafts = getFromStorage(STORAGE_KEYS.FORM_DRAFTS, {});
  return drafts[formType] || null;
};

export const saveFormDraft = (formType, formData) => {
  const drafts = getFromStorage(STORAGE_KEYS.FORM_DRAFTS, {});
  drafts[formType] = {
    ...formData,
    savedAt: new Date().toISOString(),
  };
  return setToStorage(STORAGE_KEYS.FORM_DRAFTS, drafts);
};

export const clearFormDraft = (formType) => {
  const drafts = getFromStorage(STORAGE_KEYS.FORM_DRAFTS, {});
  delete drafts[formType];
  return setToStorage(STORAGE_KEYS.FORM_DRAFTS, drafts);
};

/**
 * Manual migration trigger for returns (can be called if needed)
 */
export const triggerReturnMigration = () => {
  console.log("Manually triggering return ID migration...");
  return migrateReturnIds();
};

/**
 * Initialize default data if storage is empty
 */
export const initializeDefaultData = () => {
  // Initialize products if empty
  if (getProducts().length === 0) {
    const defaultProducts = [
      {
        id: 1,
        name: "برجر كلاسيك",
        nameEn: "Classic Burger",
        category: "main",
        stock: 50,
        minStock: 10,
        price: 25.0,
        supplier: "مؤسسة الأغذية المتميزة",
        sku: "BURG-001",
        description: "برجر لحم بقري مع الخضار الطازجة",
        createdAt: "2025-01-01T00:00:00Z",
      },
      {
        id: 2,
        name: "بيتزا مارغريتا",
        nameEn: "Margherita Pizza",
        category: "main",
        stock: 30,
        minStock: 5,
        price: 35.0,
        supplier: "مؤسسة الأغذية المتميزة",
        sku: "PIZZA-001",
        description: "بيتزا بالجبن والطماطم والريحان",
        createdAt: "2025-01-01T00:00:00Z",
      },
    ];
    saveProducts(defaultProducts);
  }

  // Ensure return IDs are migrated
  migrateReturnIds();
};

/**
 * Clear all storage data
 */
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeFromStorage(key);
  });
};

/**
 * Export storage data for backup
 */
export const exportData = () => {
  return {
    customers: getCustomers(),
    orders: getOrders(),
    products: getProducts(),
    returns: getReturns(),
    purchaseOrders: getPurchaseOrders(),
    formDrafts: getFromStorage(STORAGE_KEYS.FORM_DRAFTS, {}),
    exportedAt: new Date().toISOString(),
  };
};

/**
 * Import storage data from backup
 */
export const importData = (data) => {
  try {
    if (data.customers) saveCustomers(data.customers);
    if (data.orders) saveOrders(data.orders);
    if (data.products) saveProducts(data.products);
    if (data.returns) saveReturns(data.returns);
    if (data.purchaseOrders) savePurchaseOrders(data.purchaseOrders);
    if (data.formDrafts)
      setToStorage(STORAGE_KEYS.FORM_DRAFTS, data.formDrafts);
    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    return false;
  }
};
