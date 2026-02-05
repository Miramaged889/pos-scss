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
  Plus,
  Trash2,
  CheckSquare,
  Square,
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
    customerId: "",
    customerName: "",
    items: [], // Array of { product_id, quantity, return_reason }
  });
  const [errors, setErrors] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [orderProducts, setOrderProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set()); // Track selected product IDs

  useEffect(() => {
    if (editData) {
      // For editing, convert single return to items format
      const items = editData.items || [
        {
          product_id: editData.productId || editData.product_id,
          quantity: editData.quantity || 1,
          return_reason: editData.reason || editData.returnReason || editData.return_reason || "",
        },
      ];

      setFormData({
        orderId: editData.orderId || editData.order_id || "",
        customerId: editData.customerId || "",
        customerName: editData.customerName || "",
        items: items.map(item => ({
          product_id: parseInt(item.product_id || item.productId),
          quantity: parseInt(item.quantity || 1),
          return_reason: item.return_reason || item.reason || "",
        })),
      });

      const relatedOrder = orders.find(
        (o) => o.id === (editData.orderId || editData.order_id)
      ) || null;
      setSelectedOrder(relatedOrder);
      
      // Set selected products (ensure they're numbers)
      setSelectedProducts(new Set(
        items.map(item => parseInt(item.product_id || item.productId)).filter(id => !isNaN(id))
      ));
    } else {
      // Reset form for new return
      setFormData({
        orderId: "",
        customerId: "",
        customerName: "",
        items: [],
      });
      setSelectedProducts(new Set());
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
              product?.arabic_name || product?.english_name || product?.name || product?.nameEn || `Product ${item.product_id}`, // Get product name
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
              fullProduct?.arabic_name || fullProduct?.english_name ||
              fullProduct?.name ||
              fullProduct?.nameEn ||
              product.arabic_name || product.english_name ||
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
                product?.arabic_name || product?.english_name ||
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
              product?.arabic_name || product?.english_name ||
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
            name: order.product.arabic_name || order.product.english_name || order.product.name || order.product.nameEn,
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
                    fullProduct?.arabic_name || fullProduct?.english_name ||
                    fullProduct?.name ||
                    fullProduct?.nameEn ||
                    product.arabic_name || product.english_name ||
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
                      product.arabic_name || product.english_name ||
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
                      product.arabic_name || product.english_name ||
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
      const filteredOrders = orders.filter((o) => {
        if (o.customerId === parseInt(customerId)) return true;
        if (o.customer && o.customer.includes(`#${customerId}`)) return true;
        if (o.customer_id === parseInt(customerId)) return true;
        return false;
      });
      setCustomerOrders(filteredOrders);
      setFormData((prev) => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.customer_name || customer.name || "",
        orderId: "",
        items: [],
      }));
      setSelectedOrder(null);
      setOrderProducts([]);
      setSelectedProducts(new Set());
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
        orderId: order.id,
        items: [],
      }));
      setSelectedProducts(new Set());
    }
  };

  const handleProductToggle = (productId) => {
    const productIdNum = parseInt(productId);
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productIdNum)) {
      newSelected.delete(productIdNum);
      // Remove item from formData.items
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter(
          (item) => parseInt(item.product_id) !== productIdNum
        ),
      }));
    } else {
      newSelected.add(productIdNum);
      const product = orderProducts.find((p) => p.id === productIdNum);
      if (product) {
        // Add item to formData.items with default values
        setFormData((prev) => ({
          ...prev,
          items: [
            ...prev.items,
            {
              product_id: product.id,
              quantity: 1,
              return_reason: "",
            },
          ],
        }));
      }
    }
    setSelectedProducts(newSelected);
  };

  const handleItemQuantityChange = (productId, quantity) => {
    const productIdNum = parseInt(productId);
    const product = orderProducts.find((p) => p.id === productIdNum);
    if (product) {
      const qty = parseInt(quantity) || 1;
      const maxQty = product.quantity || 1;
      const finalQty = Math.min(qty, maxQty);

      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          parseInt(item.product_id) === productIdNum
            ? { ...item, quantity: finalQty }
            : item
        ),
      }));
    }
  };

  const handleItemReasonChange = (productId, reason) => {
    const productIdNum = parseInt(productId);
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        parseInt(item.product_id) === productIdNum
          ? { ...item, return_reason: reason }
          : item
      ),
    }));
  };

  const removeItem = (productId) => {
    const productIdNum = parseInt(productId);
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productIdNum);
      return newSet;
    });
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter(
        (item) => parseInt(item.product_id) !== productIdNum
      ),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.orderId) {
      newErrors.orderId = t("orderIdRequired");
    }

    if (!formData.customerId) {
      newErrors.customerId = t("customerRequired");
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = t("atLeastOneProductRequired");
    }

    // Validate each item
    formData.items.forEach((item, index) => {
      if (!item.quantity || item.quantity < 1) {
        newErrors[`item_${index}_quantity`] = t("validQuantityRequired");
      }
      if (!item.return_reason || item.return_reason.trim() === "") {
        newErrors[`item_${index}_reason`] = t("reasonRequired");
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const returnData = {
        order_id: parseInt(formData.orderId),
        items: formData.items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          return_reason: item.return_reason,
        })),
      };

      // Let the parent component handle API operations
      onSubmit(returnData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      orderId: "",
      customerId: "",
      customerName: "",
      items: [],
    });
    setErrors({});
    setSelectedOrder(null);
    setCustomerOrders([]);
    setOrderProducts([]);
    setSelectedProducts(new Set());
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
            <div className="space-y-4">
              <div className={`${isRTL ? "text-right" : "text-left"}`}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t("selectProductsToReturn")} *
                </label>
                {errors.items && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.items}
                  </p>
                )}
              </div>

              {/* Products List with Checkboxes */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {orderProducts.map((product) => {
                  const isSelected = selectedProducts.has(parseInt(product.id));
                  const item = formData.items.find(
                    (item) => parseInt(item.product_id) === parseInt(product.id)
                  );
                  const itemIndex = formData.items.findIndex(
                    (item) => parseInt(item.product_id) === parseInt(product.id)
                  );

                  return (
                    <div
                      key={product.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isSelected
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleProductToggle(product.id)}
                          className="mt-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {product.arabic_name || product.english_name || product.name || product.nameEn}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("availableQty")}: {product.quantity} |{" "}
                                {t("price")}: {product.price?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                            {isSelected && (
                              <button
                                type="button"
                                onClick={() => removeItem(product.id)}
                                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {isSelected && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  {t("quantity")} *
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max={product.quantity}
                                  value={item?.quantity || 1}
                                  onChange={(e) =>
                                    handleItemQuantityChange(
                                      product.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                {errors[`item_${itemIndex}_quantity`] && (
                                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    {errors[`item_${itemIndex}_quantity`]}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  {t("returnReason")} *
                                </label>
                                <select
                                  value={item?.return_reason || ""}
                                  onChange={(e) =>
                                    handleItemReasonChange(
                                      product.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                  <option value="">
                                    {t("selectReason")}
                                  </option>
                                  {returnReasons.map((reason) => (
                                    <option key={reason.value} value={reason.value}>
                                      {reason.label}
                                    </option>
                                  ))}
                                </select>
                                {errors[`item_${itemIndex}_reason`] && (
                                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    {errors[`item_${itemIndex}_reason`]}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Show message if no products found in order */}
          {formData.orderId && orderProducts.length === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm">{t("noProductsFoundInOrder")}</p>
              </div>
            </div>
          )}

          {/* Summary */}
          {formData.items.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div
                className={`flex items-center gap-2 mb-3 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <label className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {t("returnSummary")}
                </label>
              </div>
              <div className="space-y-2">
                {formData.items.map((item) => {
                  const product = orderProducts.find(
                    (p) => parseInt(p.id) === parseInt(item.product_id)
                  );
                  return (
                    <div
                      key={item.product_id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {product?.name} x {item.quantity}
                      </span>
                      <span className="text-blue-800 dark:text-blue-300 font-medium">
                        {((product?.price || 0) * (item.quantity || 1)).toFixed(2)} {t("currency")}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-blue-200 dark:border-blue-800 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-semibold text-blue-900 dark:text-blue-200">
                    {t("totalRefund")}:
                  </span>
                  <span className="font-bold text-lg text-blue-900 dark:text-blue-200">
                    {formData.items
                      .reduce((sum, item) => {
                        const product = orderProducts.find(
                          (p) => parseInt(p.id) === parseInt(item.product_id)
                        );
                        return sum + (product?.price || 0) * (item.quantity || 0);
                      }, 0)
                      .toFixed(2)}{" "}
                    {t("currency")}
                  </span>
                </div>
              </div>
            </div>
          )}

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
