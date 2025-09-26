import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  BarChart3,
  TrendingUp,
  Clock,
  ChefHat,
  AlertTriangle,
  Download,
  Calendar,
  Filter,
} from "lucide-react";

import StatsCard from "../../../components/Common/StatsCard";
import { fetchOrders } from "../../../store/slices/ordersSlice";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const KitchenReports = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const { theme } = useSelector((state) => state.language);
  const [dateRange, setDateRange] = useState("week");
  const [reportData, setReportData] = useState({});

  // Load orders from API
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const generateReportData = useCallback(() => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get orders from Redux state
    const allOrders = orders || [];
    const filteredOrders = allOrders.filter(
      (order) => new Date(order.createdAt) >= startDate
    );

    // Order status distribution
    const statusDistribution = {
      pending: filteredOrders.filter((o) => o.status === "pending").length,
      preparing: filteredOrders.filter((o) => o.status === "preparing").length,
      ready: filteredOrders.filter((o) => o.status === "ready").length,
      completed: filteredOrders.filter((o) => o.status === "completed").length,
    };

    // Orders by hour for today
    const hourlyOrders = Array.from({ length: 24 }, (_, i) => {
      return filteredOrders.filter((order) => {
        const orderHour = new Date(order.createdAt).getHours();
        return orderHour === i;
      }).length;
    });

    // Daily orders for the selected period
    const dailyOrders = {};
    filteredOrders.forEach((order) => {
      const date = new Date(order.createdAt).toDateString();
      dailyOrders[date] = (dailyOrders[date] || 0) + 1;
    });

    // Most popular items
    const itemCounts = {};
    filteredOrders.forEach((order) => {
      order.products?.forEach((product) => {
        itemCounts[product.name] =
          (itemCounts[product.name] || 0) + product.quantity;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Calculate average preparation time from completed orders
    const completedOrders = filteredOrders.filter(
      (o) => o.status === "completed" && o.completedAt
    );
    const avgPrepTime =
      completedOrders.length > 0
        ? completedOrders.reduce((sum, order) => {
            const startTime = new Date(order.createdAt).getTime();
            const endTime = new Date(order.completedAt).getTime();
            const diffInMinutes = Math.round(
              (endTime - startTime) / (1000 * 60)
            );
            return sum + (diffInMinutes > 0 ? diffInMinutes : 0);
          }, 0) / completedOrders.length
        : 0;

    // Store the generated report data in localStorage
    const reportDataToStore = {
      totalOrders: filteredOrders.length,
      completedOrders: statusDistribution.completed,
      avgPrepTime: Math.round(avgPrepTime),
      statusDistribution,
      hourlyOrders,
      dailyOrders,
      popularItems,
      lastUpdated: new Date().toISOString(),
    };

    setReportData(reportDataToStore);
  }, [dateRange]);

  // Load report data from localStorage on mount and when date range changes
  useEffect(() => {
    if (orders && orders.length > 0) {
      generateReportData();
    }
  }, [generateReportData, orders]);

  const getChartOptions = (isDark) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? "#e5e7eb" : "#374151",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? "#9ca3af" : "#6b7280",
        },
        grid: {
          color: isDark ? "#374151" : "#e5e7eb",
        },
      },
      y: {
        ticks: {
          color: isDark ? "#9ca3af" : "#6b7280",
        },
        grid: {
          color: isDark ? "#374151" : "#e5e7eb",
        },
      },
    },
  });

  const orderStatusChartData = {
    labels: [t("pending"), t("preparing"), t("ready"), t("completed")],
    datasets: [
      {
        data: [
          reportData.statusDistribution?.pending || 0,
          reportData.statusDistribution?.preparing || 0,
          reportData.statusDistribution?.ready || 0,
          reportData.statusDistribution?.completed || 0,
        ],
        backgroundColor: [
          "#fbbf24", // yellow
          "#3b82f6", // blue
          "#10b981", // green
          "#6b7280", // gray
        ],
        borderWidth: theme === "dark" ? 1 : 0,
        borderColor: theme === "dark" ? "#374151" : "transparent",
      },
    ],
  };

  const hourlyOrdersChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: t("orders"),
        data: reportData.hourlyOrders || [],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
      },
    ],
  };

  const dailyTrendData = {
    labels: Object.keys(reportData.dailyOrders || {}).map((date) =>
      new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: t("dailyOrders"),
        data: Object.values(reportData.dailyOrders || {}),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const stats = [
    {
      title: t("totalOrders"),
      value: reportData.totalOrders || 0,
      icon: ChefHat,
      color: "blue",
      change: getFromStorage("previousStats", {}).totalOrders
        ? `${Math.round(
            ((reportData.totalOrders || 0) /
              getFromStorage("previousStats", {}).totalOrders -
              1) *
              100
          )}%`
        : "+0%",
      trend: getFromStorage("previousStats", {}).totalOrders
        ? (reportData.totalOrders || 0) >=
          getFromStorage("previousStats", {}).totalOrders
          ? "up"
          : "down"
        : "up",
    },
    {
      title: t("completedOrders"),
      value: reportData.completedOrders || 0,
      icon: TrendingUp,
      color: "green",
      change: getFromStorage("previousStats", {}).completedOrders
        ? `${Math.round(
            ((reportData.completedOrders || 0) /
              getFromStorage("previousStats", {}).completedOrders -
              1) *
              100
          )}%`
        : "+0%",
      trend: getFromStorage("previousStats", {}).completedOrders
        ? (reportData.completedOrders || 0) >=
          getFromStorage("previousStats", {}).completedOrders
          ? "up"
          : "down"
        : "up",
    },
    {
      title: t("averagePreparationTime"),
      value: `${reportData.avgPrepTime || 0} ${t("minutes")}`,
      icon: Clock,
      color: "purple",
      change: getFromStorage("previousStats", {}).avgPrepTime
        ? `${Math.round(
            (reportData.avgPrepTime || 0) -
              getFromStorage("previousStats", {}).avgPrepTime
          )} min`
        : "0 min",
      trend: getFromStorage("previousStats", {}).avgPrepTime
        ? (reportData.avgPrepTime || 0) <=
          getFromStorage("previousStats", {}).avgPrepTime
          ? "down"
          : "up"
        : "up",
    },
    {
      title: t("completionRate"),
      value:
        reportData.totalOrders > 0
          ? `${Math.round(
              (reportData.completedOrders / reportData.totalOrders) * 100
            )}%`
          : "0%",
      icon: BarChart3,
      color: "indigo",
      change: getFromStorage("previousStats", {}).completionRate
        ? `${Math.round(
            ((reportData.completedOrders / reportData.totalOrders) * 100 || 0) -
              getFromStorage("previousStats", {}).completionRate
          )}%`
        : "+0%",
      trend: getFromStorage("previousStats", {}).completionRate
        ? ((reportData.completedOrders / reportData.totalOrders) * 100 || 0) >=
          getFromStorage("previousStats", {}).completionRate
          ? "up"
          : "down"
        : "up",
    },
  ];

  // Store current stats as previous stats for next comparison
  useEffect(() => {
    if (reportData.totalOrders) {
      setToStorage("previousStats", {
        totalOrders: reportData.totalOrders,
        completedOrders: reportData.completedOrders,
        avgPrepTime: reportData.avgPrepTime,
        completionRate:
          (reportData.completedOrders / reportData.totalOrders) * 100,
      });
    }
  }, [reportData]);

  const exportReport = () => {
    const reportContent = {
      dateRange,
      generatedAt: new Date().toISOString(),
      stats: reportData,
      previousStats: getFromStorage("previousStats", {}),
      orders: getOrders(),
      lastUpdated: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kitchen-report-${dateRange}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isDark = theme === "dark";

  return (
    <div className={`space-y-6 ${isDark ? "dark" : ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("kitchenReports")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("performanceAnalyticsAndInsights")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="today">{t("today")}</option>
              <option value="week">{t("thisWeek")}</option>
              <option value="month">{t("thisMonth")}</option>
            </select>
          </div>

          <button
            onClick={exportReport}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            {t("exportReport")}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} theme={theme} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t("orderStatusDistribution")}
          </h3>
          <div style={{ height: "300px" }}>
            <Doughnut
              data={orderStatusChartData}
              options={{
                ...getChartOptions(isDark),
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Hourly Orders */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t("ordersByHour")}
          </h3>
          <div style={{ height: "300px" }}>
            <Bar
              data={hourlyOrdersChartData}
              options={{
                ...getChartOptions(isDark),
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Daily Trend */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t("dailyOrderTrend")}
          </h3>
          <div style={{ height: "300px" }}>
            <Line
              data={dailyTrendData}
              options={{
                ...getChartOptions(isDark),
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("popularItems")}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {dateRange === "today"
                ? t("today")
                : dateRange === "week"
                ? t("thisWeek")
                : t("thisMonth")}
            </div>
          </div>

          <div className="space-y-4">
            {reportData.popularItems?.length > 0 ? (
              reportData.popularItems.map(([item, count], index) => {
                const maxCount = Math.max(
                  ...reportData.popularItems.map(([, c]) => c)
                );
                const percentage = (count / maxCount) * 100;

                return (
                  <div key={item} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span
                          className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                          ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
                              : index === 1
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                              : index === 2
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
                          }
                        `}
                        >
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {item}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("orderedCount", { count })}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(percentage)}%
                      </div>
                    </div>

                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-500"
                            : index === 2
                            ? "bg-orange-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM7.5 15h9m-9-3h9m-9-3h9"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                  {t("noPopularItems")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("noOrdersInPeriod")}
                </p>
              </div>
            )}
          </div>

          {reportData.popularItems?.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("totalUniqueItems")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {reportData.popularItems.length}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("totalOrderedItems")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {reportData.popularItems.reduce(
                    (sum, [, count]) => sum + count,
                    0
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t("performanceInsights")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                {t("peakHours")}
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {t("busiest")} 12:00 - 14:00 & 19:00 - 21:00
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-900 dark:text-green-200">
                {t("efficiency")}
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {reportData.avgPrepTime < 20
                ? t("goodPrepTime")
                : t("improvePrepTime")}
            </p>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <span className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                {t("recommendations")}
              </span>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              {t("optimizeForPeakHours")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenReports;
