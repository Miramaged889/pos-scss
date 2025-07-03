import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  getFromStorage,
  addDeliveryAction,
  syncDeliveryOrders,
  updateDeliveryOrder,
  addPayment,
  STORAGE_KEYS,
  DELIVERY_ACTIONS,
} from "../../../utils/localStorage";

const MyOrders = ({ isHome = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [localOrders, setLocalOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Get current user from localStorage
  const user = getFromStorage(STORAGE_KEYS.AUTH, {})?.user;

  // Load orders from localStorage
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Sync delivery orders and update stats
        const deliveryOrders = await syncDeliveryOrders(user?.name);

        if (!Array.isArray(deliveryOrders)) {
          setError(t("errorLoadingOrders"));
          return;
        }

        // Filter and sort orders
        const activeOrders = deliveryOrders
          .filter(
            (order) =>
              order &&
              (!order.isDelivered ||
                order.deliveryStatus !== "delivered" ||
                (order.assignedDriver === user?.name && !order.isPaid))
          )
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setLocalOrders(activeOrders);
      } catch (err) {
        console.error("Error loading orders:", err);
        setError(t("errorLoadingOrders"));
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [t, user?.name]);

  // Filter orders for this driver
  const filterOrders = () => {
    let filteredOrders = localOrders.filter((order) => order && order.id); // Ensure valid orders

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

  const handleStartDelivery = async (orderId) => {
    try {
      // Create delivery action
      const action = await addDeliveryAction({
        type: DELIVERY_ACTIONS.START_DELIVERY,
        driverId: user?.name,
        orderId,
      });

      // Update order in localStorage
      const updatedOrder = await updateDeliveryOrder(orderId, {
        assignedDriver: user?.name,
        deliveryStartTime: action.timestamp,
        deliveryStatus: "delivering",
      });

      // Update local state
      setLocalOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      );
    } catch (err) {
      console.error("Error starting delivery:", err);
      setError(t("errorStartingDelivery"));
    }
  };

  const handleCompleteDelivery = (order) => {
    if (!order.total) {
      setError(t("invalidOrderTotal"));
      return;
    }
    setSelectedOrder(order);
    setPaymentAmount(order.total.toString());
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

      if (Math.abs(amount - selectedOrder.total) > 0.01) {
        setPaymentError(t("amountMismatch"));
        return;
      }

      // Show confirmation step
      if (!isConfirming) {
        setIsConfirming(true);
        return;
      }

      setProcessing(true);

      // Create delivery action for completion
      const completeAction = await addDeliveryAction({
        type: DELIVERY_ACTIONS.COMPLETE_DELIVERY,
        driverId: user?.name,
        orderId: selectedOrder.id,
      });

      // Add payment record
      const payment = await addPayment({
        orderId: selectedOrder.id,
        amount: amount,
        collectedBy: user?.name,
        customerName: selectedOrder.customer,
        orderTotal: selectedOrder.total,
        method: "cash",
        status: "completed",
        collectedAt: completeAction.timestamp,
        paidAt: new Date().toISOString(),
        isPaid: true,
      });

      if (!payment) throw new Error("Failed to create payment");

      // Update order status
      const updatedOrder = await updateDeliveryOrder(selectedOrder.id, {
        isDelivered: true,
        deliveryEndTime: completeAction.timestamp,
        deliveryStatus: "delivered",
        isPaid: true,
        paidAt: payment.paidAt || payment.collectedAt,
        paymentId: payment.id,
        paymentStatus: "completed",
      });

      // Update local state
      setLocalOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id ? updatedOrder : order
        )
      );

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
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
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
                        {order.customer}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate max-w-xs">
                          {order.deliveryAddress}
                        </span>
                      </div>
                    </div>
                    {order.customerPhone && (
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title={t("callCustomer")}
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("orderItems")}
                  </h4>
                  <div className="space-y-2">
                    {order.products.slice(0, 2).map((product, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                            {product.quantity}x
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {product.name}
                          </span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {(product.price * product.quantity).toFixed(2)}{" "}
                          {t("currency")}
                        </span>
                      </div>
                    ))}
                    {order.products.length > 2 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-1">
                        +{order.products.length - 2} {t("moreItems")}
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
                      {order.total.toFixed(2)} {t("currency")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("commission")}
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {(order.total * 0.1).toFixed(2)} {t("currency")}
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
                      onClick={() => handleStartDelivery(order.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title={t("startDeliveryTooltip")}
                    >
                      <Truck className="w-4 h-4" />
                      {t("startDelivery")}
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
                        {selectedOrder?.total.toFixed(2)} {t("currency")}
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
                        {selectedOrder?.total.toFixed(2)} {t("currency")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("commission")}
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {((selectedOrder?.total || 0) * 0.1).toFixed(2)}{" "}
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
