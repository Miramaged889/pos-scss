import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  fetchFinancialReports,
  clearManagerError,
} from "../../../store/slices/managerSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  LineChart,
  PieChart,
  Eye,
  Table,
  ChefHat,
  Truck,
} from "lucide-react";
import { toast } from "react-hot-toast";

import StatsCard from "../../../components/Common/StatsCard";
import { formatCurrencyEnglish, formatNumberEnglish } from "../../../utils";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ManagerReports = () => {
  const { t } = useTranslation();
  const { isRTL, theme } = useSelector((state) => state.language);
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector((state) => state.manager);

  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateRange, setDateRange] = useState("month");
  const [viewMode, setViewMode] = useState("charts");

  // Load reports data on component mount
  useEffect(() => {
    dispatch(fetchFinancialReports({ reportType: selectedReport, dateRange }));
  }, [dispatch, selectedReport, dateRange]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearManagerError());
    };
  }, [dispatch]);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      console.error("Error:", error);
      toast.error(error);
    }
  }, [error]);

  // Get current report data from Redux store
  const currentData = reports[selectedReport] || {
    // Default fallback data structure
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    activeSellers: 0,
    growth: 0,
    timeData: [],
    topSellers: [],
    totalDeliveries: 0,
    completedDeliveries: 0,
    avgDeliveryTime: 0,
    satisfaction: 0,
    totalSellers: 0,
    completed: 0,
    pending: 0,
    processing: 0,
    cancelled: 0,
    orderStatus: [],
    sellerPerformance: [],
    kitchenPerformance: [],
    deliveryPerformance: [],
  };

  // Chart configuration
  const isDark = theme === "dark";
  const chartColors = {
    primary: isDark ? "#3b82f6" : "#2563eb",
    secondary: isDark ? "#10b981" : "#059669",
    tertiary: isDark ? "#f59e0b" : "#d97706",
    quaternary: isDark ? "#ef4444" : "#dc2626",
    quinary: isDark ? "#8b5cf6" : "#7c3aed",
    text: isDark ? "#f1f5f9" : "#0f172a",
    grid: isDark ? "#374151" : "#e5e7eb",
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: chartColors.text,
          font: {
            family: isRTL
              ? "Arial, sans-serif"
              : "Inter, system-ui, sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        titleColor: chartColors.text,
        bodyColor: chartColors.text,
        borderColor: chartColors.grid,
        borderWidth: 1,
        rtl: isRTL,
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartColors.text,
          font: {
            family: isRTL
              ? "Arial, sans-serif"
              : "Inter, system-ui, sans-serif",
          },
        },
        grid: {
          color: chartColors.grid,
        },
      },
      y: {
        ticks: {
          color: chartColors.text,
          font: {
            family: isRTL
              ? "Arial, sans-serif"
              : "Inter, system-ui, sans-serif",
          },
        },
        grid: {
          color: chartColors.grid,
        },
      },
    },
  };

  const getStats = () => {
    switch (selectedReport) {
      case "sales":
        return [
          {
            title: t("totalRevenue"),
            value: formatCurrencyEnglish(
              currentData.totalRevenue,
              t("currency")
            ),
            icon: DollarSign,
            color: "green",
            change: currentData.growth,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("totalOrders"),
            value: formatNumberEnglish(currentData.totalOrders),
            icon: ShoppingCart,
            color: "blue",
            change: 8.3,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("avgOrderValue"),
            value: formatCurrencyEnglish(
              currentData.avgOrderValue,
              t("currency")
            ),
            icon: BarChart3,
            color: "purple",
            change: 3.8,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("activeSellers"),
            value: formatNumberEnglish(currentData.activeSellers),
            icon: Users,
            color: "orange",
            change: 2,
            changeText: t("fromLastMonth"),
          },
        ];
      case "orders":
        return [
          {
            title: t("totalOrders"),
            value: formatNumberEnglish(currentData.totalOrders),
            icon: ShoppingCart,
            color: "blue",
            change: 12.5,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("completed"),
            value: formatNumberEnglish(currentData.completed),
            icon: Package,
            color: "green",
            change: 8.3,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("pending"),
            value: formatNumberEnglish(currentData.pending),
            icon: Calendar,
            color: "yellow",
            change: -5.2,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("processing"),
            value: formatNumberEnglish(currentData.processing),
            icon: TrendingUp,
            color: "purple",
            change: 15.7,
            changeText: t("fromLastMonth"),
          },
        ];
      case "sellers":
        return [
          {
            title: t("totalSellers"),
            value: formatNumberEnglish(currentData.totalSellers),
            icon: Users,
            color: "blue",
            change: 15.6,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("activeSellers"),
            value: formatNumberEnglish(currentData.activeSellers),
            icon: TrendingUp,
            color: "green",
            change: 8.3,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("newSellers"),
            value: formatNumberEnglish(currentData.newSellers),
            icon: Users,
            color: "orange",
            change: 25.0,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("avgPerformance"),
            value: formatNumberEnglish(currentData.avgPerformance) + "%",
            icon: BarChart3,
            color: "purple",
            change: 2.1,
            changeText: t("fromLastMonth"),
          },
        ];
      case "kitchen":
        return [
          {
            title: t("totalOrders"),
            value: formatNumberEnglish(currentData.totalOrders),
            icon: Package,
            color: "blue",
            change: 12.5,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("completedOrders"),
            value: formatNumberEnglish(currentData.completedOrders),
            icon: TrendingUp,
            color: "green",
            change: 8.3,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("avgPrepTime"),
            value: formatNumberEnglish(currentData.avgPrepTime) + " min",
            icon: Calendar,
            color: "orange",
            change: -5.2,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("efficiency"),
            value: formatNumberEnglish(currentData.efficiency) + "%",
            icon: BarChart3,
            color: "purple",
            change: 2.1,
            changeText: t("fromLastMonth"),
          },
        ];
      case "delivery":
        return [
          {
            title: t("totalDeliveries"),
            value: formatNumberEnglish(currentData.totalDeliveries),
            icon: Truck,
            color: "blue",
            change: 12.5,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("completedDeliveries"),
            value: formatNumberEnglish(currentData.completedDeliveries),
            icon: TrendingUp,
            color: "green",
            change: 8.3,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("avgDeliveryTime"),
            value: formatNumberEnglish(currentData.avgDeliveryTime) + " min",
            icon: Calendar,
            color: "orange",
            change: -5.2,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("satisfaction"),
            value: formatNumberEnglish(currentData.satisfaction) + "%",
            icon: BarChart3,
            color: "purple",
            change: 2.1,
            changeText: t("fromLastMonth"),
          },
        ];
      default:
        return [];
    }
  };

  const getChartData = () => {
    const labels = currentData.timeData.map((item) => item.month);

    switch (selectedReport) {
      case "sales":
        return {
          revenue: {
            labels,
            datasets: [
              {
                label: t("revenue"),
                data: currentData.timeData.map((item) => item.revenue),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primary + "20",
                fill: true,
                tension: 0.4,
              },
            ],
          },
          orders: {
            labels,
            datasets: [
              {
                label: t("orders"),
                data: currentData.timeData.map((item) => item.orders),
                backgroundColor: chartColors.secondary,
                borderColor: chartColors.secondary,
                borderWidth: 1,
              },
            ],
          },
        };
      case "orders":
        return {
          status: {
            labels,
            datasets: [
              {
                label: t("completed"),
                data: currentData.timeData.map((item) => item.completed),
                backgroundColor: chartColors.secondary,
                borderColor: chartColors.secondary,
                borderWidth: 1,
              },
              {
                label: t("pending"),
                data: currentData.timeData.map((item) => item.pending),
                backgroundColor: chartColors.tertiary,
                borderColor: chartColors.tertiary,
                borderWidth: 1,
              },
              {
                label: t("processing"),
                data: currentData.timeData.map((item) => item.processing),
                backgroundColor: chartColors.primary,
                borderColor: chartColors.primary,
                borderWidth: 1,
              },
            ],
          },
        };
      case "sellers":
        return {
          performance: {
            labels,
            datasets: [
              {
                label: t("activeSellers"),
                data: currentData.timeData.map((item) => item.active),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primary + "20",
                fill: true,
                tension: 0.4,
              },
              {
                label: t("newSellers"),
                data: currentData.timeData.map((item) => item.new),
                backgroundColor: chartColors.secondary,
                borderColor: chartColors.secondary,
                borderWidth: 1,
              },
            ],
          },
        };
      case "kitchen":
        return {
          efficiency: {
            labels,
            datasets: [
              {
                label: t("completedOrders"),
                data: currentData.timeData.map((item) => item.completed),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primary + "20",
                fill: true,
                tension: 0.4,
              },
              {
                label: t("avgPrepTime"),
                data: currentData.timeData.map((item) => item.avgTime),
                backgroundColor: chartColors.tertiary,
                borderColor: chartColors.tertiary,
                borderWidth: 1,
              },
            ],
          },
        };
      case "delivery":
        return {
          delivery: {
            labels,
            datasets: [
              {
                label: t("completedDeliveries"),
                data: currentData.timeData.map((item) => item.completed),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primary + "20",
                fill: true,
                tension: 0.4,
              },
              {
                label: t("avgDeliveryTime"),
                data: currentData.timeData.map((item) => item.avgTime),
                backgroundColor: chartColors.tertiary,
                borderColor: chartColors.tertiary,
                borderWidth: 1,
              },
            ],
          },
        };
      default:
        return {};
    }
  };

  const handleExportReport = async () => {
    try {
      const reportData = {
        reportType: selectedReport,
        dateRange,
        data: currentData,
        timestamp: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `${selectedReport}-report-${
        new Date().toISOString().split("T")[0]
      }.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      toast.success(t("reportExportedSuccessfully"));
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error(t("exportFailed"));
    }
  };

  const chartData = getChartData();
  const stats = getStats();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <div
          className={`flex items-center justify-between ${
            isRTL ? "flex-row" : ""
          }`}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("reports")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("viewAndAnalyzeData")}
            </p>
          </div>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("charts")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  viewMode === "charts"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                {t("chartView")}
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  viewMode === "table"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Table className="w-4 h-4" />
                {t("tableView")}
              </button>
            </div>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="sales">{t("salesReport")}</option>
              <option value="orders">{t("ordersReport")}</option>
              <option value="sellers">{t("sellersReport")}</option>
              <option value="kitchen">{t("kitchenReport")}</option>
              <option value="delivery">{t("deliveryReport")}</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="week">{t("thisWeek")}</option>
              <option value="month">{t("thisMonth")}</option>
              <option value="quarter">{t("thisQuarter")}</option>
            </select>
            <button
              onClick={handleExportReport}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md"
            >
              <Download className="w-4 h-4" />
              {t("exportReport")}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {viewMode === "charts" ? (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
              <div
                className={`flex items-center gap-3 mb-6 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <LineChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {selectedReport === "sales" && t("revenueChart")}
                  {selectedReport === "orders" && t("orderStatusChart")}
                  {selectedReport === "sellers" && t("sellerPerformanceChart")}
                  {selectedReport === "kitchen" && t("kitchenEfficiencyChart")}
                  {selectedReport === "delivery" &&
                    t("deliveryPerformanceChart")}
                </h3>
              </div>
              <div className="h-80">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="ml-2 text-gray-600 dark:text-gray-400">
                      {t("loading")}...
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedReport === "sales" && (
                      <Line data={chartData.revenue} options={chartOptions} />
                    )}
                    {selectedReport === "orders" && (
                      <Bar data={chartData.status} options={chartOptions} />
                    )}
                    {selectedReport === "sellers" && (
                      <Line
                        data={chartData.performance}
                        options={chartOptions}
                      />
                    )}
                    {selectedReport === "kitchen" && (
                      <Line
                        data={chartData.efficiency}
                        options={chartOptions}
                      />
                    )}
                    {selectedReport === "delivery" && (
                      <Line data={chartData.delivery} options={chartOptions} />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Secondary Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
              <div
                className={`flex items-center gap-3 mb-6 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {selectedReport === "sales" && t("ordersChart")}
                  {selectedReport === "orders" && t("orderTrendsChart")}
                  {selectedReport === "sellers" && t("sellerGrowthChart")}
                  {selectedReport === "kitchen" && t("kitchenTrendsChart")}
                  {selectedReport === "delivery" && t("deliveryTrendsChart")}
                </h3>
              </div>
              <div className="h-80">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="ml-2 text-gray-600 dark:text-gray-400">
                      {t("loading")}...
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedReport === "sales" && (
                      <Bar data={chartData.orders} options={chartOptions} />
                    )}
                    {selectedReport === "orders" && (
                      <Line data={chartData.status} options={chartOptions} />
                    )}
                    {selectedReport === "sellers" && (
                      <Bar
                        data={chartData.performance}
                        options={chartOptions}
                      />
                    )}
                    {selectedReport === "kitchen" && (
                      <Bar data={chartData.efficiency} options={chartOptions} />
                    )}
                    {selectedReport === "delivery" && (
                      <Bar data={chartData.delivery} options={chartOptions} />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Table View */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
            <div
              className={`flex items-center gap-3 mb-6 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <Table className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3
                className={`text-lg font-medium text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {selectedReport === "sales" && t("topSellersTable")}
                {selectedReport === "orders" && t("orderStatusTable")}
                {selectedReport === "sellers" && t("sellerPerformanceTable")}
                {selectedReport === "kitchen" && t("kitchenPerformanceTable")}
                {selectedReport === "delivery" && t("deliveryPerformanceTable")}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {selectedReport === "sales" && (
                      <>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("seller")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("revenue")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("orders")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("growth")}
                        </th>
                      </>
                    )}
                    {selectedReport === "orders" && (
                      <>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("status")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("count")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("percentage")}
                        </th>
                      </>
                    )}
                    {selectedReport === "sellers" && (
                      <>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("seller")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("sales")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("orders")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("rating")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("growth")}
                        </th>
                      </>
                    )}
                    {selectedReport === "kitchen" && (
                      <>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("staff")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("orders")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("avgTime")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("rating")}
                        </th>
                      </>
                    )}
                    {selectedReport === "delivery" && (
                      <>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("driver")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("deliveries")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("avgTime")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("rating")}
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedReport === "sales" &&
                    currentData.topSellers.map((seller, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {seller.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrencyEnglish(
                              seller.revenue,
                              t("currency")
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumberEnglish(seller.orders)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span
                              className={`text-sm font-medium ${
                                seller.growth > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {seller.growth > 0 ? "+" : ""}
                              {seller.growth}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {selectedReport === "orders" &&
                    currentData.orderStatus.map((status, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {t(status.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumberEnglish(status.count)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumberEnglish(status.percentage)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  {selectedReport === "sellers" &&
                    currentData.sellerPerformance.map((seller, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {seller.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrencyEnglish(seller.sales, t("currency"))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumberEnglish(seller.orders)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            ⭐ {seller.rating}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span
                              className={`text-sm font-medium ${
                                seller.growth > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {seller.growth > 0 ? "+" : ""}
                              {seller.growth}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {selectedReport === "kitchen" &&
                    currentData.kitchenPerformance.map((staff, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {staff.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumberEnglish(staff.orders)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumberEnglish(staff.avgTime)} min
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            ⭐ {staff.rating}
                          </div>
                        </td>
                      </tr>
                    ))}
                  {selectedReport === "delivery" &&
                    currentData.deliveryPerformance.map((driver, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {driver.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumberEnglish(driver.deliveries)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumberEnglish(driver.avgTime)} min
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            ⭐ {driver.rating}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerReports;
