import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DollarSign, Search, CreditCard, Clock } from "lucide-react";
import { getFromStorage, STORAGE_KEYS } from "../../../utils/localStorage";

const PaymentCollection = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);

  // Load payments from localStorage
  useEffect(() => {
    const loadPayments = () => {
      const allPayments = getFromStorage(STORAGE_KEYS.PAYMENTS, []);
      const allOrders = getFromStorage(STORAGE_KEYS.ORDERS, []);

      // Create a Map to store unique payments by orderId
      const uniquePayments = new Map();

      // Process all payments without filtering by driver
      allPayments.forEach((payment) => {
        const order = allOrders.find((o) => o.id === payment.orderId);
        if (payment.status === "completed") {
          // Use the most recent payment for each order
          const existingPayment = uniquePayments.get(payment.orderId);
          if (
            !existingPayment ||
            new Date(payment.collectedAt) >
              new Date(existingPayment.collectedAt)
          ) {
            uniquePayments.set(payment.orderId, {
              ...payment,
              id: `${payment.orderId}-${payment.collectedAt}`, // Create unique ID
              customerName: order?.customer || t("unknownCustomer"),
              amount: payment.amount || 0,
              commission: (payment.amount || 0) * 0.1,
              deliveryStatus: order?.deliveryStatus || "pending",
              isPaid: order?.isPaid || false,
              paidAt: order?.paidAt || payment.collectedAt,
            });
          }
        }
      });

      // Convert Map to array and sort by collection date
      const processedPayments = Array.from(uniquePayments.values()).sort(
        (a, b) => new Date(b.collectedAt) - new Date(a.collectedAt)
      );

      setPayments(processedPayments);

      // Calculate total collected
      const total = processedPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      setTotalCollected(total);
    };

    loadPayments();
    const interval = setInterval(loadPayments, 30000);
    return () => clearInterval(interval);
  }, [t]);

  // Filter payments by search term
  const filteredPayments = payments.filter(
    (payment) =>
      payment.orderId
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                {totalCollected.toFixed(2)} {t("currency")}
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t("commission")}: {payment.commission.toFixed(2)}{" "}
                  {t("currency")}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  {payment.amount.toFixed(2)} {t("currency")}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleString()
                      : t("pending")}
                  </span>
                </div>
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
    </div>
  );
};

export default PaymentCollection;
