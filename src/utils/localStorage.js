/**
 * Local Storage Utility for Form Data Management
 */

// Storage keys
export const STORAGE_KEYS = {
  CUSTOMERS: "sales_app_customers",
  ORDERS: "sales_app_orders",
  PRODUCTS: "sales_app_products",
  RETURNS: "sales_app_returns",
  PURCHASE_ORDERS: "sales_app_purchase_orders",
  FORM_DRAFTS: "sales_app_form_drafts",
  DELIVERY_ORDERS: "delivery_orders",
  PAYMENTS: "delivery_payments",
  DELIVERY_ACTIONS: "delivery_actions",
  DELIVERY_STATS: "delivery_stats",
  AUTH: "auth",
  LANGUAGE: "language",
};

// Add delivery action types
export const DELIVERY_ACTIONS = {
  START_DELIVERY: "START_DELIVERY",
  COMPLETE_DELIVERY: "COMPLETE_DELIVERY",
  COLLECT_PAYMENT: "COLLECT_PAYMENT",
};

/**
 * Generic local storage functions
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    console.log(`Reading from localStorage: ${key}`);
    const item = localStorage.getItem(key);
    if (!item) {
      console.log(
        `No data found for key: ${key}, returning default:`,
        defaultValue
      );
      return defaultValue;
    }
    const parsed = JSON.parse(item);
    console.log(`Successfully read data for key: ${key}`, parsed);
    return parsed;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    console.log(`Writing to localStorage: ${key}`, value);
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`Successfully wrote data for key: ${key}`);
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
  return getFromStorage(STORAGE_KEYS.PAYMENTS, []);
};

export const savePayments = (payments) => {
  return setToStorage(STORAGE_KEYS.PAYMENTS, payments);
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

export const addPayment = async (payment) => {
  const payments = getPayments();
  const newPayment = {
    ...payment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    type: "delivery",
  };
  payments.push(newPayment);
  savePayments(payments);

  // Add delivery action for payment collection
  addDeliveryAction({
    type: DELIVERY_ACTIONS.COLLECT_PAYMENT,
    driverId: payment.collectedBy,
    orderId: payment.orderId,
    amount: payment.amount,
    paymentId: newPayment.id,
  });

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
        imageUrl:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
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
        imageUrl:
          "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500",
        createdAt: "2025-01-01T00:00:00Z",
      },
      {
        id: 3,
        name: "سلطة سيزر",
        nameEn: "Caesar Salad",
        category: "side",
        stock: 40,
        minStock: 8,
        price: 18.0,
        supplier: "مؤسسة الأغذية المتميزة",
        sku: "SALAD-001",
        description: "سلطة خس رومين مع صوص سيزر وقطع الدجاج المشوي",
        imageUrl:
          "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500",
        createdAt: "2025-01-01T00:00:00Z",
      },
      {
        id: 4,
        name: "عصير برتقال طازج",
        nameEn: "Fresh Orange Juice",
        category: "beverages",
        stock: 60,
        minStock: 15,
        price: 12.0,
        supplier: "مؤسسة الأغذية المتميزة",
        sku: "BEV-001",
        description: "عصير برتقال طبيعي 100%",
        imageUrl:
          "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500",
        createdAt: "2025-01-01T00:00:00Z",
      },
      {
        id: 5,
        name: "تشيز كيك",
        nameEn: "Cheesecake",
        category: "desserts",
        stock: 25,
        minStock: 5,
        price: 22.0,
        supplier: "مؤسسة الأغذية المتميزة",
        sku: "DESS-001",
        description: "تشيز كيك نيويورك الأصلي مع صوص التوت",
        imageUrl:
          "https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=500",
        createdAt: "2025-01-01T00:00:00Z",
      },
      {
        id: 6,
        name: "باستا ألفريدو",
        nameEn: "Alfredo Pasta",
        category: "main",
        stock: 35,
        minStock: 7,
        price: 32.0,
        supplier: "مؤسسة الأغذية المتميزة",
        sku: "PASTA-001",
        description: "باستا فيتوتشيني مع صوص الكريمة والدجاج",
        imageUrl:
          "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500",
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

/**
 * Delivery Order Management Functions
 */
export const getDeliveryOrders = () => {
  return getFromStorage(STORAGE_KEYS.DELIVERY_ORDERS, []);
};

export const saveDeliveryOrders = (orders) => {
  return setToStorage(STORAGE_KEYS.DELIVERY_ORDERS, orders);
};

