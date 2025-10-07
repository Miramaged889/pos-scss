import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
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
  Camera,
  FolderOpen,
  X,
  Image,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { fetchCustomers } from "../../../store/slices/customerSlice";
import {
  fetchReceipts,
  createReceipt,
  updateReceipt,
  deleteReceipt,
} from "../../../store/slices/receiptVoucherSlice";

const FinancialReceiptVoucher = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const dispatch = useDispatch();
  const { customers, loading: customersLoading } = useSelector(
    (state) => state.customers
  );
  const { receipts, loading, error } = useSelector(
    (state) => state.receiptVouchers
  );

  // Load customers and receipts
  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchReceipts());
  }, [dispatch]);

  // Form state
  const [receiptType, setReceiptType] = useState("customer"); // "customer" or "other"
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [otherName, setOtherName] = useState("");
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [receiver, setReceiver] = useState("");
  const [receiptDate, setReceiptDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [manualReceiptNumber, setManualReceiptNumber] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload handlers
  const handleFileSelect = (files) => {
    const newFiles = Array.from(files);
    const validFiles = newFiles.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") ||
        file.name.toLowerCase().endsWith(".pdf") ||
        file.name.toLowerCase().endsWith(".doc") ||
        file.name.toLowerCase().endsWith(".docx");

      if (!isValidType) {
        toast.error(
          t("imageUpload.unsupportedFileType", { fileName: file.name })
        );
      }

      return isValidType;
    });

    const sizeValidFiles = validFiles.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("imageUpload.fileTooLarge", { fileName: file.name }));
        return false;
      }
      return true;
    });

    const filesWithPreview = sizeValidFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      uploadDate: new Date(),
      status: "pending",
    }));

    setUploadedImages((prev) => [...prev, ...filesWithPreview]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleFileSelect(files);
    e.target.value = "";
  };

  const removeFile = (fileId) => {
    setUploadedImages((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <Image className="w-6 h-6 text-blue-500" />;
    }
    if (fileType.includes("pdf")) {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    if (fileType.includes("word") || fileType.includes("document")) {
      return <FileText className="w-6 h-6 text-blue-600" />;
    }
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  // State for modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [editingReceipt, setEditingReceipt] = useState(null);

  // Receipt actions
  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setIsViewModalOpen(true);
  };

  const handleEditReceipt = (receipt) => {
    setEditingReceipt(receipt);
    setIsEditModalOpen(true);
  };

  const handleDeleteReceipt = async (receiptId) => {
    if (window.confirm(t("financialReceipt.confirmDelete"))) {
      try {
        const result = await dispatch(deleteReceipt(receiptId));
        if (result.type.endsWith("/fulfilled")) {
          toast.success(t("financialReceipt.success.receiptDeleted"));
        } else {
          toast.error(
            result.payload || t("financialReceipt.errors.deleteFailed")
          );
        }
      } catch (error) {
        console.error("Error deleting receipt:", error);
        toast.error(t("financialReceipt.errors.deleteFailed"));
      }
    }
  };

  const handlePrintReceipt = (receipt) => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html dir="${isRTL ? "rtl" : "ltr"}">
        <head>
          <title>سند قبض - ${receipt.receiptNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              direction: ${isRTL ? "rtl" : "ltr"};
            }
            .receipt { 
              border: 2px solid #333; 
              padding: 20px; 
              max-width: 500px; 
              margin: 0 auto; 
              position: relative;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #0066cc;
              padding-bottom: 10px;
            }
            .blue-bar {
              background-color: #0066cc;
              height: 4px;
              margin-bottom: 10px;
            }
            .receipt-number {
              font-size: 24px;
              font-weight: bold;
              color: #cc0000;
              margin: 10px 0;
            }
            .form-row {
              display: flex;
              justify-content: space-between;
              margin: 15px 0;
              align-items: center;
            }
            .form-row label {
              font-weight: bold;
              min-width: 120px;
            }
            .form-row input {
              border: none;
              border-bottom: 1px solid #ccc;
              flex: 1;
              margin: 0 10px;
              padding: 5px;
            }
            .amount {
              font-weight: bold;
              color: #059669;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              border-top: 2px solid #0066cc;
              padding-top: 10px;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 5px;
              width: 150px;
              display: inline-block;
            }
            @media print { 
              body { margin: 0; } 
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="blue-bar"></div>
            <div class="header">
              <h2 style="margin: 0; color: #0066cc;">سند قبض</h2>
              <p style="margin: 5px 0; font-size: 14px;">RECEIPT VOUCHER</p>
              <div class="receipt-number">${receipt.receiptNumber}</div>
            </div>
            
            <div class="form-row">
              <label>استلمنا من السيد / السادة:</label>
              <input type="text" value="${
                receipt.received_from || receipt.customerName || ""
              }" readonly>
            </div>
            
            <div class="form-row">
              <label>مبلغ وقدره:</label>
              <input type="text" value="${
                receipt.amount
              } ريال" readonly class="amount">
            </div>
            
            <div class="form-row">
              <label>نقداً / شيك رقم:</label>
              <input type="text" value="${
                receipt.paymentMethod === "cash"
                  ? "نقداً"
                  : receipt.referenceNumber
              }" readonly>
            </div>
            
            <div class="form-row">
              <label>على بنك:</label>
              <input type="text" value="${receipt.bankName || ""}" readonly>
            </div>
            
            <div class="form-row">
              <label>وذلك مقابل:</label>
              <input type="text" value="${receipt.purpose}" readonly>
            </div>
            
            <div class="form-row">
              <label>المستلم:</label>
              <input type="text" value="${receipt.receiver}" readonly>
            </div>
            
            <div class="footer">
              <div style="margin-bottom: 20px;">
                <span>المحاسب</span>
                <div class="signature-line"></div>
              </div>
            </div>
            <div class="blue-bar"></div>
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    let receivedFrom = "";
    if (receiptType === "customer") {
      if (!selectedCustomerId) {
        toast.error(t("financialReceipt.errors.selectCustomer"));
        return;
      }
      const selectedCustomer = customers.find(
        (c) => c.id === parseInt(selectedCustomerId)
      );
      receivedFrom =
        selectedCustomer?.name || selectedCustomer?.customer_name || "";
    } else {
      receivedFrom = otherName;
    }

    console.log("🔍 Form validation:");
    console.log("  receivedFrom:", receivedFrom);
    console.log("  amount:", amount);
    console.log("  receiver:", receiver);
    console.log("  bankName:", bankName);

    if (!receivedFrom || receivedFrom.trim() === "") {
      toast.error(t("financialReceipt.errors.enterReceivedFrom"));
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t("financialReceipt.errors.enterValidAmount"));
      return;
    }

    if (!receiver || receiver.trim() === "") {
      toast.error(t("financialReceipt.errors.enterReceiver"));
      return;
    }

    if (!bankName || bankName.trim() === "") {
      toast.error(t("financialReceipt.errors.enterBank"));
      return;
    }

    setIsSubmitting(true);

    try {
      const receiptData = {
        receiptType,
        receivedFrom: receivedFrom.trim(),
        receiptNumber: manualReceiptNumber?.trim() || null,
        amount: parseFloat(amount),
        paymentMethod,
        referenceNumber: referenceNumber?.trim() || "",
        bankName: bankName.trim(),
        purpose: purpose?.trim() || "",
        receiver: receiver.trim(),
        date: receiptDate,
        attachments:
          uploadedImages.length > 0
            ? [
                {
                  file: uploadedImages[0].file,
                  url: uploadedImages[0].preview,
                },
              ]
            : [],
      };

      console.log("📝 Receipt data being sent:", receiptData);

      const result = await dispatch(createReceipt(receiptData));

      if (result.type.endsWith("/fulfilled")) {
        // Reset form
        setSelectedCustomerId("");
        setOtherName("");
        setAmount("");
        setBankName("");
        setPurpose("");
        setReceiver("");
        setReceiptDate(new Date().toISOString().split("T")[0]);
        setPaymentMethod("cash");
        setReferenceNumber("");
        setUploadedImages([]);
        setManualReceiptNumber("");

        toast.success(t("financialReceipt.success.receiptCreated"));
      } else {
        toast.error(
          result.payload || t("financialReceipt.errors.createFailed")
        );
      }
    } catch (error) {
      console.error("Error creating receipt:", error);
      toast.error(t("financialReceipt.errors.createFailed"));
    } finally {
      setIsSubmitting(false);
    }
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

  // Helper function to get the received_from value consistently
  const getReceivedFromValue = (receipt) => {
    return (
      receipt.received_from ||
      receipt.customerName ||
      receipt.receivedFrom ||
      ""
    );
  };

  // Show loading state
  if (loading && !error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {t("financialReceipt.loadingReceipts")}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchReceipts())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Receipt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("financialReceipt.receiptVoucher")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t("financialReceipt.receiptVoucher")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Receipt Form */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t("financialReceipt.createNewReceiptVoucher")}
                </h2>

                {/* Receipt Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t("financialReceipt.recipientType")}:
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 rtl:space-x-reverse">
                      <input
                        type="radio"
                        value="customer"
                        checked={receiptType === "customer"}
                        onChange={(e) => setReceiptType(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 dark:text-white">
                        {t("financialReceipt.customer")}
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 rtl:space-x-reverse">
                      <input
                        type="radio"
                        value="other"
                        checked={receiptType === "other"}
                        onChange={(e) => setReceiptType(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 dark:text-white">
                        {t("financialReceipt.other")}
                      </span>
                    </label>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Payer Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("financialReceipt.weReceivedFrom")}:
                    </label>
                    {receiptType === "customer" ? (
                      <div>
                        <select
                          value={selectedCustomerId}
                          onChange={(e) =>
                            setSelectedCustomerId(e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">
                            {customersLoading
                              ? t("loading")
                              : t("financialReceipt.selectCustomer")}
                          </option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name || customer.customer_name}
                            </option>
                          ))}
                        </select>
                        {selectedCustomerId && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {t("financialReceipt.currentOutstandingCredit")}:{" "}
                              {
                                customers.find(
                                  (c) => c.id === parseInt(selectedCustomerId)
                                )?.outstandingCredit
                              }{" "}
                              {t("currency")}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={otherName}
                        onChange={(e) => setOtherName(e.target.value)}
                        placeholder={t("financialReceipt.recipientName")}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>

                  {/* Optional Manual Receipt Number */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("receiptNumber")} ({t("optional")}):
                    </label>
                    <input
                      type="text"
                      value={manualReceiptNumber}
                      onChange={(e) => setManualReceiptNumber(e.target.value)}
                      placeholder={t(
                        "financialReceipt.enterReceiptNumberOptional"
                      )}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("financialReceipt.amountAndValue")}:
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={t("amount")}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Bank */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("financialReceipt.cashOrCheckNumber")}:
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="cash">{t("cash")}</option>
                        <option value="check">{t("check")}</option>
                        <option value="bank_transfer">
                          {t("bankTransfer")}
                        </option>
                        <option value="card">{t("creditCard")}</option>
                      </select>
                      {paymentMethod === "check" && (
                        <input
                          type="text"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder={t("checkNumber")}
                          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("financialReceipt.onBank")}:
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder={t("bank")}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("financialReceipt.for")}:
                    </label>
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder={t("financialReceipt.purpose")}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Receiver */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("financialReceipt.receiver")}:
                    </label>
                    <input
                      type="text"
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      placeholder={t("financialReceipt.receiverName")}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("financialReceipt.date")}:
                    </label>
                    <input
                      type="date"
                      value={receiptDate}
                      onChange={(e) => setReceiptDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("financialReceipt.uploadAttachments")}:
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragging
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileInputChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />

                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {t("financialReceipt.dragAndDrop")}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("financialReceipt.imagePdfWord")}
                          </p>
                        </div>

                        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            <FolderOpen className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" />
                            {t("financialReceipt.selectFiles")}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Uploaded Files */}
                    {uploadedImages.length > 0 && (
                      <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                        {uploadedImages.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              {file.preview ? (
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                                  {getFileIcon(file.type)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                          {t("processing")}
                        </>
                      ) : (
                        <>
                          <Receipt className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                          {t("financialReceipt.createReceipt")}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Receipt Preview */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("financialReceipt.previewReceipt")}
                </h3>
                <button
                  onClick={() => {
                    const currentReceipt = {
                      receiptNumber:
                        manualReceiptNumber?.trim() ||
                        String(receipts.length + 1).padStart(4, "0"),
                      customerName:
                        receiptType === "customer"
                          ? customers.find(
                              (c) => c.id === parseInt(selectedCustomerId)
                            )?.name || ""
                          : otherName,
                      received_from:
                        receiptType === "customer"
                          ? customers.find(
                              (c) => c.id === parseInt(selectedCustomerId)
                            )?.name || ""
                          : otherName,
                      amount: amount,
                      bankName: bankName,
                      purpose: purpose,
                      receiver: receiver,
                      paymentMethod: paymentMethod,
                      referenceNumber: referenceNumber,
                      date: receiptDate,
                    };
                    handlePrintReceipt(currentReceipt);
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  title={t("financialReceipt.printReceipt")}
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>

              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div className="text-center mb-4">
                  <div className="w-full h-1 bg-blue-600 mb-2"></div>
                  <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {t("financialReceipt.receiptVoucher")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("financialReceipt.receiptVoucher")}
                  </p>
                  <div className="text-xl font-bold text-red-600 mt-2">
                    {manualReceiptNumber?.trim() ||
                      String(receipts.length + 1).padStart(4, "0")}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t("financialReceipt.recipientType")}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {receiptType === "customer"
                        ? t("financialReceipt.customer")
                        : t("financialReceipt.other")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t("financialReceipt.weReceivedFrom")}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {receiptType === "customer"
                        ? customers.find(
                            (c) => c.id === parseInt(selectedCustomerId)
                          )?.name || "-"
                        : otherName || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t("amount")}:
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {amount ? `${amount} ${t("currency")}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t("financialReceipt.paymentMethod")}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getPaymentMethodDisplay()}
                    </span>
                  </div>
                  {(paymentMethod === "check" ||
                    paymentMethod === "bank_transfer" ||
                    paymentMethod === "card") &&
                    referenceNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          {t("financialReceipt.referenceNumber")}:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {referenceNumber}
                        </span>
                      </div>
                    )}
                  {bankName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        {t("financialReceipt.bank")}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {bankName}
                      </span>
                    </div>
                  )}
                  {purpose && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        {t("financialReceipt.purpose")}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {purpose}
                      </span>
                    </div>
                  )}
                  {receiver && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        {t("financialReceipt.receiver")}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {receiver}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t("financialReceipt.date")}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {receiptDate}
                    </span>
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        {t("financialReceipt.uploadAttachments")}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {uploadedImages.length} {t("files")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    {t("financialReceipt.issuedFromSystem")}
                  </div>
                </div>
                <div className="w-full h-1 bg-blue-600 mt-2"></div>
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
                <button
                  onClick={() => {
                    // Export receipts to CSV
                    const csvContent = [
                      [
                        "Receipt Number",
                        "Customer",
                        "Amount",
                        "Date",
                        "Payment Method",
                        "Receiver",
                        "Purpose",
                      ],
                      ...receipts.map((r) => [
                        r.receiptNumber,
                        getReceivedFromValue(r),
                        r.amount,
                        r.date,
                        getPaymentMethodDisplayForReceipt(r.paymentMethod),
                        r.receiver,
                        r.purpose,
                      ]),
                    ]
                      .map((row) => row.join(","))
                      .join("\n");

                    const blob = new Blob([csvContent], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "receipts.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                    toast.success(
                      t("financialReceipt.success.receiptsExported")
                    );
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  title={t("financialReceipt.exportReceipts")}
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    // Print all receipts
                    receipts.forEach((receipt, index) => {
                      setTimeout(() => {
                        handlePrintReceipt(receipt);
                      }, index * 1000); // Print each receipt with 1 second delay
                    });
                    toast.success(
                      t("financialReceipt.success.allReceiptsPrinted")
                    );
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  title={t("financialReceipt.printAllReceipts")}
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th
                      className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("receiptNumber")}
                    </th>
                    <th
                      className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("financialReceipt.weReceivedFrom")}
                    </th>
                    <th
                      className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("amount")}
                    </th>
                    <th
                      className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("financialReceipt.receiver")}
                    </th>
                    <th
                      className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("date")}
                    </th>
                    <th
                      className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("status")}
                    </th>
                    <th
                      className={`py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
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
                        {getReceivedFromValue(receipt)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600 dark:text-green-400">
                        {receipt.amount} ريال
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {receipt.receiver}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {receipt.date}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 ml-1 rtl:ml-0 rtl:mr-1" />
                          مكتمل
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
                            title="طباعة السند"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReceipt(receipt.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            title="حذف السند"
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

      {/* View Receipt Modal */}
      {isViewModalOpen && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("financialReceipt.receiptDetails")}
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("receiptNumber")}:
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {selectedReceipt.receiptNumber}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("date")}:
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedReceipt.date}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("financialReceipt.weReceivedFrom")}:
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {getReceivedFromValue(selectedReceipt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("amount")}:
                  </label>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {selectedReceipt.amount} {t("currency")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("financialReceipt.paymentMethod")}:
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {getPaymentMethodDisplayForReceipt(
                      selectedReceipt.paymentMethod
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("financialReceipt.receiver")}:
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedReceipt.receiver}
                  </p>
                </div>
                {selectedReceipt.bankName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("bank")}:
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedReceipt.bankName}
                    </p>
                  </div>
                )}
                {selectedReceipt.referenceNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("financialReceipt.referenceNumber")}:
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedReceipt.referenceNumber}
                    </p>
                  </div>
                )}
              </div>

              {selectedReceipt.purpose && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("financialReceipt.purpose")}:
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedReceipt.purpose}
                  </p>
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

      {/* Edit Receipt Modal */}
      {isEditModalOpen && editingReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("financialReceipt.editReceipt")}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (isSubmitting) return;

                setIsSubmitting(true);
                try {
                  const result = await dispatch(
                    updateReceipt({
                      id: editingReceipt.id,
                      updates: {
                        receiptType: editingReceipt.receiptType,
                        receivedFrom: getReceivedFromValue(editingReceipt),
                        amount: parseFloat(editingReceipt.amount),
                        paymentMethod: editingReceipt.paymentMethod,
                        referenceNumber: editingReceipt.referenceNumber,
                        bankName: editingReceipt.bankName,
                        purpose: editingReceipt.purpose,
                        receiver: editingReceipt.receiver,
                        date: editingReceipt.date,
                      },
                    })
                  );

                  if (result.type.endsWith("/fulfilled")) {
                    setIsEditModalOpen(false);
                    setEditingReceipt(null);
                    toast.success(t("financialReceipt.success.receiptUpdated"));
                  } else {
                    toast.error(
                      result.payload ||
                        t("financialReceipt.errors.updateFailed")
                    );
                  }
                } catch (error) {
                  console.error("Error updating receipt:", error);
                  toast.error(t("financialReceipt.errors.updateFailed"));
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("financialReceipt.weReceivedFrom")}:
                  </label>
                  <input
                    type="text"
                    value={getReceivedFromValue(editingReceipt)}
                    onChange={(e) =>
                      setEditingReceipt((prev) => ({
                        ...prev,
                        received_from: e.target.value,
                        customerName: e.target.value,
                        receivedFrom: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("amount")}:
                  </label>
                  <input
                    type="number"
                    value={editingReceipt.amount}
                    onChange={(e) =>
                      setEditingReceipt((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("financialReceipt.receiver")}:
                  </label>
                  <input
                    type="text"
                    value={editingReceipt.receiver}
                    onChange={(e) =>
                      setEditingReceipt((prev) => ({
                        ...prev,
                        receiver: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("bank")}:
                  </label>
                  <input
                    type="text"
                    value={editingReceipt.bankName || ""}
                    onChange={(e) =>
                      setEditingReceipt((prev) => ({
                        ...prev,
                        bankName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("financialReceipt.paymentMethod")}:
                  </label>
                  <select
                    value={editingReceipt.paymentMethod}
                    onChange={(e) =>
                      setEditingReceipt((prev) => ({
                        ...prev,
                        paymentMethod: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cash">{t("cash")}</option>
                    <option value="check">{t("check")}</option>
                    <option value="bank_transfer">{t("bankTransfer")}</option>
                    <option value="card">{t("creditCard")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("financialReceipt.referenceNumber")}:
                  </label>
                  <input
                    type="text"
                    value={editingReceipt.referenceNumber || ""}
                    onChange={(e) =>
                      setEditingReceipt((prev) => ({
                        ...prev,
                        referenceNumber: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("financialReceipt.purpose")}:
                </label>
                <textarea
                  value={editingReceipt.purpose}
                  onChange={(e) =>
                    setEditingReceipt((prev) => ({
                      ...prev,
                      purpose: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                  {t("update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReceiptVoucher;
