import { STORAGE_KEYS } from "./localStorage";

// Generate a random date within the last n days
const getRandomDate = (days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
};

// Generate random order items
const generateOrderItems = () => {
  const items = [
    { name: "برجر دجاج", price: 25 },
    { name: "برجر لحم", price: 30 },
    { name: "شاورما دجاج", price: 20 },
    { name: "شاورما لحم", price: 25 },
    { name: "بيتزا", price: 40 },
    { name: "باستا", price: 35 },
    { name: "سلطة", price: 15 },
    { name: "عصير", price: 10 },
  ];

  const numItems = Math.floor(Math.random() * 4) + 1;
  const orderItems = [];

  for (let i = 0; i < numItems; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    orderItems.push({
      ...item,
      quantity,
      total: item.price * quantity,
    });
  }

  return orderItems;
};

// Generate mock orders
const generateOrders = (count = 20) => {
  const statuses = ["pending", "delivering", "delivered"];
  const addresses = [
    "شارع الملك فهد، الرياض",
    "شارع التحلية، جدة",
    "شارع الأمير محمد، الدمام",
    "شارع الملك عبدالله، مكة",
    "شارع الستين، المدينة",
  ];
  const customers = [
    "أحمد محمد",
    "سارة عبدالله",
    "محمد علي",
    "فاطمة أحمد",
    "عمر خالد",
  ];

  return Array.from({ length: count }, (_, index) => {
    const items = generateOrderItems();
    const total = items.reduce((sum, item) => sum + item.total, 0);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = getRandomDate();
    const deliveryTime = Math.floor(Math.random() * 45) + 15; // 15-60 minutes

    return {
      id: `ORD${String(index + 1).padStart(4, "0")}`,
      customer: customers[Math.floor(Math.random() * customers.length)],
      deliveryAddress: addresses[Math.floor(Math.random() * addresses.length)],
      items,
      total,
      deliveryStatus: status,
      createdAt,
      deliveryTime,
      isDelayed: deliveryTime > 45,
      isPaid: Math.random() > 0.2, // 80% chance of being paid
    };
  });
};

// Generate mock payments
const generatePayments = (orders) => {
  return orders
    .filter((order) => order.isPaid)
    .map((order) => ({
      id: `PAY${order.id.slice(3)}`,
      orderId: order.id,
      amount: order.total,
      status: "completed",
      collectedAt: order.createdAt,
      paymentMethod: Math.random() > 0.5 ? "cash" : "card",
    }));
};

// Generate mock delivery actions
const generateDeliveryActions = (orders) => {
  const actions = [];

  orders.forEach((order) => {
    // Add order acceptance action
    actions.push({
      id: `ACT${order.id.slice(3)}_1`,
      type: "ACCEPT_ORDER",
      orderId: order.id,
      timestamp: order.createdAt,
    });

    if (
      order.deliveryStatus === "delivering" ||
      order.deliveryStatus === "delivered"
    ) {
      // Add pickup action
      actions.push({
        id: `ACT${order.id.slice(3)}_2`,
        type: "PICKUP_ORDER",
        orderId: order.id,
        timestamp: new Date(
          new Date(order.createdAt).getTime() + 10 * 60000
        ).toISOString(), // 10 minutes after creation
      });
    }

    if (order.deliveryStatus === "delivered") {
      // Add delivery completion action
      actions.push({
        id: `ACT${order.id.slice(3)}_3`,
        type: "COMPLETE_DELIVERY",
        orderId: order.id,
        timestamp: new Date(
          new Date(order.createdAt).getTime() + order.deliveryTime * 60000
        ).toISOString(),
        isDelayed: order.isDelayed,
      });

      if (order.isPaid) {
        // Add payment collection action
        actions.push({
          id: `ACT${order.id.slice(3)}_4`,
          type: "COLLECT_PAYMENT",
          orderId: order.id,
          timestamp: new Date(
            new Date(order.createdAt).getTime() +
              (order.deliveryTime + 5) * 60000
          ).toISOString(),
          amount: order.total,
        });
      }
    }
  });

  return actions;
};

// Initialize mock data in localStorage
export const initializeMockData = () => {
  try {
    // Generate mock orders
    const mockOrders = generateOrders(20);

    // Generate related data
    const mockPayments = generatePayments(mockOrders);
    const mockActions = generateDeliveryActions(mockOrders);

    // Verify data before storing
    if (!mockOrders.length || !mockPayments.length || !mockActions.length) {
      throw new Error("Generated mock data is empty");
    }

    // Store in localStorage with error handling
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(mockOrders));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(mockPayments));
      localStorage.setItem(
        STORAGE_KEYS.DELIVERY_ACTIONS,
        JSON.stringify(mockActions)
      );

      // Verify storage
      const storedOrders = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]"
      );
      const storedPayments = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.PAYMENTS) || "[]"
      );
      const storedActions = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.DELIVERY_ACTIONS) || "[]"
      );

      if (
        !storedOrders.length ||
        !storedPayments.length ||
        !storedActions.length
      ) {
        throw new Error("Data not stored properly in localStorage");
      }

      console.log("Mock data initialized successfully:", {
        orders: storedOrders.length,
        payments: storedPayments.length,
        actions: storedActions.length,
      });

      return true;
    } catch (storageError) {
      console.error("Storage error:", storageError);
      throw new Error("Failed to store mock data in localStorage");
    }
  } catch (error) {
    console.error("Mock data initialization failed:", error);
    return false;
  }
};
