import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Search,
  Filter,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import { formatCurrency, formatDateTime } from "../../../utils";

const PaymentManagement = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock payments data
  const payments = [
    {
      id: 1,
      transactionId: "TXN-001",
      orderId: "ORD-001",
      customer: "أحمد محمد",
      amount: 125.5,
      method: "card",
      status: "completed",
      paymentDate: "2024-01-15T10:30:00Z",
      fees: 3.75,
    },
    {
      id: 2,
      transactionId: "TXN-002",
      orderId: "ORD-058",
      customer: "فاطمة علي",
      amount: 87.25,
      method: "cash",
      status: "completed",
      paymentDate: "2024-01-14T15:45:00Z",
      fees: 0,
    },
    {
      id: 3,
      transactionId: "TXN-003",
      orderId: "ORD-042",
      customer: "عبدالله سعد",
      amount: 156.75,
      method: "digital",
      status: "pending",
      paymentDate: "2024-01-12T09:15:00Z",
      fees: 4.7,
    },
    {
      id: 4,
      transactionId: "TXN-004",
      orderId: "ORD-025",
      customer: "سارة أحمد",
      amount: 95.0,
      method: "card",
      status: "failed",
      paymentDate: "2024-01-11T14:20:00Z",
      fees: 0,
    },
  ];

  // Calculate stats
  const totalTransactions = payments.length;
  const completedPayments = payments.filter((p) => p.status === "completed");
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalFees = completedPayments.reduce((sum, p) => sum + p.fees, 0);

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      title: t("totalTransactions"),
      value: totalTransactions,
      icon: CreditCard,
      color: "blue",
    },
    {
      title: t("totalRevenue"),
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "green",
    },
    {
      title: t("pendingPayments"),
      value: pendingPayments,
      icon: AlertCircle,
      color: "yellow",
    },
    {
      title: t("transactionFees"),
      value: formatCurrency(totalFees),
      icon: TrendingUp,
      color: "purple",
    },
  ];

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "card":
        return <CreditCard className="w-4 h-4" />;
      case "cash":
        return <DollarSign className="w-4 h-4" />;
      case "digital":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const paymentColumns = [
    {
      header: t("transactionId"),
      accessor: "transactionId",
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
      header: t("amount"),
      accessor: "amount",
      render: (payment) => formatCurrency(payment.amount),
    },
    {
      header: t("method"),
      accessor: "method",
      render: (payment) => (
        <div className="flex items-center gap-2">
          {getPaymentMethodIcon(payment.method)}
          <span className="capitalize">{t(payment.method)}</span>
        </div>
      ),
    },
    {
      header: t("fees"),
      accessor: "fees",
      render: (payment) => formatCurrency(payment.fees),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (payment) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            payment.status === "completed"
              ? "bg-green-100 text-green-800"
              : payment.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {payment.status === "completed" && (
            <CheckCircle className="w-3 h-3 mr-1" />
          )}
          {payment.status === "pending" && (
            <AlertCircle className="w-3 h-3 mr-1" />
          )}
          {payment.status === "failed" && <XCircle className="w-3 h-3 mr-1" />}
          {t(payment.status)}
        </span>
      ),
    },
    {
      header: t("paymentDate"),
      accessor: "paymentDate",
      render: (payment) => formatDateTime(payment.paymentDate),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: () => (
        <div className="flex items-center gap-2">
          <button
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            title={t("viewTransaction")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
            title={t("downloadReceipt")}
          >
            <Download className="w-4 h-4" />
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
              {t("payments")}
            </h1>
            <p className="text-gray-600">
              {t("managePaymentsAndTransactions")}
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t("exportReport")}
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
                placeholder={t("searchTransactions")}
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
              <option value="all">{t("allTransactions")}</option>
              <option value="completed">{t("completed")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="failed">{t("failed")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          data={filteredPayments}
          columns={paymentColumns}
          searchable={false}
          pageable={true}
        />
      </div>
    </div>
  );
};

export default PaymentManagement;
