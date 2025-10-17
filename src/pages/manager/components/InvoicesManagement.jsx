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
  FileText,
  Printer,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
  X,
  Calendar,
  User,
  Hash,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import {
  formatNumberEnglish,
  formatCurrencyEnglish,
  formatDateTimeEnglish,
} from "../../../utils/formatters";
import { fetchOrders } from "../../../store/slices/ordersSlice";
import { customerService, tenantUsersService } from "../../../services";

const InvoicesManagement = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state) => state.language);

  // Get data from Redux store
  const { orders, loading, error } = useSelector((state) => state.orders);

  // Local state for API data
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [sellersData, setSellersData] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(false);

  // Local state for UI
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch customers from API
  const fetchCustomersData = async () => {
    try {
      setCustomersLoading(true);
      const response = await customerService.getCustomers();
      setCustomers(response);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Fetch sellers from API
  const fetchSellersData = async () => {
    try {
      setSellersLoading(true);
      const response = await tenantUsersService.getTenantUsers();
      setSellersData(response);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    } finally {
      setSellersLoading(false);
    }
  };

  // Helper function to get customer name by ID
  const getCustomerName = React.useCallback(
    (customerId) => {
      if (!customerId) return "Unknown Customer";

      let actualId = customerId;
      if (typeof customerId === "string" && customerId.includes("#")) {
        const match = customerId.match(/#(\d+)/);
        actualId = match ? parseInt(match[1]) : customerId;
      }

      const customer = customers.find(
        (c) =>
          c.id === actualId ||
          c.id === parseInt(actualId) ||
          c.id === actualId.toString() ||
          c.id === customerId ||
          c.id === parseInt(customerId) ||
          c.id === customerId.toString()
      );

      if (customer) {
        return (
          customer.customer_name || customer.name || `Customer #${actualId}`
        );
      }
      return `Customer #${actualId}`;
    },
    [customers]
  );

  // Helper function to get seller name by ID
  const getSellerName = React.useCallback(
    (sellerId) => {
      if (!sellerId) return "Unknown Seller";

      let actualId = sellerId;
      if (typeof sellerId === "string" && sellerId.includes("#")) {
        const match = sellerId.match(/#(\d+)/);
        actualId = match ? parseInt(match[1]) : sellerId;
      }

      const seller = sellersData.find(
        (s) =>
          s.id === actualId ||
          s.id === parseInt(actualId) ||
          s.id === actualId.toString() ||
          s.id === sellerId ||
          s.id === parseInt(sellerId) ||
          s.id === sellerId.toString()
      );

      return seller
        ? seller.username ||
            seller.name ||
            seller.user_name ||
            `Seller #${actualId}`
        : `Seller #${actualId}`;
    },
    [sellersData]
  );

  // Fetch orders on component mount
  useEffect(() => {
    dispatch(fetchOrders());
    fetchCustomersData();
    fetchSellersData();
  }, [dispatch]);

  // Generate invoices from orders data
  const invoices = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];

    return orders.map((order) => ({
      id: order.id,
      invoiceNumber: `INV-${order.id}`,
      customer: customersLoading ? "..." : getCustomerName(order.customer),
      customerName: customersLoading ? "..." : getCustomerName(order.customer),
      customerEmail: order.customer?.email || order.customerEmail || "",
      seller: sellersLoading ? "..." : getSellerName(order.sellerId),
      sellerName: sellersLoading ? "..." : getSellerName(order.sellerId),
      sellerEmail: order.seller?.email || order.sellerEmail || "",
      amount: (() => {
        const amount =
          order.total_amount || order.totalAmount || order.total || 0;
        return typeof amount === "string" ? parseFloat(amount) : amount;
      })(),
      total: (() => {
        const amount =
          order.total_amount || order.totalAmount || order.total || 0;
        return typeof amount === "string" ? parseFloat(amount) : amount;
      })(),
      status: order.status || "pending",
      date:
        order.createdAt || order.date || new Date().toISOString().split("T")[0],
      issueDate:
        order.createdAt || order.date || new Date().toISOString().split("T")[0],
      dueDate:
        order.dueDate ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      paymentStatus: order.paymentStatus || "pending",
      paymentMethod: order.paymentMethod || "cash",
      items: order.items || [],
      orderId: order.id,
      description: order.description || "",
      notes: order.notes || "",
    }));
  }, [
    orders,
    customersLoading,
    sellersLoading,
    getCustomerName,
    getSellerName,
  ]);

  // Compute unique sellers from orders
  const sellers = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];

    const uniqueSellers = new Set();
    orders.forEach((order) => {
      const sellerId = order.sellerId;
      if (sellerId) {
        const sellerName = getSellerName(sellerId);
        uniqueSellers.add(
          JSON.stringify({
            id: sellerId,
            email: order.seller?.email || order.sellerEmail || "",
            name: sellerName,
          })
        );
      }
    });

    return Array.from(uniqueSellers).map((seller) => JSON.parse(seller));
  }, [orders, getSellerName]);

  const filterInvoices = useCallback(() => {
    if (!Array.isArray(invoices)) {
      setFilteredInvoices([]);
      return;
    }

    let filtered = [...invoices];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          (invoice.id || "")
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (invoice.orderId || "")
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (invoice.customerName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (invoice.customerEmail || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (invoice.sellerName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    // Seller filter
    if (sellerFilter !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.sellerEmail === sellerFilter
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.issueDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter, sellerFilter, dateRange]);

  useEffect(() => {
    filterInvoices();
  }, [filterInvoices]);

  // Calculate stats
  const totalInvoices = invoices.length;
  const pendingInvoices = invoices.filter(
    (inv) => inv.status === "pending"
  ).length;
  const overdueInvoices = invoices.filter(
    (inv) => inv.status === "overdue"
  ).length;
  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const stats = [
    {
      title: t("totalInvoices"),
      value: formatNumberEnglish(totalInvoices),
      icon: FileText,
      color: "blue",
    },
    {
      title: t("totalRevenue"),
      value: formatCurrencyEnglish(totalRevenue, t("currency")),
      icon: DollarSign,
      color: "green",
    },
    {
      title: t("pendingInvoices"),
      value: formatNumberEnglish(pendingInvoices),
      icon: AlertCircle,
      color: "yellow",
    },
    {
      title: t("overdueInvoices"),
      value: formatNumberEnglish(overdueInvoices),
      icon: Clock,
      color: "red",
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle,
      },
      pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock,
      },
      overdue: {
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

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const handlePrintInvoice = (invoice) => {
    const printContent = `
=================================
          فاتورة / INVOICE
=================================

رقم الفاتورة / Invoice ID: ${invoice.id}
رقم الطلب / Order ID: ${invoice.orderId}
التاريخ / Date: ${formatDateTimeEnglish(invoice.issueDate)}
تاريخ الاستحقاق / Due Date: ${formatDateTimeEnglish(invoice.dueDate)}

---------------------------------
العميل / Customer: ${invoice.customerName}
البريد الإلكتروني / Email: ${invoice.customerEmail}
الهاتف / Phone: ${invoice.customerPhone || "غير متوفر"}

البائع / Seller: ${invoice.sellerName}
البريد الإلكتروني / Email: ${invoice.sellerEmail}

---------------------------------
 الوصف / Description: ${invoice.description || t("invoiceDescription")}
 الإجمالي / Total: ${formatCurrencyEnglish(invoice.total, t("currency"))}

طريقة الدفع / Payment Method: ${t(invoice.paymentMethod)}
الحالة / Status: ${t(invoice.status)}

الملاحظات / Notes: ${invoice.notes || t("noNotes")}

=================================
شكراً لك / Thank You!
=================================
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${t("invoice")} - ${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .section { margin: 15px 0; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <pre>${printContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleEditInvoice = (invoice) => {
    // For now, just show an alert. In a real app, you'd open an edit modal
    alert(
      `${t("editInvoice")} ${invoice.id}\n${t("editFunctionalityComingSoon")}`
    );
  };

  const handleDeleteInvoice = (invoice) => {
    if (window.confirm(`${t("deleteInvoiceConfirmation")} ${invoice.id}?`)) {
      // For now, just show alert. In real app, you'd dispatch delete action
      alert(`${t("invoiceDeleted")} ${invoice.id}`);
    }
  };

  const handleExportInvoices = () => {
    console.log("Export invoices");
    // Implement export functionality
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSellerFilter("all");
    setDateRange({ start: "", end: "" });
  };

  const invoiceColumns = [
    {
      header: t("invoiceId"),
      accessor: "id",
      render: (invoice) => (
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {invoice.id}
        </span>
      ),
    },
    {
      header: t("orderId"),
      accessor: "orderId",
      render: (invoice) => (
        <span className="font-mono text-sm font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
          {invoice.orderId}
        </span>
      ),
    },
    {
      header: t("customer"),
      accessor: "customerName",
      render: (invoice) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {invoice.customerName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {invoice.customerEmail}
          </p>
        </div>
      ),
    },
    {
      header: t("seller"),
      accessor: "sellerName",
      render: (invoice) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {invoice.sellerName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {invoice.sellerEmail}
          </p>
        </div>
      ),
    },
    {
      header: t("amount"),
      accessor: "total",
      render: (invoice) => (
        <div>
          <p className="font-semibold text-green-600 dark:text-green-400">
            {formatCurrencyEnglish(invoice.total, t("currency"))}
          </p>
        </div>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (invoice) => getStatusBadge(invoice.status),
    },
    {
      header: t("payment"),
      accessor: "paymentMethod",
      render: (invoice) => getPaymentMethodBadge(invoice.paymentMethod),
    },
    {
      header: t("issueDate"),
      accessor: "issueDate",
      render: (invoice) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatDateTimeEnglish(invoice.issueDate)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Due: {formatDateTimeEnglish(invoice.dueDate)}
          </p>
        </div>
      ),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: (invoice) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewInvoice(invoice)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("view")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePrintInvoice(invoice)}
            className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("print")}
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleEditInvoice(invoice)}
            className="p-2 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("edit")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteInvoice(invoice)}
            className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Show loading state
  if (loading || customersLoading || sellersLoading) {
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
        <div
          className={`flex items-center justify-between ${
            isRTL ? "flex-row" : ""
          }`}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("invoicesManagement")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("manageAllInvoices")}
            </p>
          </div>
          <button
            onClick={handleExportInvoices}
            className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <Download className="w-4 h-4" />
            {t("export")}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
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
          <div className="flex-1">
            <div className="relative">
              <Search
                className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />
              <input
                type="text"
                placeholder={t("searchInvoices")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                  isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
          </div>

          <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                isRTL ? "text-right" : "text-left"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="paid">{t("paid")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="overdue">{t("overdue")}</option>
            </select>
          </div>

          <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                isRTL ? "text-right" : "text-left"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <option value="all">{t("allSellers")}</option>
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.email}>
                  {seller.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? t("hideFilters") : t("showFilters")}
          </button>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
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
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {t("clearFilters")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("showing")} {filteredInvoices.length} {t("of")} {invoices.length}{" "}
          {t("invoices")}
        </p>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <DataTable
          data={filteredInvoices}
          columns={invoiceColumns}
          searchable={false}
          pageable={true}
          pageSize={10}
        />
      </div>

      {/* View Invoice Modal */}
      {viewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div
                className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t("viewInvoice")}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedInvoice.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("invoiceId")}
                    </label>
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row" : ""
                      }`}
                    >
                      <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">
                        {selectedInvoice.id}
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
                        {selectedInvoice.orderId}
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
                        {selectedInvoice.customerName}
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
                      {t("issueDate")}
                    </label>
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row" : ""
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {formatDateTimeEnglish(selectedInvoice.issueDate)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("paymentMethod")}
                    </label>
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row" : ""
                      }`}
                    >
                      {getPaymentMethodBadge(selectedInvoice.paymentMethod)}
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
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("financialDetails")}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t("total")}
                    </label>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrencyEnglish(
                        selectedInvoice.total,
                        t("currency")
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {selectedInvoice.description && (
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
                    {selectedInvoice.description}
                  </p>
                </div>
              )}

              {selectedInvoice.notes && (
                <div>
                  <label
                    className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {t("notes")}
                  </label>
                  <p
                    className={`text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}
            </div>

            <div
              className={`flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <button
                onClick={() => handlePrintInvoice(selectedInvoice)}
                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <Printer className="w-4 h-4" />
                {t("print")}
              </button>

              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesManagement;
