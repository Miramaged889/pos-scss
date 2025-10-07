import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  X,
  FileText,
  Calendar,
  User,
  Hash,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import {
  formatNumberEnglish,
  formatCurrencyEnglish,
  formatDateTimeEnglish,
} from "../../../utils/formatters";
import { CustomerInvoiceForm } from "../../../components/Forms/SellerForms";
import {
  fetchCustomerInvoices,
  updateCustomerInvoice,
  deleteCustomerInvoice,
} from "../../../store/slices/customerInvoiceSlice";

const PaymentManagement = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const { customerInvoices, loading, error } = useSelector(
    (state) => state.customerInvoices
  );
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [dateRange, setDateRange] = useState("all"); // all | today | week | month | custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCustomerInvoiceOpen, setIsCustomerInvoiceOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Fetch customer invoices on component mount
  useEffect(() => {
    dispatch(fetchCustomerInvoices());
  }, [dispatch]);

  // Convert customer invoices to payment format for display
  const payments = customerInvoices.map((invoice) => ({
    id: invoice.id,
    transactionId: `INV-${invoice.id}`,
    orderId: invoice.orderId || `ORD-${invoice.id}`,
    customer: invoice.customerName,
    customerPhone: invoice.customerPhone,
    amount: invoice.total || invoice.subTotal,
    method: "invoice", // Customer invoices are treated as invoice payments
    fees: 0, // No fees for customer invoices
    status: invoice.status,
    paymentDate: invoice.createdAt,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    description: invoice.notes || t("customerInvoice"),
    items: invoice.items || [],
  }));

  const totalTransactions = payments.length;
  const completedPayments = payments.filter((p) => p.status === "completed");
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalFees = completedPayments.reduce((sum, p) => sum + p.fees, 0);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    // Date filter
    let matchesDate = true;
    if (dateRange !== "all") {
      const created = new Date(
        payment.paymentDate || payment.collectedAt || payment.createdAt
      );
      const now = new Date();
      if (dateRange === "today") {
        matchesDate = created.toDateString() === new Date().toDateString();
      } else if (dateRange === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = created >= weekAgo && created <= now;
      } else if (dateRange === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = created >= monthAgo && created <= now;
      } else if (dateRange === "custom") {
        const fromOk = startDate ? created >= new Date(startDate) : true;
        const toOk = endDate
          ? created <= new Date(endDate + "T23:59:59")
          : true;
        matchesDate = fromOk && toOk;
      }
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = [
    {
      title: t("totalTransactions"),
      value: formatNumberEnglish(totalTransactions),
      icon: CreditCard,
      color: "blue",
    },
    {
      title: t("totalRevenue"),
      value: formatCurrencyEnglish(totalRevenue, t("currency")),
      icon: DollarSign,
      color: "green",
    },
    {
      title: t("pendingPayments"),
      value: formatNumberEnglish(pendingPayments),
      icon: AlertCircle,
      color: "yellow",
    },
    {
      title: t("transactionFees"),
      value: formatCurrencyEnglish(totalFees, t("currency")),
      icon: TrendingUp,
      color: "purple",
    },
  ];

  const handleSubmitCustomerInvoice = (invoice) => {
    // Form already dispatches the action, just close the modal
    console.log("Customer invoice created successfully:", invoice);
    setIsCustomerInvoiceOpen(false);
  };

  const handleEditInvoice = (payment) => {
    // Find the original invoice data
    const originalInvoice = customerInvoices.find(
      (inv) => inv.id === payment.id
    );
    if (originalInvoice) {
      setEditingInvoice(originalInvoice);
      setEditModalOpen(true);
    }
  };

  const handleDeleteInvoice = async (payment) => {
    if (
      window.confirm(
        `${t("deleteInvoiceConfirmation")} ${payment.transactionId}?`
      )
    ) {
      try {
        const result = await dispatch(deleteCustomerInvoice(payment.id));
        if (result.type.endsWith("/fulfilled")) {
          toast.success(`${t("invoiceDeleted")} ${payment.transactionId}`);
        } else {
          toast.error(`${t("errorDeletingInvoice")}: ${result.payload}`);
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
        toast.error(`${t("errorDeletingInvoice")}: ${error.message}`);
      }
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditingInvoice(null);
  };

  const handleEditSubmit = async (updatedInvoice) => {
    try {
      const result = await dispatch(
        updateCustomerInvoice({
          id: editingInvoice.id,
          updates: updatedInvoice,
        })
      );

      if (result.type.endsWith("/fulfilled")) {
        handleEditModalClose();
        toast.success(`${t("invoiceUpdated")} INV-${editingInvoice.id}`);
      } else {
        toast.error(`${t("errorUpdatingInvoice")}: ${result.payload}`);
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error(`${t("errorUpdatingInvoice")}: ${error.message}`);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "card":
        return <CreditCard className="w-4 h-4" />;
      case "cash":
        return <DollarSign className="w-4 h-4" />;
      case "kent":
        return <CreditCard className="w-4 h-4" />;
      case "digital":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setViewModalOpen(true);
  };

  const handleDownloadReceipt = (payment) => {
    const receiptContent = `
=================================
          فاتورة دفع / PAYMENT RECEIPT
=================================

رقم المعاملة / Transaction ID: ${payment.transactionId}
رقم الطلب / Order ID: ${payment.orderId}
التاريخ / Date: ${formatDateTimeEnglish(payment.paymentDate)}

---------------------------------
العميل / Customer: ${payment.customer}
الهاتف / Phone: ${payment.customerPhone || "غير متوفر"}

---------------------------------
الوصف / Description: ${payment.description}
المبلغ / Amount: ${formatCurrencyEnglish(payment.amount, t("currency"))}
الرسوم / Fees: ${formatCurrencyEnglish(payment.fees, t("currency"))}
الإجمالي / Total: ${formatCurrencyEnglish(
      payment.amount + payment.fees,
      t("currency")
    )}

طريقة الدفع / Payment Method: ${t(payment.method)}
الحالة / Status: ${t(payment.status)}

=================================
شكراً لك / Thank You!
=================================
    `;

    const blob = new Blob([receiptContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt_${payment.transactionId}_${payment.orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const paymentColumns = [
    {
      header: t("transactionId"),
      accessor: "transactionId",
      render: (payment) => (
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {payment.transactionId}
        </span>
      ),
    },
    {
      header: t("orderId"),
      accessor: "orderId",
      render: (payment) => (
        <span className="font-mono text-sm font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
          {payment.orderId}
        </span>
      ),
    },
    {
      header: t("customer"),
      accessor: "customer",
    },
    {
      header: t("amount"),
      accessor: "amount",
      render: (payment) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {formatCurrencyEnglish(payment.amount, t("currency"))}
        </span>
      ),
    },
    {
      header: t("method"),
      accessor: "method",
      render: (payment) => (
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
          <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
            {getPaymentMethodIcon(payment.method)}
          </div>
          <span className="capitalize font-medium">{t(payment.method)}</span>
        </div>
      ),
    },
    {
      header: t("fees"),
      accessor: "fees",
      render: (payment) => (
        <span className="text-orange-600 dark:text-orange-400 font-medium">
          {formatCurrencyEnglish(payment.fees, t("currency"))}
        </span>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (payment) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            payment.status === "completed"
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
              : payment.status === "pending"
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
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
      header: t("dueDate"),
      accessor: "dueDate",
      render: (payment) => (
        <span
          className={`text-gray-600 dark:text-gray-400 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {formatDateTimeEnglish(payment.dueDate)}
        </span>
      ),
    },

    {
      header: t("actions"),
      accessor: "actions",
      render: (payment) => (
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
          <button
            onClick={() => handleViewPayment(payment)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("viewTransaction")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditInvoice(payment)}
            className="p-2 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("edit")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteInvoice(payment)}
            className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownloadReceipt(payment)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("downloadReceipt")}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {t("loadingInvoices")}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchCustomerInvoices())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
        <div
          className={`flex items-center justify-between ${
            isRTL ? "flex-row" : ""
          }`}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("payments")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("managePaymentsAndTransactions")}
            </p>
          </div>
          <button
            onClick={() => setIsCustomerInvoiceOpen(true)}
            className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <FileText className="w-4 h-4" />
            {isRTL ? "إضافة فاتورة عميل" : "Add Customer Invoice"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

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
                placeholder={t("searchTransactions")}
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
              <option value="all">{t("allTransactions")}</option>
              <option value="completed">{t("completed")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="failed">{t("failed")}</option>
            </select>
          </div>

          {/* Date Range */}
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                isRTL ? "text-right" : "text-left"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <option value="all">{t("allTime")}</option>
              <option value="today">{t("today")}</option>
              <option value="week">{t("thisWeek")}</option>
              <option value="month">{t("thisMonth")}</option>
              <option value="custom">{t("customRange")}</option>
            </select>
          </div>
        </div>
        {dateRange === "custom" && (
          <div
            className={`mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 ${
              isRTL ? "sm:flex-row-reverse" : ""
            }`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("fromDate")}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("toDate")}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <DataTable
          data={filteredPayments}
          columns={paymentColumns}
          searchable={false}
          pageable={true}
        />
      </div>

      {viewModalOpen && selectedPayment && (
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
                    {t("viewTransactions")}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPayment.transactionId}
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
                      {t("transactionId")}
                    </label>
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row" : ""
                      }`}
                    >
                      <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">
                        {selectedPayment.transactionId}
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
                        {selectedPayment.orderId}
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
                        {selectedPayment.customer}
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
                        {formatDateTimeEnglish(
                          selectedPayment.issueDate ||
                            selectedPayment.paymentDate
                        )}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("dueDate")}
                    </label>
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row" : ""
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {formatDateTimeEnglish(selectedPayment.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("method")}
                    </label>
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row" : ""
                      }`}
                    >
                      {getPaymentMethodIcon(selectedPayment.method)}
                      <span className="text-gray-900 dark:text-white capitalize">
                        {t(selectedPayment.method)}
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
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedPayment.status === "completed"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                          : selectedPayment.status === "pending"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                      }`}
                    >
                      {selectedPayment.status === "completed" && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {selectedPayment.status === "pending" && (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {selectedPayment.status === "failed" && (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {t(selectedPayment.status)}
                    </span>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t("amount")}
                    </label>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatCurrencyEnglish(
                        selectedPayment.amount,
                        t("currency")
                      )}
                    </span>
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t("fees")}
                    </label>
                    <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {formatCurrencyEnglish(
                        selectedPayment.fees,
                        t("currency")
                      )}
                    </span>
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t("total")}
                    </label>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrencyEnglish(
                        selectedPayment.amount + selectedPayment.fees,
                        t("currency")
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              {selectedPayment.method === "cash" &&
                selectedPayment.assignedDriver && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3
                      className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("deliveryInformation")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {t("assignedDriver")}
                        </label>
                        <span className="text-gray-900 dark:text-white">
                          {selectedPayment.assignedDriver}
                        </span>
                      </div>
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {t("collectionStatus")}
                        </label>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedPayment.status === "completed"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                          }`}
                        >
                          {selectedPayment.status === "completed" ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {t("collected")}
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {t("pendingCollection")}
                            </>
                          )}
                        </span>
                        {selectedPayment.status === "completed" &&
                          selectedPayment.collectedAt && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {t("collectedAt")}:{" "}
                              {formatDateTimeEnglish(
                                selectedPayment.collectedAt
                              )}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                )}

              {selectedPayment.description && (
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
                    {selectedPayment.description}
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
                onClick={() => handleDownloadReceipt(selectedPayment)}
                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <Download className="w-4 h-4" />
                {t("downloadReceipt")}
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

      {/* Customer Invoice Form Modal */}
      <CustomerInvoiceForm
        isOpen={isCustomerInvoiceOpen}
        onClose={() => setIsCustomerInvoiceOpen(false)}
        onSubmit={handleSubmitCustomerInvoice}
      />

      {/* Edit Invoice Modal */}
      {editModalOpen && editingInvoice && (
        <CustomerInvoiceForm
          isOpen={editModalOpen}
          onClose={handleEditModalClose}
          onSubmit={handleEditSubmit}
          invoice={editingInvoice}
          mode="edit"
        />
      )}
    </div>
  );
};

export default PaymentManagement;
