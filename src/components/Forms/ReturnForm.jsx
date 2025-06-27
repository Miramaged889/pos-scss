import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  X,
  Package,
  RotateCcw,
  AlertTriangle,
  DollarSign,
  Calendar,
  FileText,
  User,
} from "lucide-react";
import FormField from "./FormField";
import { getOrders } from "../../utils/localStorage";

const ReturnForm = ({ isOpen, onClose, onSubmit, editData = null }) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const { products } = useSelector((state) => state.inventory);
  const [orders] = useState(getOrders());
  const [formData, setFormData] = useState({
    orderId: "",
    customerId: "",
    customerName: "",
    productId: "",
    productName: "",
    quantity: 1,
    reason: "",
    description: "",
    refundAmount: 0,
    status: "pending",
  });
  const [errors, setErrors] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (editData) {
      setFormData(editData);
      const order = orders.find((o) => o.id === editData.orderId);
      setSelectedOrder(order);
    }
  }, [editData, orders]);

  const returnReasons = [
    { value: "defective", label: t("defectiveProduct") },
    { value: "wrongOrder", label: t("wrongOrder") },
    { value: "damaged", label: t("damagedProduct") },
    { value: "expired", label: t("expiredProduct") },
    { value: "unsatisfied", label: t("qualityUnsatisfactory") },
    { value: "other", label: t("other") },
  ];

  const handleOrderSelect = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setFormData((prev) => ({
        ...prev,
        orderId: order.id,
        customerId: order.customer || "",
        customerName: order.customer || "",
      }));
    }
  };

  const handleProductSelect = (productId) => {
    const product = products.find((p) => p.id === parseInt(productId));
    if (product) {
      setFormData((prev) => ({
        ...prev,
        productId: product.id,
        productName: product.name,
        refundAmount: product.price * prev.quantity,
      }));
    }
  };

  const handleQuantityChange = (quantity) => {
    const product = products.find((p) => p.id === parseInt(formData.productId));
    if (product) {
      setFormData((prev) => ({
        ...prev,
        quantity: parseInt(quantity) || 1,
        refundAmount: product.price * (parseInt(quantity) || 1),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.orderId) {
      newErrors.orderId = t("orderIdRequired");
    }

    if (!formData.productId) {
      newErrors.productId = t("productRequired");
    }

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = t("validQuantityRequired");
    }

    if (!formData.reason) {
      newErrors.reason = t("reasonRequired");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("descriptionRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const returnData = {
        ...formData,
        id: editData?.id || Date.now(),
        returnDate: editData?.returnDate || new Date().toISOString(),
      };

      // Let the parent component handle localStorage operations
      onSubmit(returnData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      orderId: "",
      customerId: "",
      customerName: "",
      productId: "",
      productName: "",
      quantity: 1,
      reason: "",
      description: "",
      refundAmount: 0,
      status: "pending",
    });
    setErrors({});
    setSelectedOrder(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <RotateCcw className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editData ? t("editReturn") : t("processReturn")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("processReturnDescription")}
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
          {/* Order Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("selectOrder")}
              name="orderId"
              type="select"
              value={formData.orderId}
              onChange={(e) => handleOrderSelect(e.target.value)}
              error={errors.orderId}
              required
              icon={<FileText className="w-4 h-4" />}
              options={[
                { value: "", label: t("selectOrder") },
                ...orders.map((order) => ({
                  value: order.id,
                  label: `${order.id} - ${order.customer}`,
                })),
              ]}
            />

            {selectedOrder && (
              <div className={`${isRTL ? "text-right" : "text-left"}`}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("orderDetails")}
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                  <div
                    className={`flex items-center gap-2 ${
                      isRTL ? "flex-row" : ""
                    }`}
                  >
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedOrder.customer}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      isRTL ? "flex-row" : ""
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={t("selectProduct")}
              name="productId"
              type="select"
              value={formData.productId}
              onChange={(e) => handleProductSelect(e.target.value)}
              error={errors.productId}
              required
              icon={<Package className="w-4 h-4" />}
              options={[
                { value: "", label: t("selectProduct") },
                ...products.map((product) => ({
                  value: product.id,
                  label: product.name,
                })),
              ]}
            />

            <FormField
              label={t("quantity")}
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              error={errors.quantity}
              required
              min="1"
              icon={<Package className="w-4 h-4" />}
            />
          </div>

          {/* Return Reason */}
          <FormField
            label={t("returnReason")}
            name="reason"
            type="select"
            value={formData.reason}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, reason: e.target.value }))
            }
            error={errors.reason}
            required
            icon={<AlertTriangle className="w-4 h-4" />}
            options={[
              { value: "", label: t("selectReason") },
              ...returnReasons,
            ]}
          />

          {/* Description */}
          <FormField
            label={t("description")}
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            error={errors.description}
            required
            placeholder={t("describeIssueDetail")}
            rows={3}
          />

          {/* Refund Amount */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div
              className={`flex items-center gap-2 mb-2 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <label className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {t("refundAmount")}
              </label>
            </div>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              {formData.refundAmount.toFixed(2)} {t("currency")}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {t("calculatedAutomatically")}
            </p>
          </div>

          {/* Form Actions */}
          <div
            className={`flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-all duration-200 hover:scale-105 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              {editData ? t("updateReturn") : t("processReturn")}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnForm;
