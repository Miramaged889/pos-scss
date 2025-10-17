import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingDown,
  Award,
  Target,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import StatsCard from "../../../components/Common/StatsCard";
import { fetchOrders } from "../../../store/slices/ordersSlice";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DeliveryReports = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state) => state.language);
  const { orders } = useSelector((state) => state.orders);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState("today");

  // Helper function to filter orders by date range
  const filterOrdersByDateRange = (orders, range) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case "today": {
        return orders.filter((order) => {
          const orderDate = new Date(order.date || order.createdAt);
          const orderDay = new Date(
            orderDate.getFullYear(),
            orderDate.getMonth(),
            orderDate.getDate()
          );
          return orderDay.getTime() === today.getTime();
        });
      }

      case "week": {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // End of current week (Saturday)
        weekEnd.setHours(23, 59, 59, 999);

        return orders.filter((order) => {
          const orderDate = new Date(order.date || order.createdAt);
          return orderDate >= weekStart && orderDate <= weekEnd;
        });
      }

      case "month": {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        return orders.filter((order) => {
          const orderDate = new Date(order.date || order.createdAt);
          return orderDate >= monthStart && orderDate <= monthEnd;
        });
      }

      default:
        return orders;
    }
  };

  // Load orders from API
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Calculate stats from orders data
  useEffect(() => {
    if (orders.length > 0) {
      // Filter orders by selected date range
      const filteredOrders = filterOrdersByDateRange(orders, dateRange);

      // Get completed deliveries from filtered orders - only delivery orders
      const completedDeliveries = filteredOrders.filter(
        (order) =>
          order.delivery_option === "delivery" &&
          (order.status === "completed" ||
            order.status === "delivered" ||
            order.isDelivered)
      );

      // Only calculate earnings from filtered delivery orders
      const deliveryOrders = filteredOrders.filter(
        (order) => order.delivery_option === "delivery"
      );
      const totalEarnings = deliveryOrders.reduce(
        (sum, order) => sum + (order.total_amount || order.total || 0),
        0
      );

      const deliveryTimes = completedDeliveries.map(
        (order) => order.deliveryTime || 0
      );

      const avgDeliveryTime = deliveryTimes.length
        ? deliveryTimes.reduce((sum, time) => sum + time, 0) /
          deliveryTimes.length
        : 0;

      const onTimeDeliveries = completedDeliveries.filter(
        (order) => !order.isDelayed
      ).length;

      const onTimeRate = completedDeliveries.length
        ? (onTimeDeliveries / completedDeliveries.length) * 100
        : 100;

      const overallStats = {
        totalDeliveries: completedDeliveries.length,
        totalEarnings,
        averageDeliveryTime: Math.round(avgDeliveryTime),
        onTimeRate,
      };

      setStats(overallStats);
    }
  }, [orders, dateRange]);

  // Prepare stats cards data with null check
  const statsCards = (() => {
    const defaultStats = {
      totalDeliveries: 0,
      totalEarnings: 0,
      averageDeliveryTime: 0,
      onTimeRate: 100,
    };

    const currentStats = stats || defaultStats;

    return [
      {
        title: t("totalDeliveries"),
        value: currentStats.totalDeliveries,
        icon: TrendingUp,
        color: "blue",
        trend: "+12%",
        trendDirection: "up",
      },
      {
        title: t("earnings"),
        value: `${(currentStats.totalEarnings || 0).toFixed(2)} ${t(
          "currency"
        )}`,
        icon: DollarSign,
        color: "green",
        trend: "+8%",
        trendDirection: "up",
      },
      {
        title: t("avgDeliveryTime"),
        value: `${currentStats.averageDeliveryTime} ${t("minutes")}`,
        icon: Clock,
        color: "yellow",
        trend: "-5%",
        trendDirection: "down",
      },
      {
        title: t("onTimeRate"),
        value: `${(currentStats.onTimeRate || 0).toFixed(1)}%`,
        icon: CheckCircle,
        color: "purple",
        trend: "+3%",
        trendDirection: "up",
      },
    ];
  })();

  // Prepare data for charts
  const prepareDeliveryTrendData = () => {
    const now = new Date();

    // Determine array size based on date range
    let periodDays = 7; // Default to 7 days
    if (dateRange === "today") {
      periodDays = 1;
    } else if (dateRange === "week") {
      periodDays = 7;
    } else if (dateRange === "month") {
      periodDays = 30;
    }

    const data = new Array(periodDays).fill(0);
    const labels = [];

    // Filter orders by selected date range first
    const filteredOrders = filterOrdersByDateRange(orders, dateRange);

    // Get completed deliveries from filtered orders - only delivery orders
    const completedDeliveries = filteredOrders.filter(
      (order) =>
        order.delivery_option === "delivery" &&
        (order.status === "completed" ||
          order.status === "delivered" ||
          order.isDelivered)
    );

    // Calculate previous period data for trend based on date range
    let previousPeriodDeliveries = 0;
    if (dateRange === "today") {
      // Compare with yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      previousPeriodDeliveries = orders.filter((order) => {
        const orderDate = new Date(order.date || order.createdAt);
        const orderDay = new Date(
          orderDate.getFullYear(),
          orderDate.getMonth(),
          orderDate.getDate()
        );
        const yesterdayDay = new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate()
        );
        return (
          orderDay.getTime() === yesterdayDay.getTime() &&
          order.delivery_option === "delivery" &&
          (order.status === "completed" ||
            order.status === "delivered" ||
            order.isDelivered)
        );
      }).length;
    } else if (dateRange === "week") {
      // Compare with previous week
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - 7); // Start of previous week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      previousPeriodDeliveries = orders.filter((order) => {
        const orderDate = new Date(order.date || order.createdAt);
        return (
          orderDate >= weekStart &&
          orderDate <= weekEnd &&
          order.delivery_option === "delivery" &&
          (order.status === "completed" ||
            order.status === "delivered" ||
            order.isDelivered)
        );
      }).length;
    } else if (dateRange === "month") {
      // Compare with previous month
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      prevMonthEnd.setHours(23, 59, 59, 999);

      previousPeriodDeliveries = orders.filter((order) => {
        const orderDate = new Date(order.date || order.createdAt);
        return (
          orderDate >= prevMonthStart &&
          orderDate <= prevMonthEnd &&
          order.delivery_option === "delivery" &&
          (order.status === "completed" ||
            order.status === "delivered" ||
            order.isDelivered)
        );
      }).length;
    }

    // Calculate current period data
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      if (dateRange === "today") {
        labels.push(
          date.toLocaleDateString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } else if (dateRange === "week") {
        labels.push(date.toLocaleDateString(undefined, { weekday: "short" }));
      } else {
        labels.push(
          date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        );
      }

      const dayDeliveries = completedDeliveries.filter((order) => {
        const orderDate = new Date(order.date || order.createdAt);
        if (dateRange === "today") {
          return (
            orderDate.getDate() === date.getDate() &&
            orderDate.getMonth() === date.getMonth() &&
            orderDate.getFullYear() === date.getFullYear()
          );
        } else {
          return orderDate.toDateString() === date.toDateString();
        }
      });

      data[periodDays - 1 - i] = dayDeliveries.length;
    }

    const currentPeriodDeliveries = data.reduce((sum, count) => sum + count, 0);
    const deliveryTrend = previousPeriodDeliveries
      ? ((currentPeriodDeliveries - previousPeriodDeliveries) /
          previousPeriodDeliveries) *
        100
      : 0;

    return { labels, data, trend: (deliveryTrend || 0).toFixed(1) };
  };

  const prepareEarningsTrendData = () => {
    const now = new Date();

    // Determine array size based on date range
    let periodDays = 7; // Default to 7 days
    if (dateRange === "today") {
      periodDays = 1;
    } else if (dateRange === "week") {
      periodDays = 7;
    } else if (dateRange === "month") {
      periodDays = 30;
    }

    const data = new Array(periodDays).fill(0);
    const labels = [];

    // Filter orders by selected date range first
    const filteredOrders = filterOrdersByDateRange(orders, dateRange);

    // Get completed delivery orders for earnings calculation
    const completedOrders = filteredOrders.filter(
      (order) =>
        order.delivery_option === "delivery" &&
        (order.status === "completed" || order.isPaid)
    );

    // Calculate previous period earnings for trend based on date range
    let previousPeriodEarnings = 0;
    if (dateRange === "today") {
      // Compare with yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      previousPeriodEarnings = orders
        .filter((order) => {
          const orderDate = new Date(order.date || order.createdAt);
          const orderDay = new Date(
            orderDate.getFullYear(),
            orderDate.getMonth(),
            orderDate.getDate()
          );
          const yesterdayDay = new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate()
          );
          return (
            orderDay.getTime() === yesterdayDay.getTime() &&
            order.delivery_option === "delivery" &&
            (order.status === "completed" || order.isPaid)
          );
        })
        .reduce(
          (sum, order) => sum + (order.total_amount || order.total || 0) * 0.1,
          0
        );
    } else if (dateRange === "week") {
      // Compare with previous week
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      previousPeriodEarnings = orders
        .filter((order) => {
          const orderDate = new Date(order.date || order.createdAt);
          return (
            orderDate >= weekStart &&
            orderDate <= weekEnd &&
            order.delivery_option === "delivery" &&
            (order.status === "completed" || order.isPaid)
          );
        })
        .reduce(
          (sum, order) => sum + (order.total_amount || order.total || 0) * 0.1,
          0
        );
    } else if (dateRange === "month") {
      // Compare with previous month
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      prevMonthEnd.setHours(23, 59, 59, 999);

      previousPeriodEarnings = orders
        .filter((order) => {
          const orderDate = new Date(order.date || order.createdAt);
          return (
            orderDate >= prevMonthStart &&
            orderDate <= prevMonthEnd &&
            order.delivery_option === "delivery" &&
            (order.status === "completed" || order.isPaid)
          );
        })
        .reduce(
          (sum, order) => sum + (order.total_amount || order.total || 0) * 0.1,
          0
        );
    }

    // Calculate current period data
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      if (dateRange === "today") {
        labels.push(
          date.toLocaleDateString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } else if (dateRange === "week") {
        labels.push(date.toLocaleDateString(undefined, { weekday: "short" }));
      } else {
        labels.push(
          date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        );
      }

      const dayOrders = completedOrders.filter((order) => {
        const orderDate = new Date(order.date || order.createdAt);
        if (dateRange === "today") {
          return (
            orderDate.getDate() === date.getDate() &&
            orderDate.getMonth() === date.getMonth() &&
            orderDate.getFullYear() === date.getFullYear()
          );
        } else {
          return orderDate.toDateString() === date.toDateString();
        }
      });

      data[periodDays - 1 - i] = dayOrders.reduce(
        (sum, order) => sum + (order.total_amount || order.total || 0) * 0.1,
        0
      );
    }

    const currentPeriodEarnings = data.reduce((sum, amount) => sum + amount, 0);
    const earningsTrend = previousPeriodEarnings
      ? ((currentPeriodEarnings - previousPeriodEarnings) /
          previousPeriodEarnings) *
        100
      : 0;

    return { labels, data, trend: (earningsTrend || 0).toFixed(1) };
  };

  const prepareOrderStatusData = () => {
    // Filter orders by selected date range first
    const filteredOrders = filterOrdersByDateRange(orders, dateRange);

    const statusCounts = {
      ready: filteredOrders.filter(
        (order) => order.delivery_option === "delivery" && !order.deliveryStatus
      ).length,
      delivering: filteredOrders.filter(
        (order) =>
          order.delivery_option === "delivery" &&
          order.deliveryStatus === "delivering"
      ).length,
      completed: filteredOrders.filter(
        (order) =>
          order.delivery_option === "delivery" &&
          order.deliveryStatus === "delivered"
      ).length,
    };

    return {
      labels: [t("ready"), t("delivering"), t("completed")],
      data: Object.values(statusCounts),
    };
  };

  const deliveryTrendData = prepareDeliveryTrendData();
  const earningsTrendData = prepareEarningsTrendData();
  const orderStatusData = prepareOrderStatusData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1
              className={`text-2xl font-bold text-gray-900 dark:text-white mb-2 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("deliveryReports")}
            </h1>
            <p
              className={`text-gray-600 dark:text-gray-400 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("viewDeliveryPerformance")}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 font-medium"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <option value="today">{t("today")}</option>
              <option value="week">{t("thisWeek")}</option>
              <option value="month">{t("thisMonth")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("deliveryTrend")}
            </h3>
            <div
              className={`flex items-center gap-2 text-sm ${
                parseFloat(deliveryTrendData.trend) >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {parseFloat(deliveryTrendData.trend) >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{deliveryTrendData.trend}%</span>
            </div>
          </div>
          <div className="h-80">
            <Line
              data={{
                labels: deliveryTrendData.labels,
                datasets: [
                  {
                    label: t("deliveries"),
                    data: deliveryTrendData.data,
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Earnings Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("earningsTrend")}
            </h3>
            <div
              className={`flex items-center gap-2 text-sm ${
                parseFloat(earningsTrendData.trend) >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {parseFloat(earningsTrendData.trend) >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{earningsTrendData.trend}%</span>
            </div>
          </div>
          <div className="h-80">
            <Bar
              data={{
                labels: earningsTrendData.labels,
                datasets: [
                  {
                    label: t("earnings"),
                    data: earningsTrendData.data,
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    borderColor: "rgb(34, 197, 94)",
                    borderWidth: 2,
                    borderRadius: 4,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("orderStatusDistribution")}
            </h3>
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <Target className="w-4 h-4" />
              <span>{t("current")}</span>
            </div>
          </div>
          <div className="h-80">
            <Doughnut
              data={{
                labels: orderStatusData.labels,
                datasets: [
                  {
                    data: orderStatusData.data,
                    backgroundColor: [
                      "rgba(234, 179, 8, 0.8)",
                      "rgba(59, 130, 246, 0.8)",
                      "rgba(34, 197, 94, 0.8)",
                    ],
                    borderColor: [
                      "rgb(234, 179, 8)",
                      "rgb(59, 130, 246)",
                      "rgb(34, 197, 94)",
                    ],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      padding: 20,
                      font: {
                        size: 12,
                      },
                    },
                  },
                },
                cutout: "70%",
              }}
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("deliveryMetrics")}
            </h3>
            <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
              <Award className="w-4 h-4" />
              <span>{t("topPerformer")}</span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">
                    {t("delayedDeliveries")}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t("thisWeek")}
                  </span>
                </div>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {(() => {
                  const filteredOrders = filterOrdersByDateRange(
                    orders,
                    dateRange
                  );
                  const completedDeliveries = filteredOrders.filter(
                    (order) =>
                      order.delivery_option === "delivery" &&
                      (order.status === "completed" ||
                        order.status === "delivered" ||
                        order.isDelivered)
                  );
                  return completedDeliveries.length > 0
                    ? (
                        (completedDeliveries.filter((order) => order.isDelayed)
                          .length /
                          completedDeliveries.length) *
                        100
                      ).toFixed(1)
                    : "0";
                })()}
                %
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">
                    {t("avgResponseTime")}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t("today")}
                  </span>
                </div>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.averageDeliveryTime || 0} {t("minutes")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryReports;
