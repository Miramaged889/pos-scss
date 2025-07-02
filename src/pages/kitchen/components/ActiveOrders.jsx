import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { ChefHat } from "lucide-react";
import { toast } from "react-hot-toast";

import OrderCard from "./OrderCard";
import StatusUpdateModal from "./StatusUpdateModal";
import {
  setToStorage as saveToLocalStorage,
  getFromStorage as getFromLocalStorage,
  getOrders,
} from "../../../utils/localStorage";

const ActiveOrders = ({ isHome = false }) => {
  const { t } = useTranslation();
  const { theme } = useSelector((state) => state.language);
  const reduxOrders = useSelector((state) => state.orders.orders);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [notes, setNotes] = useState("");

  // Load orders from both Redux and localStorage
  useEffect(() => {
    const loadOrders = () => {
      const localOrders = getOrders();

      if (reduxOrders && reduxOrders.length > 0) {
        const mergedOrders = [...localOrders];

        reduxOrders.forEach((reduxOrder) => {
          const existingIndex = mergedOrders.findIndex(
            (o) => o.id === reduxOrder.id
          );
          if (existingIndex === -1) {
            mergedOrders.push(reduxOrder);
          } else {
            const existingOrder = mergedOrders[existingIndex];
            const reduxOrderDate = new Date(
              reduxOrder.lastUpdated || reduxOrder.createdAt
            );
            const existingOrderDate = new Date(
              existingOrder.lastUpdated || existingOrder.createdAt
            );

            if (reduxOrderDate > existingOrderDate) {
              mergedOrders[existingIndex] = reduxOrder;
            }
          }
        });

        saveToLocalStorage("sales_app_orders", mergedOrders);
        setOrders(mergedOrders);
      } else {
        setOrders(localOrders);
      }
    };

    loadOrders();
  }, [reduxOrders]);

  // Filter only uncompleted orders and sort by creation time (newest first)
  const activeOrders = orders
    .filter((order) => order.status !== "completed")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const displayOrders = isHome ? activeOrders.slice(0, 8) : activeOrders;

  const handleStatusUpdate = (orderId) => {
    setSelectedOrder(orderId);
    setStatusUpdateModal(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedOrder) {
      const updatedOrders = [...orders];
      const orderIndex = updatedOrders.findIndex((o) => o.id === selectedOrder);

      if (orderIndex !== -1) {
        const currentStatus = updatedOrders[orderIndex].status;
        const nextStatus = getNextStatus(currentStatus);

        // Track preparation time for analytics
        if (currentStatus === "preparing" && nextStatus === "ready") {
          const prepTimes = getFromLocalStorage("preparationTimes", []);
          const startTime = getFromLocalStorage(
            `orderStartTime_${selectedOrder}`
          );

          if (startTime) {
            const prepTime = Math.round((Date.now() - startTime) / (1000 * 60));
            prepTimes.push(prepTime);

            if (prepTimes.length > 50) {
              prepTimes.shift();
            }

            saveToLocalStorage("preparationTimes", prepTimes);
          }
        }

        // Store start time when order begins preparation
        if (currentStatus === "pending" && nextStatus === "preparing") {
          saveToLocalStorage(`orderStartTime_${selectedOrder}`, Date.now());
        }

        // Update order status
        updatedOrders[orderIndex] = {
          ...updatedOrders[orderIndex],
          status: nextStatus,
          notes: notes,
          lastUpdated: new Date().toISOString(),
          ...(nextStatus === "completed" && {
            completedAt: new Date().toISOString(),
          }),
        };

        saveToLocalStorage("sales_app_orders", updatedOrders);
        setOrders(updatedOrders);

        // Show appropriate status message
        let statusMessage = "";
        switch (nextStatus) {
          case "preparing":
            statusMessage = t("orderPreparationStarted");
            break;
          case "ready":
            statusMessage = t("orderReadyForPickup");
            break;
          case "completed":
            statusMessage = t("orderCompleted");
            break;
          default:
            statusMessage = t("orderUpdated");
        }

        toast.success(statusMessage);
        setStatusUpdateModal(false);
        setSelectedOrder(null);
        setNotes("");
      }
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return "preparing";
      case "preparing":
        return "ready";
      case "ready":
        return "completed";
      default:
        return currentStatus;
    }
  };

  const getOrderPriority = (order) => {
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const hoursDiff = (now - orderTime) / (1000 * 60 * 60);

    if (hoursDiff > 1) return "high";
    if (hoursDiff > 0.5) return "medium";
    return "normal";
  };

  return (
    <div className={`space-y-6 ${theme === "dark" ? "dark" : ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {isHome ? t("kitchenOrdersOverview") : t("kitchenOrders")}
        </h3>
        {isHome && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("showing")} {displayOrders.length} {t("of")}{" "}
            {activeOrders.length} {t("orders")}
          </span>
        )}
      </div>

      {/* Orders Grid - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
        {displayOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            priority={getOrderPriority(order)}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </div>

      {displayOrders.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {t("noKitchenOrders")}
          </p>
        </div>
      )}

      {/* Show more button for home view */}
      {isHome && activeOrders.length > 8 && (
        <div className="text-center">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {t("viewAllKitchenOrders")} ({activeOrders.length - 8} {t("more")})
          </button>
        </div>
      )}

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={statusUpdateModal}
        onClose={() => setStatusUpdateModal(false)}
        onConfirm={confirmStatusUpdate}
        notes={notes}
        setNotes={setNotes}
        selectedOrder={selectedOrder}
        orders={orders}
        theme={theme}
      />
    </div>
  );
};

export default ActiveOrders;
