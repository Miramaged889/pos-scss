import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Phone, Clock, AlertTriangle, Package } from "lucide-react";

import {
  getDeliveryOrderById,
  updateDeliveryOrder,
  setToStorage,
  getFromStorage,
  STORAGE_KEYS,
} from "../../../utils/localStorage";

const OrderDetails = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrder = useCallback(() => {
    try {
      if (!orderId) {
        setError("Invalid order ID");
        setLoading(false);
        return;
      }

      console.log("Loading order with ID:", orderId);
      const foundOrder = getDeliveryOrderById(orderId);

      if (!foundOrder) {
        console.log("Order not found");
        setError(t("orderNotFound"));
        setLoading(false);
        return;
      }

      console.log("Found order:", foundOrder);
      setOrder(foundOrder);
      setError(null);
    } catch (err) {
      console.error("Error loading order:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId, t]);

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadOrder]);

  const handleStartDelivery = () => {
    try {
      console.log("Starting delivery for order:", order.id);
      const updates = {
        deliveryStartTime: new Date().toISOString(),
        deliveryStatus: "delivering",
      };

      // Update in both storages
      updateDeliveryOrder(order.id, updates);
      const salesOrders = getFromStorage(STORAGE_KEYS.ORDERS, []);
      const updatedSalesOrders = salesOrders.map((o) =>
        o.id === order.id ? { ...o, ...updates } : o
      );
      setToStorage(STORAGE_KEYS.ORDERS, updatedSalesOrders);

      // Update local state
      setOrder((prev) => ({
        ...prev,
        ...updates,
      }));
    } catch (err) {
      console.error("Error starting delivery:", err);
      setError(err.message);
    }
  };

  const handleCompleteDelivery = () => {
    try {
      console.log("Completing delivery for order:", order.id);
      const updates = {
        deliveryEndTime: new Date().toISOString(),
        deliveryStatus: "delivered",
        isDelivered: true,
      };

      // Update in both storages
      updateDeliveryOrder(order.id, updates);
      const salesOrders = getFromStorage(STORAGE_KEYS.ORDERS, []);
      const updatedSalesOrders = salesOrders.map((o) =>
        o.id === order.id ? { ...o, ...updates } : o
      );
      setToStorage(STORAGE_KEYS.ORDERS, updatedSalesOrders);

      navigate("/delivery");
    } catch (err) {
      console.error("Error completing delivery:", err);
      setError(err.message);
    }
  };

  if (loading) {
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
            onClick={() => navigate("/delivery")}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("backToOrders")}
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
            onClick={() => navigate("/delivery")}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("backToOrders")}
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
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                order.isDelivered
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : order.deliveryStatus === "delivering"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {order.isDelivered
                ? t("delivered")
                : order.deliveryStatus === "delivering"
                ? t("delivering")
                : t("readyForDelivery")}
            </span>
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
                    {order.customer}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.customerPhone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {order.deliveryAddress}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("orderDetails")}
            </h3>
            <div className="space-y-4">
              {order.products.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {product.quantity}x
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(product.price * product.quantity).toFixed(2)}{" "}
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
                    {order.total.toFixed(2)} {t("currency")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => navigate("/delivery")}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t("back")}
          </button>
          {!order.isDelivered && (
            <button
              onClick={
                order.deliveryStatus === "delivering"
                  ? handleCompleteDelivery
                  : handleStartDelivery
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {order.deliveryStatus === "delivering"
                ? t("markAsDelivered")
                : t("startDelivery")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
