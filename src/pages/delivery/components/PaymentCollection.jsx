import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  DollarSign,
  Search,
  CreditCard,
  Clock,
  CheckCircle,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  fetchOrders,
  updateOrderStatus,
} from "../../../store/slices/ordersSlice";
import { customerService } from "../../../services";

const PaymentCollection = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Customer data states
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

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

  // Helper function to get customer name by ID
  const getCustomerName = useCallback(
    (customerId) => {
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
        return (
          customer.customer_name || customer.name || `Customer #${actualId}`
        );
      }
      return `Customer #${actualId}`;
    },
    [customers]
  );

  // Helper function to get customer address by ID
  const getCustomerAddress = useCallback(
    (customerId) => {
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
    },
    [customers]
  );

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        await dispatch(fetchOrders());
      } catch (err) {
        console.error("Error loading orders:", err);
      }
    };

    loadOrders();
    fetchCustomersData();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Process orders to create payment data
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Create payment data from orders (simplified approach) - only delivery orders
      const processedPayments = orders
        .filter(
          (order) =>
            order.delivery_option === "delivery" &&
            (order.status === "completed" ||
              order.status === "delivering" ||
              order.isPaid)
        )
        .map((order) => ({
          id: `${order.id}-${order.date || order.createdAt}`,
          orderId: order.id,
          customerName: customersLoading
            ? "..."
            : getCustomerName(order.customer),
          customerAddress: customersLoading
            ? "..."
            : getCustomerAddress(order.customer),
          amount: order.total_amount || order.total || 0,
          commission: (order.total_amount || order.total || 0) * 0.1,
          deliveryStatus: order.status || order.deliveryStatus || "pending",
          isPaid: order.isPaid || order.status === "completed" || false,
          paidAt: order.paidAt || order.date || order.createdAt,
          collectedAt: order.paidAt || order.date || order.createdAt,
        }))
        .sort((a, b) => new Date(b.collectedAt) - new Date(a.collectedAt));

      setPayments(processedPayments);

      // Calculate total collected
      const total = processedPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      setTotalCollected(total);
    }
  }, [
    orders,
    t,
    customers,
    customersLoading,
    getCustomerName,
    getCustomerAddress,
  ]);

  // Filter payments by search term
  const filteredPayments = payments.filter(
    (payment) =>
      payment.orderId
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCollectPayment = (order) => {
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

      // Log payment collection
      console.log("Payment collected:", {
        orderId: selectedOrder.id,
        amount: amount,
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
        })
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

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("totalPayments")}
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {payments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("totalCollected")}
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {(totalCollected || 0).toFixed(2)} {t("currency")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("searchPayments")}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    #{payment.orderId}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      payment.isPaid
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {payment.isPaid ? t("completed") : t("pending")}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                  {payment.customerName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {payment.customerAddress}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t("commission")}: {(payment.commission || 0).toFixed(2)}{" "}
                  {t("currency")}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  {(payment.amount || 0).toFixed(2)} {t("currency")}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleString()
                      : t("pending")}
                  </span>
                </div>
                {!payment.isPaid && (
                  <button
                    onClick={() => handleCollectPayment(payment)}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    {t("collectPayment")}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("noPaymentsFound")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {searchTerm ? t("tryDifferentSearch") : t("noPaymentsCollected")}
            </p>
          </div>
        )}
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

export default PaymentCollection;
