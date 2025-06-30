import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  Filter,
  Search,
  Calendar,
  ChevronDown,
  RefreshCw,
  Download,
} from "lucide-react";
import { getOrders } from "../../../utils/localStorage";
import OrderCard from "./OrderCard";

const AllOrders = () => {
  const { t } = useTranslation();
  const { theme } = useSelector((state) => state.language);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const loadOrders = useCallback(() => {
    const allOrders = getOrders();
    setOrders(allOrders);
    applyFilters(allOrders, searchTerm, statusFilter, dateRange, sortBy);
  }, [searchTerm, statusFilter, dateRange, sortBy]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const applyFilters = (ordersList, search, status, date, sort) => {
    let filtered = [...ordersList];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (order) =>
          order.id?.toLowerCase().includes(search.toLowerCase()) ||
          order.customer?.toLowerCase().includes(search.toLowerCase()) ||
          order.products?.some((product) =>
            product.name.toLowerCase().includes(search.toLowerCase())
          )
      );
    }

    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter((order) => order.status === status);
    }

    // Apply date filter
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    switch (date) {
      case "today":
        filtered = filtered.filter(
          (order) =>
            new Date(order.createdAt).toDateString() === now.toDateString()
        );
        break;
      case "week":
        filtered = filtered.filter(
          (order) => new Date(order.createdAt) >= weekAgo
        );
        break;
      case "month":
        filtered = filtered.filter(
          (order) => new Date(order.createdAt) >= monthAgo
        );
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sort) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "highestValue":
        filtered.sort((a, b) => b.total - a.total);
        break;
      case "lowestValue":
        filtered.sort((a, b) => a.total - b.total);
        break;
      default:
        break;
    }

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    applyFilters(orders, searchTerm, statusFilter, dateRange, sortBy);
  }, [searchTerm, statusFilter, dateRange, sortBy, orders]);

  const exportOrders = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      orders: filteredOrders,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kitchen-orders-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("allOrders")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("manageAllCustomerOrders")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={loadOrders}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("refresh")}
          </button>
          <button
            onClick={exportOrders}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            {t("exportOrders")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchOrders")}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">{t("allOrders")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="preparing">{t("preparing")}</option>
            <option value="ready">{t("readyForDelivery")}</option>
            <option value="completed">{t("completed")}</option>
            <option value="cancelled">{t("cancelled")}</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">{t("allTime")}</option>
            <option value="today">{t("today")}</option>
            <option value="week">{t("thisWeek")}</option>
            <option value="month">{t("thisMonth")}</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="newest">{t("newest")}</option>
            <option value="oldest">{t("oldest")}</option>
            <option value="highestValue">{t("highestValue")}</option>
            <option value="lowestValue">{t("lowestValue")}</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              theme={theme}
              showCustomerInfo={true}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {t("noOrdersFound")}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("tryAdjustingSearchCriteria")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Orders Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("totalOrders")}
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {filteredOrders.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("pendingOrders")}
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {filteredOrders.filter((o) => o.status === "pending").length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("preparingOrders")}
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {filteredOrders.filter((o) => o.status === "preparing").length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("completedOrders")}
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {filteredOrders.filter((o) => o.status === "completed").length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllOrders;
