import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, ShoppingCart, X } from "lucide-react";
import FormField from "./FormField";
import {
  saveFormDraft,
  getFormDraft,
  clearFormDraft,
} from "../../utils/localStorage";
import { addOrder, updateOrder } from "../../store/slices/ordersSlice";

const OrderForm = ({
  onSubmit,
  initialData = null,
  submitLabel,
  onClose,
  mode = "add", // "add" or "edit"
}) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const dispatch = useDispatch();

  // Get products from Redux inventory slice
  const { products } = useSelector((state) => state.inventory);

  const [formData, setFormData] = useState({
    customer: initialData?.customer || "",
    customerPhone: initialData?.customerPhone || "",
    deliveryAddress: initialData?.deliveryAddress || "",
    notes: initialData?.notes || "",
    kitchenNotes: initialData?.kitchenNotes || "",
    priority: initialData?.priority || "normal",
  });

  const [orderItems, setOrderItems] = useState(initialData?.products || []);
  const [errors, setErrors] = useState({});

  // Load form draft or initial data when component mounts
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        customer: initialData.customer || "",
        customerPhone: initialData.customerPhone || "",
        deliveryAddress: initialData.deliveryAddress || "",
        notes: initialData.notes || "",
        kitchenNotes: initialData.kitchenNotes || "",
        priority: initialData.priority || "normal",
      });
      setOrderItems(initialData.products || []);
    } else if (mode === "add") {
      // Try to load draft for new order form
      const draft = getFormDraft("order_add");
      if (draft) {
        setFormData({
          customer: draft.customer || "",
          customerPhone: draft.customerPhone || "",
          deliveryAddress: draft.deliveryAddress || "",
          notes: draft.notes || "",
          kitchenNotes: draft.kitchenNotes || "",
          priority: draft.priority || "normal",
        });
        setOrderItems(draft.orderItems || []);
      } else {
        // Reset form for new order
        setFormData({
          customer: "",
          customerPhone: "",
          deliveryAddress: "",
          notes: "",
          kitchenNotes: "",
          priority: "normal",
        });
        setOrderItems([]);
      }
    }
    setErrors({});
  }, [initialData, mode]);

  // Auto-save form draft when form data changes (for add mode only)
  useEffect(() => {
    if (mode === "add") {
      const timeoutId = setTimeout(() => {
        // Only save if form has some data
        if (formData.customer || orderItems.length > 0) {
          saveFormDraft("order_add", { ...formData, orderItems });
        }
      }, 1000); // Save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, orderItems, mode]);

  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: "", quantity: 1, price: 0 }]);
  };

  const removeOrderItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index, field, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index][field] = value;

    if (field === "productId") {
      const product = products.find((p) => p.id === parseInt(value));
      if (product) {
        updatedItems[index].price = product.price;
        updatedItems[index].name = product.name;
      }
    }

    setOrderItems(updatedItems);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer.trim()) {
      newErrors.customer = t("customerNameRequired");
    }

    if (orderItems.length === 0) {
      newErrors.items = t("atLeastOneProductRequired");
    }

    orderItems.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`item_${index}_product`] = t("productSelectionRequired");
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = t(
          "quantityMustBeGreaterThanZero"
        );
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const orderData = {
        ...formData,
        customer: formData.customer,
        phone: formData.customerPhone,
        products: orderItems.map((item) => ({
          productId: parseInt(item.productId),
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: calculateTotal(),
        items: orderItems.length,
        createdAt: new Date().toISOString(),
        status: "pending",
        generalNotes: formData.notes,
      };

      if (mode === "edit" && initialData?.id) {
        // Update existing order via Redux
        dispatch(
          updateOrder({
            orderId: initialData.id,
            updates: orderData,
          })
        );
        // Call the parent onSubmit with the order data
        if (onSubmit) {
          onSubmit(orderData);
        }
      } else {
        // For new orders, let the parent component handle Redux dispatch
        // This prevents double addition when parent also calls dispatch(addOrder)
        if (onSubmit) {
          onSubmit(orderData);
        } else {
          // Only dispatch if no parent handler (standalone usage)
          dispatch(addOrder(orderData));
        }
        // Clear the form draft after successful submission
        clearFormDraft("order_add");
      }

      // Reset form if adding new order
      if (mode === "add") {
        setFormData({
          customer: "",
          customerPhone: "",
          deliveryAddress: "",
          notes: "",
          kitchenNotes: "",
          priority: "normal",
        });
        setOrderItems([]);
        setErrors({});
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      setErrors({ submit: t("errorCreatingOrder") });
    }
  };

  const handleClose = () => {
    // Save draft before closing if in add mode and form has data
    if (mode === "add" && (formData.customer || orderItems.length > 0)) {
      saveFormDraft("order_add", { ...formData, orderItems });
    }
    if (onClose) {
      onClose();
    }
  };

  const clearDraft = () => {
    clearFormDraft("order_add");
    setFormData({
      customer: "",
      customerPhone: "",
      deliveryAddress: "",
      notes: "",
      kitchenNotes: "",
      priority: "normal",
    });
    setOrderItems([]);
  };

  const priorityOptions = [
    { value: "normal", label: t("normal") },
    { value: "medium", label: t("medium") },
    { value: "high", label: t("urgent") },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {initialData ? t("editOrder") : t("newOrder")}
            </h2>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            {mode === "add" && getFormDraft("order_add") && (
              <button
                onClick={clearDraft}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={t("clearDraft")}
              >
                {t("clearDraft")}
              </button>
            )}
            {onClose && (
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Draft indicator */}
        {mode === "add" && getFormDraft("order_add") && (
          <div className="mb-6 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              📝 {t("draftRestored")} - {t("formDataSavedAutomatically")}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("customerName")}
              value={formData.customer}
              onChange={(e) => handleInputChange("customer", e.target.value)}
              placeholder={t("enterCustomerName")}
              required
              error={errors.customer}
            />

            <FormField
              label={t("phoneNumber")}
              type="tel"
              value={formData.customerPhone}
              onChange={(e) =>
                handleInputChange("customerPhone", e.target.value)
              }
              placeholder={t("enterPhoneNumber")}
            />
          </div>

          <FormField
            label={t("deliveryAddress")}
            value={formData.deliveryAddress}
            onChange={(e) =>
              handleInputChange("deliveryAddress", e.target.value)
            }
            placeholder={t("enterDeliveryAddress")}
          />

          <FormField
            label={t("orderPriority")}
            type="select"
            value={formData.priority}
            onChange={(e) => handleInputChange("priority", e.target.value)}
            options={priorityOptions}
          />

          {/* Order Items */}
          <div>
            <div
              className={`flex items-center justify-between mb-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("products")}
              </h3>
              <button
                type="button"
                onClick={addOrderItem}
                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Plus className="w-4 h-4" />
                {t("addProduct")}
              </button>
            </div>

            {errors.items && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {errors.items}
              </p>
            )}

            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="md:col-span-2">
                    <FormField
                      label={t("product")}
                      type="select"
                      value={item.productId}
                      onChange={(e) =>
                        updateOrderItem(index, "productId", e.target.value)
                      }
                      placeholder={t("selectProduct")}
                      options={products.map((product) => ({
                        value: product.id,
                        label: `${product.name} - ${t("stock")}: ${
                          product.stock
                        }`,
                      }))}
                      error={errors[`item_${index}_product`]}
                      required
                    />
                  </div>

                  <FormField
                    label={t("quantity")}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateOrderItem(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 1
                      )
                    }
                    error={errors[`item_${index}_quantity`]}
                  />

                  <FormField
                    label={t("price")}
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) =>
                      updateOrderItem(
                        index,
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeOrderItem(index)}
                      className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("generalNotes")}
              type="textarea"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder={t("anyOrderNotes")}
              rows={3}
            />

            <FormField
              label={t("kitchenNotes")}
              type="textarea"
              value={formData.kitchenNotes}
              onChange={(e) =>
                handleInputChange("kitchenNotes", e.target.value)
              }
              placeholder={t("specialKitchenInstructions")}
              rows={3}
            />
          </div>

          {/* Total */}
          <div className="bg-gray-50 dark:bg-gray-700 flex justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <span className="text-gray-900 dark:text-white text-lg font-semibold">
                {t("total")}:
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-600 dark:text-blue-400 text-lg font-semibold">
                {calculateTotal().toFixed(2)} {t("currency")}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <span className="text-sm text-red-600 dark:text-red-400">
                {errors.submit}
              </span>
            </div>
          )}

          {/* Submit */}
          <div
            className={`flex justify-end gap-4 ${
              isRTL ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {onClose && (
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t("cancel")}
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {submitLabel ||
                (mode === "edit" ? t("updateOrder") : t("addOrder"))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