export const updateDeliveryOrder = async (orderId, updates) => {
  const orders = getOrders();
  const updatedOrders = orders.map((order) => {
    if (order.id === orderId) {
      const updatedOrder = {
        ...order,
        ...updates,
        deliveryHistory: [
          ...(order.deliveryHistory || []),
          {
            ...updates,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      return updatedOrder;
    }
    return order;
  });
  setToStorage(STORAGE_KEYS.ORDERS, updatedOrders);
  return updatedOrders.find((order) => order.id === orderId);
};

export const getDeliveryOrderById = (orderId) => {
  try {
    console.log("Getting delivery order by ID:", orderId);

    if (!orderId) {
      console.error("Invalid order ID: null or undefined");
      return null;
    }

    // First check delivery orders
    const deliveryOrders = getDeliveryOrders();
    let order = deliveryOrders.find((o) => o.id === orderId);

    // If not found, check sales orders
    if (!order) {
      const salesOrders = getOrders();
      order = salesOrders.find(
        (o) =>
          o.id === orderId &&
          o.deliveryType === "delivery" &&
          o.status === "completed"
      );

      // If found in sales orders, add to delivery orders
      if (order) {
        const updatedDeliveryOrders = [...deliveryOrders, order];
        saveDeliveryOrders(updatedDeliveryOrders);
      }
    }

    console.log("Found order:", order);
    return order;
  } catch (err) {
    console.error("Error getting delivery order:", err);
    return null;
  }
};

export const syncDeliveryOrders = (driverId = null) => {
  const orders = getOrders();
  const actions = getFromStorage(STORAGE_KEYS.DELIVERY_ACTIONS, []);

  // Filter orders based on delivery status and driver
  const deliveryOrders = orders.filter((order) => {
    if (driverId) {
      return order.assignedDriver === driverId || !order.assignedDriver;
    }
    return true;
  });

  // Update orders with delivery actions
  const updatedOrders = deliveryOrders.map((order) => {
    const orderActions = actions.filter(
      (action) => action.orderId === order.id
    );
    const lastAction = orderActions[orderActions.length - 1];

    if (lastAction) {
      switch (lastAction.type) {
        case DELIVERY_ACTIONS.START_DELIVERY:
          return {
            ...order,
            deliveryStatus: "delivering",
            deliveryStartTime: lastAction.timestamp,
          };
        case DELIVERY_ACTIONS.COMPLETE_DELIVERY:
          return {
            ...order,
            deliveryStatus: "delivered",
            deliveryEndTime: lastAction.timestamp,
            isDelivered: true,
          };
        default:
          return order;
      }
    }
    return order;
  });

  // Update driver stats if driverId provided
  if (driverId) {
    const driverOrders = updatedOrders.filter(
      (order) => order.assignedDriver === driverId
    );
    const completedOrders = driverOrders.filter(
      (order) => order.deliveryStatus === "delivered"
    );

    const stats = {
      totalDeliveries: completedOrders.length,
      totalEarnings: completedOrders.reduce(
        (sum, order) => sum + (order.total || 0) * 0.1,
        0
      ),
      averageDeliveryTime: calculateAverageDeliveryTime(completedOrders),
      onTimeRate: calculateOnTimeRate(completedOrders),
    };

    updateDeliveryStats(driverId, stats);
  }

  return updatedOrders;
};

// Helper function to calculate average delivery time
const calculateAverageDeliveryTime = (orders) => {
  const deliveryTimes = orders
    .filter((order) => order.deliveryStartTime && order.deliveryEndTime)
    .map((order) => {
      const start = new Date(order.deliveryStartTime).getTime();
      const end = new Date(order.deliveryEndTime).getTime();
      return (end - start) / (1000 * 60); // Convert to minutes
    });

  if (deliveryTimes.length === 0) return 0;
  return Math.round(
    deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
  );
};

// Helper function to calculate on-time delivery rate
const calculateOnTimeRate = (orders) => {
  if (orders.length === 0) return 100;
  const onTimeDeliveries = orders.filter((order) => {
    if (!order.deliveryStartTime || !order.deliveryEndTime) return true;
    const deliveryTime =
      (new Date(order.deliveryEndTime) - new Date(order.deliveryStartTime)) /
      (1000 * 60);
    return deliveryTime <= 45; // Consider delivery on time if within 45 minutes
  });
  return (onTimeDeliveries.length / orders.length) * 100;
};

// Get delivery actions for a specific driver
export const getDriverDeliveryActions = (driverId) => {
  const actions = getFromStorage(STORAGE_KEYS.DELIVERY_ACTIONS, []);
  return actions.filter((action) => action.driverId === driverId);
};

// Add a new delivery action
export const addDeliveryAction = (action) => {
  const actions = getFromStorage(STORAGE_KEYS.DELIVERY_ACTIONS, []);
  const newAction = {
    ...action,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  actions.push(newAction);
  setToStorage(STORAGE_KEYS.DELIVERY_ACTIONS, actions);
  return newAction;
};

// Update delivery stats for a driver
export const updateDeliveryStats = (driverId, stats) => {
  const allStats = getFromStorage(STORAGE_KEYS.DELIVERY_STATS, {});
  allStats[driverId] = {
    ...allStats[driverId],
    ...stats,
    lastUpdated: new Date().toISOString(),
  };
  setToStorage(STORAGE_KEYS.DELIVERY_STATS, allStats);
};

// Get delivery stats for a driver
export const getDriverDeliveryStats = (driverId) => {
  const allStats = getFromStorage(STORAGE_KEYS.DELIVERY_STATS, {});
  return (
    allStats[driverId] || {
      totalDeliveries: 0,
      totalEarnings: 0,
      averageDeliveryTime: 0,
      onTimeRate: 100,
      lastUpdated: null,
    }
  );
};
