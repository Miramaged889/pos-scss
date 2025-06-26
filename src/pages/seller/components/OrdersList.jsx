import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Package,
  User,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import { formatCurrency, formatDateTime } from "../../../utils";

const OrdersList = () => {
  const { t } = useTranslation();
  const { orders } = useSelector((state) => state.orders);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter orders based on status and search term
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const statusOptions = [
    { value: "all", label: t("allOrders") },
    { value: "pending", label: t("pending") },
    { value: "processing", label: t("processing") },
    { value: "completed", label: t("completed") },
    { value: "cancelled", label: t("cancelled") },
  ];

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
      processing:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      completed:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      cancelled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusClasses[status] || statusClasses.pending
        }`}
      >
        {t(status)}
      </span>
    );
  };

  const orderColumns = [
    {
      header: t("orderId"),
      accessor: "id",
      render: (order) => (
        <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
          {order.id}
        </span>
      ),
    },
    {
      header: t("customer"),
      accessor: "customer",
      render: (order) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {order.customer}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {order.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: t("items"),
      accessor: "items",
      render: (order) => (
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {order.items} {t("items")}
          </span>
        </div>
      ),
    },
    {
      header: t("total"),
      accessor: "total",
      render: (order) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="font-medium text-green-600 dark:text-green-400">
            {formatCurrency(order.total)}
          </span>
        </div>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (order) => getStatusBadge(order.status),
    },
    {
      header: t("date"),
      accessor: "createdAt",
      render: (order) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {formatDateTime(order.createdAt)}
          </span>
        </div>
      ),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: (order) => (
        <div className="flex items-center gap-2">
          <button
            className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all duration-200 hover:scale-110"
            title={t("viewOrder")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-all duration-200 hover:scale-110"
            title={t("editOrder")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all duration-200 hover:scale-110"
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      label: t("totalOrders"),
      value: orders.length,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: t("pendingOrders"),
      value: orders.filter((o) => o.status === "pending").length,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      label: t("completedOrders"),
      value: orders.filter((o) => o.status === "completed").length,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: t("totalRevenue"),
      value: formatCurrency(
        orders.reduce((sum, order) => sum + order.total, 0)
      ),
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("ordersManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageAllCustomerOrders")}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105">
          <Plus className="w-4 h-4" />
          {t("newOrder")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bg} rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {stat.label}
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder={t("searchOrders")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 appearance-none"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        data={filteredOrders}
        columns={orderColumns}
        searchable={false}
        pageable={true}
        pageSize={10}
      />
    </div>
  );
};

export default OrdersList;
