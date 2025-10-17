import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Truck,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  MapPin,
  Route as RouteIcon,
  Power,
} from "lucide-react";

import { setOnlineStatus } from "../../../store/slices/deliverySlice";
import { fetchOrders } from "../../../store/slices/ordersSlice";
import StatsCard from "../../../components/Common/StatsCard";
import MyOrders from "./MyOrders";

const DeliveryHome = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isOnline } = useSelector((state) => state.delivery);
  const { orders } = useSelector((state) => state.orders);
  const [todaysStats, setTodaysStats] = useState({
    completedToday: 0,
    pendingDeliveries: 0,
    todaysEarnings: 0,
  });

  // Load orders and calculate statistics
  useEffect(() => {
    const loadOrdersAndStats = async () => {
      // Fetch orders from API
      await dispatch(fetchOrders());
    };

    loadOrdersAndStats();
    const interval = setInterval(loadOrdersAndStats, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  // Calculate statistics when orders change
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Filter orders for delivery only and this driver
      const driverOrders = orders.filter(
        (order) =>
          order.delivery_option === "delivery" &&
          (order.assignedDriver === user?.name ||
            (!order.assignedDriver && !order.isDelivered))
      );

      // Get today's orders
      const today = new Date().toDateString();
      const todaysOrders = driverOrders.filter(
        (order) => new Date(order.createdAt).toDateString() === today
      );

      // Calculate statistics
      const completed = todaysOrders.filter(
        (order) => order.isDelivered
      ).length;
      const pending = driverOrders.filter((order) => !order.isDelivered).length;

      // Calculate earnings (simplified without payments data)
      const earnings = todaysOrders.reduce(
        (sum, order) => sum + (order.total || 0) * 0.1,
        0
      );

      setTodaysStats({
        completedToday: completed,
        pendingDeliveries: pending,
        todaysEarnings: earnings,
      });
    }
  }, [orders, user?.name]);

  const stats = [
    {
      title: t("deliveriesCompleted"),
      value: todaysStats.completedToday,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: t("pendingDeliveries"),
      value: todaysStats.pendingDeliveries,
      icon: Clock,
      color: "yellow",
    },
    {
      title: t("todaysEarnings"),
      value: `${(todaysStats.todaysEarnings || 0).toFixed(2)} ${t("currency")}`,
      icon: DollarSign,
      color: "blue",
    },
  ];

  const quickActions = [
    {
      icon: MapPin,
      title: t("trackLocation"),
      description: t("startSharingLocation"),
      link: "/delivery/track",
      color: "blue",
    },
    {
      icon: RouteIcon,
      title: t("route"),
      description: t("viewDeliveryRoute"),
      link: "/delivery/route",
      color: "purple",
    },
    {
      icon: Shield,
      title: t("settings"),
      description: t("manageYourProfileAndPreferences"),
      link: "/delivery/settings",
      color: "gray",
    },
  ];

  const handleToggleOnline = () => {
    dispatch(setOnlineStatus(!isOnline));
  };

  return (
    <div className="space-y-6">
      {/* Header with Online Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("welcome")}, {user?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isOnline ? t("availableForDelivery") : t("goOnlineToStart")}
            </p>
          </div>
          <button
            onClick={handleToggleOnline}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isOnline
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Power className="w-5 h-5" />
            <span>{isOnline ? t("online") : t("offline")}</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t("quickActions")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.link}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div
                className={`p-3 rounded-lg ${
                  action.color === "blue"
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : action.color === "purple"
                    ? "bg-purple-100 dark:bg-purple-900/30"
                    : "bg-gray-100 dark:bg-gray-600"
                }`}
              >
                <action.icon
                  className={`w-6 h-6 ${
                    action.color === "blue"
                      ? "text-blue-600 dark:text-blue-400"
                      : action.color === "purple"
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Active Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t("activeOrders")}
        </h2>
        <MyOrders isHome={true} />
      </div>
    </div>
  );
};

export default DeliveryHome;
