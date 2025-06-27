import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
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
import { getFromStorage as getFromLocalStorage } from "../../../utils/localStorage";

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
  const { orders } = useSelector((state) => state.orders);
  const { theme } = useSelector((state) => state.language);
  const [dateRange, setDateRange] = useState("week");
  const [reportData, setReportData] = useState({});

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

    const filteredOrders = orders.filter(
      (order) => new Date(order.createdAt) >= startDate
    );

    // Calculate preparation times from localStorage
    const prepTimes = getFromLocalStorage("preparationTimes", []);
    const avgPrepTime =
      prepTimes.length > 0
        ? prepTimes.reduce((sum, time) => sum + time, 0) / prepTimes.length
        : 0;

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

    setReportData({
      totalOrders: filteredOrders.length,
      completedOrders: statusDistribution.completed,
      avgPrepTime: Math.round(avgPrepTime),
      statusDistribution,
      hourlyOrders,
      dailyOrders,
      popularItems,
    });
  }, [orders, dateRange]);

  useEffect(() => {
    generateReportData();
  }, [generateReportData]);

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
      new Date(date).toLocaleDateString("ar-SA", {
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
      change: "+12%",
      trend: "up",
    },
    {
      title: t("completedOrders"),
      value: reportData.completedOrders || 0,
      icon: TrendingUp,
      color: "green",
      change: "+8%",
      trend: "up",
    },
    {
      title: t("averagePreparationTime"),
      value: `${reportData.avgPrepTime || 0} ${t("minutes")}`,
      icon: Clock,
      color: "purple",
      change: reportData.avgPrepTime > 20 ? "+2 min" : "-1 min",
      trend: reportData.avgPrepTime > 20 ? "up" : "down",
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
      change: "+5%",
      trend: "up",
    },
  ];

  const exportReport = () => {
    const reportContent = {
      dateRange,
      generatedAt: new Date().toISOString(),
      stats: reportData,
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t("popularItems")}
          </h3>
          <div className="space-y-3">
            {reportData.popularItems?.map(([item, count], index) => (
              <div key={item} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white truncate max-w-32">
                    {item}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (count /
                            Math.max(
                              ...(reportData.popularItems?.map(
                                ([, c]) => c
                              ) || [1])
                            )) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {count}
                  </span>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("noDataAvailable")}
              </p>
            )}
          </div>
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
