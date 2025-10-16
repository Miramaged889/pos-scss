import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
import FormField from "../FormField";
import { fetchOrders } from "../../../store/slices/ordersSlice";
import { customerService } from "../../../services";

const ReturnForm = ({ isOpen, onClose, onSubmit, editData = null }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state) => state.language);
  const { orders } = useSelector((state) => state.orders);
  const [formData, setFormData] = useState({
    orderItemId: "",
    customerId: "",
    customerName: "",
    productId: "",
    productName: "",
    quantity: 1,
    reason: "",
    description: "",
    refundAmount: 0,
  });
  const [errors, setErrors] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [orderProducts, setOrderProducts] = useState([]);

  useEffect(() => {
    if (editData) {
      setFormData(editData);
      const order = orders.find((o) => o.id === editData.orderItemId);
      setSelectedOrder(order);
    }
  }, [editData, orders]);

  // Load orders and customers when component mounts
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchOrders());
      loadCustomers();
    }
  }, [isOpen, dispatch]);

  const loadCustomers = async () => {
    try {
      const response = await customerService.getCustomers();
      const customersList = Array.isArray(response)
        ? response
        : response.data || [];
      setCustomers(customersList);
    } catch (error) {
      console.error("Error loading customers:", error);
      setCustomers([]);
    }
  };

  const returnReasons = [
    { value: "defective", label: t("defectiveProduct") },
    { value: "wrongOrder", label: t("wrongOrder") },
    { value: "damaged", label: t("damagedProduct") },
    { value: "expired", label: t("expiredProduct") },
    { value: "unsatisfied", label: t("qualityUnsatisfactory") },
    { value: "other", label: t("other") },
  ];

  // Handle customer selection
  const handleCustomerSelect = (customerId) => {
    const customer = customers.find((c) => c.id === parseInt(customerId));
    if (customer) {
      // Filter orders for this customer
      const filteredOrders = orders.filter(
        (o) =>
          o.customer === parseInt(customerId) ||
          o.customer === customer.customer_name ||
          o.customer === customer.name
      );
      setCustomerOrders(filteredOrders);
      setFormData((prev) => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.customer_name || customer.name || "",
        orderItemId: "",
        productId: "",
        productName: "",
        quantity: 1,
        refundAmount: 0,
      }));
      setSelectedOrder(null);
      setOrderProducts([]);
    }
  };

  const handleOrderSelect = (orderId) => {
    const order = customerOrders.find((o) => o.id === parseInt(orderId));
    if (order) {
      setSelectedOrder(order);

      // Extract products from the order
      // Assuming order has items array or product information
      let productsInOrder = [];

      // Check if order has items array
      if (order.items && Array.isArray(order.items)) {
        productsInOrder = order.items.map((item) => ({
          id: item.product_id || item.productId || item.id,
          name: item.product_name || item.productName || item.name,
          quantity: item.quantity,
          price: item.price || item.unitPrice || 0,
        }));
      }
      // Check if order has direct product information
      else if (order.product_id || order.productId) {
        productsInOrder = [
          {
            id: order.product_id || order.productId,
            name: order.product_name || order.productName,
            quantity: order.quantity,
            price: order.price || order.unitPrice || 0,
          },
        ];
      }
      // Check if order has product field that is a product object
      else if (order.product) {
        productsInOrder = [
          {
            id: order.product.id,
            name: order.product.name,
            quantity: order.quantity,
            price: order.product.price || 0,
          },
        ];
      }

      setOrderProducts(productsInOrder);
      setFormData((prev) => ({
        ...prev,
        orderItemId: order.id,
        productId: "",
        productName: "",
        quantity: 1,
        refundAmount: 0,
      }));
    }
  };

  const handleProductSelect = (productId) => {
    const product = orderProducts.find((p) => p.id === parseInt(productId));
    if (product) {
      setFormData((prev) => ({
        ...prev,
        productId: product.id,
        productName: product.name,
        quantity: product.quantity || 1,
        refundAmount: product.price * (product.quantity || 1),
      }));
    }
  };

  const handleQuantityChange = (quantity) => {
    const product = orderProducts.find(
      (p) => p.id === parseInt(formData.productId)
    );
    if (product) {
      const qty = parseInt(quantity) || 1;
      // Don't allow more than the original quantity
      const maxQty = product.quantity || 1;
      const finalQty = Math.min(qty, maxQty);

      setFormData((prev) => ({
        ...prev,
        quantity: finalQty,
        refundAmount: product.price * finalQty,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.orderItemId) {
      newErrors.orderItemId = t("orderIdRequired");
    }

    if (!formData.customerId) {
      newErrors.customerId = t("customerRequired");
    }

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = t("validQuantityRequired");
    }

    if (!formData.reason) {
      newErrors.reason = t("reasonRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const returnData = {
        ...formData,
        id: editData?.id || `RTN-${Date.now()}`,
        returnDate: editData?.returnDate || new Date().toISOString(),
      };

      // Let the parent component handle API operations
      onSubmit(returnData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      orderItemId: "",
      customerId: "",
      customerName: "",
      productId: "",
      productName: "",
      quantity: 1,
      reason: "",
      description: "",
      refundAmount: 0,
    });
    setErrors({});
    setSelectedOrder(null);
    setCustomerOrders([]);
    setOrderProducts([]);
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
          {/* Customer Selection - First Step */}
          <div className="grid grid-cols-1 gap-6">
            <FormField
              label={t("selectCustomer")}
              name="customerId"
              type="select"
              value={formData.customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              error={errors.customerId}
              required
              icon={<User className="w-4 h-4" />}
              options={[
                { value: "", label: t("selectCustomer") },
                ...customers.map((customer) => ({
                  value: customer.id,
                  label:
                    customer.customer_name ||
                    customer.name ||
                    `Customer ${customer.id}`,
                })),
              ]}
            />
          </div>

          {/* Order Selection - Second Step (shown after customer selected) */}
          {formData.customerId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label={t("selectOrder")}
                name="orderItemId"
                type="select"
                value={formData.orderItemId}
                onChange={(e) => handleOrderSelect(e.target.value)}
                error={errors.orderItemId}
                required
                icon={<FileText className="w-4 h-4" />}
                options={[
                  { value: "", label: t("selectOrder") },
                  ...(customerOrders || []).map((order) => ({
                    value: order.id,
                    label: `${t("order")} #${order.id} - ${new Date(
                      order.createdAt
                    ).toLocaleDateString()}`,
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
                        {formData.customerName}
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
          )}

          {/* Product Selection - Third Step (shown after order selected) */}
          {formData.orderItemId && orderProducts.length > 0 && (
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
                  ...orderProducts.map((product) => ({
                    value: product.id,
                    label: `${product.name} (${t("qty")}: ${product.quantity})`,
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
                max={
                  orderProducts.find(
                    (p) => p.id === parseInt(formData.productId)
                  )?.quantity || 999
                }
                icon={<Package className="w-4 h-4" />}
                disabled={!formData.productId}
              />
            </div>
          )}

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
            placeholder={t("desribelssueDetails")}
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
