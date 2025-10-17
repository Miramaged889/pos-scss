import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Clock, ChefHat, CheckCircle, AlertTriangle } from "lucide-react";

const OrderCard = ({ order, priority, onStatusUpdate, products = [] }) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  // Helper function to get product name by ID using the products prop
  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      return isRTL ? product.name : product.nameEn;
    }
    return `Product #${productId}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800",
      preparing:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800",
      ready:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800",
      completed:
        "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-200 dark:border-gray-700",
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      preparing: <ChefHat className="w-4 h-4" />,
      ready: <CheckCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
    };
    return icons[status] || icons.pending;
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "high":
        return "border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-700";
      case "medium":
        return "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-700";
      default:
        return "border-gray-200 dark:border-gray-700";
    }
  };

  const getActionButtonText = (status) => {
    switch (status) {
      case "pending":
        return t("startPreparing");
      case "preparing":
        return t("markReady");
      case "ready":
        return t("markCompleted");
      default:
        return "";
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeElapsed = (dateString) => {
    const orderTime = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} ${t("minutesAgo")}`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}:${minutes.toString().padStart(2, "0")} ${t("ago")}`;
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 p-4 transition-all duration-200 hover:shadow-md ${getPriorityStyles(
        priority
      )}`}
    >
      {/* Order Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {t("order")} #{order.id}
          </span>
          {priority === "high" && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(order.createdAt)}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {getTimeElapsed(order.createdAt)}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <div className="space-y-1">
          {order.products?.slice(0, 3).map((product, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {product.quantity}x {getProductName(product.id)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {product.notes}
              </span>
            </div>
          ))}
          {order.products?.length > 3 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              +{order.products.length - 3} {t("moreItems")}
            </div>
          )}
        </div>

        {/* Kitchen Notes */}
        {order.kitchenNotes && (
          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
            <strong className="text-yellow-800 dark:text-yellow-200">
              {t("note")}:
            </strong>{" "}
            <span className="text-yellow-700 dark:text-yellow-300">
              {order.kitchenNotes}
            </span>
          </div>
        )}
      </div>

      {/* Status and Action */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusIcon(order.status)}
          {t(order.status)}
        </span>

        {order.status !== "completed" && (
          <button
            onClick={() => onStatusUpdate(order.id)}
            className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            {getActionButtonText(order.status)}
          </button>
        )}
      </div>

      {/* Priority Indicator */}
      {priority === "high" && (
        <div className="mt-2 px-2 py-1 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-200 text-center">
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          {t("urgentOrder")}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
