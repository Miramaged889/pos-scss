import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  MapPin,
  Phone,
  Clock,
  AlertTriangle,
  Package,
  DollarSign,
  CheckCircle,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  fetchOrders,
  updateOrderStatus,
} from "../../../store/slices/ordersSlice";
import { customerService, productService } from "../../../services";

const OrderDetails = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, loading: ordersLoading } = useSelector(
    (state) => state.orders
  );

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Status editing states
  const [statusInput, setStatusInput] = useState("");
  const [editingStatus, setEditingStatus] = useState(false);

  // Customer and product data states
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
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

    let actualId = customerId;
    if (typeof customerId === "string" && customerId.includes("#")) {
      const match = customerId.match(/#(\d+)/);
      actualId = match ? parseInt(match[1]) : customerId;
    }

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

    let actualId = customerId;
    if (typeof customerId === "string" && customerId.includes("#")) {
      const match = customerId.match(/#(\d+)/);
      actualId = match ? parseInt(match[1]) : customerId;
    }

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

    let actualId = customerId;
    if (typeof customerId === "string" && customerId.includes("#")) {
      const match = customerId.match(/#(\d+)/);
      actualId = match ? parseInt(match[1]) : customerId;
    }

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

    let actualId = productId;
    if (typeof productId === "string" && productId.includes("#")) {
      const match = productId.match(/#(\d+)/);
      actualId = match ? parseInt(match[1]) : productId;
    }

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

    let actualId = productId;
    if (typeof productId === "string" && productId.includes("#")) {
      const match = productId.match(/#(\d+)/);
      actualId = match ? parseInt(match[1]) : productId;
    }

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

  const loadOrder = useCallback(() => {
    try {
      if (!orderId) {
        setError("Invalid order ID");
        setLoading(false);
        return;
      }

      // Find the order from Redux store
      const foundOrder = orders.find(
        (order) => order.id.toString() === orderId.toString()
      );

      if (foundOrder && foundOrder.delivery_option === "delivery") {
        setOrder(foundOrder);
        setError(null);
      } else {
        setError("Order not found or not a delivery order");
      }
    } catch (err) {
      console.error("Error loading order:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId, orders]);

  useEffect(() => {
    // Fetch orders first, then load the specific order
    dispatch(fetchOrders());
    fetchCustomersData();
    fetchProducts();

    const interval = setInterval(() => {
      dispatch(fetchOrders());
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStartDelivery = async () => {
    try {
      console.log("Starting delivery for order:", order.id);

      // Update order status via Redux - set status to "delivering" when starting delivery
      await dispatch(
        updateOrderStatus({
          id: order.id,
          status: "delivering",
          assignedDriver: user?.name,
          deliveryStartTime: new Date().toISOString(),
          deliveryStatus: "delivering",
        })
      );

      // Update local state
      setOrder((prev) => ({
        ...prev,
        status: "delivering",
        deliveryStartTime: new Date().toISOString(),
        deliveryStatus: "delivering",
        assignedDriver: user?.name,
      }));
    } catch (err) {
      console.error("Error starting delivery:", err);
      setError(err.message);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      console.log(`Updating order ${order.id} status to: ${newStatus}`);

      await dispatch(
        updateOrderStatus({
          id: order.id,
          status: newStatus,
        })
      );

      setOrder((prev) => ({
        ...prev,
        status: newStatus,
      }));

      setEditingStatus(false);
      setStatusInput("");
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err.message);
    }
  };

  const handleEditStatus = () => {
    setEditingStatus(true);
    setStatusInput(order.status || "");
  };

  const handleCancelEditStatus = () => {
    setEditingStatus(false);
    setStatusInput("");
  };

  const handleCompleteDelivery = () => {
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

      // Since payment service is not available, we'll just update the order directly
      // In a real app, you would create a payment record here
      console.log("Payment collected:", {
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

      // Update order status via API
      await dispatch(
        updateOrderStatus({
          id: selectedOrder.id,
          status: "completed",
          total_amount: amount.toString(), // Update the total amount
          isDelivered: true,
          deliveryEndTime: new Date().toISOString(),
          deliveryStatus: "delivered",
          isPaid: true,
          paidAt: new Date().toISOString(),
          paymentStatus: "completed",
          payment_method: "cash",
          collectedBy: user?.name,
        })
      );

      // Update local state
      setOrder((prev) => ({
        ...prev,
        status: "completed",
        total_amount: amount.toString(),
        deliveryEndTime: new Date().toISOString(),
        deliveryStatus: "delivered",
        isDelivered: true,
        isPaid: true,
        paidAt: new Date().toISOString(),
        paymentStatus: "completed",
        payment_method: "cash",
        collectedBy: user?.name,
      }));

      // The Redux state will automatically update the UI
      // Reset state
      setShowPaymentModal(false);
      setSelectedOrder(null);
      setPaymentAmount("");
      setPaymentError("");
      setIsConfirming(false);
      setProcessing(false);

      navigate("/delivery/my-orders");
    } catch (err) {
      console.error("Error processing payment:", err);
      setPaymentError(t("paymentError"));
      setProcessing(false);
    }
  };

  if (loading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/delivery/my-orders")}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("backToMyOrders")}
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("orderNotFound")}
          </p>
          <button
            onClick={() => navigate("/delivery/my-orders")}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("backToMyOrders")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("order")} #{order.id}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {order.deliveryStartTime
                ? `${t("started")}: ${new Date(
                    order.deliveryStartTime
                  ).toLocaleTimeString()}`
                : t("notStarted")}
            </span>
          </div>
        </div>

        {/* Delivery Status */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            {editingStatus ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter status"
                />
                <button
                  onClick={() => handleStatusUpdate(statusInput)}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancelEditStatus}
                  className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    order.status === "completed" || order.isDelivered
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : order.status === "delivering" ||
                        order.deliveryStatus === "delivering"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {order.status === "completed"
                    ? t("completed")
                    : order.status === "delivering"
                    ? t("delivering")
                    : order.status === "pending"
                    ? t("pending")
                    : order.status === "cancelled"
                    ? t("cancelled")
                    : order.isDelivered
                    ? t("delivered")
                    : order.deliveryStatus === "delivering"
                    ? t("delivering")
                    : t("readyForDelivery")}
                </span>
                <button
                  onClick={handleEditStatus}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  title="Edit Status"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customer & Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("customerInformation")}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {customersLoading ? "..." : getCustomerName(order.customer)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {customersLoading
                      ? "..."
                      : getCustomerPhone(order.customer)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {customersLoading
                    ? "..."
                    : getCustomerAddress(order.customer)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("orderDetails")}
            </h3>
            <div className="space-y-4">
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
              ).map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {product.quantity}x
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {productsLoading
                        ? "..."
                        : getProductName(product.id) ||
                          product.name ||
                          product.product_name ||
                          `Product #${product.id}`}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(
                      (productsLoading
                        ? 0
                        : getProductPrice(product.id) || product.price || 0) *
                      (product.quantity || 1)
                    ).toFixed(2)}{" "}
                    {t("currency")}
                  </span>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("total")}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(order.total_amount || order.total || 0).toFixed(2)}{" "}
                    {t("currency")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => navigate("/delivery/my-orders")}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t("back")}
          </button>
          {(order.status === "pending" || !order.status) && (
            <button
              onClick={handleStartDelivery}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t("startDelivery")}
            </button>
          )}
          {(order.status === "delivering" ||
            order.deliveryStatus === "delivering") && (
            <button
              onClick={handleCompleteDelivery}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {t("markAsDelivered")}
            </button>
          )}
        </div>
      </div>

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

export default OrderDetails;
