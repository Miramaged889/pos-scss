import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  X,
  Save,
  DollarSign,
  Calendar,
  Building,
  FileText,
  AlertCircle,
  Receipt,
  CreditCard,
  Wallet,
  Banknote,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";

import FormField from "../FormField";

const PaymentVoucherForm = ({
  isOpen,
  onClose,
  onSubmit,
  voucher = null,
  mode = "add", // "add" or "edit"
  suppliers = [],
}) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  const [formData, setFormData] = useState({
    voucherNumber: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    supplier: "",
    invoiceNumber: "",
    paymentMethod: "cash",
    description: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && voucher) {
        setFormData({
          voucherNumber: voucher.voucherNumber || "",
          date: voucher.date
            ? voucher.date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          amount: voucher.amount || "",
          supplier: voucher.supplier || "",
          invoiceNumber: voucher.invoiceNumber || "",
          paymentMethod: voucher.paymentMethod || "cash",
          description: voucher.description || "",
          notes: voucher.notes || "",
        });
      } else {
        // Reset form for add mode
        setFormData({
          voucherNumber: "",
          date: new Date().toISOString().split("T")[0],
          amount: "",
          supplier: "",
          invoiceNumber: "",
          paymentMethod: "cash",
          description: "",
          notes: "",
        });
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

    if (!formData.supplier.trim()) {
      newErrors.supplier = t("supplierRequired");
    }

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = t("invoiceNumberRequired");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("descriptionRequired");
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
      };

      onSubmit(submitData);
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
    setFormData({
      voucherNumber: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      supplier: "",
      invoiceNumber: "",
      paymentMethod: "cash",
      description: "",
      notes: "",
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const clearDraft = () => {
    setFormData({
      voucherNumber: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      supplier: "",
      invoiceNumber: "",
      paymentMethod: "cash",
      description: "",
      notes: "",
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Receipt className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === "add"
                  ? t("addPaymentVoucher")
                  : t("editPaymentVoucher")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === "add"
                  ? t("addNewPaymentVoucher")
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

              <FormField
                label={t("supplier")}
                value={formData.supplier}
                onChange={handleFieldChange("supplier")}
                placeholder={t("enterSupplier")}
                required
                error={errors.supplier}
                icon={Building}
              />

              <FormField
                label={t("invoiceNumber")}
                value={formData.invoiceNumber}
                onChange={handleFieldChange("invoiceNumber")}
                placeholder={t("enterInvoiceNumber")}
                required
                error={errors.invoiceNumber}
                icon={FileText}
              />
            </div>

            <div className="mt-4">
              <FormField
                label={t("description")}
                value={formData.description}
                onChange={handleFieldChange("description")}
                placeholder={t("enterDescription")}
                required
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
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors flex items-center gap-2"
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

export default PaymentVoucherForm;
