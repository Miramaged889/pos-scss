import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  FileText,
  DollarSign,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Printer,
  Calendar,
  User,
  Building,
  Receipt,
  CreditCard,
  Wallet,
  Banknote,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Save,
  ArrowLeft,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  ExpenseVoucherForm,
  PaymentVoucherForm,
} from "../../../components/Forms/ManagerForms";
import { numberToWords } from "../../../utils/formatters";

const VouchersPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  // State for vouchers
  const [expenseVouchers, setExpenseVouchers] = useState([]);
  const [paymentVouchers, setPaymentVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [expenseModal, setExpenseModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [modalMode, setModalMode] = useState("add");

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = () => {
    setLoading(true);
    // Mock data for expense vouchers
    const mockExpenseVouchers = [
      {
        id: "EXP-001",
        voucherNumber: "EXP-2024-001",
        date: "2024-01-15",
        amount: 500.0,
        description: "Office supplies purchase",
        category: "office_supplies",
        paymentMethod: "cash",
        recipient: "Office Store",
        notes: "Monthly office supplies",
        status: "approved",
        createdAt: "2024-01-15T10:30:00",
      },
      {
        id: "EXP-002",
        voucherNumber: "EXP-2024-002",
        date: "2024-01-14",
        amount: 1200.0,
        description: "Equipment maintenance",
        category: "maintenance",
        paymentMethod: "bank_transfer",
        recipient: "Tech Services Co.",
        notes: "Computer maintenance services",
        status: "pending",
        createdAt: "2024-01-14T14:20:00",
      },
    ];

    // Mock data for payment vouchers
    const mockPaymentVouchers = [
      {
        id: "PAY-001",
        voucherNumber: "PAY-2024-001",
        date: "2024-01-15",
        amount: 2500.0,
        supplier: "ABC Suppliers",
        invoiceNumber: "INV-2024-001",
        paymentMethod: "bank_transfer",
        description: "Raw materials payment",
        notes: "Payment for January materials",
        status: "completed",
        createdAt: "2024-01-15T11:30:00",
      },
      {
        id: "PAY-002",
        voucherNumber: "PAY-2024-002",
        date: "2024-01-14",
        amount: 1800.0,
        supplier: "XYZ Manufacturing",
        invoiceNumber: "INV-2024-002",
        paymentMethod: "check",
        description: "Component parts payment",
        notes: "Payment for electronic components",
        status: "pending",
        createdAt: "2024-01-14T16:45:00",
      },
    ];

    setTimeout(() => {
      setExpenseVouchers(mockExpenseVouchers);
      setPaymentVouchers(mockPaymentVouchers);
      setLoading(false);
    }, 1000);
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
      completed: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        icon: CheckCircle,
      },
      rejected: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: AlertCircle,
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
      bank_transfer: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        text: t("bankTransfer"),
      },
      credit_card: {
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        text: t("creditCard"),
      },
      check: {
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        text: t("check"),
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

  const handleAddExpense = () => {
    setModalMode("add");
    setEditingVoucher(null);
    setExpenseModal(true);
  };

  const handleAddPayment = () => {
    setModalMode("add");
    setEditingVoucher(null);
    setPaymentModal(true);
  };

  const handleViewVoucher = (voucher, type) => {
    setSelectedVoucher({ ...voucher, type });
    setViewModal(true);
  };

  const handleEditVoucher = (voucher, type) => {
    setModalMode("edit");
    setEditingVoucher(voucher);
    if (type === "expense") {
      setExpenseModal(true);
    } else {
      setPaymentModal(true);
    }
  };

  const handleDeleteVoucher = (voucher, type) => {
    if (type === "expense") {
      setExpenseVouchers(expenseVouchers.filter((v) => v.id !== voucher.id));
    } else {
      setPaymentVouchers(paymentVouchers.filter((v) => v.id !== voucher.id));
    }
    toast.success(t("voucherDeleted"));
  };

  const handleExpenseSubmit = (voucherData) => {
    if (modalMode === "add") {
      const newVoucher = {
        ...voucherData,
        id: `EXP-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setExpenseVouchers([newVoucher, ...expenseVouchers]);
      toast.success(t("expenseVoucherCreated"));
    } else {
      const updatedVouchers = expenseVouchers.map((voucher) =>
        voucher.id === editingVoucher.id ? voucherData : voucher
      );
      setExpenseVouchers(updatedVouchers);
      toast.success(t("expenseVoucherUpdated"));
    }
    setExpenseModal(false);
  };

  const handlePaymentSubmit = (voucherData) => {
    if (modalMode === "add") {
      const newVoucher = {
        ...voucherData,
        id: `PAY-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setPaymentVouchers([newVoucher, ...paymentVouchers]);
      toast.success(t("paymentVoucherCreated"));
    } else {
      const updatedVouchers = paymentVouchers.map((voucher) =>
        voucher.id === editingVoucher.id ? voucherData : voucher
      );
      setPaymentVouchers(updatedVouchers);
      toast.success(t("paymentVoucherUpdated"));
    }
    setPaymentModal(false);
  };

  const handlePrintVoucher = (voucher) => {
    const printWindow = window.open("", "_blank");

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>${voucher.type === "expense" ? "سند صرف" : "سند دفع"} - ${
      voucher.voucherNumber
    }</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 20px; 
              direction: rtl;
              text-align: right;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .voucher-info { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 30px; 
            }
            .info-section { 
              flex: 1; 
              margin: 0 10px;
            }
            .amount-section {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              border: 2px solid #333;
              border-radius: 8px;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
            }
            .signature-box {
              border-top: 1px solid #333;
              padding-top: 10px;
              text-align: center;
              width: 200px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${voucher.type === "expense" ? "سند صرف" : "سند دفع"}</h1>
            <h2>${voucher.voucherNumber}</h2>
          </div>
          
          <div class="voucher-info">
            <div class="info-section">
              <h3>معلومات السند</h3>
              <p><strong>رقم السند:</strong> ${voucher.voucherNumber}</p>
              <p><strong>التاريخ:</strong> ${voucher.date}</p>
              <p><strong>المبلغ:</strong> ${voucher.amount.toFixed(2)} ${t(
      "currency"
    )}</p>
              <p><strong>طريقة الدفع:</strong> ${getPaymentMethodText(
                voucher.paymentMethod
              )}</p>
            </div>
            
            <div class="info-section">
              <h3>${
                voucher.type === "expense"
                  ? "معلومات المستلم"
                  : "معلومات المورد"
              }</h3>
              <p><strong>${
                voucher.type === "expense" ? "المستلم:" : "المورد:"
              }</strong> ${
      voucher.type === "expense" ? voucher.recipient : voucher.supplier
    }</p>
              <p><strong>الوصف:</strong> ${voucher.description}</p>
              ${
                voucher.type === "payment"
                  ? `<p><strong>رقم الفاتورة:</strong> ${voucher.invoiceNumber}</p>`
                  : ""
              }
            </div>
          </div>
          
          <div class="amount-section">
            <h2>المبلغ: ${voucher.amount.toFixed(2)} ${t("currency")}</h2>
            <p>${numberToWords(voucher.amount)}</p>
          </div>
          
          ${
            voucher.notes
              ? `
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
              <h4>ملاحظات:</h4>
              <p>${voucher.notes}</p>
            </div>
          `
              : ""
          }
          
          <div class="signatures">
            <div class="signature-box">
              <p>المصادق عليه</p>
            </div>
            <div class="signature-box">
              <p>المستلم</p>
            </div>
            <div class="signature-box">
              <p>المحاسب</p>
            </div>
          </div>
          
          <div class="no-print" style="margin-top: 50px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              طباعة السند
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
              إغلاق
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };

    toast.success(t("voucherPrinted"));
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      cash: "نقداً",
      bank_transfer: "تحويل بنكي",
      credit_card: "بطاقة ائتمان",
      check: "شيك",
    };
    return methods[method] || method;
  };

  const getStats = () => {
    const totalExpenses = expenseVouchers.reduce(
      (sum, voucher) => sum + voucher.amount,
      0
    );
    const totalPayments = paymentVouchers.reduce(
      (sum, voucher) => sum + voucher.amount,
      0
    );
    const pendingExpenses = expenseVouchers.filter(
      (voucher) => voucher.status === "pending"
    ).length;
    const pendingPayments = paymentVouchers.filter(
      (voucher) => voucher.status === "pending"
    ).length;

    return {
      totalExpenses: totalExpenses.toFixed(2),
      totalPayments: totalPayments.toFixed(2),
      pendingExpenses,
      pendingPayments,
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className={isRTL ? "text-right" : "text-left"}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("vouchers")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageFinancialVouchers")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddExpense}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("addExpenseVoucher")}
          </button>
          <button
            onClick={handleAddPayment}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("addPaymentVoucher")}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("totalExpenses")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalExpenses} {t("currency")}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("totalPayments")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalPayments} {t("currency")}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("pendingExpenses")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pendingExpenses}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("pendingPayments")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pendingPayments}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Vouchers Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Vouchers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("expenseVouchers")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("generalExpenses")}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {expenseVouchers.length} {t("vouchers")}
              </span>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t("loading")}...
                </p>
              </div>
            ) : expenseVouchers.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t("noExpenseVouchers")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {expenseVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {voucher.voucherNumber}
                        </span>
                        {getStatusBadge(voucher.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewVoucher(voucher, "expense")}
                          className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t("view")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handlePrintVoucher({ ...voucher, type: "expense" })
                          }
                          className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          title={t("print")}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditVoucher(voucher, "expense")}
                          className="p-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                          title={t("edit")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteVoucher(voucher, "expense")
                          }
                          className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title={t("delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {t("amount")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {Number(voucher.amount).toFixed(2)} {t("currency")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {t("date")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(voucher.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {t("recipient")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {voucher.recipient}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {t("paymentMethod")}
                        </p>
                        {getPaymentMethodBadge(voucher.paymentMethod)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Vouchers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Receipt className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("paymentVouchers")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("supplierPayments")}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {paymentVouchers.length} {t("vouchers")}
              </span>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t("loading")}...
                </p>
              </div>
            ) : paymentVouchers.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t("noPaymentVouchers")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {voucher.voucherNumber}
                        </span>
                        {getStatusBadge(voucher.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewVoucher(voucher, "payment")}
                          className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t("view")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handlePrintVoucher({ ...voucher, type: "payment" })
                          }
                          className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          title={t("print")}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditVoucher(voucher, "payment")}
                          className="p-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                          title={t("edit")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteVoucher(voucher, "payment")
                          }
                          className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title={t("delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {t("amount")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {Number(voucher.amount).toFixed(2)} {t("currency")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {t("date")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(voucher.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {t("supplier")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {voucher.supplier}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {t("paymentMethod")}
                        </p>
                        {getPaymentMethodBadge(voucher.paymentMethod)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseVoucherForm
        isOpen={expenseModal}
        onClose={() => setExpenseModal(false)}
        onSubmit={handleExpenseSubmit}
        voucher={editingVoucher}
        mode={modalMode}
      />

      {/* Payment Voucher Modal */}
      <PaymentVoucherForm
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        onSubmit={handlePaymentSubmit}
        voucher={editingVoucher}
        mode={modalMode}
      />

      {/* View Voucher Modal */}
      {viewModal && selectedVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedVoucher.type === "expense"
                  ? t("expenseVoucher")
                  : t("paymentVoucher")}{" "}
                - {selectedVoucher.voucherNumber}
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
                    {t("voucherInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("voucherNumber")}:</strong>{" "}
                    {selectedVoucher.voucherNumber}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("date")}:</strong>{" "}
                    {new Date(selectedVoucher.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("amount")}:</strong>{" "}
                    {Number(selectedVoucher.amount).toFixed(2)} {t("currency")}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("status")}:</strong>{" "}
                    {getStatusBadge(selectedVoucher.status)}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedVoucher.type === "expense"
                      ? t("expenseDetails")
                      : t("paymentDetails")}
                  </h3>
                  {selectedVoucher.type === "expense" ? (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>{t("recipient")}:</strong>{" "}
                        {selectedVoucher.recipient}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>{t("description")}:</strong>{" "}
                        {selectedVoucher.description}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>{t("category")}:</strong>{" "}
                        {selectedVoucher.category}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>{t("supplier")}:</strong>{" "}
                        {selectedVoucher.supplier}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>{t("invoiceNumber")}:</strong>{" "}
                        {selectedVoucher.invoiceNumber}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>{t("description")}:</strong>{" "}
                        {selectedVoucher.description}
                      </p>
                    </>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("paymentMethod")}:</strong>{" "}
                    {getPaymentMethodBadge(selectedVoucher.paymentMethod)}
                  </p>
                </div>
              </div>

              {selectedVoucher.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("notes")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedVoucher.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handlePrintVoucher(selectedVoucher)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  {t("print")}
                </button>
                <button
                  onClick={() => {
                    setViewModal(false);
                    handleEditVoucher(selectedVoucher, selectedVoucher.type);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {t("edit")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VouchersPage;
