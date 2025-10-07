import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  X,
  Save,
  FileText,
  User,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  Plus,
} from "lucide-react";

import FormField from "../FormField";
import {
  createCustomerInvoice,
  updateCustomerInvoice,
} from "../../../store/slices/customerInvoiceSlice";
import { fetchProducts } from "../../../store/slices/inventorySlice";
import { customerService } from "../../../services";

const CustomerInvoiceForm = ({
  isOpen,
  onClose,
  onSubmit,
  invoice = null,
  mode = "add",
}) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const { products = [] } = useSelector((state) => state.inventory) || {};
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    customerName: "",
    customerPhone: "",
    orderId: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "pending",
    notes: "",
    items: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    productId: "",
    name: "",
    quantity: 1,
    unitPrice: 0,
  });
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Fetch customers when form opens
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!isOpen) return;
      setLoadingCustomers(true);
      try {
        const response = await customerService.getCustomers();
        const customersList = Array.isArray(response)
          ? response
          : response.results || [];
        setCustomers(customersList);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, [isOpen]);

  // Fetch products when form opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchProducts());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    if (invoice && mode === "edit") {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || "",
        customerName: invoice.customerName || "",
        customerPhone: invoice.customerPhone
          ? invoice.customerPhone.toString()
          : "",
        orderId: invoice.orderId || "",
        issueDate: invoice.issueDate
          ? invoice.issueDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        dueDate: invoice.dueDate
          ? invoice.dueDate.split("T")[0]
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
        status: invoice.status || "pending",
        notes: invoice.notes || "",
        items: Array.isArray(invoice.items)
          ? invoice.items
              .map((item) => ({
                productId: item.productId || item.product_id || null,
                name: item.name || item.product_name || "",
                quantity: item.quantity || 0,
                unitPrice: item.unitPrice || item.unit_price || 0,
                total:
                  item.total ||
                  (item.quantity || 0) *
                    (item.unitPrice || item.unit_price || 0),
              }))
              .filter((item) => item.productId !== null) // Filter out items without product ID
          : [],
      });
    } else {
      setFormData({
        invoiceNumber: "",
        customerName: "",
        customerPhone: "",
        orderId: "",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        status: "pending",
        notes: "",
        items: [],
      });
    }
    setErrors({});
    setNewItem({ productId: "", name: "", quantity: 1, unitPrice: 0 });
    setIsSubmitting(false);
  }, [isOpen, invoice, mode]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFieldChange = (field) => (e) =>
    handleInputChange(field, e.target.value);

  const handleNewItemChange = (field, value) =>
    setNewItem((prev) => ({ ...prev, [field]: value }));

  const handleSelectProduct = (value) => {
    const selectedId = value ? parseInt(value) : "";
    const product = products.find((p) => p.id === selectedId);
    if (product) {
      setNewItem((prev) => ({
        ...prev,
        productId: selectedId,
        name: product.name,
        unitPrice: product.price ?? prev.unitPrice,
      }));
    } else {
      setNewItem((prev) => ({ ...prev, productId: "", name: "" }));
    }
  };

  const addItem = () => {
    if (!newItem.productId || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      setErrors((prev) => ({ ...prev, items: t("pleaseFillAllItemFields") }));
      return;
    }
    const item = {
      productId: newItem.productId,
      name: newItem.name,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      total: newItem.quantity * newItem.unitPrice,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, item] }));
    setNewItem({ productId: "", name: "", quantity: 1, unitPrice: 0 });
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotals = () => {
    const subTotal = formData.items.reduce(
      (sum, it) => sum + (it.total || 0),
      0
    );
    const grandTotal = subTotal;
    return { subTotal, grandTotal };
  };

  const validateForm = () => {
    const next = {};
    if (!formData.customerName || !formData.customerName.toString().trim())
      next.customerName = t("customerNameRequired");
    if (!formData.customerPhone || !formData.customerPhone.toString().trim())
      next.customerPhone = t("phoneRequired");
    if (!formData.issueDate) next.issueDate = t("issueDateRequired");
    if (!formData.dueDate) next.dueDate = t("dueDateRequired");
    if (new Date(formData.dueDate) <= new Date(formData.issueDate))
      next.dueDate = t("dueDateMustBeAfterIssueDate");
    if (!Array.isArray(formData.items) || formData.items.length === 0)
      next.items = t("atLeastOneItemRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    try {
      const { subTotal, grandTotal } = calculateTotals();
      const payload = {
        ...formData,
        amount: subTotal,
        total: grandTotal,
        issueDate: new Date(formData.issueDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        createdAt: invoice?.createdAt || new Date().toISOString(),
      };

      let result;
      if (mode === "edit" && invoice) {
        result = await dispatch(
          updateCustomerInvoice({ id: invoice.id, updates: payload })
        );
      } else {
        result = await dispatch(createCustomerInvoice(payload));
      }

      if (result.type.endsWith("/fulfilled")) {
        handleClose();
        // Call onSubmit callback with the invoice data, not dispatching again
        if (onSubmit) {
          onSubmit(result.payload);
        }
      } else {
        setErrors({ submit: result.payload || t("errorSavingInvoice") });
        setIsSubmitting(false); // Reset on error
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      setErrors({ submit: t("errorSavingInvoice") });
      setIsSubmitting(false); // Reset on error
    }
  };

  const handleClose = () => {
    setErrors({});
    setNewItem({ productId: "", name: "", quantity: 1, unitPrice: 0 });
    setIsSubmitting(false); // Reset submitting state
    onClose();
  };

  if (!isOpen) return null;

  const { subTotal, grandTotal } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === "add"
                  ? isRTL
                    ? "إنشاء فاتورة عميل"
                    : "Create Customer Invoice"
                  : isRTL
                  ? "تعديل فاتورة عميل"
                  : "Edit Customer Invoice"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL
                  ? "أدخل تفاصيل الفاتورة للعميل"
                  : "Enter invoice details for the customer"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
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
                label={
                  isRTL ? "رقم الفاتورة (اختياري)" : "Invoice Number (optional)"
                }
                value={formData.invoiceNumber}
                onChange={handleFieldChange("invoiceNumber")}
                placeholder={
                  isRTL ? "أدخل رقم الفاتورة" : "Enter invoice number"
                }
                icon={FileText}
              />

              <FormField
                label={t("orderId")}
                value={formData.orderId}
                onChange={handleFieldChange("orderId")}
                placeholder={t("enterOrderId")}
                icon={FileText}
              />

              <FormField
                label={t("issueDate")}
                type="date"
                value={formData.issueDate}
                onChange={handleFieldChange("issueDate")}
                error={errors.issueDate}
                required
                icon={Calendar}
              />

              <FormField
                label={t("dueDate")}
                type="date"
                value={formData.dueDate}
                onChange={handleFieldChange("dueDate")}
                error={errors.dueDate}
                required
                icon={Calendar}
              />
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("customerInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t("customerName")}
                type="select"
                value={formData.customerName}
                onChange={(e) => {
                  const selectedCustomer = customers.find(
                    (c) => c.customer_name === e.target.value // ✅ Use correct field name
                  );
                  handleInputChange("customerName", e.target.value);
                  if (selectedCustomer) {
                    handleInputChange(
                      "customerPhone",
                      selectedCustomer.customer_phone
                        ? selectedCustomer.customer_phone.toString()
                        : ""
                    );
                  }
                }}
                options={[
                  { value: "", label: t("selectCustomer") },
                  ...customers.map((customer, index) => {
                    return {
                      value:
                        customer.customer_name ||
                        `customer-${customer.id || index}`, // ✅ Ensure unique value
                      label:
                        customer.customer_name ||
                        `Customer ${customer.id || index}`, // ✅ Fallback label
                    };
                  }),
                ]}
                error={errors.customerName}
                required
                icon={User}
                disabled={loadingCustomers}
                helperText={loadingCustomers ? t("loadingCustomers") : ""}
              />
              <FormField
                label={t("phoneNumber")}
                value={formData.customerPhone}
                onChange={handleFieldChange("customerPhone")}
                placeholder={t("enterPhoneNumber")}
                error={errors.customerPhone}
                required
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("invoiceItems")}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <FormField
                  label={t("itemName")}
                  type="select"
                  value={newItem.productId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  options={[
                    { value: "", label: t("selectProduct") },
                    ...products.map((product, index) => {
                      return {
                        value: product.id || `product-${index}`, // ✅ Ensure unique value
                        label: product.name || `Product ${product.id || index}`, // ✅ Fallback label
                      };
                    }),
                  ]}
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
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> {t("addItem")}
                  </button>
                </div>
              </div>
              {errors.items && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {errors.items}
                </p>
              )}
            </div>

            {formData.items && formData.items.length > 0 && (
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name || "Unknown Item"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.quantity || 0} x{" "}
                        {(item.unitPrice || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(item.total || 0).toFixed(2)}
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
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("subtotal")}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {subTotal.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {t("total")}:
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <FormField
              label={t("notes")}
              value={formData.notes}
              onChange={handleFieldChange("notes")}
              placeholder={t("enterNotes")}
              rows={3}
              icon={FileText}
            />
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400">
                {errors.submit}
              </span>
            </div>
          )}

          {/* Actions */}
          <div
            className={`flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 ${
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting
                ? t("saving")
                : mode === "add"
                ? isRTL
                  ? "إنشاء الفاتورة"
                  : "Create Invoice"
                : isRTL
                ? "تحديث الفاتورة"
                : "Update Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerInvoiceForm;
