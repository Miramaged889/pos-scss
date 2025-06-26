import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { X, Check, Package, Tag, DollarSign, Truck } from "lucide-react";
import FormField from "./FormField";
import { addProduct, updateProduct } from "../../store/slices/inventorySlice";

const ProductForm = ({ isOpen, onClose, product = null, mode = "create" }) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const dispatch = useDispatch();

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

  // Initialize form data when editing
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
    } else {
      // Reset form for create mode
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
    setErrors({});
  }, [product, mode, isOpen]);

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
        dispatch(
          updateProduct({
            productId: product.id,
            updates: productData,
          })
        );
      } else {
        dispatch(addProduct(productData));
      }

      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSubmitting(false);
    }
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
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

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
              <Check className="w-4 h-4" />
              {isSubmitting
                ? t("saving")
                : mode === "edit"
                ? t("updateProduct")
                : t("addProduct")}
            </button>
            <button
              type="button"
              onClick={onClose}
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
