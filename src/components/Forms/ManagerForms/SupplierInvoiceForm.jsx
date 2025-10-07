import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  X,
  Save,
  FileText,
  Package,
  DollarSign,
  AlertCircle,
  Building,
  Calendar,
  User,
  Mail,
  Calculator,
} from "lucide-react";
import { toast } from "react-hot-toast";

import FormField from "../FormField";

const SupplierInvoiceForm = ({
  isOpen,
  onClose,
  onSubmit,
  invoice = null,
  mode = "add", // "add" or "edit"
  suppliers = [],
}) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  const [formData, setFormData] = useState({
    supplier: "",
    order_id: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "Pending",
    payment_method: "Bank Transfer",
    notes: "",
    tax: 0,
    total: 0,
    items: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    item_name: "",
    quantity: 1,
    unit_price: 0,
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && invoice) {
        setFormData({
          supplier: invoice.supplier || invoice.supplierId || "",
          order_id: invoice.order_id || invoice.orderId || "",
          issue_date:
            invoice.issue_date || invoice.issueDate
              ? (invoice.issue_date || invoice.issueDate).split("T")[0]
              : new Date().toISOString().split("T")[0],
          due_date:
            invoice.due_date || invoice.dueDate
              ? (invoice.due_date || invoice.dueDate).split("T")[0]
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
          status: invoice.status || "Pending",
          payment_method:
            invoice.payment_method || invoice.paymentMethod || "Bank Transfer",
          notes: invoice.notes || "",
          tax: invoice.tax || 0,
          total: invoice.total || 0,
          items: (invoice.items || []).map((item) => ({
            id: item.id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal || item.quantity * item.unit_price,
          })),
        });
      } else {
        // Reset form for add mode
        setFormData({
          supplier: "",
          order_id: "",
          issue_date: new Date().toISOString().split("T")[0],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          status: "Pending",
          payment_method: "Bank Transfer",
          notes: "",
          tax: 0,
          total: 0,
          items: [],
        });
      }
      setErrors({});
      setNewItem({
        item_name: "",
        quantity: 1,
        unit_price: 0,
      });
    }
  }, [isOpen, mode, invoice]);

  useEffect(() => {
    // Calculate total when items or tax changes
    const itemsTotal = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.subtotal || item.total) || 0);
    }, 0);
    const tax = parseFloat(formData.tax) || 0;
    const total = itemsTotal + tax;
    setFormData((prev) => ({
      ...prev,
      total: total,
    }));
  }, [formData.items, formData.tax]);

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
    if (!newItem.item_name.trim()) {
      toast.error(t("pleaseFillItemDetails"));
      return;
    }

    const quantity = parseFloat(newItem.quantity) || 0;
    const unitPrice = parseFloat(newItem.unit_price) || 0;
    const subtotal = quantity * unitPrice;

    const item = {
      ...newItem,
      quantity: quantity,
      unit_price: unitPrice,
      subtotal: subtotal,
      total: subtotal, // Keep for backward compatibility
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));

    setNewItem({
      item_name: "",
      quantity: 1,
      unit_price: 0,
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
    if (!formData.supplier) {
      newErrors.supplier = t("supplierRequired");
    }

    if (!formData.order_id.trim()) {
      newErrors.order_id = t("orderIdRequired");
    }

    if (formData.items.length === 0) {
      newErrors.items = t("atLeastOneItemRequired");
    }

    // Tax validation
    if (formData.tax < 0) {
      newErrors.tax = t("taxPositive");
    }

    // Date validation
    if (new Date(formData.due_date) <= new Date(formData.issue_date)) {
      newErrors.due_date = t("dueDateAfterIssueDate");
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
        issue_date: formData.issue_date,
        due_date: formData.due_date,
      };

      onSubmit(submitData);
      handleClose();
      toast.success(
        mode === "add"
          ? t("invoiceAddedSuccessfully")
          : t("invoiceUpdatedSuccessfully")
      );
    } catch (error) {
      console.error("Error submitting invoice:", error);
      toast.error(t("errorSavingInvoice"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      supplier: "",
      order_id: "",
      issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "Pending",
      payment_method: "Bank Transfer",
      notes: "",
      tax: 0,
      total: 0,
      items: [],
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const clearDraft = () => {
    setFormData({
      supplier: "",
      order_id: "",
      issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "Pending",
      payment_method: "Bank Transfer",
      notes: "",
      tax: 0,
      total: 0,
      items: [],
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${
            isRTL ? "flex-row" : ""
          }`}
        >
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === "add" ? t("addInvoice") : t("editInvoice")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === "add" ? t("addNewInvoice") : t("updateInvoiceInfo")}
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
              {t("invoiceInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t("supplier")}
                type="select"
                value={formData.supplier}
                onChange={handleFieldChange("supplier")}
                options={[
                  { value: "", label: t("selectSupplier") },
                  ...suppliers.map((supplier) => ({
                    value: supplier.id,
                    label: supplier.supplier_name || supplier.name,
                  })),
                ]}
                required
                error={errors.supplier}
                icon={Building}
              />

              <FormField
                label={t("orderId")}
                value={formData.order_id}
                onChange={handleFieldChange("order_id")}
                placeholder={t("enterOrderId")}
                required
                error={errors.order_id}
                icon={Package}
              />

              <FormField
                label={t("issueDate")}
                type="date"
                value={formData.issue_date}
                onChange={handleFieldChange("issue_date")}
                required
                icon={Calendar}
              />

              <FormField
                label={t("dueDate")}
                type="date"
                value={formData.due_date}
                onChange={handleFieldChange("due_date")}
                required
                error={errors.due_date}
                icon={Calendar}
              />

              <FormField
                label={t("status")}
                type="select"
                value={formData.status}
                onChange={handleFieldChange("status")}
                options={[
                  { value: "Pending", label: t("pending") },
                  { value: "Paid", label: t("paid") },
                  { value: "Overdue", label: t("overdue") },
                ]}
                required
              />

              <FormField
                label={t("paymentMethod")}
                type="select"
                value={formData.payment_method}
                onChange={handleFieldChange("payment_method")}
                options={[
                  { value: "Bank Transfer", label: t("bankTransfer") },
                  { value: "Check", label: t("check") },
                  { value: "Cash", label: t("cash") },
                ]}
                required
              />
            </div>
          </div>

          {/* Items Section */}
          <div>
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("invoiceItems")}
            </h3>

            {/* Add New Item */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <h4
                className={`text-sm font-medium text-gray-900 dark:text-white mb-3 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("addNewItem")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newItem.item_name}
                  onChange={(e) =>
                    handleNewItemChange("item_name", e.target.value)
                  }
                  placeholder={t("itemName")}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) =>
                    handleNewItemChange("quantity", parseInt(e.target.value))
                  }
                  placeholder={t("quantity")}
                  min="1"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="number"
                  value={newItem.unit_price}
                  onChange={(e) =>
                    handleNewItemChange(
                      "unit_price",
                      parseFloat(e.target.value)
                    )
                  }
                  placeholder={t("unitPrice")}
                  min="0"
                  step="0.01"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {t("addItem")}
              </button>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`grid grid-cols-4 gap-4 items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    <div className={`${isRTL ? "text-right" : "text-left"}`}>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isRTL
                          ? `${item.item_name} x ${item.quantity}`
                          : `${item.quantity}x ${item.item_name}`}
                      </span>
                    </div>
                    <div className={`${isRTL ? "text-right" : "text-left"}`}>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {isRTL
                          ? ` ${t("each")} ${(
                              parseFloat(item.unit_price) || 0
                            ).toFixed(2)} `
                          : ` ${(
                              parseFloat(item.unit_price) || 0
                            ).toFixed(2)} ${t("each")}`}
                      </span>
                    </div>
                    <div className={`${isRTL ? "text-right" : "text-left"}`}>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        $
                        {(parseFloat(item.subtotal || item.total) || 0).toFixed(
                          2
                        )}
                      </span>
                    </div>
                    <div
                      className={`flex ${
                        isRTL ? "justify-end" : "justify-end"
                      }`}
                    >
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
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                {errors.items}
              </p>
            )}
          </div>

          {/* Financial Information */}
          <div>
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("financialInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label={t("subtotal")}
                type="number"
                value={formData.items.reduce((sum, item) => {
                  return sum + (parseFloat(item.subtotal || item.total) || 0);
                }, 0)}
                min="0"
                step="0.01"
                required
                icon={Calculator}
                disabled
              />

              <FormField
                label={t("tax")}
                type="number"
                value={formData.tax}
                onChange={handleFieldChange("tax")}
                min="0"
                step="0.01"
                required
                error={errors.tax}
                icon={DollarSign}
              />

              <FormField
                label={t("total")}
                type="number"
                value={formData.total}
                min="0"
                step="0.01"
                required
                icon={DollarSign}
                disabled
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
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
              className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting
                  ? t("saving")
                  : mode === "add"
                  ? t("addInvoice")
                  : t("updateInvoice")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierInvoiceForm;
