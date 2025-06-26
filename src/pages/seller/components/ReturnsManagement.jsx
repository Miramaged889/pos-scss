import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RotateCcw,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Search,
  Filter,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import { formatCurrency, formatDateTime } from "../../../utils";

const ReturnsManagement = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock returns data
  const returns = [
    {
      id: 1,
      orderId: "ORD-001",
      customer: "أحمد محمد",
      product: "برجر لحم",
      quantity: 2,
      reason: "منتج معيب",
      status: "pending",
      returnDate: "2024-01-15T10:30:00Z",
      refundAmount: 45.0,
    },
    {
      id: 2,
      orderId: "ORD-058",
      customer: "فاطمة علي",
      product: "سلطة قيصر",
      quantity: 1,
      reason: "طلب خاطئ",
      status: "approved",
      returnDate: "2024-01-14T15:45:00Z",
      refundAmount: 25.5,
    },
    {
      id: 3,
      orderId: "ORD-042",
      customer: "عبدالله سعد",
      product: "عصير برتقال",
      quantity: 3,
      reason: "جودة غير مرضية",
      status: "rejected",
      returnDate: "2024-01-12T09:15:00Z",
      refundAmount: 0,
    },
  ];

  // Calculate stats
  const totalReturns = returns.length;
  const pendingReturns = returns.filter((r) => r.status === "pending").length;
  const approvedReturns = returns.filter((r) => r.status === "approved").length;
  const totalRefunds = returns
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.refundAmount, 0);

  // Filter returns
  const filteredReturns = returns.filter((returnItem) => {
    const matchesSearch =
      returnItem.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || returnItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      title: t("totalReturns"),
      value: totalReturns,
      icon: RotateCcw,
      color: "blue",
    },
    {
      title: t("pendingReturns"),
      value: pendingReturns,
      icon: AlertCircle,
      color: "yellow",
    },
    {
      title: t("approvedReturns"),
      value: approvedReturns,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: t("totalRefunds"),
      value: formatCurrency(totalRefunds),
      icon: Package,
      color: "purple",
    },
  ];

  const returnColumns = [
    {
      header: t("returnId"),
      accessor: "id",
      render: (returnItem) =>
        `#RTN-${returnItem.id.toString().padStart(3, "0")}`,
    },
    {
      header: t("orderId"),
      accessor: "orderId",
    },
    {
      header: t("customer"),
      accessor: "customer",
    },
    {
      header: t("product"),
      accessor: "product",
    },
    {
      header: t("quantity"),
      accessor: "quantity",
    },
    {
      header: t("reason"),
      accessor: "reason",
    },
    {
      header: t("status"),
      accessor: "status",
      render: (returnItem) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            returnItem.status === "approved"
              ? "bg-green-100 text-green-800"
              : returnItem.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {t(returnItem.status)}
        </span>
      ),
    },
    {
      header: t("refundAmount"),
      accessor: "refundAmount",
      render: (returnItem) => formatCurrency(returnItem.refundAmount),
    },
    {
      header: t("returnDate"),
      accessor: "returnDate",
      render: (returnItem) => formatDateTime(returnItem.returnDate),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: () => (
        <div className="flex items-center gap-2">
          <button
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            title={t("viewReturn")}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t("returns")}
            </h1>
            <p className="text-gray-600">{t("manageProductReturns")}</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t("processReturn")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t("searchReturns")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t("allReturns")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="approved">{t("approved")}</option>
              <option value="rejected">{t("rejected")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          data={filteredReturns}
          columns={returnColumns}
          searchable={false}
          pageable={true}
        />
      </div>
    </div>
  );
};

export default ReturnsManagement;
