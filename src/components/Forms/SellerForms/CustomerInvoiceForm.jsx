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
    customer_name: "",
    customer_phone: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "pending",
    notes: "",
    items: [],
    subtotal: "0.00",
    tax: "0.00",
    total: "0.00",
    payment_method: null,
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
        customer_name: invoice.customer_name || invoice.customerName || "",
        customer_phone: invoice.customer_phone || invoice.customerPhone || "",
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
        status: invoice.status || "pending",
        notes: invoice.notes || "",
        items: Array.isArray(invoice.items)
          ? invoice.items.map((item) => ({
              productId: item.product?.id || null,
              name:
                item.product?.english_name || item.product?.arabic_name || "",
              quantity: item.quantity || 0,
              unitPrice: parseFloat(item.product?.price || 0),
              total:
                (item.quantity || 0) * parseFloat(item.product?.price || 0),
            }))
          : [],
        subtotal: (invoice.subTotal || invoice.subtotal || 0).toString(),
        tax: (invoice.tax || 0).toString(),
        total: (invoice.total || 0).toString(),
        payment_method: invoice.payment_method || null,
      });


    } else {
      setFormData({
        customer_name: "",
        customer_phone: "",
        issue_date: new Date().toISOString().split("T")[0],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        status: "pending",
        notes: "",
        items: [],
        subtotal: "0.00",
        tax: "0.00",
        total: "0.00",
        payment_method: null,
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

  const handleFieldChange = (field) => (e) => {
    const value = e.target.value;

    if (field === "tax") {
      const taxValue = parseFloat(value) || 0;
      handleInputChange(field, taxValue.toFixed(2));

      // Recalculate total when tax changes
      const { subTotal } = calculateTotals();
      setFormData((prev) => ({
        ...prev,
        total: (subTotal + taxValue).toFixed(2),
      }));
    } else {
      handleInputChange(field, value);
    }
  };

  const handleNewItemChange = (field, value) =>
    setNewItem((prev) => ({ ...prev, [field]: value }));

  const handleSelectProduct = (value) => {
    const selectedId = value ? parseInt(value) : "";
    const product = products.find((p) => p.id === selectedId);
    if (product) {
      setNewItem((prev) => ({
        ...prev,
        productId: selectedId,
        name: product.english_name || product.arabic_name || product.name,
        unitPrice: parseFloat(product.price || 0),
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
    setFormData((prev) => {
      const newItems = [...prev.items, item];
      const subtotal = newItems.reduce((sum, it) => sum + (it.total || 0), 0);
      const taxAmount = parseFloat(prev.tax) || 0;
      return {
        ...prev,
        items: newItems,
        subtotal: subtotal.toFixed(2),
        total: (subtotal + taxAmount).toFixed(2),
      };
    });
    setNewItem({ productId: "", name: "", quantity: 1, unitPrice: 0 });
  };

  const removeItem = (index) => {
    setFormData((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, it) => sum + (it.total || 0), 0);
      const taxAmount = parseFloat(prev.tax) || 0;
      return {
        ...prev,
        items: newItems,
        subtotal: subtotal.toFixed(2),
        total: (subtotal + taxAmount).toFixed(2),
      };
    });
  };

  const calculateTotals = () => {
    const subTotal = formData.items.reduce(
      (sum, it) => sum + (it.total || 0),
      0
    );
    const taxAmount = parseFloat(formData.tax) || 0;
    const grandTotal = subTotal + taxAmount;
    return { subTotal, grandTotal };
  };

  const validateForm = () => {
    const next = {};
    if (!formData.customer_name || !formData.customer_name.toString().trim())
      next.customer_name = t("customerNameRequired");
    if (!formData.customer_phone || !formData.customer_phone.toString().trim())
      next.customer_phone = t("phoneRequired");
    if (!formData.issue_date) next.issue_date = t("issueDateRequired");
    if (!formData.due_date) next.due_date = t("dueDateRequired");
    if (new Date(formData.due_date) <= new Date(formData.issue_date))
      next.due_date = t("dueDateMustBeAfterIssueDate");
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

      // Transform items to match backend schema
      const transformedItems = formData.items.map((item) => ({
        product: item.productId, // Backend expects product ID
        quantity: item.quantity,
      }));

      const payload = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        items: transformedItems,
        subtotal: subTotal.toFixed(2),
        tax: (parseFloat(formData.tax) || 0).toFixed(2),
        total: grandTotal.toFixed(2),
        notes: formData.notes,
        payment_method: formData.payment_method,
        status: formData.status,
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
                label={t("issueDate")}
                type="date"
                value={formData.issue_date}
                onChange={handleFieldChange("issue_date")}
                error={errors.issue_date}
                required
                icon={Calendar}
              />

              <FormField
                label={t("dueDate")}
                type="date"
                value={formData.due_date}
                onChange={handleFieldChange("due_date")}
                error={errors.due_date}
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
                value={formData.customer_name}
                onChange={(e) => {
                  const selectedCustomer = customers.find(
                    (c) => c.customer_name === e.target.value
                  );
                  handleInputChange("customer_name", e.target.value);
                  if (selectedCustomer) {
                    handleInputChange(
                      "customer_phone",
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
                        `customer-${customer.id || index}`,
                      label:
                        customer.customer_name ||
                        `Customer ${customer.id || index}`,
                    };
                  }),
                ]}
                error={errors.customer_name}
                required
                icon={User}
                disabled={loadingCustomers}
                helperText={loadingCustomers ? t("loadingCustomers") : ""}
              />
              <FormField
                label={t("phoneNumber")}
                value={formData.customer_phone}
                onChange={handleFieldChange("customer_phone")}
                placeholder={t("enterPhoneNumber")}
                error={errors.customer_phone}
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
                        value: product.id || `product-${index}`,
                        label:
                          product.english_name ||
                          product.arabic_name ||
                          product.name ||
                          `Product ${product.id || index}`,
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

          {/* Tax, Payment Method, and Status Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label={t("tax")}
              type="number"
              value={formData.tax}
              onChange={(e) => {
                const value = e.target.value;
                handleInputChange("tax", value);

                // Recalculate total when tax changes
                const subTotal = formData.items.reduce(
                  (sum, it) => sum + (it.total || 0),
                  0
                );
                const taxAmount = parseFloat(value) || 0;
                setFormData((prev) => ({
                  ...prev,
                  total: (subTotal + taxAmount).toFixed(2),
                }));
              }}
              placeholder={t("enterTax")}
              min={0}
              step={0.01}
              icon={DollarSign}
            />

            <FormField
              label={t("paymentMethod")}
              type="select"
              value={formData.payment_method || ""}
              onChange={(e) =>
                handleInputChange("payment_method", e.target.value || null)
              }
              options={[
                { value: "", label: t("selectPaymentMethod") },
                { value: "cash", label: t("cash") },
                { value: "card", label: t("card") },
                { value: "knet", label: t("knet") },
                { value: "digital", label: t("digital") },
              ]}
              icon={DollarSign}
            />

            <FormField
              label={t("status")}
              type="select"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              options={[
                { value: "pending", label: t("pending") },
                { value: "completed", label: t("completed") },
                { value: "cancelled", label: t("cancelled") },
              ]}
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("invoiceSummary")}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("subtotal")}:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {parseFloat(formData.subtotal || 0).toFixed(2)}{" "}
                  {t("currency")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("tax")}:
                </span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {parseFloat(formData.tax || 0).toFixed(2)} {t("currency")}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {t("total")}:
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {parseFloat(formData.total || 0).toFixed(2)} {t("currency")}
                  </span>
                </div>
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
