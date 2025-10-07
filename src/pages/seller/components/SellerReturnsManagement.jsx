import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  Building,
  Plus,
  X,
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

import DataTable from "../../../components/Common/DataTable";
import { SellerReturnForm } from "../../../components/Forms";
import { supplierService } from "../../../services/supplierService";

const SupplierReturnsManagement = () => {
  const { t } = useTranslation();

  // Local state
  const [returns, setReturns] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [itemNames, setItemNames] = useState({}); // Store item ID to name mapping
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Modal states
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Form modal states
  const [formModal, setFormModal] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedReturnForForm, setSelectedReturnForForm] = useState(null);

  // Load suppliers and returns data
  const loadSuppliers = useCallback(async () => {
    try {
      const response = await supplierService.getSuppliers();
      const suppliersList = response.results || response || [];
      setSuppliers(suppliersList);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      setError(t("errorLoadingSuppliers"));
    }
  }, [t]);

  // Load item names for all suppliers
  const loadItemNames = useCallback(async () => {
    try {
      const itemNamesMap = {};

      // Load items for each supplier to build the mapping
      for (const supplier of suppliers) {
        const items = await supplierService.getSupplierItems(supplier.id);
        items.forEach((item) => {
          itemNamesMap[item.id] = item.name;
        });
      }

      setItemNames(itemNamesMap);
    } catch (error) {
      console.error("Error loading item names:", error);
    }
  }, [suppliers]);

  const loadReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierService.getSupplierReturns();
      const returnsList = response.results || response || [];

      // Enrich returns with supplier information and item names
      const enrichedReturns = await Promise.all(
        returnsList.map(async (returnItem) => {
          const supplier = suppliers.find((s) => s.id === returnItem.supplier);
          return {
            ...returnItem,
            supplierName:
              supplier?.supplier_name || supplier?.name || "Unknown",
            supplierEmail: supplier?.email || "",
            purchaseItemName:
              itemNames[returnItem.purchase_item] ||
              returnItem.purchase_item ||
              "Unknown Item",
          };
        })
      );

      setReturns(enrichedReturns);
    } catch (error) {
      console.error("Error loading returns:", error);
      setError(t("errorLoadingReturns"));
    } finally {
      setLoading(false);
    }
  }, [suppliers, itemNames, t]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  useEffect(() => {
    if (suppliers.length > 0) {
      loadItemNames();
    }
  }, [suppliers, loadItemNames]);

  useEffect(() => {
    if (suppliers.length > 0 && Object.keys(itemNames).length > 0) {
      loadReturns();
    }
  }, [suppliers, itemNames, loadReturns]);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filterReturns = useCallback(() => {
    let filtered = [...(returns || [])];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (returnItem) =>
          returnItem.id
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          returnItem.purchaseItemName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          returnItem.purchase_item
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          returnItem.supplierName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          returnItem.supplierEmail
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          returnItem.return_reason
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Supplier filter
    if (supplierFilter !== "all") {
      filtered = filtered.filter(
        (returnItem) => returnItem.supplier?.toString() === supplierFilter
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((returnItem) => {
        const returnDate = new Date(returnItem.created_at);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return returnDate >= startDate && returnDate <= endDate;
      });
    }

    setFilteredReturns(filtered);
  }, [returns, searchTerm, supplierFilter, dateRange]);

  useEffect(() => {
    filterReturns();
  }, [filterReturns]);

  const columns = [
    {
      header: t("returnId"),
      accessor: "id",
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">
          #{item.id}
        </span>
      ),
    },
    {
      header: t("purchaseItem"),
      accessor: "purchaseItemName",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.purchaseItemName}
        </span>
      ),
    },
    {
      header: t("supplier"),
      accessor: "supplierName",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {item.supplierName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {item.supplierEmail}
          </p>
        </div>
      ),
    },
    {
      header: t("reason"),
      accessor: "return_reason",
      render: (item) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 dark:text-white truncate">
            {item.return_reason}
          </p>
        </div>
      ),
    },
    {
      header: t("quantity"),
      accessor: "quantity",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {item.quantity}
          </p>
        </div>
      ),
    },
    {
      header: t("returnDate"),
      accessor: "created_at",
      render: (item) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewReturn(item)}
            className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title={t("view")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleProcessReturn(item)}
            className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            title={t("process")}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditReturnForm(item)}
            className="p-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            title={t("edit")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteReturn(item)}
            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleViewReturn = (returnItem) => {
    setSelectedReturn(returnItem);
    setViewModal(true);
  };

  const handleProcessReturn = () => {
    toast.success(t("returnProcessed"));
  };

  const handleDeleteReturn = (returnItem) => {
    setSelectedReturn(returnItem);
    setDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedReturn) return;

    try {
      const updateData = {
        return_reason: editForm.return_reason || selectedReturn.return_reason,
        quantity: editForm.quantity || selectedReturn.quantity,
      };

      await supplierService.updateSupplierReturn(selectedReturn.id, updateData);

      setEditModal(false);
      setSelectedReturn(null);
      setEditForm({});
      toast.success(t("returnUpdated"));
      // Reload data
      loadReturns();
    } catch (error) {
      console.error("Error updating return:", error);
      toast.error(error?.message || t("updateFailed"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedReturn) return;

    try {
      await supplierService.deleteSupplierReturn(selectedReturn.id);
      setDeleteModal(false);
      setSelectedReturn(null);
      toast.success(t("returnDeleted"));
      // Reload data
      loadReturns();
    } catch (error) {
      console.error("Error deleting return:", error);
      toast.error(error?.message || t("deleteFailed"));
    }
  };

  // Form handlers
  const handleAddReturn = () => {
    setFormMode("add");
    setSelectedReturnForForm(null);
    setFormModal(true);
  };

  const handleEditReturnForm = (returnItem) => {
    setFormMode("edit");
    setSelectedReturnForForm(returnItem);
    setFormModal(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === "add") {
        await supplierService.createSupplierReturn(formData);
        toast.success(t("returnAddedSuccessfully"));
      } else {
        await supplierService.updateSupplierReturn(
          selectedReturnForForm.id,
          formData
        );
        toast.success(t("returnUpdatedSuccessfully"));
      }
      setFormModal(false);
      // Reload data
      loadReturns();
    } catch (error) {
      console.error("Error submitting return:", error);
      toast.error(error?.message || t("operationFailed"));
    }
  };

  const handleFormClose = () => {
    setFormModal(false);
    setSelectedReturnForForm(null);
  };

  const handleExportReturns = () => {
    console.log("Export returns");
    toast.success(t("returnsExported"));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSupplierFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // Get statistics
  const getStats = () => {
    const returnList = returns || [];
    const totalReturns = returnList.length;
    const approvedReturns = returnList.filter(
      (returnItem) => returnItem.status === "approved"
    ).length;
    const pendingReturns = returnList.filter(
      (returnItem) => returnItem.status === "pending"
    ).length;
    const totalRefundAmount = returnList.reduce(
      (sum, returnItem) => sum + (returnItem.refundAmount || 0),
      0
    );

    return {
      totalReturns,
      approvedReturns,
      pendingReturns,
      totalRefundAmount: totalRefundAmount.toFixed(2),
    };
  };

  const stats = getStats();

  // Safe suppliers array to prevent map error
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("supplierReturnsManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageAllSupplierReturns")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddReturn}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("addReturn")}
          </button>
          <button
            onClick={handleExportReturns}
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
                {t("totalReturns")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalReturns}
              </p>
            </div>
            <RotateCcw className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("approvedReturns")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.approvedReturns}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("pendingReturns")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pendingReturns}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("totalRefundAmount")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.totalRefundAmount}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
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
                  placeholder={t("searchReturns")}
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
                <option value="approved">{t("approved")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="rejected">{t("rejected")}</option>
              </select>
            </div>

            {/* Supplier Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("supplier")}
              </label>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">{t("allSuppliers")}</option>
                {safeSuppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
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
          {t("showing")} {filteredReturns.length} {t("of")}{" "}
          {(returns || []).length} {t("returns")}
        </p>
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {safeSuppliers.length} {t("activeSuppliers")}
          </span>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <DataTable
          data={filteredReturns}
          columns={columns}
          loading={loading}
          searchable={false}
        />
      </div>

      {/* View Modal */}
      {viewModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("returnDetails")} - {selectedReturn.id}
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
                    {t("supplierInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("name")}:</strong> {selectedReturn.supplierName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("email")}:</strong>{" "}
                    {selectedReturn.supplierEmail}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("orderId")}:</strong> {selectedReturn.orderId}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("returnInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("returnReason")}:</strong>{" "}
                    {selectedReturn.return_reason}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("quantity")}:</strong> {selectedReturn.quantity}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("purchaseItem")}:</strong>{" "}
                    {selectedReturn.purchaseItemName ||
                      selectedReturn.purchase_item}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t("reason")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  {selectedReturn.reason}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t("returnedItems")}
                </h3>
                <div className="space-y-2">
                  {selectedReturn.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div className="flex-1">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.quantity}x {item.name}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t("reason")}: {item.reason}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${item.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReturn.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("notes")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedReturn.notes}
                  </p>
                </div>
              )}

              {selectedReturn.processedBy && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("processingInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("processedBy")}:</strong>{" "}
                    {selectedReturn.processedBy}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("processedDate")}:</strong>{" "}
                    {new Date(selectedReturn.processedDate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("editReturn")} - {selectedReturn.id}
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
                  <option value="approved">{t("approved")}</option>
                  <option value="rejected">{t("rejected")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("refundAmount")}
                </label>
                <input
                  type="number"
                  value={editForm.refundAmount}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      refundAmount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("refundMethod")}
                </label>
                <select
                  value={editForm.refundMethod || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, refundMethod: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t("selectMethod")}</option>
                  <option value="bank_transfer">{t("bankTransfer")}</option>
                  <option value="check">{t("check")}</option>
                  <option value="cash">{t("cash")}</option>
                </select>
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
      {deleteModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("deleteReturn")}
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
                    {t("confirmDeleteReturn")}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {t("returnId")}: {selectedReturn.id}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("deleteReturnWarning")}
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

      {/* Form Modal */}
      <SellerReturnForm
        isOpen={formModal}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        returnItem={selectedReturnForForm}
        mode={formMode}
        suppliers={safeSuppliers}
      />
    </div>
  );
};

export default SupplierReturnsManagement;
