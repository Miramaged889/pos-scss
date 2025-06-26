import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
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
} from "lucide-react";

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

const SalesReports = () => {
  const { t } = useTranslation();
  const { isRTL, theme } = useSelector((state) => state.language);
  const [dateRange, setDateRange] = useState("today");
  const [viewMode, setViewMode] = useState("charts"); // 'charts' or 'table'

  // Mock sales data with time series
  const salesData = {
    today: {
      revenue: 2450.75,
      orders: 23,
      products: 87,
      customers: 19,
      growth: 12.5,
      timeData: [
        { time: "09:00", revenue: 150, orders: 2 },
        { time: "10:00", revenue: 280, orders: 4 },
        { time: "11:00", revenue: 420, orders: 6 },
        { time: "12:00", revenue: 680, orders: 8 },
        { time: "13:00", revenue: 520, orders: 5 },
        { time: "14:00", revenue: 400, orders: 3 },
      ],
    },
    week: {
      revenue: 15230.5,
      orders: 156,
      products: 542,
      customers: 98,
      growth: 8.3,
      timeData: [
        { time: t("sunday"), revenue: 1850, orders: 18 },
        { time: t("monday"), revenue: 2150, orders: 22 },
        { time: t("tuesday"), revenue: 2450, orders: 25 },
        { time: t("wednesday"), revenue: 2200, orders: 21 },
        { time: t("thursday"), revenue: 2680, orders: 28 },
        { time: t("friday"), revenue: 2100, orders: 20 },
        { time: t("saturday"), revenue: 1800, orders: 22 },
      ],
    },
    month: {
      revenue: 67890.25,
      orders: 678,
      products: 2134,
      customers: 234,
      growth: 15.7,
      timeData: [
        { time: t("week") + " 1", revenue: 15230, orders: 156 },
        { time: t("week") + " 2", revenue: 17450, orders: 178 },
        { time: t("week") + " 3", revenue: 16890, orders: 165 },
        { time: t("week") + " 4", revenue: 18320, orders: 179 },
      ],
    },
  };

  const currentData = salesData[dateRange];

  // Top selling products with bilingual names
  const topProducts = [
    {
      name: isRTL ? "برجر لحم" : "Beef Burger",
      nameAr: "برجر لحم",
      nameEn: "Beef Burger",
      sales: 145,
      revenue: 3625.0,
    },
    {
      name: isRTL ? "سلطة قيصر" : "Caesar Salad",
      nameAr: "سلطة قيصر",
      nameEn: "Caesar Salad",
      sales: 98,
      revenue: 2450.0,
    },
    {
      name: isRTL ? "عصير برتقال" : "Orange Juice",
      nameAr: "عصير برتقال",
      nameEn: "Orange Juice",
      sales: 87,
      revenue: 1305.0,
    },
    {
      name: isRTL ? "بيتزا مارجريتا" : "Margherita Pizza",
      nameAr: "بيتزا مارجريتا",
      nameEn: "Margherita Pizza",
      sales: 76,
      revenue: 1900.0,
    },
    {
      name: isRTL ? "ساندويش دجاج" : "Chicken Sandwich",
      nameAr: "ساندويش دجاج",
      nameEn: "Chicken Sandwich",
      sales: 65,
      revenue: 1300.0,
    },
  ];

  // Sales by category with bilingual names
  const categorySales = [
    {
      category: isRTL ? "البرجر" : "Burgers",
      categoryAr: "البرجر",
      categoryEn: "Burgers",
      percentage: 35,
      revenue: 8750.0,
    },
    {
      category: isRTL ? "السلطات" : "Salads",
      categoryAr: "السلطات",
      categoryEn: "Salads",
      percentage: 22,
      revenue: 5500.0,
    },
    {
      category: isRTL ? "المشروبات" : "Beverages",
      categoryAr: "المشروبات",
      categoryEn: "Beverages",
      percentage: 18,
      revenue: 4500.0,
    },
    {
      category: isRTL ? "البيتزا" : "Pizza",
      categoryAr: "البيتزا",
      categoryEn: "Pizza",
      percentage: 15,
      revenue: 3750.0,
    },
    {
      category: isRTL ? "الساندويشات" : "Sandwiches",
      categoryAr: "الساندويشات",
      categoryEn: "Sandwiches",
      percentage: 10,
      revenue: 2500.0,
    },
  ];

  const stats = [
    {
      title: t("totalRevenue"),
      value: formatCurrencyEnglish(currentData.revenue, t("currency")),
      icon: DollarSign,
      color: "green",
      change: currentData.growth,
      changeText: t("fromLastPeriod"),
    },
    {
      title: t("totalOrders"),
      value: formatNumberEnglish(currentData.orders),
      icon: ShoppingCart,
      color: "blue",
      change: 8,
      changeText: t("fromLastPeriod"),
    },
    {
      title: t("productsSold"),
      value: formatNumberEnglish(currentData.products),
      icon: Package,
      color: "purple",
      change: 12,
      changeText: t("fromLastPeriod"),
    },
    {
      title: t("activeCustomers"),
      value: formatNumberEnglish(currentData.customers),
      icon: Users,
      color: "yellow",
      change: 5,
      changeText: t("fromLastPeriod"),
    },
  ];

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

  // Revenue Chart Data
  const revenueChartData = {
    labels: currentData.timeData.map((item) => item.time),
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
  };

  // Orders Chart Data
  const ordersChartData = {
    labels: currentData.timeData.map((item) => item.time),
    datasets: [
      {
        label: t("orderCount"),
        data: currentData.timeData.map((item) => item.orders),
        backgroundColor: chartColors.secondary,
        borderColor: chartColors.secondary,
        borderWidth: 1,
      },
    ],
  };

  // Category Distribution Chart Data
  const categoryChartData = {
    labels: categorySales.map((item) => item.category),
    datasets: [
      {
        label: t("revenue"),
        data: categorySales.map((item) => item.revenue),
        backgroundColor: [
          chartColors.primary,
          chartColors.secondary,
          chartColors.tertiary,
          chartColors.quaternary,
          chartColors.quinary,
        ],
        borderWidth: 2,
        borderColor: isDark ? "#374151" : "#ffffff",
      },
    ],
  };

  const handleExportReport = () => {
    // Mock export functionality
    const reportData = {
      dateRange,
      stats: currentData,
      topProducts,
      categorySales,
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `sales-report-${dateRange}-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

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
              {t("salesReports")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("viewSalesAnalytics")}
            </p>
          </div>
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row" : ""
            }`}
          >
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
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="today">{t("today")}</option>
              <option value="week">{t("thisWeek")}</option>
              <option value="month">{t("thisMonth")}</option>
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
            {/* Revenue Trend Chart */}
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
                  {t("revenueChart")}
                </h3>
              </div>
              <div className="h-80">
                <Line data={revenueChartData} options={chartOptions} />
              </div>
            </div>

            {/* Orders Chart */}
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
                  {t("ordersChart")}
                </h3>
              </div>
              <div className="h-80">
                <Bar data={ordersChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
              <div
                className={`flex items-center gap-3 mb-6 ${
                    isRTL ? "flex-row" : ""
                }`}
              >
                <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("categoryDistribution")}
                </h3>
              </div>
              <div className="h-80">
                <Doughnut
                  data={categoryChartData}
                  options={{
                    ...chartOptions,
                    scales: undefined,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        position: "bottom",
                        labels: {
                          color: chartColors.text,
                          font: {
                            family: isRTL
                              ? "Arial, sans-serif"
                              : "Inter, system-ui, sans-serif",
                          },
                          padding: 20,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Top Products Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
              <div
                className={`flex items-center gap-3 mb-6 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("topProductsChart")}
                </h3>
              </div>
              <div className="h-80">
                <Bar
                  data={{
                    labels: topProducts.map((product) => product.name),
                    datasets: [
                      {
                        label: t("sales"),
                        data: topProducts.map((product) => product.sales),
                        backgroundColor: chartColors.tertiary,
                        borderColor: chartColors.tertiary,
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    ...chartOptions,
                    indexAxis: isRTL ? "y" : "x",
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Table View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
              <div
                className={`flex items-center gap-3 mb-6 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("topSellingProducts")}
                </h3>
              </div>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-200 dark:border-gray-600"
                  >
                    <div
                      className={`flex items-center gap-3 ${
                        isRTL ? "flex-row" : ""
                      }`}
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {formatNumberEnglish(index + 1)}
                        </span>
                      </div>
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatNumberEnglish(product.sales)} {t("unitsSold")}
                        </div>
                      </div>
                    </div>
                    <div className={isRTL ? "text-left" : "text-right"}>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrencyEnglish(product.revenue, t("currency"))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales by Category Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
              <div
                className={`flex items-center gap-3 mb-6 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("salesByCategory")}
                </h3>
              </div>
              <div className="space-y-4">
                {categorySales.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className={`flex items-center justify-between ${
                        isRTL ? "flex-row" : ""
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatNumberEnglish(category.percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <div className={isRTL ? "text-left" : "text-right"}>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrencyEnglish(category.revenue, t("currency"))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
          <div
            className={`flex items-center gap-3 mb-4 ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("periodSummary")}
            </h3>
          </div>
          <div className="space-y-3">
            <div
              className={`flex justify-between ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("startDate")}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {dateRange === "today"
                  ? t("today")
                  : dateRange === "week"
                  ? t("sevenDaysAgo")
                  : t("thirtyDaysAgo")}
              </span>
            </div>
            <div
              className={`flex justify-between ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("endDate")}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t("today")}
              </span>
            </div>
            <div
              className={`flex justify-between ${
                  isRTL ? "flex-row" : ""
              }`}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("averageOrderValue")}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrencyEnglish(
                  currentData.revenue / currentData.orders,
                  t("currency")
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
          <div
            className={`flex items-center gap-3 mb-4 ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("performance")}
            </h3>
          </div>
          <div className="space-y-3">
            <div
              className={`flex justify-between ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("growthRate")}
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +{formatNumberEnglish(currentData.growth)}%
              </span>
            </div>
            <div
              className={`flex justify-between ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("conversionRate")}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatNumberEnglish(68)}%
              </span>
            </div>
            <div
              className={`flex justify-between ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("repeatCustomers")}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatNumberEnglish(45)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
          <div
            className={`flex items-center gap-3 mb-4 ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("productInsights")}
            </h3>
          </div>
          <div className="space-y-3">
            <div
              className={`flex justify-between ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("totalProducts")}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatNumberEnglish(156)}
              </span>
            </div>
            <div
              className={`flex justify-between ${
                  isRTL ? "flex-row" : ""
              }`}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("activeSelling")}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatNumberEnglish(89)}
              </span>
            </div>
            <div
              className={`flex justify-between ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("outOfStock")}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatNumberEnglish(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;
