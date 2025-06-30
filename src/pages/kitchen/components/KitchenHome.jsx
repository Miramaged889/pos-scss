import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  ChefHat,
  Clock,
  CheckCircle,
  Timer,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import StatsCard from "../../../components/Common/StatsCard";
import TodaysOrders from "./TodaysOrders";
import { getFromStorage as getFromLocalStorage } from "../../../utils/localStorage";
import { formatNumberEnglish } from "../../../utils";

const KitchenHome = () => {
  const { t } = useTranslation();
  const { theme, isRTL } = useSelector((state) => state.language);
  const [orders, setOrders] = useState([]);
  const [kitchenSettings, setKitchenSettings] = useState({});

  // Load kitchen settings and orders from localStorage
  useEffect(() => {
    const settings = getFromLocalStorage("kitchenSettings", {
      autoRefresh: true,
      refreshInterval: 20,
      soundNotifications: true,
      showPriorityAlerts: true,
    });
    setKitchenSettings(settings);

    const savedOrders = getFromLocalStorage("sales_app_orders", []);
    setOrders(savedOrders);
  }, []);

  // Filter today's orders
  const todayOrders = orders.filter(
    (order) =>
      new Date(order.createdAt).toDateString() === new Date().toDateString()
  );

  // Calculate order statistics
  const preparingOrders = todayOrders.filter(
    (order) => order.status === "preparing"
  );
  const readyOrders = todayOrders.filter((order) => order.status === "ready");
  const pendingOrders = todayOrders.filter(
    (order) => order.status === "pending"
  );
  const completedOrders = todayOrders.filter(
    (order) => order.status === "completed"
  );

  // Calculate average preparation time (enhanced with local storage tracking)
  const getAveragePreparationTime = () => {
    const prepTimes = getFromLocalStorage("preparationTimes", []);
    if (prepTimes.length === 0) return 18;

    const total = prepTimes.reduce((sum, time) => sum + time, 0);
    return Math.round(total / prepTimes.length);
  };

  const avgPrepTime = getAveragePreparationTime();

  // Priority orders (orders older than 30 minutes)
  const priorityOrders = todayOrders.filter((order) => {
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const hoursDiff = (now - orderTime) / (1000 * 60 * 60);
    return hoursDiff > 0.5 && order.status !== "completed";
  });

  const stats = [
    {
      title: t("pendingOrders"),
      value: formatNumberEnglish(pendingOrders.length),
      icon: Clock,
      color: "yellow",
      change: formatNumberEnglish(2),
      trend: "up",
    },
    {
      title: t("preparing"),
      value: formatNumberEnglish(preparingOrders.length),
      icon: ChefHat,
      color: "blue",
      change: formatNumberEnglish(1),
      trend: "up",
    },
    {
      title: t("readyForDelivery"),
      value: formatNumberEnglish(readyOrders.length),
      icon: CheckCircle,
      color: "green",
      change: formatNumberEnglish(1),
      trend: "down",
    },
    {
      title: t("averagePreparationTime"),
      value: `${formatNumberEnglish(avgPrepTime)} ${t("minutes")}`,
      icon: Timer,
      color: "purple",
      change: formatNumberEnglish(avgPrepTime > 20 ? 2 : 1),
      trend: avgPrepTime > 20 ? "up" : "down",
    },
  ];

  return (
    <div
      className={`space-y-6 ${theme === "dark" ? "dark" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Auto-refresh notification */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <RefreshCw
              className={`w-5 h-5 text-blue-600 dark:text-blue-400 ${
                isRTL ? "ml-2" : "mr-2"
              }`}
            />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              {t("autoRefreshNotification")}
            </span>
          </div>
          {priorityOrders.length > 0 && kitchenSettings.showPriorityAlerts && (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <AlertTriangle className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`} />
              <span className="text-sm font-medium">
                {formatNumberEnglish(priorityOrders.length)}{" "}
                {t("priorityOrders")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} theme={theme} />
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t("todayPerformance")}
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t("totalOrders")}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatNumberEnglish(todayOrders.length)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t("completedOrders")}
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatNumberEnglish(completedOrders.length)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t("completionRate")}
              </span>
              <span className="font-medium">
                {formatNumberEnglish(
                  todayOrders.length > 0
                    ? Math.round(
                        (completedOrders.length / todayOrders.length) * 100
                      )
                    : 0
                )}
                %
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t("quickActions")}
          </h4>
          <div className="space-y-2">
            <button
              className={`w-full text-${
                isRTL ? "right" : "left"
              } px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors`}
            >
              {t("markAllReady")}
            </button>
            <button
              className={`w-full text-${
                isRTL ? "right" : "left"
              } px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors`}
            >
              {t("printTodayOrders")}
            </button>
            <button
              className={`w-full text-${
                isRTL ? "right" : "left"
              } px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors`}
            >
              {t("exportReport")}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t("notifications")}
          </h4>
          <div className="space-y-2">
            {priorityOrders.length > 0 && (
              <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {formatNumberEnglish(priorityOrders.length)}{" "}
                  {t("ordersNeedAttention")}
                </p>
              </div>
            )}
            {pendingOrders.length > 5 && (
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {t("highOrderVolume")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Orders Overview */}
      <div aria-label={t("todayOrdersOverview")}>
        <TodaysOrders isHome={true} />
      </div>
    </div>
  );
};

export default KitchenHome;
