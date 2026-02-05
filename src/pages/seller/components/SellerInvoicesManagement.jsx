import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Printer,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  Plus,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  fetchSupplierInvoices,
  createSupplierInvoice,
  updateSupplierInvoice,
  clearManagerError,
} from "../../../store/slices/managerSlice";
import { fetchSuppliers } from "../../../store/slices/supplierSlice";
import { fetchTenantInfo } from "../../../store/slices/tenantSlice";

import DataTable from "../../../components/Common/DataTable";
import { SellerInvoiceForm } from "../../../components/Forms";
import { useCurrency } from "../../../hooks";
import { currencyService } from "../../../services";

const SupplierInvoicesManagement = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { currency } = useCurrency();

  // Redux state
  const { invoices, loading, error } = useSelector((state) => state.manager);
  const { suppliers } = useSelector((state) => state.suppliers);

  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Modal states
  const [viewModal, setViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form modal states
  const [formModal, setFormModal] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedInvoiceForForm, setSelectedInvoiceForForm] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    dispatch(fetchSupplierInvoices());
    dispatch(fetchSuppliers());
    dispatch(fetchTenantInfo());
    
    // Fetch payment methods from API
    const fetchPaymentMethods = async () => {
      try {
        const response = await currencyService.getCurrencies();
        const currenciesList = Array.isArray(response)
          ? response
          : response.results || response.data || [];
        
        // Filter only active currencies and map to payment methods format
        const activePaymentMethods = currenciesList
          .filter((currency) => currency.is_active === true)
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map((currency) => ({
            id: currency.id?.toString() || String(currency.id || ""),
            name: currency.name || currency.code || "",
            code: currency.code || "",
            icon: currency.icon || null,
          }));
        
        setPaymentMethods(activePaymentMethods);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        setPaymentMethods([]);
      }
    };

    fetchPaymentMethods();
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearManagerError());
    };
  }, [dispatch]);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Safe supplier data getter
  const getSafeSuppliers = useCallback(() => {
    if (!suppliers) return [];
    if (Array.isArray(suppliers)) return suppliers;
    if (
      typeof suppliers === "object" &&
      suppliers.data &&
      Array.isArray(suppliers.data)
    ) {
      return suppliers.data;
    }
    return [];
  }, [suppliers]);

  // Get supplier name by ID
  const getSupplierName = useCallback(
    (supplierId) => {
      const safeSuppliers = getSafeSuppliers();
      const supplier = safeSuppliers.find((s) => s.id === supplierId);
      return supplier
        ? supplier.supplier_name || supplier.name
        : `Supplier ${supplierId}`;
    },
    [getSafeSuppliers]
  );

  // Get supplier email by ID
  const getSupplierEmail = useCallback(
    (supplierId) => {
      const safeSuppliers = getSafeSuppliers();
      const supplier = safeSuppliers.find((s) => s.id === supplierId);
      return supplier ? supplier.email : "";
    },
    [getSafeSuppliers]
  );

  const filterInvoices = useCallback(() => {
    let filtered = [...(invoices || [])];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.id
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getSupplierName(invoice.supplier)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getSupplierEmail(invoice.supplier)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    // Supplier filter
    if (supplierFilter !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.supplier?.toString() === supplierFilter.toString()
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((invoice) => {
        if (!invoice.issue_date) return false;
        const invoiceDate = new Date(invoice.issue_date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    }

    setFilteredInvoices(filtered);
  }, [
    invoices,
    searchTerm,
    statusFilter,
    supplierFilter,
    dateRange,
    getSupplierName,
    getSupplierEmail,
  ]);

  useEffect(() => {
    filterInvoices();
  }, [filterInvoices]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      Paid: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle,
      },
      Pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock,
      },
      Overdue: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {t(status.toLowerCase())}
      </span>
    );
  };

  // Get payment method details by ID
  const getPaymentMethodDetails = (methodId) => {
    if (!methodId) return null;
    const methodIdStr = String(methodId);
    return paymentMethods.find(
      (method) => method.id === methodIdStr || method.id?.toString() === methodIdStr
    );
  };

  // Get payment method name
  const getPaymentMethodName = (methodId) => {
    const method = getPaymentMethodDetails(methodId);
    if (method) return method.name;
    
    // Fallback for old string-based methods
    if (typeof methodId === "string") {
      switch (methodId) {
        case "Bank Transfer":
          return t("bankTransfer");
        case "Check":
          return t("check");
        case "Cash":
          return t("cash");
        case "cash":
          return t("cash");
        case "card":
          return t("card");
        case "knet":
          return t("knet");
        case "digital":
          return t("digital");
        default:
          return methodId;
      }
    }
    
    return methodId?.toString() || t("unknown");
  };

  // Get payment method color based on code or name
  const getPaymentMethodColor = (methodId) => {
    const method = getPaymentMethodDetails(methodId);
    
    if (method) {
      const code = method.code?.toLowerCase() || method.name?.toLowerCase() || "";
      if (code.includes("cash") || code.includes("نقد")) {
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      }
      if (code.includes("card") || code.includes("credit")) {
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      }
      if (code.includes("transfer") || code.includes("bank")) {
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      }
      if (code.includes("check")) {
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      }
    }
    
    // Fallback for old string-based methods
    if (typeof methodId === "string") {
      switch (methodId) {
        case "Bank Transfer":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
        case "Check":
          return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
        case "Cash":
        case "cash":
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
        case "card":
        case "knet":
        case "digital":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      }
    }
    
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  };

  const getPaymentMethodBadge = (method) => {
    const color = getPaymentMethodColor(method);
    const text = getPaymentMethodName(method);

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}
      >
        {text}
      </span>
    );
  };

  const columns = [
    {
      header: t("invoiceId"),
      accessor: "id",
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {item.id}
        </span>
      ),
    },
    {
      header: t("supplier"),
      accessor: "supplier",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {getSupplierName(item.supplier)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getSupplierEmail(item.supplier)}
          </p>
        </div>
      ),
    },
    {
      header: t("amount"),
      accessor: "total",
      render: (item) => {
        try {
          const itemsTotal =
            item.items?.reduce((sum, item) => {
              return sum + (parseFloat(item.subtotal || item.total) || 0);
            }, 0) || 0;
          const tax = parseFloat(item.tax) || 0;
          const total = itemsTotal + tax;
          return (
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {total.toFixed(2)}{currency()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tax: {tax.toFixed(2)}{currency()}
              </p>
            </div>
          );
        } catch (error) {
          console.warn("Error calculating item total:", error, item);
          return (
            <div>
              <p className="font-medium text-gray-900 dark:text-white">0.00{currency()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tax: 0.00{currency()}
              </p>
            </div>
          );
        }
      },
    },
    {
      header: t("status"),
      accessor: "status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      header: t("payment"),
      accessor: "payment_method",
      render: (item) => getPaymentMethodBadge(item.payment_method),
    },
    {
      header: t("issueDate"),
      accessor: "issue_date",
      render: (item) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            {new Date(item.issue_date).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Due: {new Date(item.due_date).toLocaleDateString()}
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
            onClick={() => handleViewInvoice(item)}
            className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title={t("view")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePrintInvoice(item)}
            className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            title={t("print")}
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSendInvoice(item)}
            className="p-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            title={t("send")}
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewModal(true);
  };

  const handlePrintInvoice = (invoice) => {
    console.log("Print invoice:", invoice);
    toast.success(t("invoicePrinted"));
  };

  const handleSendInvoice = (invoice) => {
    console.log("Send invoice:", invoice);
    toast.success(t("invoiceSent"));
  };

  // Form handlers
  const handleAddInvoice = () => {
    setFormMode("add");
    setSelectedInvoiceForForm(null);
    setFormModal(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === "add") {
        await dispatch(createSupplierInvoice(formData)).unwrap();
        toast.success(t("invoiceAddedSuccessfully"));
      } else {
        await dispatch(
          updateSupplierInvoice({
            id: selectedInvoiceForForm.id,
            invoiceData: formData,
          })
        ).unwrap();
        toast.success(t("invoiceUpdatedSuccessfully"));
      }
      setFormModal(false);
    } catch (error) {
      toast.error(error || t("operationFailed"));
    }
  };

  const handleFormClose = () => {
    setFormModal(false);
    setSelectedInvoiceForForm(null);
  };

  const handleExportInvoices = () => {
    console.log("Export invoices");
    toast.success(t("invoicesExported"));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSupplierFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // Get statistics
  const getStats = () => {
    const invoiceList = invoices || [];
    const totalInvoices = invoiceList.length;
    const paidInvoices = invoiceList.filter(
      (invoice) => invoice.status === "Paid"
    ).length;
    const pendingInvoices = invoiceList.filter(
      (invoice) => invoice.status === "Pending"
    ).length;

    const totalAmount = invoiceList.reduce((sum, invoice) => {
      try {
        const itemsTotal =
          invoice.items?.reduce((itemSum, item) => {
            return itemSum + (parseFloat(item.subtotal || item.total) || 0);
          }, 0) || 0;
        const tax = parseFloat(invoice.tax) || 0;
        return sum + itemsTotal + tax;
      } catch (error) {
        console.warn("Error calculating invoice total:", error, invoice);
        return sum;
      }
    }, 0);

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalAmount:
        typeof totalAmount === "number" ? totalAmount.toFixed(2) : "0.00",
    };
  };

  const stats = getStats();
  const safeSuppliers = getSafeSuppliers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("supplierInvoicesManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageAllSupplierInvoices")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddInvoice}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("addInvoice")}
          </button>
          <button
            onClick={handleExportInvoices}
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
                {t("totalInvoices")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalInvoices}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("paidInvoices")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.paidInvoices}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("pendingInvoices")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pendingInvoices}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("totalAmount")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalAmount} {currency()}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  placeholder={t("searchInvoices")}
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
                <option value="Paid">{t("paid")}</option>
                <option value="Pending">{t("pending")}</option>
                <option value="Overdue">{t("overdue")}</option>
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
                    {supplier.supplier_name || supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("dateRange")}
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t("from")}
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t("to")}
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
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
          {t("showing")} {filteredInvoices.length} {t("of")}{" "}
          {(invoices || []).length} {t("invoices")}
        </p>
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {safeSuppliers.length} {t("activeSuppliers")}
          </span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <DataTable
          data={filteredInvoices}
          columns={columns}
          loading={loading}
          searchable={false}
        />
      </div>

      {/* View Modal */}
      {viewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("invoiceDetails")} - {selectedInvoice.id}
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
                    <strong>{t("name")}:</strong>{" "}
                    {getSupplierName(selectedInvoice.supplier)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("email")}:</strong>{" "}
                    {getSupplierEmail(selectedInvoice.supplier)}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("invoiceInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("status")}:</strong>{" "}
                    {getStatusBadge(selectedInvoice.status)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("paymentMethod")}:</strong>{" "}
                    {getPaymentMethodBadge(selectedInvoice.payment_method)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("total")}:</strong> 
                    {(() => {
                      try {
                        const itemsTotal =
                          selectedInvoice.items?.reduce((sum, item) => {
                            return (
                              sum +
                              (parseFloat(item.subtotal || item.total) || 0)
                            );
                          }, 0) || 0;
                        const tax = parseFloat(selectedInvoice.tax) || 0;
                        const total = itemsTotal + tax;
                        return total.toFixed(2) + currency();
                      } catch (error) {
                        console.warn(
                          "Error calculating total:",
                          error,
                          selectedInvoice
                        );
                        return "0.00" + currency();
                      }
                    })()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t("items")}
                </h3>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, index) => {
                    try {
                      const quantity = parseFloat(item.quantity) || 0;
                      const subtotal =
                        parseFloat(item.subtotal || item.total) || 0;
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span className="text-sm text-gray-900 dark:text-white">
                            {quantity}x {item.item_name}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {subtotal.toFixed(2)}{currency()}
                          </span>
                        </div>
                      );
                    } catch (error) {
                      console.warn("Error displaying item:", error, item);
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span className="text-sm text-gray-900 dark:text-white">
                            {item.quantity || 0}x{" "}
                            {item.item_name || "Unknown Item"}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            0.00{currency()}
                          </span>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("notes")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <SellerInvoiceForm
        isOpen={formModal}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        invoice={selectedInvoiceForForm}
        mode={formMode}
        suppliers={safeSuppliers}
      />
    </div>
  );
};

export default SupplierInvoicesManagement;
