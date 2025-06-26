import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
} from "lucide-react";

import StatsCard from "../../../components/Common/StatsCard";
import { formatCurrencyEnglish, formatNumberEnglish } from "../../../utils";

const SalesReports = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const [dateRange, setDateRange] = useState("today");

  // Mock sales data
  const salesData = {
    today: {
      revenue: 2450.75,
      orders: 23,
      products: 87,
      customers: 19,
      growth: 12.5,
    },
    week: {
      revenue: 15230.5,
      orders: 156,
      products: 542,
      customers: 98,
      growth: 8.3,
    },
    month: {
      revenue: 67890.25,
      orders: 678,
      products: 2134,
      customers: 234,
      growth: 15.7,
    },
  };

  const currentData = salesData[dateRange];

  // Top selling products
  const topProducts = [
    { name: "برجر لحم", sales: 145, revenue: 3625.0 },
    { name: "سلطة قيصر", sales: 98, revenue: 2450.0 },
    { name: "عصير برتقال", sales: 87, revenue: 1305.0 },
    { name: "بيتزا مارجريتا", sales: 76, revenue: 1900.0 },
    { name: "ساندويش دجاج", sales: 65, revenue: 1300.0 },
  ];

  // Sales by category
  const categorySales = [
    { category: "البرجر", percentage: 35, revenue: 8750.0 },
    { category: "السلطات", percentage: 22, revenue: 5500.0 },
    { category: "المشروبات", percentage: 18, revenue: 4500.0 },
    { category: "البيتزا", percentage: 15, revenue: 3750.0 },
    { category: "الساندويشات", percentage: 10, revenue: 2500.0 },
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <div
          className={`flex items-center justify-between ${
            isRTL ? "flex-row-reverse" : ""
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
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="today">{t("today")}</option>
              <option value="week">{t("thisWeek")}</option>
              <option value="month">{t("thisMonth")}</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
          <div
            className={`flex items-center gap-3 mb-6 ${
              isRTL ? "flex-row-reverse" : ""
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
                    isRTL ? "flex-row-reverse" : ""
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

        {/* Sales by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
          <div
            className={`flex items-center gap-3 mb-6 ${
              isRTL ? "flex-row-reverse" : ""
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
                    isRTL ? "flex-row-reverse" : ""
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
          <div
            className={`flex items-center gap-3 mb-4 ${
              isRTL ? "flex-row-reverse" : ""
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
                isRTL ? "flex-row-reverse" : ""
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
                isRTL ? "flex-row-reverse" : ""
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
                isRTL ? "flex-row-reverse" : ""
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
              isRTL ? "flex-row-reverse" : ""
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
                isRTL ? "flex-row-reverse" : ""
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
                isRTL ? "flex-row-reverse" : ""
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
                isRTL ? "flex-row-reverse" : ""
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
              isRTL ? "flex-row-reverse" : ""
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
                isRTL ? "flex-row-reverse" : ""
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
                isRTL ? "flex-row-reverse" : ""
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
                isRTL ? "flex-row-reverse" : ""
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
