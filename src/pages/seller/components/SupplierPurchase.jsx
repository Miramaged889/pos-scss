import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Truck,
  Package,
  Building,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Plus,
  Search,
  Filter,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import { formatCurrency, formatDateTime } from "../../../utils";

const SupplierPurchase = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock purchase orders data
  const purchaseOrders = [
    {
      id: 1,
      poNumber: "PO-001",
      supplier: "مؤسسة الأغذية الطازجة",
      items: [
        { name: "خضروات مشكلة", quantity: 50, price: 15.0 },
        { name: "لحم بقري", quantity: 20, price: 85.0 },
      ],
      totalAmount: 2450.0,
      status: "pending",
      orderDate: "2024-01-15T10:30:00Z",
      expectedDelivery: "2024-01-17T14:00:00Z",
    },
    {
      id: 2,
      poNumber: "PO-002",
      supplier: "شركة المشروبات المميزة",
      items: [
        { name: "عصائر طبيعية", quantity: 100, price: 8.5 },
        { name: "مياه معدنية", quantity: 200, price: 2.25 },
      ],
      totalAmount: 1300.0,
      status: "delivered",
      orderDate: "2024-01-12T09:15:00Z",
      expectedDelivery: "2024-01-14T11:30:00Z",
    },
    {
      id: 3,
      poNumber: "PO-003",
      supplier: "مخبز الطازج",
      items: [
        { name: "خبز برجر", quantity: 300, price: 1.5 },
        { name: "خبز ساندويش", quantity: 200, price: 1.25 },
      ],
      totalAmount: 700.0,
      status: "confirmed",
      orderDate: "2024-01-14T16:20:00Z",
      expectedDelivery: "2024-01-16T08:00:00Z",
    },
  ];

  // Calculate stats
  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter(
    (po) => po.status === "pending"
  ).length;
  const deliveredOrders = purchaseOrders.filter(
    (po) => po.status === "delivered"
  ).length;
  const totalSpent = purchaseOrders
    .filter((po) => po.status === "delivered")
    .reduce((sum, po) => sum + po.totalAmount, 0);

  // Filter purchase orders
  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      title: t("totalPurchaseOrders"),
      value: totalOrders,
      icon: Package,
      color: "blue",
    },
    {
      title: t("pendingOrders"),
      value: pendingOrders,
      icon: Clock,
      color: "yellow",
    },
    {
      title: t("deliveredOrders"),
      value: deliveredOrders,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: t("totalSpent"),
      value: formatCurrency(totalSpent),
      icon: Truck,
      color: "purple",
    },
  ];

  const orderColumns = [
    {
      header: t("poNumber"),
      accessor: "poNumber",
    },
    {
      header: t("supplier"),
      accessor: "supplier",
      render: (order) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 text-gray-500" />
          </div>
          <span className="font-medium text-gray-900">{order.supplier}</span>
        </div>
      ),
    },
    {
      header: t("items"),
      accessor: "items",
      render: (order) => (
        <div className="space-y-1">
          {order.items.slice(0, 2).map((item, index) => (
            <div key={index} className="text-sm text-gray-600">
              {item.name} × {item.quantity}
            </div>
          ))}
          {order.items.length > 2 && (
            <div className="text-xs text-gray-500">
              +{order.items.length - 2} {t("moreItems")}
            </div>
          )}
        </div>
      ),
    },
    {
      header: t("totalAmount"),
      accessor: "totalAmount",
      render: (order) => formatCurrency(order.totalAmount),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (order) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            order.status === "delivered"
              ? "bg-green-100 text-green-800"
              : order.status === "confirmed"
              ? "bg-blue-100 text-blue-800"
              : order.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {t(order.status)}
        </span>
      ),
    },
    {
      header: t("orderDate"),
      accessor: "orderDate",
      render: (order) => formatDateTime(order.orderDate),
    },
    {
      header: t("expectedDelivery"),
      accessor: "expectedDelivery",
      render: (order) => formatDateTime(order.expectedDelivery),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: () => (
        <div className="flex items-center gap-2">
          <button
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            title={t("viewPurchaseOrder")}
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
              {t("supplierPurchase")}
            </h1>
            <p className="text-gray-600">{t("managePurchaseOrders")}</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t("createPurchaseOrder")}
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
                placeholder={t("searchPurchaseOrders")}
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
              <option value="all">{t("allOrders")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="confirmed">{t("confirmed")}</option>
              <option value="delivered">{t("delivered")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          data={filteredOrders}
          columns={orderColumns}
          searchable={false}
          pageable={true}
        />
      </div>
    </div>
  );
};

export default SupplierPurchase;
