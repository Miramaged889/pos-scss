import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  X,
  Save,
  Building,
  DollarSign,
  AlertCircle,
  Calendar,
  User,
  FileText,
  CreditCard,
  Wallet,
  Banknote,
  Upload,
  Image,
  Trash2,
  Camera,
  Plus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import FormField from "../FormField";
import { supplierService } from "../../../services/supplierService";

const PaymentVoucherForm = ({
  isOpen,
  onClose,
  onSubmit,
  voucher = null,
  mode = "add", // "add" or "edit"
}) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  const [formData, setFormData] = useState({
    voucherNumber: "",
    date: "",
    amount: "",
    supplier: "",
    supplierId: "",
    otherSupplier: "",
    paymentMethod: "cash",
    category: "General",
    description: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // Fetch suppliers from API
  const fetchSuppliers = useCallback(async () => {
    setLoadingSuppliers(true);
    try {
      const response = await supplierService.getSuppliers();
      setSuppliers(response);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error(t("errorLoadingSuppliers"));
    } finally {
      setLoadingSuppliers(false);
    }
  }, [t]);

  // Fetch suppliers when component opens
  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen, fetchSuppliers]);

  // Load voucher data when component mounts or voucher changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && voucher) {
        setFormData({
          voucherNumber: voucher.voucherNumber || "",
          date: voucher.date || "",
          amount: voucher.amount?.toString() || "",
          supplier: voucher.supplier || voucher.recipient || "",
          supplierId: voucher.supplierId || "",
          otherSupplier: "",
          paymentMethod: voucher.paymentMethod || "cash",
          category: voucher.category || "General",
          description: voucher.description || "",
          notes: voucher.notes || "",
        });
        // Load existing attachment if exists
        if (voucher.attachment) {
          setUploadedFiles([
            {
              id: "existing",
              url: voucher.attachment,
              name: "Existing Attachment",
              isExisting: true,
            },
          ]);
        } else {
          setUploadedFiles([]);
        }
      } else {
        // Reset form for new voucher
        setFormData({
          voucherNumber: "",
          date: new Date().toISOString().split("T")[0],
          amount: "",
          supplier: "",
          supplierId: "",
          otherSupplier: "",
          paymentMethod: "cash",
          category: "General",
          description: "",
          notes: "",
        });
        setUploadedFiles([]);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, mode, voucher]);

  const paymentMethodOptions = [
    { value: "cash", label: t("cash") },
    { value: "bank_transfer", label: t("bankTransfer") },
    { value: "credit_card", label: t("creditCard") },
    { value: "check", label: t("check") },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle supplier selection
  const handleSupplierChange = (value) => {
    if (value === "other") {
      setFormData((prev) => ({
        ...prev,
        supplier: "other",
        supplierId: "",
      }));
    } else {
      const selectedSupplier = suppliers.find((s) => s.id.toString() === value);
      setFormData((prev) => ({
        ...prev,
        supplier:
          selectedSupplier?.name || selectedSupplier?.supplier_name || "",
        supplierId: value,
      }));
    }

    // Clear error when user selects supplier
    if (errors.supplier) {
      setErrors((prev) => ({
        ...prev,
        supplier: "",
      }));
    }
  };

  const handleFieldChange = (field) => (e) => {
    const value =
      e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;
    handleInputChange(field, value);
  };

  // Build supplier options from API
  const supplierOptions = (() => {
    try {
      const supplierList = suppliers || [];
      return [
        { value: "", label: t("selectSupplier") },
        ...supplierList.map((supplier) => ({
          value: supplier.id.toString(),
          label:
            supplier.name ||
            supplier.supplier_name ||
            `Supplier ${supplier.id}`,
        })),
        { value: "other", label: t("other") },
      ];
    } catch {
      return [
        { value: "", label: t("selectSupplier") },
        { value: "other", label: t("other") },
      ];
    }
  })();

  // File upload handlers
  const handleFileSelect = (files) => {
    const newFiles = Array.from(files);

    if (newFiles.length === 0) {
      toast.error(t("pleaseSelectFiles"));
      return;
    }

    // Check file size (max 10MB per file)
    const validFiles = newFiles.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("fileTooLarge", { fileName: file.name }));
        return false;
      }
      return true;
    });

    // Create file objects with preview URL for images, or file icon for other types
    const filesWithData = validFiles.map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        isImage,
        url: isImage ? URL.createObjectURL(file) : null,
        uploadDate: new Date(),
      };
    });

    setUploadedFiles((prev) => [...prev, ...filesWithData]);
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
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      // Only revoke object URLs for local files, not existing attachments
      if (fileToRemove?.url && !fileToRemove?.isExisting) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    // voucherNumber is optional

    if (!formData.date) {
      newErrors.date = t("dateRequired");
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t("validAmountRequired");
    }

    if (!formData.supplier) {
      newErrors.supplier = t("supplierRequired");
    }
    if (formData.supplier === "other" && !formData.otherSupplier.trim()) {
      newErrors.supplier = t("supplierRequired");
    }

    // Description is now optional
    // if (!formData.description.trim()) {
    //   newErrors.description = t("descriptionRequired");
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("pleaseFixErrors"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const voucherData = {
        ...formData,
        supplier:
          formData.supplier === "other" && formData.otherSupplier.trim()
            ? formData.otherSupplier.trim()
            : formData.supplier,
        recipient:
          formData.supplier === "other" && formData.otherSupplier.trim()
            ? formData.otherSupplier.trim()
            : formData.supplier,
        supplierId: formData.supplier === "other" ? null : formData.supplierId,
        amount: parseFloat(formData.amount),
        status: "pending",
        createdAt: new Date().toISOString(),
        photos: uploadedFiles,
      };

      // Add ID and existing data if editing
      if (mode === "edit" && voucher) {
        voucherData.id = voucher.id;
        voucherData.status = voucher.status;
        voucherData.createdAt = voucher.createdAt;
        voucherData.attachment = voucher.attachment;
      }

      onSubmit(voucherData);
      handleClose();
      toast.success(
        mode === "add" ? t("paymentVoucherCreated") : t("paymentVoucherUpdated")
      );
    } catch (error) {
      console.error("Error submitting payment voucher:", error);
      toast.error(t("errorSavingVoucher"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs (only for local files, not existing attachments)
    uploadedFiles.forEach((file) => {
      if (file.url && !file.isExisting) {
        URL.revokeObjectURL(file.url);
      }
    });

    setFormData({
      voucherNumber: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      supplier: "",
      supplierId: "",
      otherSupplier: "",
      paymentMethod: "cash",
      category: "General",
      description: "",
      notes: "",
    });
    setUploadedFiles([]);
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Building className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === "add"
                  ? t("addPaymentVoucher")
                  : t("editPaymentVoucher")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === "add"
                  ? t("createNewPaymentVoucher")
                  : t("updatePaymentVoucherInfo")}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("voucherInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t("voucherNumber")}
                value={formData.voucherNumber}
                onChange={handleFieldChange("voucherNumber")}
                placeholder={t("enterVoucherNumber")}
                error={errors.voucherNumber}
                icon={FileText}
              />

              <FormField
                label={t("date")}
                type="date"
                value={formData.date}
                onChange={handleFieldChange("date")}
                error={errors.date}
                required
                icon={Calendar}
              />

              <FormField
                label={t("amount")}
                type="number"
                value={formData.amount}
                onChange={handleFieldChange("amount")}
                placeholder="0.00"
                min="0"
                step="0.01"
                error={errors.amount}
                required
                icon={DollarSign}
              />

              <FormField
                label={t("paymentMethod")}
                type="select"
                value={formData.paymentMethod}
                onChange={handleFieldChange("paymentMethod")}
                options={paymentMethodOptions}
                required
                icon={CreditCard}
              />

              <FormField
                label={t("category")}
                value={formData.category}
                onChange={handleFieldChange("category")}
                placeholder={t("enterCategory")}
                icon={Building}
              />
            </div>
          </div>

          {/* Supplier Information */}
          <div>
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("supplierInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t("supplier")}
                type="select"
                value={formData.supplierId || formData.supplier}
                onChange={(e) => handleSupplierChange(e.target.value)}
                options={
                  loadingSuppliers
                    ? [{ value: "", label: t("loading") }]
                    : supplierOptions
                }
                error={errors.supplier}
                required
                icon={Building}
                disabled={loadingSuppliers}
              />
            </div>

            {formData.supplier === "other" && (
              <div className="mt-4">
                <FormField
                  label={t("enterSupplierName")}
                  value={formData.otherSupplier}
                  onChange={handleFieldChange("otherSupplier")}
                  placeholder={t("enterSupplierName")}
                  required
                  error={errors.supplier}
                  icon={Building}
                />
              </div>
            )}
          </div>

          {/* Description and Notes */}
          <div className="space-y-4">
            <FormField
              label={t("description")}
              value={formData.description}
              onChange={handleFieldChange("description")}
              placeholder={t("enterPaymentDescription")}
              error={errors.description}
              rows={3}
              icon={FileText}
            />

            <FormField
              label={t("notes")}
              value={formData.notes}
              onChange={handleFieldChange("notes")}
              placeholder={t("enterAdditionalNotes")}
              rows={3}
              icon={FileText}
            />
          </div>

          {/* File Upload Section */}
          <div>
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("attachments")}
            </h3>

            {/* Upload Area */}
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
                type="file"
                multiple
                accept="*/*"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {t("dragDropFiles")}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t("supportedAllFormats")}
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      document.querySelector('input[type="file"]').click()
                    }
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("selectFiles")}
                  </button>
                </div>
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t("uploadedFiles", { count: uploadedFiles.length })}
                </h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {file.isImage && file.url ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : file.isExisting ? (
                          <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded">
                            <FileText className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          {file.size && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div
                className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t("pleaseFixErrors")}
                </h4>
              </div>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div
            className={`flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors flex items-center gap-2 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting
                ? t("saving")
                : mode === "add"
                ? t("createVoucher")
                : t("updateVoucher")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentVoucherForm;
