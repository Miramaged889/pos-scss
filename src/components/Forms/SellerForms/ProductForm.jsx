import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { X, Check, Package, Tag, DollarSign, Truck } from "lucide-react";
import FormField from "../FormField";
import {
  createProduct,
  updateProduct,
  fetchProducts,
} from "../../../store/slices/inventorySlice";
import { supplierService } from "../../../services";

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
    barcode: "",
    description: "",
    imageUrl: "",
    unitSize: "",
    unitType: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // Fetch suppliers on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoadingSuppliers(true);
      try {
        const response = await supplierService.getSuppliers();
        const suppliersList = Array.isArray(response)
          ? response
          : response.results || [];
        setSuppliers(suppliersList);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setSuppliers([]);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  // Load product data when component mounts
  useEffect(() => {
    if (product && mode === "edit") {
      setFormData({
        name: product.name || "",
        nameEn: product.nameEn || "",
        category: product.category || "",
        stock: product.stock?.toString() || "",
        minStock: product.minStock?.toString() || "",
        price: product.price?.toString() || "",
        supplier: product.supplierId || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        unitSize: product.unitSize?.toString() || "",
        unitType: product.unitType || "",
      });
      setImagePreview(product.imageUrl || null);
    } else if (mode === "create") {
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
        barcode: "",
        description: "",
        imageUrl: "",
        unitSize: "",
        unitType: "",
      });
      setImagePreview(null);
    }
    setErrors({});
  }, [product, mode, isOpen]);

  const categoryOptions = [
    { value: "main", label: t("mainCourse") },
    { value: "side", label: t("sideDish") },
    { value: "beverages", label: t("beverages") },
    { value: "desserts", label: t("desserts") },
  ];

  const unitTypeOptions = [
    { value: "gram", label: t("gram") },
    { value: "kilogram", label: t("kilogram") },
    { value: "liter", label: t("liter") },
    { value: "milliliter", label: t("milliliter") },
    { value: "piece", label: t("piece") },
    { value: "box", label: t("box") },
    { value: "carton", label: t("carton") },
    { value: "bottle", label: t("bottle") },
    { value: "can", label: t("can") },
    { value: "pack", label: t("pack") },
  ];

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({ ...prev, imageUrl: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
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

    if (!formData.description.trim()) {
      newErrors.description = t("descriptionRequired");
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
        supplier: formData.supplier
          ? formData.supplier.toString().trim()
          : null,
        sku: formData.sku ? formData.sku.toString().trim() : null,
        barcode: formData.barcode ? formData.barcode.toString().trim() : null,
        description: formData.description
          ? formData.description.toString().trim()
          : null,
        imageUrl: formData.imageUrl || null,
        unitSize: formData.unitSize ? parseFloat(formData.unitSize) : null,
        unitType: formData.unitType || null,
      };

      let result;
      if (mode === "edit" && product) {
        // Update existing product via API
        result = await dispatch(
          updateProduct({ id: product.id, updates: productData })
        );
      } else {
        // Create new product via API
        result = await dispatch(createProduct(productData));
      }

      if (result.type.endsWith("/fulfilled")) {
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
            barcode: "",
            description: "",
            imageUrl: "",
            unitSize: "",
            unitType: "",
          });
          setImagePreview(null);
        }
        setErrors({});
        // Refresh the products list
        dispatch(fetchProducts());
        onClose();
      } else {
        setErrors({ submit: result.payload || t("errorSavingProduct") });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setErrors({ submit: t("errorSavingProduct") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div
            className={`flex items-center justify-between ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <div
              className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("productImage")}{" "}
              <span className="text-gray-500 text-xs">({t("optional")})</span>
            </label>
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              {imagePreview ? (
                <div className="relative group w-full">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="max-h-48 w-full rounded-lg object-contain mx-auto"
                    onError={(e) => {
                      console.log(
                        "Image preview failed to load:",
                        imagePreview
                      );
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+";
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="product-image-change"
                      />
                      <label
                        htmlFor="product-image-change"
                        className="cursor-pointer px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {t("edit")}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData((prev) => ({ ...prev, imageUrl: "" }));
                          // Reset file input
                          const fileInput =
                            document.getElementById("product-image");
                          if (fileInput) fileInput.value = "";
                          const changeInput = document.getElementById(
                            "product-image-change"
                          );
                          if (changeInput) changeInput.value = "";
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="product-image"
                  />
                  <label
                    htmlFor="product-image"
                    className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    {t("uploadImage")}
                  </label>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("dragAndDropOrClick")}
                  </p>
                </div>
              )}
            </div>
            {errors.imageUrl && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.imageUrl}
              </p>
            )}
          </div>

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
              <FormField
                label={t("barcode")}
                type="number"
                value={formData.barcode}
                onChange={handleInputChange("barcode")}
                placeholder={t("enterBarcode")}
                helperText={t("barcodeOptional")}
              />
            </div>
          </div>

          {/* Stock & Pricing */}
          <div>
            <h4
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2 ${
                isRTL ? "text-right flex-row" : "text-left"
              }`}
            >
              <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t("stockAndPricing")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <FormField
                label={t("unitSize")}
                type="number"
                value={formData.unitSize}
                onChange={handleInputChange("unitSize")}
                placeholder="0"
                min="0"
                step="0.01"
                helperText={t("unitSizeOptional")}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                label={t("unitType")}
                type="select"
                value={formData.unitType}
                onChange={handleInputChange("unitType")}
                placeholder={t("selectUnitType")}
                options={unitTypeOptions}
                helperText={t("unitTypeOptional")}
              />
            </div>
          </div>

          {/* Supplier & Description */}
          <div>
            <h4
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2 ${
                isRTL ? "text-right flex-row" : "text-left"
              }`}
            >
              <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
              {t("supplierAndDetails")}
            </h4>
            <div className="space-y-4">
              <FormField
                label={t("supplier")}
                type="select"
                value={formData.supplier}
                onChange={handleInputChange("supplier")}
                placeholder={t("selectSupplier")}
                options={[
                  { value: "", label: t("noSupplier") },
                  ...suppliers.map((supplier) => ({
                    value: supplier.id,
                    label:
                      supplier.name ||
                      supplier.supplier_name ||
                      supplier.company_name,
                  })),
                ]}
                helperText={t("supplierOptional")}
                disabled={loadingSuppliers}
              />
              <FormField
                label={t("description")}
                type="textarea"
                value={formData.description}
                onChange={handleInputChange("description")}
                placeholder={t("enterProductDescription")}
                rows={3}
                error={errors.description}
                required
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
              isRTL ? "flex-row" : ""
            }`}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRTL ? "flex-row" : ""
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
                isRTL ? "flex-row" : ""
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
