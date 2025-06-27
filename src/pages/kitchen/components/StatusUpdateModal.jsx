import React from "react";
import { useTranslation } from "react-i18next";
import { X, AlertCircle } from "lucide-react";

const StatusUpdateModal = ({
  isOpen,
  onClose,
  onConfirm,
  notes,
  setNotes,
  selectedOrder,
  orders,
  theme,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const order = orders?.find((o) => o.id === selectedOrder);

  const getNextStatusText = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return t("startPreparing");
      case "preparing":
        return t("markAsReady");
      case "ready":
        return t("markAsDelivered");
      default:
        return t("updateStatus");
    }
  };

  const getStatusDescription = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return t("orderWillBeMarkedPreparing");
      case "preparing":
        return t("orderWillBeMarkedReady");
      case "ready":
        return t("orderWillBeMarkedDelivered");
      default:
        return t("orderStatusWillBeUpdated");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 ${
          theme === "dark" ? "dark" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t("updateOrderStatus")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Info */}
          {order && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("order")} #{order.id}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {order.customer}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {order.products?.slice(0, 2).map((product, index) => (
                  <div key={index}>
                    {product.quantity}x {product.name}
                  </div>
                ))}
                {order.products?.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{order.products.length - 2} {t("moreItems")}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Update Info */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {order ? getNextStatusText(order.status) : t("updateStatus")}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {order ? getStatusDescription(order.status) : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Notes Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("notes")} ({t("optional")})
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 resize-none"
              placeholder={t("addNotesAboutOrder")}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
            >
              {t("cancel")}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              {t("confirmUpdate")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
