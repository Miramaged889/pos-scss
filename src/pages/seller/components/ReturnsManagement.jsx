import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
  Edit,
  Trash2,
  X,
  Calendar,
  User,
  Hash,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import { ReturnForm } from "../../../components/Forms";
import {
  formatCurrencyEnglish,
  formatDateTimeEnglish,
  formatNumberEnglish,
} from "../../../utils/formatters";
import { returnService } from "../../../services";

const ReturnsManagement = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [editingReturn, setEditingReturn] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Load returns from API
  useEffect(() => {
    const loadReturns = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await returnService.getReturns();
        setReturns(response.data || response);
      } catch (err) {
        console.error("Error loading returns:", err);
        setError(t("errorLoadingReturns"));
        setReturns([]);
      } finally {
        setLoading(false);
      }
    };

    loadReturns();
  }, [t]);

  // Calculate stats
  const totalReturns = returns.length;
  const pendingReturns = returns.filter((r) => r.status === "pending").length;
  const approvedReturns = returns.filter((r) => r.status === "approved").length;
  const totalRefunds = returns
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + (r.refundAmount || 0), 0);

  // Filter returns
  const filteredReturns = returns.filter((returnItem) => {
    const matchesSearch =
      returnItem.customerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      returnItem.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.productName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      returnItem.id
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || returnItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      title: t("totalReturns"),
      value: formatNumberEnglish(totalReturns),
      icon: RotateCcw,
      color: "blue",
    },
    {
      title: t("pendingReturns"),
      value: formatNumberEnglish(pendingReturns),
      icon: AlertCircle,
      color: "yellow",
    },
    {
      title: t("approvedReturns"),
      value: formatNumberEnglish(approvedReturns),
      icon: CheckCircle,
      color: "green",
    },
    {
      title: t("totalRefunds"),
      value: formatCurrencyEnglish(totalRefunds, t("currency")),
      icon: Package,
      color: "purple",
    },
  ];

  const handleAddReturn = () => {
    setEditingReturn(null);
    setShowReturnForm(true);
  };

  const handleEditReturn = (returnItem) => {
    setEditingReturn(returnItem);
    setShowReturnForm(true);
  };

  const handleViewReturn = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowViewModal(true);
  };

  const handleDeleteReturn = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowDeleteModal(true);
  };

  const handleReturnSubmit = async (returnData) => {
    try {
      if (editingReturn) {
        await returnService.updateReturn(editingReturn.id, returnData);
      } else {
        await returnService.createReturn(returnData);
      }

      // Reload returns from API
      const response = await returnService.getReturns();
      setReturns(response.data || response);
      setShowReturnForm(false);
      setEditingReturn(null);
    } catch (err) {
      console.error("Error saving return:", err);
      setError(t("errorSavingReturn"));
    }
  };

  const confirmDelete = async () => {
    if (!selectedReturn) return;

    setIsDeleting(true);

    try {
      // Delete the return via API
      await returnService.deleteReturn(selectedReturn.id);

      // Update local state
      setReturns(returns.filter((r) => r.id !== selectedReturn.id));

      // Reset states
      setShowDeleteModal(false);
      setSelectedReturn(null);
      setDeleteConfirmationText("");

      // Show success feedback (you can add toast notification here)
      console.log(
        `Return ${formatReturnId(selectedReturn.id)} deleted successfully`
      );
    } catch (error) {
      console.error("Error deleting return:", error);
      setError(t("errorDeletingReturn"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteModalClose = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setShowDeleteModal(false);
    setSelectedReturn(null);
    setDeleteConfirmationText("");
  };

  const formatReturnId = (returnId) => {
    // Since we have auto-migration in localStorage, just return the ID as-is
    // The migration ensures all IDs are in RTN-001, RTN-002 format
    if (typeof returnId === "string" && returnId.startsWith("RTN-")) {
      return returnId;
    }
    // Fallback for numeric IDs - format as RTN-001
    return `RTN-${String(returnId).padStart(3, "0")}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400",
        icon: AlertCircle,
      },
      approved: {
        bg: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400",
        icon: CheckCircle,
      },
      rejected: {
        bg: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {t(status)}
      </span>
    );
  };

  const returnColumns = [
    {
      header: t("returnId"),
      accessor: "id",
      render: (returnItem) => (
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {formatReturnId(returnItem.id)}
        </span>
      ),
    },
    {
      header: t("orderId"),
      accessor: "orderId",
      render: (returnItem) => (
        <span className="font-mono text-sm font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
          {returnItem.orderId}
        </span>
      ),
    },
    {
      header: t("customer"),
      accessor: "customerName",
    },
    {
      header: t("product"),
      accessor: "productName",
    },
    {
      header: t("quantity"),
      accessor: "quantity",
      render: (returnItem) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatNumberEnglish(returnItem.quantity)}
        </span>
      ),
    },
    {
      header: t("reason"),
      accessor: "reason",
      render: (returnItem) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t(returnItem.reason)}
        </span>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (returnItem) => getStatusBadge(returnItem.status),
    },
    {
      header: t("refundAmount"),
      accessor: "refundAmount",
      render: (returnItem) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {formatCurrencyEnglish(returnItem.refundAmount || 0, t("currency"))}
        </span>
      ),
    },
    {
      header: t("returnDate"),
      accessor: "returnDate",
      render: (returnItem) => (
        <span
          className={`text-gray-600 dark:text-gray-400 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {formatDateTimeEnglish(returnItem.returnDate)}
        </span>
      ),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: (returnItem) => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <button
            onClick={() => handleViewReturn(returnItem)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("viewReturn")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditReturn(returnItem)}
            className="p-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("editReturn")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteReturn(returnItem)}
            className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("deleteReturn")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
        <div
          className={`flex items-center justify-between ${
            isRTL ? "flex-row" : ""
          }`}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("returns")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("manageProductReturns")}
            </p>
          </div>
          <button
            onClick={handleAddReturn}
            className={`px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
              isRTL ? "flex-row" : ""
            }`}
          >
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
        <div
          className={`flex flex-col sm:flex-row gap-4 ${
            isRTL ? "sm:flex-row" : ""
          }`}
        >
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
                placeholder={t("searchReturns")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                  isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                isRTL ? "text-right" : "text-left"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <option value="all">{t("allReturns")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="approved">{t("approved")}</option>
              <option value="rejected">{t("rejected")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Returns Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <DataTable
            data={filteredReturns}
            columns={returnColumns}
            searchable={false}
            pageable={true}
          />
        )}
      </div>

      {/* Return Form Modal */}
      <ReturnForm
        isOpen={showReturnForm}
        onClose={() => {
          setShowReturnForm(false);
          setEditingReturn(null);
        }}
        onSubmit={handleReturnSubmit}
        editData={editingReturn}
      />

      {/* View Return Modal */}
      {showViewModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div
                className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}
              >
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Eye className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t("viewReturn")}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatReturnId(selectedReturn.id)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("returnId")}
                    </label>
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row" : ""
                      }`}
                    >
                      <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {formatReturnId(selectedReturn.id)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("orderId")}
                    </label>
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row" : ""
                      }`}
                    >
                      <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">
                        {selectedReturn.orderId}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("customer")}
                    </label>
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row" : ""
                      }`}
                    >
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {selectedReturn.customerName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("returnDate")}
                    </label>
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row" : ""
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {formatDateTimeEnglish(selectedReturn.returnDate)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("status")}
                    </label>
                    {getStatusBadge(selectedReturn.status)}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("refundAmount")}
                    </label>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatCurrencyEnglish(
                        selectedReturn.refundAmount || 0,
                        t("currency")
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("productDetails")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t("product")}
                    </label>
                    <span className="text-gray-900 dark:text-white">
                      {selectedReturn.productName}
                    </span>
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t("quantity")}
                    </label>
                    <span className="text-gray-900 dark:text-white">
                      {formatNumberEnglish(selectedReturn.quantity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Return Details */}
              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("returnReason")}
                </label>
                <p
                  className={`text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t(selectedReturn.reason)}
                </p>
              </div>

              {selectedReturn.description && (
                <div>
                  <label
                    className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {t("description")}
                  </label>
                  <p
                    className={`text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {selectedReturn.description}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div
              className={`flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditReturn(selectedReturn);
                }}
                className={`flex items-center gap-2 px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-all duration-200 hover:scale-105 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <Edit className="w-4 h-4" />
                {t("editReturn")}
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full animate-fade-in">
            <div className="p-6">
              {/* Header */}
              <div
                className={`flex items-center gap-3 mb-6 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t("deleteReturn")}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("thisActionCannotBeUndone")}
                  </p>
                </div>
              </div>

              {/* Return Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h3
                  className={`text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("returnToDelete")}
                </h3>
                <div className="space-y-2">
                  <div
                    className={`flex justify-between items-center ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("returnId")}:
                    </span>
                    <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      {formatReturnId(selectedReturn.id)}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-center ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("customer")}:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedReturn.customerName}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-center ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("product")}:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedReturn.productName}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-center ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("refundAmount")}:
                    </span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrencyEnglish(
                        selectedReturn.refundAmount || 0,
                        t("currency")
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("typeDeleteToConfirm")}
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={t("typeDelete")}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                  disabled={isDeleting}
                />
              </div>

              {/* Warning Message */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
                <div
                  className={`flex items-start gap-2 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p
                    className={`text-sm text-yellow-800 dark:text-yellow-300 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {t("deleteReturnWarning")}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                <button
                  onClick={confirmDelete}
                  disabled={
                    deleteConfirmationText.toLowerCase() !== "delete" ||
                    isDeleting
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 dark:disabled:hover:bg-red-500 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("deleting")}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      {t("confirmDelete")}
                    </>
                  )}
                </button>
                <button
                  onClick={handleDeleteModalClose}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsManagement;
