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
  Search,
  ArrowRight,
  ArrowLeft,
  Filter,
  Barcode,
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
  customer = null,
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
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [currentStage, setCurrentStage] = useState(1); // 1: Product Selection, 2: Invoice Details
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [barcodeSearch, setBarcodeSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const reverseCategoryMapping = {
    main: "main course",
    side: "side dish",
    beverages: "beverages",
    desserts: "desserts",
  };

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

  // Filter products based on category, subcategory, and search
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !categoryFilter || product.category === categoryFilter;
    const matchesSubcategory =
      !subcategoryFilter || product.subcategory === subcategoryFilter;
    const matchesSearch =
      !searchTerm ||
      product.english_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.arabic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBarcode =
      !barcodeSearch ||
      product.barcode?.toString().includes(barcodeSearch) ||
      product.sku?.toLowerCase().includes(barcodeSearch.toLowerCase());

    return (
      matchesCategory && matchesSubcategory && matchesSearch && matchesBarcode
    );
  });

  // Get unique categories and subcategories
  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  const subcategories = [
    ...new Set(products.map((p) => p.subcategory).filter(Boolean)),
  ];

  // Handle product selection
  const handleProductSelect = (product) => {
    const existingIndex = selectedProducts.findIndex(
      (p) => p.id === product.id
    );
    if (existingIndex >= 0) {
      // Update quantity if product already selected
      setSelectedProducts((prev) =>
        prev.map((p, index) =>
          index === existingIndex ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      // Add new product
      setSelectedProducts((prev) => [
        ...prev,
        {
          id: product.id,
          name: product.english_name || product.arabic_name || product.name,
          quantity: 1,
          unitPrice: parseFloat(product.price || 0),
          total: parseFloat(product.price || 0),
        },
      ]);
    }
  };

  // Handle quantity change for selected products
  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              quantity: Math.max(1, quantity),
              total: p.unitPrice * Math.max(1, quantity),
            }
          : p
      )
    );
  };

  // Remove product from selection
  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Move to next stage
  const handleNextStage = () => {
    if (selectedProducts.length === 0) {
      setErrors({ products: t("pleaseSelectAtLeastOneProduct") });
      return;
    }
    setCurrentStage(2);
    // Initialize form data with selected products and calculate totals
    const subtotal = selectedProducts.reduce(
      (sum, product) => sum + product.total,
      0
    );
    setFormData((prev) => ({
      ...prev,
      items: selectedProducts.map((product) => ({
        productId: product.id, // Ensure productId is set correctly
        name: product.name,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        total: product.total,
      })),
      subtotal: subtotal.toFixed(2),
      total: subtotal.toFixed(2), // Will be updated when tax is added
    }));
  };

  // Move to previous stage
  const handlePrevStage = () => {
    setCurrentStage(1);
  };

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
      // Pre-fill customer data if customer is provided
      const customerName = customer?.name || "";
      const customerPhone = customer?.phone || "";

      setFormData({
        customer_name: customerName,
        customer_phone: customerPhone,
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
    setIsSubmitting(false);
  }, [isOpen, invoice, customer, mode]);

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

      // Items are already in the correct format for the service layer
      const transformedItems = formData.items;

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
    setIsSubmitting(false); // Reset submitting state
    setCurrentStage(1); // Reset to first stage
    setSelectedProducts([]); // Clear selected products
    setCategoryFilter(""); // Clear filters
    setSubcategoryFilter("");
    setBarcodeSearch("");
    setSearchTerm("");
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
                {currentStage === 1
                  ? t("selectProducts")
                  : mode === "add"
                  ? t("createCustomerInvoice")
                  : t("editCustomerInvoice")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentStage === 1
                  ? t("chooseProductsForInvoice")
                  : t("enterInvoiceDetailsForCustomer")}
              </p>
              {/* Stage indicator */}
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStage >= 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  1
                </div>
                <div
                  className={`w-8 h-1 ${
                    currentStage >= 2 ? "bg-blue-600" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStage >= 2
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  2
                </div>
              </div>
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
          {currentStage === 1 ? (
            // Stage 1: Product Selection
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("filters")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <FormField
                    label={t("category")}
                    type="select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    options={[
                      { value: "", label: t("allCategories") },
                      ...categories.map((cat) => ({
                        value: cat,
                        label: reverseCategoryMapping[cat] || cat,
                      })),
                    ]}
                    icon={Filter}
                  />

                  {/* Subcategory Filter */}
                  <FormField
                    label={t("subcategory")}
                    type="select"
                    value={subcategoryFilter}
                    onChange={(e) => setSubcategoryFilter(e.target.value)}
                    options={[
                      { value: "", label: t("allSubcategories") },
                      ...subcategories.map((sub) => ({
                        value: sub,
                        label: sub,
                      })),
                    ]}
                    icon={Filter}
                  />

                  {/* Search by Name */}
                  <FormField
                    label={t("searchProducts")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("searchByName")}
                    icon={Search}
                  />

                  {/* Barcode Search */}
                  <FormField
                    label={t("barcode")}
                    value={barcodeSearch}
                    onChange={(e) => setBarcodeSearch(e.target.value)}
                    placeholder={t("searchByBarcode")}
                    icon={Barcode}
                  />
                </div>
              </div>

              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3
                    className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {t("selectedProducts")} ({selectedProducts.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("quantity")}: {product.quantity} |{" "}
                            {t("unitPrice")}: {product.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                product.id,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center"
                          />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {product.total.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(product.id)}
                            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Grid */}
              <div>
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("availableProducts")} ({filteredProducts.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {product.english_name ||
                            product.arabic_name ||
                            product.name}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {product.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {parseFloat(product.price || 0).toFixed(2)}{" "}
                          {t("currency")}
                        </span>
                        {product.barcode && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t("barcode")}: {product.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage 1 Actions */}
              <div
                className={`flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 ${
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
                  type="button"
                  onClick={handleNextStage}
                  disabled={selectedProducts.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center gap-2"
                >
                  {t("next")} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            // Stage 2: Invoice Details
            <div className="space-y-6">
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

              {/* Selected Products Display */}
              <div>
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("selectedProducts")} ({selectedProducts.length})
                </h3>
                {selectedProducts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("quantity")}: {product.quantity} |{" "}
                            {t("unitPrice")}: {product.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {product.total.toFixed(2)} {t("currency")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t("noProductsSelected")}</p>
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

                    // Recalculate total when tax changes based on selected products
                    const subTotal = selectedProducts.reduce(
                      (sum, product) => sum + product.total,
                      0
                    );
                    const taxAmount = parseFloat(value) || 0;
                    setFormData((prev) => ({
                      ...prev,
                      subtotal: subTotal.toFixed(2),
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
                      {selectedProducts
                        .reduce((sum, product) => sum + product.total, 0)
                        .toFixed(2)}{" "}
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
                        {(
                          selectedProducts.reduce(
                            (sum, product) => sum + product.total,
                            0
                          ) + parseFloat(formData.tax || 0)
                        ).toFixed(2)}{" "}
                        {t("currency")}
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

              {/* Stage 2 Actions */}
              <div
                className={`flex items-center justify-between gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={handlePrevStage}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("back")}
                </button>
                <div className="flex items-center gap-3">
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
                      ? t("createInvoice")
                      : t("updateInvoice")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CustomerInvoiceForm;
