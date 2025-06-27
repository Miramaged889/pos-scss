import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { X, Check, Package, Tag, DollarSign, Truck } from "lucide-react";
import FormField from "./FormField";
import {
  addProduct as addProductToStorage,
  updateProduct as updateProductInStorage,
  saveFormDraft,
  getFormDraft,
  clearFormDraft,
} from "../../utils/localStorage";

const ProductForm = ({ isOpen, onClose, product = null, mode = "create" }) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    category: "",
    stock: "",
    minStock: "",
    price: "",
    supplier: "",
    sku: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load form draft or product data when component mounts
  useEffect(() => {
    if (product && mode === "edit") {
      setFormData({
        name: product.name || "",
        nameEn: product.nameEn || "",
        category: product.category || "",
        stock: product.stock?.toString() || "",
        minStock: product.minStock?.toString() || "",
        price: product.price?.toString() || "",
        supplier: product.supplier || "",
        sku: product.sku || "",
        description: product.description || "",
      });
    } else if (mode === "create") {
      // Try to load draft for new product form
      const draft = getFormDraft("product_create");
      if (draft) {
        setFormData({
          name: draft.name || "",
          nameEn: draft.nameEn || "",
          category: draft.category || "",
          stock: draft.stock || "",
          minStock: draft.minStock || "",
          price: draft.price || "",
          supplier: draft.supplier || "",
          sku: draft.sku || "",
          description: draft.description || "",
        });
      } else {
        // Reset form for new product
        setFormData({
          name: "",
          nameEn: "",
          category: "",
          stock: "",
          minStock: "",
          price: "",
          supplier: "",
          sku: "",
          description: "",
        });
      }
    }
    setErrors({});
  }, [product, mode, isOpen]);

  // Auto-save form draft when form data changes (for create mode only)
  useEffect(() => {
    if (mode === "create" && isOpen) {
      const timeoutId = setTimeout(() => {
        // Only save if form has some data
        if (formData.name || formData.nameEn || formData.category) {
          saveFormDraft("product_create", formData);
        }
      }, 1000); // Save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, mode, isOpen]);

  const categoryOptions = [
    { value: "main", label: t("mainCourse") },
    { value: "side", label: t("sideDish") },
    { value: "beverages", label: t("beverages") },
    { value: "desserts", label: t("desserts") },
  ];

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("productNameRequired");
    }

    if (!formData.nameEn.trim()) {
      newErrors.nameEn = t("englishNameRequired");
    }

    if (!formData.category) {
      newErrors.category = t("categoryRequired");
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = t("validStockRequired");
    }

    if (!formData.minStock || parseInt(formData.minStock) < 0) {
      newErrors.minStock = t("validMinStockRequired");
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = t("validPriceRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name.trim(),
        nameEn: formData.nameEn.trim(),
        category: formData.category,
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        price: parseFloat(formData.price),
        supplier: formData.supplier.trim() || null,
        sku: formData.sku.trim() || null,
        description: formData.description.trim() || null,
      };

      if (mode === "edit" && product) {
        // Update existing product in local storage
        updateProductInStorage(product.id, productData);
      } else {
        // Add new product to local storage
        addProductToStorage(productData);
        // Clear the form draft after successful submission
        clearFormDraft("product_create");
      }

      // Reset form if creating new product
      if (mode === "create") {
        setFormData({
          name: "",
          nameEn: "",
          category: "",
          stock: "",
          minStock: "",
          price: "",
          supplier: "",
          sku: "",
          description: "",
        });
        setErrors({});
      }

      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      setErrors({ submit: t("errorSavingProduct") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Save draft before closing if in create mode and form has data
    if (
      mode === "create" &&
      (formData.name || formData.nameEn || formData.category)
    ) {
      saveFormDraft("product_create", formData);
    }
    onClose();
  };

  const clearDraft = () => {
    clearFormDraft("product_create");
    setFormData({
      name: "",
      nameEn: "",
      category: "",
      stock: "",
      minStock: "",
      price: "",
      supplier: "",
      sku: "",
      description: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div
            className={`flex items-center justify-between ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex items-center gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-lg flex items-center justify-center shadow-md">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mode === "edit" ? t("editProduct") : t("addProduct")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mode === "edit"
                    ? t("updateProductInformation")
                    : t("addNewProductToInventory")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mode === "create" && getFormDraft("product_create") && (
                <button
                  onClick={clearDraft}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title={t("clearDraft")}
                >
                  {t("clearDraft")}
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Draft indicator */}
        {mode === "create" && getFormDraft("product_create") && (
          <div className="px-6 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              📝 {t("draftRestored")} - {t("formDataSavedAutomatically")}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("basicInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t("productNameArabic")}
                value={formData.name}
                onChange={handleInputChange("name")}
                placeholder={t("enterProductNameArabic")}
                error={errors.name}
                required
              />
              <FormField
                label={t("productNameEnglish")}
                value={formData.nameEn}
                onChange={handleInputChange("nameEn")}
                placeholder={t("enterProductNameEnglish")}
                error={errors.nameEn}
                required
              />
              <FormField
                label={t("category")}
                type="select"
                value={formData.category}
                onChange={handleInputChange("category")}
                placeholder={t("selectCategory")}
                options={categoryOptions}
                error={errors.category}
                required
              />
              <FormField
                label={t("sku")}
                value={formData.sku}
                onChange={handleInputChange("sku")}
                placeholder={t("enterSKU")}
                helperText={t("skuOptional")}
              />
            </div>
          </div>

          {/* Stock & Pricing */}
          <div>
            <h4
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2 ${
                isRTL ? "text-right flex-row-reverse" : "text-left"
              }`}
            >
              <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t("stockAndPricing")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label={t("currentStock")}
                type="number"
                value={formData.stock}
                onChange={handleInputChange("stock")}
                placeholder="0"
                min="0"
                error={errors.stock}
                required
              />
              <FormField
                label={t("minimumStock")}
                type="number"
                value={formData.minStock}
                onChange={handleInputChange("minStock")}
                placeholder="0"
                min="0"
                error={errors.minStock}
                required
              />
              <FormField
                label={t("price")}
                type="number"
                value={formData.price}
                onChange={handleInputChange("price")}
                placeholder="0.00"
                min="0"
                step="0.01"
                error={errors.price}
                required
              />
            </div>
          </div>

          {/* Supplier & Description */}
          <div>
            <h4
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2 ${
                isRTL ? "text-right flex-row-reverse" : "text-left"
              }`}
            >
              <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
              {t("supplierAndDetails")}
            </h4>
            <div className="space-y-4">
              <FormField
                label={t("supplier")}
                value={formData.supplier}
                onChange={handleInputChange("supplier")}
                placeholder={t("enterSupplierName")}
                helperText={t("supplierOptional")}
              />
              <FormField
                label={t("description")}
                type="textarea"
                value={formData.description}
                onChange={handleInputChange("description")}
                placeholder={t("enterProductDescription")}
                rows={3}
                helperText={t("descriptionOptional")}
              />
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

          {/* Action Buttons */}
          <div
            className={`flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isSubmitting
                ? t("saving")
                : mode === "edit"
                ? t("updateProduct")
                : t("addProduct")}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <X className="w-4 h-4" />
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
