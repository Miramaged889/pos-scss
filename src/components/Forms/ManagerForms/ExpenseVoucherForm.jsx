import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  X,
  Save,
  DollarSign,
  Calendar,
  User,
  FileText,
  AlertCircle,
  Receipt,
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

const ExpenseVoucherForm = ({
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
    date: new Date().toISOString().split("T")[0],
    amount: "",
    description: "",
    category: "",
    paymentMethod: "cash",
    recipient: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && voucher) {
        setFormData({
          voucherNumber: voucher.voucherNumber || "",
          date: voucher.date
            ? voucher.date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          amount: voucher.amount || "",
          description: voucher.description || "",
          category: voucher.category || "",
          paymentMethod: voucher.paymentMethod || "cash",
          recipient: voucher.recipient || "",
          notes: voucher.notes || "",
        });
        setUploadedPhotos(voucher.photos || []);
      } else {
        // Reset form for add mode
        setFormData({
          voucherNumber: "",
          date: new Date().toISOString().split("T")[0],
          amount: "",
          description: "",
          category: "",
          paymentMethod: "cash",
          recipient: "",
          notes: "",
        });
        setUploadedPhotos([]);
      }
      setErrors({});
    }
  }, [isOpen, mode, voucher]);

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

  const handleFieldChange = (field) => (e) => {
    handleInputChange(field, e.target.value);
  };

  // Photo upload handlers
  const handleFileSelect = (files) => {
    const newFiles = Array.from(files);
    const imageFiles = newFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      toast.error(t("pleaseSelectImageFiles"));
      return;
    }

    // Check file size (max 5MB per file)
    const validFiles = imageFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("fileTooLarge", { fileName: file.name }));
        return false;
      }
      return true;
    });

    // Create file objects with preview
    const filesWithPreview = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      uploadDate: new Date(),
    }));

    setUploadedPhotos((prev) => [...prev, ...filesWithPreview]);
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

  const removePhoto = (photoId) => {
    setUploadedPhotos((prev) => {
      const photoToRemove = prev.find((p) => p.id === photoId);
      if (photoToRemove?.preview) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter((p) => p.id !== photoId);
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.voucherNumber.trim()) {
      newErrors.voucherNumber = t("voucherNumberRequired");
    }

    if (!formData.date) {
      newErrors.date = t("dateRequired");
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t("amountRequired");
    }

    // Description is now optional
    // if (!formData.description.trim()) {
    //   newErrors.description = t("descriptionRequired");
    // }

    if (!formData.category.trim()) {
      newErrors.category = t("categoryRequired");
    }

    if (!formData.recipient.trim()) {
      newErrors.recipient = t("recipientRequired");
    }

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

      // Prepare data for submission
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        status: "pending",
        createdAt: new Date().toISOString(),
        photos: uploadedPhotos,
      };

      onSubmit(submitData);
      handleClose();
      toast.success(
        mode === "add" ? t("expenseVoucherCreated") : t("expenseVoucherUpdated")
      );
    } catch (error) {
      console.error("Error submitting expense voucher:", error);
      toast.error(t("errorSavingVoucher"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    uploadedPhotos.forEach((photo) => {
      if (photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });

    setFormData({
      voucherNumber: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      description: "",
      category: "",
      paymentMethod: "cash",
      recipient: "",
      notes: "",
    });
    setUploadedPhotos([]);
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const clearDraft = () => {
    // Clean up preview URLs
    uploadedPhotos.forEach((photo) => {
      if (photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });

    setFormData({
      voucherNumber: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      description: "",
      category: "",
      paymentMethod: "cash",
      recipient: "",
      notes: "",
    });
    setUploadedPhotos([]);
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Receipt className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === "add"
                  ? t("addExpenseVoucher")
                  : t("editExpenseVoucher")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === "add"
                  ? t("addNewExpenseVoucher")
                  : t("updateExpenseVoucherInfo")}
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("voucherInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t("voucherNumber")}
                value={formData.voucherNumber}
                onChange={handleFieldChange("voucherNumber")}
                placeholder={t("enterVoucherNumber")}
                required
                error={errors.voucherNumber}
                icon={FileText}
              />

              <FormField
                label={t("date")}
                type="date"
                value={formData.date}
                onChange={handleFieldChange("date")}
                required
                error={errors.date}
                icon={Calendar}
              />

              <FormField
                label={t("amount")}
                type="number"
                value={formData.amount}
                onChange={handleFieldChange("amount")}
                placeholder={t("enterAmount")}
                min="0"
                step="0.01"
                required
                error={errors.amount}
                icon={DollarSign}
              />

              <FormField
                label={t("category")}
                value={formData.category}
                onChange={handleFieldChange("category")}
                placeholder={t("enterCategory")}
                required
                error={errors.category}
                icon={FileText}
              />

              <FormField
                label={t("recipient")}
                value={formData.recipient}
                onChange={handleFieldChange("recipient")}
                placeholder={t("enterRecipient")}
                required
                error={errors.recipient}
                icon={User}
              />

              <FormField
                label={t("paymentMethod")}
                type="select"
                value={formData.paymentMethod}
                onChange={handleFieldChange("paymentMethod")}
                options={[
                  { value: "cash", label: t("cash") },
                  { value: "bank_transfer", label: t("bankTransfer") },
                  { value: "credit_card", label: t("creditCard") },
                  { value: "check", label: t("check") },
                ]}
                required
                icon={CreditCard}
              />
            </div>

            <div className="mt-4">
              <FormField
                label={t("description")}
                value={formData.description}
                onChange={handleFieldChange("description")}
                placeholder={t("enterDescription")}
                error={errors.description}
                icon={FileText}
                rows={3}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("additionalInformation")}
            </h3>
            <FormField
              label={t("notes")}
              value={formData.notes}
              onChange={handleFieldChange("notes")}
              placeholder={t("enterNotes")}
              rows={4}
              icon={FileText}
            />
          </div>

          {/* Photo Upload Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
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
                accept="image/*"
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
                    {t("dragDropPhotos")}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t("supportedImageFormats")}
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() =>
                      document.querySelector('input[type="file"]').click()
                    }
                    className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className={`w-4 h-4 ${isRTL ? "mr-1" : "ml-1"}`} />
                    {t("selectPhotos")}
                  </button>
                  <button
                    type="button"
                    className="flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Camera className={`w-4 h-4 ${isRTL ? "mr-1" : "ml-1"}`} />
                    {t("takePhoto")}
                  </button>
                </div>
              </div>
            </div>

            {/* Uploaded Photos */}
            {uploadedPhotos.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t("uploadedPhotos", { count: uploadedPhotos.length })}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {uploadedPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.preview}
                        alt={photo.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
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
                className={`flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
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
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearDraft}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t("clearForm")}
              </button>
            </div>

            <div
              className={`flex items-center gap-3 ${
                isRTL ? "flex-row-reverse" : ""
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
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting
                  ? t("saving")
                  : mode === "add"
                  ? t("create")
                  : t("update")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseVoucherForm;
