import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  XCircle,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import { PurchaseOrderForm } from "../../../components/Forms";
import {
  formatCurrency,
  formatCurrencyEnglish,
  formatDateTimeEnglish,
} from "../../../utils";
const SupplierPurchase = () => {
  const { t, i18n } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  // Smart currency formatter based on current language
  const formatCurrencySmart = (amount) => {
    return i18n.language === "ar"
      ? formatCurrency(amount)
      : formatCurrencyEnglish(amount);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const loadPurchaseOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // For now, we'll use an empty array since we don't have a specific purchase order service
      // In a real implementation, you would have a purchaseOrderService
      setPurchaseOrders([]);
    } catch (error) {
      console.error("Error loading purchase orders:", error);
      setError(t("errorLoadingPurchaseOrders"));
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Load purchase orders from API
  useEffect(() => {
    loadPurchaseOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    .reduce((sum, po) => sum + (po.totalAmount || 0), 0);

  // Filter purchase orders
  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      (order.supplier || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.poNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
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
      value: formatCurrencySmart(totalSpent),
      icon: TrendingUp,
      color: "purple",
    },
  ];

  const handleCreateOrder = () => {
    setEditData(null);
    setIsFormOpen(true);
  };

  const handleEditOrder = (order) => {
    setEditData(order);
    setIsFormOpen(true);
  };

  const handleViewOrder = (order) => {
    setViewData(order);
    setIsViewOpen(true);
  };

  const handleDeleteOrder = async (orderId) => {
    const order = purchaseOrders.find((po) => po.id === orderId);
    const confirmMessage = `${t("confirmDeletePurchaseOrder")}\n\n${t(
      "poNumber"
    )}: ${order?.poNumber || order?.id}\n${t("supplier")}: ${order?.supplier}`;

    if (window.confirm(confirmMessage)) {
      try {
        // For now, just remove from local state since we don't have a purchase order service
        setPurchaseOrders((prev) => prev.filter((po) => po.id !== orderId));
        // Show success message
        alert(t("purchaseOrderDeleted"));
      } catch (error) {
        console.error("Error deleting purchase order:", error);
        setError(t("errorDeletingPurchaseOrder"));
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editData) {
        // For now, just update local state since we don't have a purchase order service
        setPurchaseOrders((prev) =>
          prev.map((po) =>
            po.id === editData.id ? { ...po, ...formData } : po
          )
        );
      } else {
        // For now, just add to local state since we don't have a purchase order service
        const newOrder = { ...formData, id: Date.now().toString() };
        setPurchaseOrders((prev) => [...prev, newOrder]);
      }
      setIsFormOpen(false);
      setEditData(null);
    } catch (error) {
      console.error("Error saving purchase order:", error);
      setError(t("errorSavingPurchaseOrder"));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const orderColumns = [
    {
      header: t("poNumber"),
      accessor: "poNumber",
      render: (order) => (
        <div className="font-medium text-blue-600 dark:text-blue-400">
          {order.poNumber || order.id}
        </div>
      ),
    },
    {
      header: t("supplier"),
      accessor: "supplier",
      render: (order) => (
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {order.supplier}
          </span>
        </div>
      ),
    },
    {
      header: t("items"),
      accessor: "items",
      render: (order) => (
        <div className="space-y-1">
          {(order.items || []).slice(0, 2).map((item, index) => (
            <div
              key={index}
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              {item.name} × {item.quantity}
            </div>
          ))}
          {(order.items || []).length > 2 && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              +{order.items.length - 2} {t("moreItems")}
            </div>
          )}
          {(!order.items || order.items.length === 0) && (
            <div className="text-sm text-gray-500 dark:text-gray-500">
              {t("noItems")}
            </div>
          )}
        </div>
      ),
    },
    {
      header: t("totalAmount"),
      accessor: "totalAmount",
      render: (order) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          {formatCurrencySmart(order.totalAmount || 0)}
        </div>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (order) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            order.status
          )}`}
        >
          {t(order.status || "pending")}
        </span>
      ),
    },
    {
      header: t("orderDate"),
      accessor: "orderDate",
      render: (order) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {order.orderDate ? formatDateTimeEnglish(order.orderDate) : "-"}
        </div>
      ),
    },
    {
      header: t("expectedDelivery"),
      accessor: "expectedDelivery",
      render: (order) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {order.expectedDelivery
            ? formatDateTimeEnglish(order.expectedDelivery)
            : "-"}
        </div>
      ),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: (order) => (
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
          <button
            onClick={() => handleEditOrder(order)}
            className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
            title={t("editPurchaseOrder")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewOrder(order)}
            className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors duration-200"
            title={t("viewPurchaseOrder")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteOrder(order.id)}
            className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
            title={t("deletePurchaseOrder")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isRTL ? "sm:flex-row" : ""
          }`}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("supplierPurchase")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {t("managePurchaseOrders")}
            </p>
          </div>
          <button
            onClick={handleCreateOrder}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 text-sm sm:text-base ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <Plus className="w-4 h-4" />
            {t("createPurchaseOrder")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />
              <input
                type="text"
                placeholder={t("searchPurchaseOrders")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                }`}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">{t("allOrders")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="confirmed">{t("confirmed")}</option>
              <option value="delivered">{t("delivered")}</option>
              <option value="cancelled">{t("cancelled")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Purchase Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || statusFilter !== "all"
                ? t("noPurchaseOrdersFound")
                : t("noPurchaseOrders")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== "all"
                ? t("tryAdjustingFilters")
                : t("createFirstPurchaseOrder")}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button
                onClick={handleCreateOrder}
                className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <Plus className="w-4 h-4" />
                {t("createPurchaseOrder")}
              </button>
            )}
          </div>
        ) : (
          <DataTable
            data={filteredOrders}
            columns={orderColumns}
            searchable={false}
            pageable={true}
          />
        )}
      </div>

      {/* Purchase Order Form Modal */}
      <PurchaseOrderForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditData(null);
        }}
        onSubmit={handleFormSubmit}
        editData={editData}
      />

      {/* View Purchase Order Modal */}
      {isViewOpen && viewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div
                className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t("viewPurchaseOrder")}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {viewData.poNumber || viewData.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsViewOpen(false)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("supplier")}
                  </label>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">
                      {viewData.supplier}
                    </span>
                  </div>
                </div>
                <div className={`space-y-2 ${isRTL ? "flex-row" : ""}`}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("status")}
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        viewData.status
                      )}`}
                    >
                      {t(viewData.status || "pending")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("orderDate")}
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">
                      {viewData.orderDate
                        ? formatDateTimeEnglish(viewData.orderDate)
                        : "-"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("expectedDelivery")}
                  </label>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">
                      {viewData.expectedDelivery
                        ? formatDateTimeEnglish(viewData.expectedDelivery)
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t("orderItems")}
                </h3>
                {viewData.items && viewData.items.length > 0 ? (
                  <div className="space-y-3">
                    {viewData.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {t("itemName")}
                            </label>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {t("quantity")}
                            </label>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {item.quantity}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {t("unitPrice")}
                            </label>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {formatCurrencySmart(item.price)}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {t("subtotal")}
                            </label>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrencySmart(
                                (item.quantity || 0) * (item.price || 0)
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("noItems")}
                  </p>
                )}
              </div>

              {/* Notes */}
              {viewData.notes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("notes")}
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {viewData.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div
                  className={`flex items-center justify-between ${
                    isRTL ? "flex-row" : ""
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 ${
                      isRTL ? "flex-row" : ""
                    }`}
                  >
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      {t("totalAmount")}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                    {formatCurrencySmart(viewData.totalAmount || 0)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div
                className={`flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <button
                  onClick={() => {
                    setIsViewOpen(false);
                    handleEditOrder(viewData);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 ${
                    isRTL ? "flex-row" : ""
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  {t("editPurchaseOrder")}
                </button>
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPurchase;
