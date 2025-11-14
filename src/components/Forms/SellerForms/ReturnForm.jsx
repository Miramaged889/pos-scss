import React, { useState, useEffect, useCallback } from "react";
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
import { customerService, productService } from "../../../services";

const ReturnForm = ({ isOpen, onClose, onSubmit, editData = null }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state) => state.language);
  const { orders } = useSelector((state) => state.orders);
  const [formData, setFormData] = useState({
    orderId: "",
    orderItemId: "", // Store the actual order item ID for API
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
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (editData) {
      setFormData((prev) => ({
        ...prev,
        ...editData,
        orderId: editData.orderId || "",
        orderItemId: editData.orderItemId || "",
        customerId: editData.customerId || "",
        customerName: editData.customerName || "",
        productId: editData.productId || "",
        productName: editData.productName || "",
        quantity: editData.quantity || 1,
        reason: editData.reason || editData.returnReason || "",
        description: editData.description || "",
        refundAmount: editData.refundAmount || 0,
      }));

      const relatedOrder =
        orders.find(
          (o) => o.id === (editData.orderId || editData.orderItemId)
        ) || null;
      setSelectedOrder(relatedOrder);
    }
  }, [editData, orders]);

  // Load orders, customers, and products when component mounts
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchOrders());
      loadCustomers();
      loadProducts();
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

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts();
      const productsList = Array.isArray(response)
        ? response
        : response.data || [];
      setProducts(productsList);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    }
  };

  const processOrderProducts = useCallback(
    (order) => {
      // Extract products from the order
      let productsInOrder = [];

      // Check if order has items array (multiple products in one order)
      if (order.items && Array.isArray(order.items)) {
        productsInOrder = order.items.map((item) => {
          // Find the product details from the products list
          const product = products.find((p) => p.id === item.product_id);

          return {
            id: item.product_id, // Use actual product ID
            itemId: item.id, // Store the order item ID for API
            name:
              product?.name || product?.nameEn || `Product ${item.product_id}`, // Get product name
            quantity: item.quantity,
            price: product?.price || 0, // Get product price
          };
        });
      }
      // Check if order has products array (the actual structure we're seeing)
      else if (order.products && Array.isArray(order.products)) {
        productsInOrder = order.products.map((product) => {
          // Find the full product details from the products list
          const fullProduct = products.find((p) => p.id === product.id);

          return {
            id: product.id, // Use actual product ID
            itemId: order.id, // Use order ID as item ID
            name:
              fullProduct?.name ||
              fullProduct?.nameEn ||
              product.name ||
              product.nameEn ||
              `Product ${product.id}`, // Get product name
            quantity: product.quantity,
            price: fullProduct?.price || product.price || 0, // Get product price
          };
        });
      }
      // Handle case where items is not an array but might be a single item or different structure
      else if (order.items && !Array.isArray(order.items)) {
        // Check if this is a single product order with direct product info
        if (order.product_id || order.productId) {
          const product = products.find(
            (p) => p.id === (order.product_id || order.productId)
          );

          productsInOrder = [
            {
              id: order.product_id || order.productId,
              itemId: order.id,
              name:
                product?.name ||
                product?.nameEn ||
                `Product ${order.product_id || order.productId}`,
              quantity: order.quantity || 1,
              price: product?.price || 0,
            },
          ];
        }
      }
      // Check if order has direct product information (single product order)
      else if (order.product_id || order.productId) {
        const product = products.find(
          (p) => p.id === (order.product_id || order.productId)
        );
        productsInOrder = [
          {
            id: order.product_id || order.productId, // Use actual product ID
            itemId: order.id, // Use order ID as item ID for single-item orders
            name:
              product?.name ||
              product?.nameEn ||
              order.product_name ||
              order.productName ||
              `Product ${order.product_id || order.productId}`,
            quantity: order.quantity,
            price: product?.price || order.price || order.unitPrice || 0,
          },
        ];
      }
      // Check if order has product field that is a product object
      else if (order.product) {
        productsInOrder = [
          {
            id: order.product.id, // Use actual product ID
            itemId: order.id, // Use order ID as item ID
            name: order.product.name,
            quantity: order.quantity,
            price: order.product.price || 0,
          },
        ];
      }

      // If no products found, try to extract from any available fields
      if (productsInOrder.length === 0) {
        // Try to find any product-related fields in the order
        const possibleProductFields = [
          "products",
          "product_id",
          "productId",
          "product",
          "item",
          "items",
        ];

        for (const field of possibleProductFields) {
          if (order[field]) {
            // If it's an array of products
            if (Array.isArray(order[field])) {
              productsInOrder = order[field].map((product) => {
                const fullProduct = products.find((p) => p.id === product.id);
                return {
                  id: product.id,
                  itemId: order.id,
                  name:
                    fullProduct?.name ||
                    fullProduct?.nameEn ||
                    product.name ||
                    product.nameEn ||
                    `Product ${product.id}`,
                  quantity: product.quantity || 1,
                  price: fullProduct?.price || product.price || 0,
                };
              });
              break;
            }
            // If it's an object with product info
            else if (typeof order[field] === "object" && order[field].id) {
              const product = products.find((p) => p.id === order[field].id);
              if (product) {
                productsInOrder = [
                  {
                    id: order[field].id,
                    itemId: order.id,
                    name:
                      product.name ||
                      product.nameEn ||
                      `Product ${order[field].id}`,
                    quantity: order[field].quantity || order.quantity || 1,
                    price: product.price || 0,
                  },
                ];
                break;
              }
            }
            // If it's just a product ID
            else if (typeof order[field] === "number") {
              const product = products.find((p) => p.id === order[field]);
              if (product) {
                productsInOrder = [
                  {
                    id: order[field],
                    itemId: order.id,
                    name:
                      product.name ||
                      product.nameEn ||
                      `Product ${order[field]}`,
                    quantity: order.quantity || 1,
                    price: product.price || 0,
                  },
                ];
                break;
              }
            }
          }
        }
      }

      setOrderProducts(productsInOrder);
    },
    [products]
  );

  // Handle order selection when products are loaded
  useEffect(() => {
    if (selectedOrder && products.length > 0 && orderProducts.length === 0) {
      processOrderProducts(selectedOrder);
    }
  }, [products, selectedOrder, orderProducts.length, processOrderProducts]);

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
      // Filter orders for this customer based on customer ID
      // Try different possible field names for customer ID
      const filteredOrders = orders.filter((o) => {
        // Check customerId field (number)
        if (o.customerId === parseInt(customerId)) return true;
        // Check customer field (string like "Customer #7")
        if (o.customer && o.customer.includes(`#${customerId}`)) return true;
        // Check customer_id field
        if (o.customer_id === parseInt(customerId)) return true;
        return false;
      });
      setCustomerOrders(filteredOrders);
      setFormData((prev) => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.customer_name || customer.name || "",
        orderId: "",
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

      // Check if products are loaded
      if (products.length === 0) {
        return;
      }

      // Process the order products
      processOrderProducts(order);

      setFormData((prev) => ({
        ...prev,
        orderId: order.id, // Store order ID for reference
        orderItemId: "", // Reset order item ID until product is selected
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
      const orderItemIdentifier =
        product.itemId ??
        product.orderItemId ??
        product.order_item_id ??
        product.order_item ??
        product.id;

      setFormData((prev) => ({
        ...prev,
        productId: product.id, // This is the actual product ID
        productName: product.name,
        orderItemId: orderItemIdentifier, // Store the order item ID for API
        quantity: 1, // Reset to 1, user can adjust
        refundAmount: product.price * 1, // Calculate based on single item price
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

    if (!formData.orderId) {
      newErrors.orderId = t("orderIdRequired");
    }

    if (!formData.customerId) {
      newErrors.customerId = t("customerRequired");
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
        // Ensure we're sending the correct identifiers
        orderId: formData.orderId,
        orderItemId: formData.orderItemId,
        productId: formData.productId,
      };

      // Let the parent component handle API operations
      onSubmit(returnData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      orderId: "",
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
                name="orderId"
                type="select"
                value={formData.orderId}
                onChange={(e) => handleOrderSelect(e.target.value)}
                error={errors.orderId}
                required
                icon={<FileText className="w-4 h-4" />}
                options={[
                  { value: "", label: t("selectOrder") },
                  ...(customerOrders || []).map((order) => ({
                    value: order.id,
                    label: `Order #${order.id} - Total: ${
                      order.total_amount || order.total || "0.00"
                    }`,
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
          {formData.orderId && orderProducts.length > 0 && (
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

          {/* Show message if no products found in order */}
          {formData.orderId && orderProducts.length === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm">
                  {t("noProductsFoundInOrder")} (Debug: orderProducts.length ={" "}
                  {orderProducts.length})
                </p>
              </div>
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
