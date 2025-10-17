import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Truck,
  MapPin,
  Phone,
  Package,
  Filter,
  CheckCircle,
  DollarSign,
  Clock,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";

import {
  fetchOrders,
  updateOrderStatus,
} from "../../../store/slices/ordersSlice";
import { paymentService } from "../../../services/paymentService";
import { customerService, productService } from "../../../services";

const MyOrders = ({ isHome = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state) => state.orders);

  const [filter, setFilter] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [startingDelivery, setStartingDelivery] = useState(null); // Track which order is being started

  // Customer data states
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Product data states
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Fetch customers from API
  const fetchCustomersData = async () => {
    try {
      setCustomersLoading(true);
      const response = await customerService.getCustomers();
      setCustomers(response);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productService.getProducts();
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Helper function to get customer name by ID
  const getCustomerName = (customerId) => {
    if (!customerId) return "Unknown Customer";

    // Extract actual ID from strings like "Customer #1"
    let actualId = customerId;
    if (typeof customerId === "string" && customerId.includes("#")) {
      const match = customerId.match(/#(\d+)/);
      actualId = match ? parseInt(match[1]) : customerId;
    }

    // Try both string and number comparison
    const customer = customers.find(
      (c) =>
        c.id === actualId ||
        c.id === parseInt(actualId) ||
        c.id === actualId.toString() ||
        c.id === customerId ||
        c.id === parseInt(customerId) ||
        c.id === customerId.toString()
    );

    if (customer) {
      return customer.customer_name || customer.name || `Customer #${actualId}`;
    }
    return `Customer #${actualId}`;
  };

  // Helper function to get customer phone by ID
  const getCustomerPhone = (customerId) => {
    if (!customerId) return "N/A";

    // Extract actual ID from strings like "Customer #1"
    let actualId = customerId;
    if (typeof customerId === "string" && customerId.includes("#")) {
      const match = customerId.match(/#(\d+)/);
      actualId = match ? parseInt(match[1]) : customerId;
    }

    // Try both string and number comparison
    const customer = customers.find(
      (c) =>
        c.id === actualId ||
        c.id === parseInt(actualId) ||
        c.id === actualId.toString() ||
        c.id === customerId ||
        c.id === parseInt(customerId) ||
        c.id === customerId.toString()
    );

    return customer ? customer.customer_phone || customer.phone : "N/A";
  };

  // Helper function to get customer address by ID
  const getCustomerAddress = (customerId) => {
    if (!customerId) return "N/A";

    // Extract actual ID from strings like "Customer #1"
    let actualId = customerId;
    if (typeof customerId === "string" && customerId.includes("#")) {
      const match = customerId.match(/#(\d+)/);
      actualId = match ? parseInt(match[1]) : customerId;
    }

    // Try both string and number comparison
    const customer = customers.find(
      (c) =>
        c.id === actualId ||
        c.id === parseInt(actualId) ||
        c.id === actualId.toString() ||
        c.id === customerId ||
        c.id === parseInt(customerId) ||
        c.id === customerId.toString()
    );

    return customer ? customer.customer_address || customer.address : "N/A";
  };

  // Helper function to get product name by ID
  const getProductName = (productId) => {
    if (!productId) return "Unknown Product";

    // Extract actual ID from strings like "Product #3"
    let actualId = productId;
    if (typeof productId === "string" && productId.includes("#")) {
      const match = productId.match(/#(\d+)/);
      actualId = match ? parseInt(match[1]) : productId;
    }

    // Try both string and number comparison
    const product = products.find(
      (p) =>
        p.id === actualId ||
        p.id === parseInt(actualId) ||
        p.id === actualId.toString() ||
        p.id === productId ||
        p.id === parseInt(productId) ||
        p.id === productId.toString()
    );

    if (product) {
      return product.nameEn || product.name || `Product #${actualId}`;
    }
    return `Product #${actualId}`;
  };

  // Helper function to get product price by ID
  const getProductPrice = (productId) => {
    if (!productId) return 0;

    // Extract actual ID from strings like "Product #3"
    let actualId = productId;
    if (typeof productId === "string" && productId.includes("#")) {
      const match = productId.match(/#(\d+)/);
      actualId = match ? parseInt(match[1]) : productId;
    }

    // Try both string and number comparison
    const product = products.find(
      (p) =>
        p.id === actualId ||
        p.id === parseInt(actualId) ||
        p.id === actualId.toString() ||
        p.id === productId ||
        p.id === parseInt(productId) ||
        p.id === productId.toString()
    );

    return product ? parseFloat(product.price) : 0;
  };

  // Load orders from API
  useEffect(() => {
    dispatch(fetchOrders());
    fetchCustomersData();
    fetchProducts();

    // Refresh orders every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchOrders());
    }, 30000);

    return () => {
      clearInterval(interval);
      setStartingDelivery(null); // Clear loading state on unmount
    };
  }, [dispatch]);

  // Filter orders for this driver - only delivery orders
  const filterOrders = () => {
    // First filter to only include delivery orders
    let filteredOrders = orders.filter(
      (order) => order && order.id && order.delivery_option === "delivery"
    );

    switch (filter) {
      case "pending":
        filteredOrders = filteredOrders.filter(
          (order) =>
            (!order.assignedDriver || order.assignedDriver === user?.name) &&
            order.deliveryStatus !== "delivered"
        );
        break;
      case "delivering":
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.assignedDriver === user?.name &&
            order.deliveryStatus === "delivering"
        );
        break;
      case "delivered":
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.assignedDriver === user?.name &&
            order.deliveryStatus === "delivered" &&
            order.isPaid
        );
        break;
      default:
        filteredOrders = filteredOrders.filter(
          (order) =>
            (order.assignedDriver === user?.name && !order.isPaid) ||
            !order.assignedDriver
        );
    }

    return filteredOrders;
  };

  const displayOrders = isHome ? filterOrders().slice(0, 4) : filterOrders();

  const handleStartDelivery = useCallback(
    async (orderId) => {
      // Use a simple flag to prevent multiple calls
      if (startingDelivery === orderId) {
        console.log("Already starting delivery for order:", orderId);
        return;
      }

      try {
        console.log("Starting delivery for order:", orderId);
        setStartingDelivery(orderId);

        // Update order status via API - set status to "pending" when starting delivery
        await dispatch(
          updateOrderStatus({
            id: orderId,
            status: "pending",
            assignedDriver: user?.name,
            deliveryStartTime: new Date().toISOString(),
            deliveryStatus: "delivering",
          })
        );

        // The Redux state will automatically update the UI, no need for immediate refresh
        // The 30-second interval will handle regular updates
      } catch (err) {
        console.error("Error starting delivery:", err);
        // You could add a toast notification here to show the error to the user
      } finally {
        setStartingDelivery(null);
      }
    },
    [dispatch, user?.name, startingDelivery]
  );

  const handleCompleteDelivery = (order) => {
    if (!order.total_amount && !order.total) {
      return;
    }
    setSelectedOrder(order);
    setPaymentAmount((order.total_amount || order.total || 0).toString());
    setPaymentError("");
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedOrder) return;

    try {
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        setPaymentError(t("invalidAmount"));
        return;
      }

      if (
        Math.abs(
          amount - (selectedOrder.total_amount || selectedOrder.total || 0)
        ) > 0.01
      ) {
        setPaymentError(t("amountMismatch"));
        return;
      }

      // Show confirmation step
      if (!isConfirming) {
        setIsConfirming(true);
        return;
      }

      setProcessing(true);

      // Add payment record via API
      const payment = await paymentService.createPayment({
        orderId: selectedOrder.id,
        amount: amount,
        collectedBy: user?.name,
        customerName: selectedOrder.customer,
        orderTotal: selectedOrder.total_amount || selectedOrder.total || 0,
        method: "cash",
        status: "completed",
        collectedAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        isPaid: true,
      });

      if (!payment) throw new Error("Failed to create payment");

      // Update order status via API
      await dispatch(
        updateOrderStatus({
          id: selectedOrder.id,
          status: "delivered",
          isDelivered: true,
          deliveryEndTime: new Date().toISOString(),
          deliveryStatus: "delivered",
          isPaid: true,
          paidAt: payment.paidAt || payment.collectedAt,
          paymentId: payment.id,
          paymentStatus: "completed",
        })
      );

      // The Redux state will automatically update the UI
      // Reset state
      setShowPaymentModal(false);
      setSelectedOrder(null);
      setPaymentAmount("");
      setPaymentError("");
      setIsConfirming(false);
      setProcessing(false);
    } catch (err) {
      console.error("Error processing payment:", err);
      setPaymentError(t("paymentError"));
      setProcessing(false);
    }
  };

  const handleViewDetails = (orderId) => {
    if (!orderId) return;
    navigate(`/delivery/order/${orderId}`);
  };

  const getOrderStatusColor = (order) => {
    if (order.deliveryStatus === "delivered") {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
    if (order.deliveryStatus === "delivering") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  const getOrderStatusText = (order) => {
    switch (order.deliveryStatus) {
      case "delivered":
        return t("delivered");
      case "delivering":
        return t("delivering");
      default:
        return t("readyForDelivery");
    }
  };

  const getDeliveryTime = (order) => {
    if (!order.deliveryStartTime) return null;

    const start = new Date(order.deliveryStartTime);
    const end = order.deliveryEndTime
      ? new Date(order.deliveryEndTime)
      : new Date();
    const diff = Math.floor((end - start) / (1000 * 60)); // minutes

    return diff;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("ordersToDeliver")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("manageDeliveries")}
            </p>
          </div>

          {!isHome && (
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 font-medium"
              >
                <option value="all">{t("allOrders")}</option>
                <option value="pending">{t("pendingDelivery")}</option>
                <option value="delivering">{t("delivering")}</option>
                <option value="delivered">{t("delivered")}</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {ordersError && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{ordersError}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {ordersLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-mono text-sm">
                      #{order.id}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${getOrderStatusColor(
                        order
                      )}`}
                    >
                      {getOrderStatusText(order)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {customersLoading
                          ? "..."
                          : getCustomerName(order.customer)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate max-w-xs">
                          {customersLoading
                            ? "..."
                            : getCustomerAddress(order.customer)}
                        </span>
                      </div>
                    </div>
                    {getCustomerPhone(order.customer) !== "N/A" &&
                      getCustomerPhone(order.customer) && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span
                            className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 select-all"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                getCustomerPhone(order.customer)
                              )
                            }
                            title={t("clickToCopy")}
                          >
                            {getCustomerPhone(order.customer)}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("orderItems")}
                  </h4>
                  <div className="space-y-2">
                    {(Array.isArray(order.products)
                      ? order.products
                      : Array.isArray(order.items)
                      ? order.items.map((item) => ({
                          id: item.product_id,
                          quantity: item.quantity,
                          name: item.product_name || item.name,
                          price: item.price || item.product?.price,
                        }))
                      : []
                    )
                      .slice(0, 2)
                      .map((product, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                              {product.quantity}x
                            </span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {productsLoading
                                ? "..."
                                : getProductName(product.id) ||
                                  product.name ||
                                  product.product_name ||
                                  `Product #${product.id}`}
                            </span>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">
                            {(
                              (productsLoading
                                ? 0
                                : getProductPrice(product.id) ||
                                  product.price ||
                                  0) * (product.quantity || 1)
                            ).toFixed(2)}{" "}
                            {t("currency")}
                          </span>
                        </div>
                      ))}
                    {(Array.isArray(order.products)
                      ? order.products
                      : Array.isArray(order.items)
                      ? order.items
                      : []
                    ).length > 2 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-1">
                        +
                        {(Array.isArray(order.products)
                          ? order.products
                          : Array.isArray(order.items)
                          ? order.items
                          : []
                        ).length - 2}{" "}
                        {t("moreItems")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("total")}
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {(order.total_amount || order.total || 0).toFixed(2)}{" "}
                      {t("currency")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("commission")}
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {((order.total_amount || order.total || 0) * 0.1).toFixed(
                        2
                      )}{" "}
                      {t("currency")}
                    </span>
                  </div>
                  {order.deliveryStartTime && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("deliveryTime")}
                      </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {getDeliveryTime(order)} {t("minutes")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewDetails(order.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={t("viewOrderDetails")}
                  >
                    <Package className="w-4 h-4" />
                    {t("viewDetails")}
                  </button>

                  {!order.assignedDriver && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleStartDelivery(order.id);
                      }}
                      disabled={startingDelivery === order.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t("startDeliveryTooltip")}
                    >
                      {startingDelivery === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Truck className="w-4 h-4" />
                      )}
                      {startingDelivery === order.id
                        ? t("starting")
                        : t("startDelivery")}
                    </button>
                  )}

                  {order.assignedDriver === user?.name &&
                    order.deliveryStatus === "delivering" && (
                      <button
                        onClick={() => handleCompleteDelivery(order)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title={t("markAsDeliveredTooltip")}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t("markAsDelivered")}
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {displayOrders.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700">
              <Truck className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {filter === "pending"
                  ? t("noPendingDeliveries")
                  : filter === "delivered"
                  ? t("noDeliveredOrders")
                  : t("noOrdersToDeliver")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("checkBackLater")}
              </p>
            </div>
          )}
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {isConfirming ? t("confirmPayment") : t("collectPayment")}
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedOrder(null);
                  setPaymentAmount("");
                  setPaymentError("");
                  setIsConfirming(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                disabled={processing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isConfirming ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                      {t("pleaseConfirm")}
                    </h4>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-500">
                      {t("confirmPaymentMessage")}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("orderTotal")}
                      </span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {(
                          selectedOrder?.total_amount ||
                          selectedOrder?.total ||
                          0
                        ).toFixed(2)}{" "}
                        {t("currency")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("amountCollected")}
                      </span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {paymentAmount} {t("currency")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("orderTotal")}
                      </span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {(
                          selectedOrder?.total_amount ||
                          selectedOrder?.total ||
                          0
                        ).toFixed(2)}{" "}
                        {t("currency")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("commission")}
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {(
                          (selectedOrder?.total_amount ||
                            selectedOrder?.total ||
                            0) * 0.1
                        ).toFixed(2)}{" "}
                        {t("currency")}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("amountCollected")}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => {
                          setPaymentAmount(e.target.value);
                          setPaymentError("");
                        }}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        placeholder={t("enterAmount")}
                        disabled={processing}
                      />
                    </div>
                    {paymentError && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {paymentError}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  if (isConfirming) {
                    setIsConfirming(false);
                  } else {
                    setShowPaymentModal(false);
                    setSelectedOrder(null);
                    setPaymentAmount("");
                    setPaymentError("");
                  }
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                disabled={processing}
              >
                {isConfirming ? t("back") : t("cancel")}
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isConfirming ? t("confirmAndComplete") : t("proceed")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
