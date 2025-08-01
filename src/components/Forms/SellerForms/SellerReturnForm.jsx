import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  X,
  Save,
  RotateCcw,
  Package,
  DollarSign,
  FileText,
  AlertCircle,
  Building,
  Calendar,
  User,
  Mail,
} from "lucide-react";
import { toast } from "react-hot-toast";

import FormField from "../FormField";

const SellerReturnForm = ({
  isOpen,
  onClose,
  onSubmit,
  returnItem = null,
  mode = "add", // "add" or "edit"
  suppliers = [],
}) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  const [formData, setFormData] = useState({
    supplierId: "",
    orderId: "",
    invoiceId: "",
    returnDate: new Date().toISOString().split("T")[0],
    status: "pending",
    reason: "",
    totalAmount: 0,
    refundAmount: 0,
    refundMethod: "",
    notes: "",
    items: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    unitPrice: 0,
    reason: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && returnItem) {
        setFormData({
          supplierId: returnItem.supplierId || "",
          orderId: returnItem.orderId || "",
          invoiceId: returnItem.invoiceId || "",
          returnDate: returnItem.returnDate
            ? returnItem.returnDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
          status: returnItem.status || "pending",
          reason: returnItem.reason || "",
          totalAmount: returnItem.totalAmount || 0,
          refundAmount: returnItem.refundAmount || 0,
          refundMethod: returnItem.refundMethod || "",
          notes: returnItem.notes || "",
          items: returnItem.items || [],
        });
      } else {
        // Reset form for add mode
        setFormData({
          supplierId: "",
          orderId: "",
          invoiceId: "",
          returnDate: new Date().toISOString().split("T")[0],
          status: "pending",
          reason: "",
          totalAmount: 0,
          refundAmount: 0,
          refundMethod: "",
          notes: "",
          items: [],
        });
      }
      setErrors({});
      setNewItem({
        name: "",
        quantity: 1,
        unitPrice: 0,
        reason: "",
      });
    }
  }, [isOpen, mode, returnItem]);

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

  const handleNewItemChange = (field, value) => {
    setNewItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addItem = () => {
    if (
      !newItem.name.trim() ||
      newItem.quantity <= 0 ||
      newItem.unitPrice <= 0 ||
      !newItem.reason.trim()
    ) {
      toast.error(t("pleaseFillAllItemFields"));
      return;
    }

    const item = {
      ...newItem,
      total: newItem.quantity * newItem.unitPrice,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));

    setNewItem({
      name: "",
      quantity: 1,
      unitPrice: 0,
      reason: "",
    });
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.supplierId) {
      newErrors.supplierId = t("supplierRequired");
    }

    if (!formData.orderId.trim()) {
      newErrors.orderId = t("orderIdRequired");
    }

    if (!formData.reason.trim()) {
      newErrors.reason = t("returnReasonRequired");
    }

    if (formData.totalAmount <= 0) {
      newErrors.totalAmount = t("amountMustBePositive");
    }

    if (formData.refundAmount < 0) {
      newErrors.refundAmount = t("refundAmountCannotBeNegative");
    }

    if (formData.refundAmount > formData.totalAmount) {
      newErrors.refundAmount = t("refundAmountCannotExceedTotal");
    }

    if (!formData.returnDate) {
      newErrors.returnDate = t("returnDateRequired");
    }

    if (formData.items.length === 0) {
      newErrors.items = t("atLeastOneItemRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
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

      // Calculate totals
      const totalAmount = calculateTotal();

      // Prepare data for submission
      const submitData = {
        ...formData,
        totalAmount,
        returnDate: new Date(formData.returnDate).toISOString(),
      };

      onSubmit(submitData);
      handleClose();
      toast.success(
        mode === "add"
          ? t("returnCreatedSuccessfully")
          : t("returnUpdatedSuccessfully")
      );
    } catch (error) {
      console.error("Error submitting return:", error);
      toast.error(t("errorSavingReturn"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      supplierId: "",
      orderId: "",
      invoiceId: "",
      returnDate: new Date().toISOString().split("T")[0],
      status: "pending",
      reason: "",
      totalAmount: 0,
      refundAmount: 0,
      refundMethod: "",
      notes: "",
      items: [],
    });
    setErrors({});
    setIsSubmitting(false);
    setNewItem({
      name: "",
      quantity: 1,
      unitPrice: 0,
      reason: "",
    });
    onClose();
  };

  const clearDraft = () => {
    setFormData({
      supplierId: "",
      orderId: "",
      invoiceId: "",
      returnDate: new Date().toISOString().split("T")[0],
      status: "pending",
      reason: "",
      totalAmount: 0,
      refundAmount: 0,
      refundMethod: "",
      notes: "",
      items: [],
    });
    setErrors({});
    setNewItem({
      name: "",
      quantity: 1,
      unitPrice: 0,
      reason: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <RotateCcw className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === "add" ? t("createReturn") : t("editReturn")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === "add" ? t("createNewReturn") : t("updateReturnInfo")}
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
              {t("returnInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t("supplier")}
                type="select"
                value={formData.supplierId}
                onChange={handleFieldChange("supplierId")}
                options={suppliers.map((supplier) => ({
                  value: supplier.id,
                  label: supplier.name,
                }))}
                required
                error={errors.supplierId}
                icon={Building}
              />

              <FormField
                label={t("orderId")}
                value={formData.orderId}
                onChange={handleFieldChange("orderId")}
                placeholder={t("enterOrderId")}
                required
                error={errors.orderId}
                icon={FileText}
              />

              <FormField
                label={t("invoiceId")}
                value={formData.invoiceId}
                onChange={handleFieldChange("invoiceId")}
                placeholder={t("enterInvoiceId")}
                icon={FileText}
              />

              <FormField
                label={t("returnDate")}
                type="date"
                value={formData.returnDate}
                onChange={handleFieldChange("returnDate")}
                required
                error={errors.returnDate}
                icon={Calendar}
              />

              <FormField
                label={t("status")}
                type="select"
                value={formData.status}
                onChange={handleFieldChange("status")}
                options={[
                  { value: "pending", label: t("pending") },
                  { value: "approved", label: t("approved") },
                  { value: "rejected", label: t("rejected") },
                ]}
                required
              />

              <FormField
                label={t("refundMethod")}
                type="select"
                value={formData.refundMethod}
                onChange={handleFieldChange("refundMethod")}
                options={[
                  { value: "", label: t("selectMethod") },
                  { value: "bank_transfer", label: t("bankTransfer") },
                  { value: "check", label: t("check") },
                  { value: "cash", label: t("cash") },
                ]}
              />
            </div>

            <div className="mt-4">
              <FormField
                label={t("returnReason")}
                value={formData.reason}
                onChange={handleFieldChange("reason")}
                placeholder={t("enterReturnReason")}
                required
                error={errors.reason}
                rows={3}
                icon={FileText}
              />
            </div>
          </div>

          {/* Items Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("returnedItems")}
            </h3>

            {/* Add New Item */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t("addNewItem")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <FormField
                  label={t("itemName")}
                  value={newItem.name}
                  onChange={(e) => handleNewItemChange("name", e.target.value)}
                  placeholder={t("enterItemName")}
                  icon={Package}
                />

                <FormField
                  label={t("quantity")}
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) =>
                    handleNewItemChange("quantity", parseFloat(e.target.value))
                  }
                  min={1}
                  step={1}
                  icon={Package}
                />

                <FormField
                  label={t("unitPrice")}
                  type="number"
                  value={newItem.unitPrice}
                  onChange={(e) =>
                    handleNewItemChange("unitPrice", parseFloat(e.target.value))
                  }
                  min={0}
                  step={0.01}
                  icon={DollarSign}
                />

                <FormField
                  label={t("returnReason")}
                  value={newItem.reason}
                  onChange={(e) =>
                    handleNewItemChange("reason", e.target.value)
                  }
                  placeholder={t("enterItemReturnReason")}
                  icon={FileText}
                />

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {t("addItem")}
                  </button>
                </div>
              </div>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.quantity} x ${item.unitPrice.toFixed(2)} -{" "}
                        {item.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${item.total.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.items && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.items}
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("returnSummary")}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("totalAmount")}:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("refundAmount")}:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${formData.refundAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {t("remainingAmount")}:
                  </span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    ${(calculateTotal() - formData.refundAmount).toFixed(2)}
                  </span>
                </div>
              </div>
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
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting
                  ? t("saving")
                  : mode === "add"
                  ? t("createReturn")
                  : t("updateReturn")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerReturnForm;
