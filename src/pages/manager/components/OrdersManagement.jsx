import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Users,
  X,
  Save,
} from "lucide-react";
import { toast } from "react-hot-toast";

import DataTable from "../../../components/Common/DataTable";
import {
  fetchOrders,
  updateOrder,
  deleteOrder,
} from "../../../store/slices/ordersSlice";

const OrdersManagement = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Get data from Redux store
  const { orders, loading, error } = useSelector((state) => state.orders);

  // Local state for UI
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Modal states
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editForm, setEditForm] = useState({});

  const filterOrders = useCallback(() => {
    if (!Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          (order.id || "")
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (order.customer?.name || order.customerName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (order.seller?.name || order.sellerName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (order.customer?.phone || order.customerPhone || "").includes(
            searchTerm
          )
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Seller filter
    if (sellerFilter !== "all") {
      filtered = filtered.filter(
        (order) =>
          (order.seller?.email || order.sellerEmail || "") === sellerFilter
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(
          order.createdAt || order.orderDate || order.date
        );
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sellerFilter, dateRange]);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  // Compute unique sellers from orders
  const sellers = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];

    const uniqueSellers = new Set();
    orders.forEach((order) => {
      const sellerEmail = order.seller?.email || order.sellerEmail;
      const sellerName = order.seller?.name || order.sellerName;
      if (sellerEmail && sellerName) {
        uniqueSellers.add(
          JSON.stringify({ email: sellerEmail, name: sellerName })
        );
      }
    });

    return Array.from(uniqueSellers).map((seller) => JSON.parse(seller));
  }, [orders]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock,
      },
      processing: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        icon: ShoppingCart,
      },
      completed: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle,
      },
      cancelled: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {t(status)}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methodConfig = {
      cash: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        text: t("cash"),
      },
      card: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        text: t("card"),
      },
      online: {
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        text: t("online"),
      },
    };

    const config = methodConfig[method] || methodConfig.cash;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const columns = [
    {
      header: t("orderId"),
      accessor: "id",
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {item.id}
        </span>
      ),
    },
    {
      header: t("customer"),
      accessor: "customerName",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {item.customer?.name || item.customerName || "Unknown Customer"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {item.customer?.phone || item.customerPhone || "N/A"}
          </p>
        </div>
      ),
    },
    {
      header: t("seller"),
      accessor: "sellerName",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {item.seller?.name || item.sellerName || "Unknown Seller"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {item.seller?.email || item.sellerEmail || "N/A"}
          </p>
        </div>
      ),
    },
    {
      header: t("items"),
      accessor: "items",
      render: (item) => (
        <div className="max-w-xs">
          {(item.items || []).map((orderItem, index) => (
            <div key={index} className="text-sm">
              <span className="text-gray-900 dark:text-white">
                {orderItem.quantity || 1}x{" "}
                {orderItem.name || orderItem.product?.name || "Item"}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                ${(orderItem.price || orderItem.product?.price || 0).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      header: t("total"),
      accessor: "totalAmount",
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">
          ${(item.totalAmount || item.total || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (item) => getStatusBadge(item.status || "pending"),
    },
    {
      header: t("payment"),
      accessor: "paymentMethod",
      render: (item) => getPaymentMethodBadge(item.paymentMethod || "cash"),
    },
    {
      header: t("date"),
      accessor: "orderDate",
      render: (item) => {
        const orderDate =
          item.createdAt ||
          item.orderDate ||
          item.date ||
          new Date().toISOString();
        return (
          <div>
            <p className="text-sm text-gray-900 dark:text-white">
              {new Date(orderDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(orderDate).toLocaleTimeString()}
            </p>
          </div>
        );
      },
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewOrder(item)}
            className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title={t("view")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOrder(item)}
            className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            title={t("edit")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteOrder(item)}
            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status || "pending",
      notes: order.notes || "",
      deliveryDate: order.deliveryDate ? order.deliveryDate.split("T")[0] : "",
    });
    setEditModal(true);
  };

  const handleDeleteOrder = (order) => {
    setSelectedOrder(order);
    setDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder) return;

    try {
      const updates = {
        status: editForm.status,
        notes: editForm.notes,
        deliveryDate: editForm.deliveryDate
          ? `${editForm.deliveryDate}T${
              (selectedOrder.deliveryDate || new Date().toISOString()).split(
                "T"
              )[1]
            }`
          : selectedOrder.deliveryDate,
      };

      await dispatch(updateOrder({ id: selectedOrder.id, updates }));
      setEditModal(false);
      setSelectedOrder(null);
      setEditForm({});
      toast.success(t("orderUpdated"));
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(t("errorUpdatingOrder"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;

    try {
      await dispatch(deleteOrder(selectedOrder.id));
      setDeleteModal(false);
      setSelectedOrder(null);
      toast.success(t("orderDeleted"));
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(t("errorDeletingOrder"));
    }
  };

  const handleExportOrders = () => {
    console.log("Export orders");
    // Implement export functionality
    toast.success(t("ordersExported"));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSellerFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // Get statistics
  const getStats = () => {
    if (!Array.isArray(orders)) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: "0.00",
      };
    }

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === "completed"
    ).length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || order.total || 0),
      0
    );

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue.toFixed(2),
    };
  };

  const stats = getStats();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("ordersManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageAllOrders")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportOrders}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t("export")}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("totalOrders")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalOrders}
              </p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("pendingOrders")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pendingOrders}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("completedOrders")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completedOrders}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("totalRevenue")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.totalRevenue}
              </p>
            </div>
            <User className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters - Always Visible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("filters")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("search")}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("searchOrders")}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("status")}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">{t("allStatuses")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="processing">{t("processing")}</option>
                <option value="completed">{t("completed")}</option>
                <option value="cancelled">{t("cancelled")}</option>
              </select>
            </div>

            {/* Seller Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("seller")}
              </label>
              <select
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">{t("allSellers")}</option>
                {sellers.map((seller, index) => (
                  <option key={index} value={seller.email}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("dateRange")}
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t("clearFilters")}
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("showing")} {filteredOrders.length} {t("of")} {orders.length}{" "}
          {t("orders")}
        </p>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sellers.length} {t("activeSellers")}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <DataTable
          data={filteredOrders}
          columns={columns}
          loading={loading}
          searchable={false}
        />
      </div>

      {/* View Modal */}
      {viewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("orderDetails")} - {selectedOrder.id}
              </h2>
              <button
                onClick={() => setViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("customerInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("name")}:</strong>{" "}
                    {selectedOrder.customer?.name ||
                      selectedOrder.customerName ||
                      "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("phone")}:</strong>{" "}
                    {selectedOrder.customer?.phone ||
                      selectedOrder.customerPhone ||
                      "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("address")}:</strong>{" "}
                    {selectedOrder.customer?.address ||
                      selectedOrder.address ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("orderInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("status")}:</strong>{" "}
                    {getStatusBadge(selectedOrder.status || "pending")}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("paymentMethod")}:</strong>{" "}
                    {getPaymentMethodBadge(
                      selectedOrder.paymentMethod || "cash"
                    )}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("total")}:</strong> $
                    {(
                      selectedOrder.totalAmount ||
                      selectedOrder.total ||
                      0
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t("items")}
                </h3>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="text-sm text-gray-900 dark:text-white">
                        {item.quantity || 1}x{" "}
                        {item.name || item.product?.name || "Item"}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${(item.price || item.product?.price || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("notes")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("editOrder")} - {selectedOrder.id}
              </h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("status")}
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="pending">{t("pending")}</option>
                  <option value="processing">{t("processing")}</option>
                  <option value="completed">{t("completed")}</option>
                  <option value="cancelled">{t("cancelled")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("deliveryDate")}
                </label>
                <input
                  type="date"
                  value={editForm.deliveryDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, deliveryDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("notes")}
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t("saveChanges")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("deleteOrder")}
              </h2>
              <button
                onClick={() => setDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {t("confirmDeleteOrder")}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {t("orderId")}: {selectedOrder.id}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("deleteOrderWarning")}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
