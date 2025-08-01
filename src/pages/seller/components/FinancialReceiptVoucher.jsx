import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  Receipt,
  DollarSign,
  FileText,
  Upload,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  Printer,
} from "lucide-react";
import { toast } from "react-hot-toast";

import ImageUploadModal from "../../../components/Forms/ManagerForms/ImageUploadModal";

const FinancialReceiptVoucher = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  const [receiptMode, setReceiptMode] = useState("customer"); // "customer" or "invoice"
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [receiptDate, setReceiptDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Mock data for demonstration - in real app, this would come from seller's customer/invoice data
  const [customers] = useState([
    {
      id: 1,
      name: "أحمد محمد",
      email: "ahmed@example.com",
      phone: "+966501234567",
      outstandingCredit: 5000,
      invoices: [],
    },
    {
      id: 2,
      name: "فاطمة علي",
      email: "fatima@example.com",
      phone: "+966507654321",
      outstandingCredit: 3200,
      invoices: [],
    },
    {
      id: 3,
      name: "محمد عبدالله",
      email: "mohammed@example.com",
      phone: "+966509876543",
      outstandingCredit: 7800,
      invoices: [],
    },
  ]);

  const [invoices] = useState([
    {
      id: 1,
      customerName: "أحمد محمد",
      amount: 2500,
      dueDate: "2024-01-15",
      status: "pending",
      invoiceNumber: "INV-001",
    },
    {
      id: 2,
      customerName: "فاطمة علي",
      amount: 1800,
      dueDate: "2024-01-20",
      status: "pending",
      invoiceNumber: "INV-002",
    },
    {
      id: 3,
      customerName: "محمد عبدالله",
      amount: 3200,
      dueDate: "2024-01-25",
      status: "pending",
      invoiceNumber: "INV-003",
    },
  ]);

  const [receipts, setReceipts] = useState([
    {
      id: 1,
      receiptNumber: "RCV-001",
      customerName: "أحمد محمد",
      amount: 1500,
      date: "2024-01-10",
      mode: "customer",
      status: "completed",
      description: "دفعة جزئية للمديونية",
      paymentMethod: "cash",
      referenceNumber: "REF-001",
    },
    {
      id: 2,
      receiptNumber: "RCV-002",
      customerName: "فاطمة علي",
      amount: 800,
      date: "2024-01-12",
      mode: "invoice",
      status: "completed",
      description: "دفعة على الفاتورة INV-002",
      paymentMethod: "bank_transfer",
      referenceNumber: "REF-002",
    },
  ]);

  // Action handlers for receipts table
  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setIsViewModalOpen(true);
  };

  const handleEditReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    // TODO: Implement edit functionality
    toast.info(t("financialReceipt.editReceipt"));
  };

  const handleDeleteReceipt = (receiptId) => {
    if (window.confirm(t("financialReceipt.confirmDelete"))) {
      setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
      toast.success(t("financialReceipt.success.receiptDeleted"));
    }
  };

  const handlePrintReceipt = (receipt) => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html dir="${isRTL ? "rtl" : "ltr"}">
        <head>
          <title>${t("financialReceipt.title")} - ${
      receipt.receiptNumber
    }</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt { border: 2px solid #333; padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; }
            .amount { font-weight: bold; color: #059669; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>${t("financialReceipt.title")}</h2>
              <p>${t("financialReceipt.receiptVoucher")}</p>
            </div>
            <div class="row">
              <span>${t("financialReceipt.receiptNumber")}:</span>
              <span>${receipt.receiptNumber}</span>
            </div>
            <div class="row">
              <span>${t("date")}:</span>
              <span>${receipt.date}</span>
            </div>
            <div class="row">
              <span>${t("customer")}:</span>
              <span>${receipt.customerName}</span>
            </div>
            <div class="row">
              <span>${t("amount")}:</span>
              <span class="amount">${receipt.amount} ${t("currency")}</span>
            </div>
            <div class="row">
              <span>${t("financialReceipt.paymentMethod")}:</span>
              <span>${getPaymentMethodDisplayForReceipt(
                receipt.paymentMethod
              )}</span>
            </div>
            ${
              receipt.referenceNumber
                ? `
            <div class="row">
              <span>${t("financialReceipt.referenceNumber")}:</span>
              <span>${receipt.referenceNumber}</span>
            </div>
            `
                : ""
            }
            ${
              receipt.description
                ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ccc;">
              <div style="margin-bottom: 5px;">${t("description")}:</div>
              <div>${receipt.description}</div>
            </div>
            `
                : ""
            }
            <div class="footer">
              ${t("financialReceipt.issuedBySystem")}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const getPaymentMethodDisplayForReceipt = (method) => {
    switch (method) {
      case "cash":
        return t("financialReceipt.cash");
      case "bank_transfer":
        return t("financialReceipt.bankTransfer");
      case "check":
        return t("financialReceipt.check");
      case "card":
        return t("financialReceipt.creditCard");
      default:
        return t("financialReceipt.cash");
    }
  };

  const handlePrintCurrentReceipt = () => {
    const currentReceipt = {
      receiptNumber: `RCV-${String(receipts.length + 1).padStart(3, "0")}`,
      date: receiptDate,
      customerName: getCustomerNameForPreview(),
      amount: amount,
      paymentMethod: paymentMethod,
      referenceNumber: referenceNumber,
      description: description,
    };

    handlePrintReceipt(currentReceipt);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer && receiptMode === "customer") {
      toast.error(t("financialReceipt.errors.selectCustomer"));
      return;
    }

    if (selectedInvoices.length === 0 && receiptMode === "invoice") {
      toast.error(t("financialReceipt.errors.selectInvoices"));
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t("financialReceipt.errors.enterValidAmount"));
      return;
    }

    const newReceipt = {
      id: receipts.length + 1,
      receiptNumber: `RCV-${String(receipts.length + 1).padStart(3, "0")}`,
      customerName: selectedCustomer?.name || selectedInvoices[0]?.customerName,
      amount: parseFloat(amount),
      date: receiptDate,
      mode: receiptMode,
      status: "completed",
      description,
      paymentMethod,
      referenceNumber,
      images: uploadedImages,
    };

    setReceipts((prev) => [newReceipt, ...prev]);

    // Reset form
    setSelectedCustomer(null);
    setSelectedInvoices([]);
    setAmount("");
    setDescription("");
    setReceiptDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("cash");
    setReferenceNumber("");
    setUploadedImages([]);

    toast.success(t("financialReceipt.success.receiptCreated"));
  };

  const handleImageUpload = (images) => {
    setUploadedImages(images);
    setIsImageUploadModalOpen(false);
    toast.success(t("financialReceipt.success.imagesUploaded"));
  };

  const getTotalSelectedInvoicesAmount = () => {
    return selectedInvoices.reduce((total, invoiceId) => {
      const invoice = invoices.find((inv) => inv.id === invoiceId);
      return total + (invoice?.amount || 0);
    }, 0);
  };

  const getCustomerNameForPreview = () => {
    if (selectedCustomer?.name) {
      return selectedCustomer.name;
    }
    if (selectedInvoices.length > 0) {
      const firstInvoice = invoices.find(
        (inv) => inv.id === selectedInvoices[0]
      );
      return firstInvoice?.customerName || "-";
    }
    return "-";
  };

  const getPaymentMethodDisplay = () => {
    switch (paymentMethod) {
      case "cash":
        return t("financialReceipt.cash");
      case "bank_transfer":
        return t("financialReceipt.bankTransfer");
      case "check":
        return t("financialReceipt.check");
      case "card":
        return t("financialReceipt.creditCard");
      default:
        return t("financialReceipt.cash");
    }
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Receipt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t("financialReceipt.title")}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("financialReceipt.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => setIsImageUploadModalOpen(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                {t("financialReceipt.uploadImages")}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Receipt Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("financialReceipt.createNewReceipt")}
                </h2>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("financialReceipt.receiptType")}:
                  </span>
                  <select
                    value={receiptMode}
                    onChange={(e) => setReceiptMode(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="customer">
                      {t("financialReceipt.customerCreditDeduction")}
                    </option>
                    <option value="invoice">
                      {t("financialReceipt.specificInvoicePayment")}
                    </option>
                  </select>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Selection */}
                {receiptMode === "customer" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("financialReceipt.selectCustomer")}
                    </label>
                    <select
                      value={selectedCustomer?.id || ""}
                      onChange={(e) => {
                        const customer = customers.find(
                          (c) => c.id === parseInt(e.target.value)
                        );
                        setSelectedCustomer(customer);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">
                        {t("financialReceipt.chooseCustomer")}
                      </option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} -{" "}
                          {t("financialReceipt.outstandingCredit")}:{" "}
                          {customer.outstandingCredit} {t("currency")}
                        </option>
                      ))}
                    </select>
                    {selectedCustomer && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t("financialReceipt.currentOutstandingCredit")}:
                          </span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {selectedCustomer.outstandingCredit} {t("currency")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Invoice Selection */}
                {receiptMode === "invoice" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("financialReceipt.selectInvoices")}
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {invoices.map((invoice) => (
                        <label
                          key={invoice.id}
                          className="flex items-center space-x-3 rtl:space-x-reverse p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedInvoices((prev) => [
                                  ...prev,
                                  invoice.id,
                                ]);
                              } else {
                                setSelectedInvoices((prev) =>
                                  prev.filter((id) => id !== invoice.id)
                                );
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {invoice.invoiceNumber}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {invoice.customerName}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {t("amount")}: {invoice.amount} {t("currency")}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {t("financialReceipt.dueDate")}:{" "}
                                {invoice.dueDate}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {selectedInvoices.length > 0 && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t("financialReceipt.totalSelectedInvoices")}:
                          </span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {getTotalSelectedInvoicesAmount()} {t("currency")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("amount")}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={t("financialReceipt.enterAmount")}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("description")}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("financialReceipt.receiptDescription")}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Date and Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("financialReceipt.receiptDate")}
                    </label>
                    <input
                      type="date"
                      value={receiptDate}
                      onChange={(e) => setReceiptDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("financialReceipt.paymentMethod")}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="cash">{t("financialReceipt.cash")}</option>
                      <option value="bank_transfer">
                        {t("financialReceipt.bankTransfer")}
                      </option>
                      <option value="check">
                        {t("financialReceipt.check")}
                      </option>
                      <option value="card">
                        {t("financialReceipt.creditCard")}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("financialReceipt.referenceNumber")}
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder={t("financialReceipt.referenceNumberOptional")}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
                  <button
                    type="submit"
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Receipt className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                    {t("financialReceipt.createReceipt")}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("financialReceipt.receiptPreview")}
                </h3>
                <button
                  onClick={handlePrintCurrentReceipt}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  title={t("financialReceipt.printReceipt")}
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>

              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("financialReceipt.title")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("financialReceipt.receiptVoucher")}
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("financialReceipt.receiptNumber")}:
                    </span>
                    <span className="font-medium">
                      RCV-{String(receipts.length + 1).padStart(3, "0")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("date")}:
                    </span>
                    <span className="font-medium">{receiptDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("customer")}:
                    </span>
                    <span className="font-medium">
                      {getCustomerNameForPreview()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("amount")}:
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {amount ? `${amount} ${t("currency")}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("financialReceipt.paymentMethod")}:
                    </span>
                    <span className="font-medium">
                      {getPaymentMethodDisplay()}
                    </span>
                  </div>
                  {referenceNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("financialReceipt.referenceNumber")}:
                      </span>
                      <span className="font-medium">{referenceNumber}</span>
                    </div>
                  )}
                  {description && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">
                        {t("description")}:
                      </div>
                      <div className="text-sm">{description}</div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    {t("financialReceipt.issuedBySystem")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Receipts */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("financialReceipt.recentReceipts")}
              </h2>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("financialReceipt.receiptNumber")}
                    </th>
                    <th className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("customer")}
                    </th>
                    <th className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("amount")}
                    </th>
                    <th className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("date")}
                    </th>
                    <th className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("type")}
                    </th>
                    <th className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("status")}
                    </th>
                    <th className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => (
                    <tr
                      key={receipt.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                        {receipt.receiptNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {receipt.customerName}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600 dark:text-green-400">
                        {receipt.amount} {t("currency")}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {receipt.date}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            receipt.mode === "customer"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {receipt.mode === "customer"
                            ? t("financialReceipt.customerCreditDeduction")
                            : t("financialReceipt.specificInvoicePayment")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 ml-1 rtl:ml-0 rtl:mr-1" />
                          {t("completed")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={() => handleViewReceipt(receipt)}
                            className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            title={t("financialReceipt.viewReceipt")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditReceipt(receipt)}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                            title={t("financialReceipt.editReceipt")}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(receipt)}
                            className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                            title={t("financialReceipt.printReceipt")}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReceipt(receipt.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            title={t("financialReceipt.deleteReceipt")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={() => setIsImageUploadModalOpen(false)}
        onSubmit={handleImageUpload}
        title={t("financialReceipt.uploadReceiptImages")}
        description={t("financialReceipt.uploadReceiptImagesDesc")}
      />

      {/* View Receipt Modal */}
      {isViewModalOpen && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("financialReceipt.receiptDetails")}
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("financialReceipt.receiptNumber")}:
                </span>
                <span className="font-medium">
                  {selectedReceipt.receiptNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("customer")}:
                </span>
                <span className="font-medium">
                  {selectedReceipt.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("amount")}:
                </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {selectedReceipt.amount} {t("currency")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("date")}:
                </span>
                <span className="font-medium">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("financialReceipt.paymentMethod")}:
                </span>
                <span className="font-medium">
                  {getPaymentMethodDisplayForReceipt(
                    selectedReceipt.paymentMethod
                  )}
                </span>
              </div>
              {selectedReceipt.referenceNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("financialReceipt.referenceNumber")}:
                  </span>
                  <span className="font-medium">
                    {selectedReceipt.referenceNumber}
                  </span>
                </div>
              )}
              {selectedReceipt.description && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">
                    {t("description")}:
                  </div>
                  <div className="text-sm">{selectedReceipt.description}</div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => handlePrintReceipt(selectedReceipt)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Printer className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                {t("financialReceipt.printReceipt")}
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
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

export default FinancialReceiptVoucher;
