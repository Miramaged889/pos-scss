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
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  Plus,
  X,
  Save,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

import DataTable from "../../../components/Common/DataTable";
import { SupplierReturnForm } from "../../../components/Forms";

const SupplierReturnsManagement = () => {
  const { t } = useTranslation();
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [suppliers, setSuppliers] = useState([]);

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

  useEffect(() => {
    loadReturns();
    loadSuppliers();
  }, []);

  const filterReturns = useCallback(() => {
    let filtered = [...returns];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (returnItem) =>
          returnItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          returnItem.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          returnItem.supplierName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          returnItem.supplierEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          returnItem.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (returnItem) => returnItem.status === statusFilter
      );
    }

    // Supplier filter
    if (supplierFilter !== "all") {
      filtered = filtered.filter(
        (returnItem) => returnItem.supplierId === supplierFilter
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((returnItem) => {
        const returnDate = new Date(returnItem.returnDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return returnDate >= startDate && returnDate <= endDate;
      });
    }

    setFilteredReturns(filtered);
  }, [returns, searchTerm, statusFilter, supplierFilter, dateRange]);

  useEffect(() => {
    filterReturns();
  }, [filterReturns]);

  const loadReturns = () => {
    setLoading(true);
    // Mock data for supplier returns
    const mockReturns = [
      {
        id: "SUP-RET-001",
        supplierId: "SUP-001",
        supplierName: "شركة الأغذية المتحدة",
        supplierEmail: "info@unitedfoods.com",
        orderId: "PO-001",
        invoiceId: "SUP-INV-001",
        returnDate: "2024-01-15T10:30:00",
        status: "approved",
        reason: "Damaged goods during transport",
        totalAmount: 2500.0,
        refundAmount: 2500.0,
        refundMethod: "bank_transfer",
        notes: "Return processed and refund issued",
        items: [
          {
            name: "Rice",
            quantity: 10,
            unitPrice: 50.0,
            total: 500.0,
            reason: "Damaged packaging",
          },
          {
            name: "Oil",
            quantity: 5,
            unitPrice: 80.0,
            total: 400.0,
            reason: "Leaking containers",
          },
          {
            name: "Sugar",
            quantity: 15,
            unitPrice: 40.0,
            total: 600.0,
            reason: "Contaminated",
          },
          {
            name: "Flour",
            quantity: 20,
            unitPrice: 50.0,
            total: 1000.0,
            reason: "Expired",
          },
        ],
        processedBy: "أحمد محمد",
        processedDate: "2024-01-16T14:30:00",
      },
      {
        id: "SUP-RET-002",
        supplierId: "SUP-002",
        supplierName: "مؤسسة البناء الحديث",
        supplierEmail: "contact@modernbuilding.com",
        orderId: "PO-002",
        invoiceId: "SUP-INV-002",
        returnDate: "2024-01-14T15:45:00",
        status: "pending",
        reason: "Wrong specifications delivered",
        totalAmount: 5000.0,
        refundAmount: 0.0,
        refundMethod: null,
        notes: "Awaiting supplier confirmation",
        items: [
          {
            name: "Cement",
            quantity: 50,
            unitPrice: 25.0,
            total: 1250.0,
            reason: "Wrong grade",
          },
          {
            name: "Steel",
            quantity: 10,
            unitPrice: 300.0,
            total: 3000.0,
            reason: "Incorrect dimensions",
          },
          {
            name: "Bricks",
            quantity: 200,
            unitPrice: 5.0,
            total: 1000.0,
            reason: "Wrong color",
          },
        ],
        processedBy: null,
        processedDate: null,
      },
      {
        id: "SUP-RET-003",
        supplierId: "SUP-003",
        supplierName: "شركة الإلكترونيات المتقدمة",
        supplierEmail: "sales@advancedelectronics.com",
        orderId: "PO-003",
        invoiceId: "SUP-INV-003",
        returnDate: "2024-01-13T18:20:00",
        status: "rejected",
        reason: "Customer changed mind",
        totalAmount: 8000.0,
        refundAmount: 0.0,
        refundMethod: null,
        notes: "Return rejected - not supplier's fault",
        items: [
          {
            name: "Laptops",
            quantity: 2,
            unitPrice: 2000.0,
            total: 4000.0,
            reason: "No technical issue",
          },
          {
            name: "Monitors",
            quantity: 4,
            unitPrice: 500.0,
            total: 2000.0,
            reason: "Working properly",
          },
          {
            name: "Printers",
            quantity: 1,
            unitPrice: 1500.0,
            total: 1500.0,
            reason: "Functional",
          },
        ],
        processedBy: "فاطمة أحمد",
        processedDate: "2024-01-14T09:15:00",
      },
      {
        id: "SUP-RET-004",
        supplierId: "SUP-004",
        supplierName: "مصنع النسيج الوطني",
        supplierEmail: "info@nationaltextile.com",
        orderId: "PO-004",
        invoiceId: "SUP-INV-004",
        returnDate: "2024-01-12T12:15:00",
        status: "approved",
        reason: "Quality issues",
        totalAmount: 1800.0,
        refundAmount: 1800.0,
        refundMethod: "check",
        notes: "Quality control failed - full refund issued",
        items: [
          {
            name: "Cotton Fabric",
            quantity: 15,
            unitPrice: 80.0,
            total: 1200.0,
            reason: "Poor quality",
          },
          {
            name: "Polyester",
            quantity: 10,
            unitPrice: 60.0,
            total: 600.0,
            reason: "Color fading",
          },
        ],
        processedBy: "خالد سعد",
        processedDate: "2024-01-13T11:45:00",
      },
      {
        id: "SUP-RET-005",
        supplierId: "SUP-005",
        supplierName: "شركة الأدوية العالمية",
        supplierEmail: "orders@globalpharma.com",
        orderId: "PO-005",
        invoiceId: "SUP-INV-005",
        returnDate: "2024-01-11T09:30:00",
        status: "approved",
        reason: "Expired products",
        totalAmount: 3500.0,
        refundAmount: 3500.0,
        refundMethod: "bank_transfer",
        notes: "Expired medications returned - safety concern",
        items: [
          {
            name: "Antibiotics",
            quantity: 50,
            unitPrice: 50.0,
            total: 2500.0,
            reason: "Expired",
          },
          {
            name: "Painkillers",
            quantity: 100,
            unitPrice: 15.0,
            total: 1500.0,
            reason: "Expired",
          },
        ],
        processedBy: "نورا عبدالله",
        processedDate: "2024-01-12T16:20:00",
      },
    ];

    setTimeout(() => {
      setReturns(mockReturns);
      setFilteredReturns(mockReturns);
      setLoading(false);
    }, 1000);
  };

  const loadSuppliers = () => {
    const mockSuppliers = [
      {
        id: "SUP-001",
        name: "شركة الأغذية المتحدة",
        email: "info@unitedfoods.com",
      },
      {
        id: "SUP-002",
        name: "مؤسسة البناء الحديث",
        email: "contact@modernbuilding.com",
      },
      {
        id: "SUP-003",
        name: "شركة الإلكترونيات المتقدمة",
        email: "sales@advancedelectronics.com",
      },
      {
        id: "SUP-004",
        name: "مصنع النسيج الوطني",
        email: "info@nationaltextile.com",
      },
      {
        id: "SUP-005",
        name: "شركة الأدوية العالمية",
        email: "orders@globalpharma.com",
      },
    ];
    setSuppliers(mockSuppliers);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle,
      },
      pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock,
      },
      rejected: {
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

  const getRefundMethodBadge = (method) => {
    if (!method) return null;

    const methodConfig = {
      bank_transfer: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        text: t("bankTransfer"),
      },
      check: {
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        text: t("check"),
      },
      cash: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        text: t("cash"),
      },
    };

    const config = methodConfig[method] || methodConfig.bank_transfer;

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
      header: t("returnId"),
      accessor: "id",
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {item.id}
        </span>
      ),
    },
    {
      header: t("orderId"),
      accessor: "orderId",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.orderId}
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
      accessor: "reason",
      render: (item) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 dark:text-white truncate">
            {item.reason}
          </p>
        </div>
      ),
    },
    {
      header: t("amount"),
      accessor: "totalAmount",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            ${item.totalAmount.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Refund: ${item.refundAmount.toFixed(2)}
          </p>
        </div>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      header: t("refund"),
      accessor: "refundMethod",
      render: (item) => getRefundMethodBadge(item.refundMethod),
    },
    {
      header: t("returnDate"),
      accessor: "returnDate",
      render: (item) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            {new Date(item.returnDate).toLocaleDateString()}
          </p>
          {item.processedDate && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Processed: {new Date(item.processedDate).toLocaleDateString()}
            </p>
          )}
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

  const handleProcessReturn = (returnItem) => {
    console.log("Process return:", returnItem);
    toast.success(t("returnProcessed"));
  };

  const handleDeleteReturn = (returnItem) => {
    setSelectedReturn(returnItem);
    setDeleteModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedReturn) return;

    const updatedReturns = returns.map((returnItem) =>
      returnItem.id === selectedReturn.id
        ? {
            ...returnItem,
            status: editForm.status,
            notes: editForm.notes,
            refundAmount: editForm.refundAmount,
            refundMethod: editForm.refundMethod,
            processedBy: "أحمد محمد",
            processedDate: new Date().toISOString(),
          }
        : returnItem
    );

    setReturns(updatedReturns);
    setEditModal(false);
    setSelectedReturn(null);
    setEditForm({});
    toast.success(t("returnUpdated"));
  };

  const handleConfirmDelete = () => {
    if (!selectedReturn) return;

    const updatedReturns = returns.filter(
      (returnItem) => returnItem.id !== selectedReturn.id
    );
    setReturns(updatedReturns);
    setDeleteModal(false);
    setSelectedReturn(null);
    toast.success(t("returnDeleted"));
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

  const handleFormSubmit = (formData) => {
    if (formMode === "add") {
      const newReturn = {
        ...formData,
        id: `SUP-RET-${Date.now()}`,
      };
      setReturns([newReturn, ...returns]);
      toast.success(t("returnAddedSuccessfully"));
    } else {
      const updatedReturns = returns.map((returnItem) =>
        returnItem.id === selectedReturnForForm.id ? formData : returnItem
      );
      setReturns(updatedReturns);
      toast.success(t("returnUpdatedSuccessfully"));
    }
    setFormModal(false);
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
    const totalReturns = returns.length;
    const approvedReturns = returns.filter(
      (returnItem) => returnItem.status === "approved"
    ).length;
    const pendingReturns = returns.filter(
      (returnItem) => returnItem.status === "pending"
    ).length;
    const totalRefundAmount = returns.reduce(
      (sum, returnItem) => sum + returnItem.refundAmount,
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
                {suppliers.map((supplier) => (
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
          {t("showing")} {filteredReturns.length} {t("of")} {returns.length}{" "}
          {t("returns")}
        </p>
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {suppliers.length} {t("activeSuppliers")}
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
                    <strong>{t("status")}:</strong>{" "}
                    {getStatusBadge(selectedReturn.status)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("totalAmount")}:</strong> $
                    {selectedReturn.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("refundAmount")}:</strong> $
                    {selectedReturn.refundAmount.toFixed(2)}
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
      <SupplierReturnForm
        isOpen={formModal}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        returnItem={selectedReturnForForm}
        mode={formMode}
        suppliers={suppliers}
      />
    </div>
  );
};

export default SupplierReturnsManagement;
