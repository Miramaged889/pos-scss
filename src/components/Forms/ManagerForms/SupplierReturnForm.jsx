import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  X,
  Save,
  RotateCcw,
  Package,
  DollarSign,
  FileText,
  AlertCircle,
  Building,
  Calendar,
  User,
  Mail,
} from "lucide-react";
import { toast } from "react-hot-toast";

import FormField from "../FormField";
import { supplierService } from "../../../services/supplierService";

const SellerReturnForm = ({
  isOpen,
  onClose,
  onSubmit,
  returnItem = null,
  mode = "add", // "add" or "edit"
}) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  const [formData, setFormData] = useState({
    supplier: "",
    purchase_item: "",
    quantity: 1,
    return_reason: "",
    created_at: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliersList, setSuppliersList] = useState([]);
  const [supplierItems, setSupplierItems] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // Load suppliers from API
  const loadSuppliers = useCallback(async () => {
    setLoadingSuppliers(true);
    try {
      const response = await supplierService.getSuppliers();
      const suppliers = response.results || response || [];
      setSuppliersList(suppliers);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      toast.error(t("errorLoadingSuppliers"));
    } finally {
      setLoadingSuppliers(false);
    }
  }, [t]);

  // Load items for selected supplier
  const loadSupplierItems = useCallback(
    async (supplierId) => {
      if (!supplierId) {
        setSupplierItems([]);
        return;
      }

      setLoadingItems(true);
      try {
        const items = await supplierService.getSupplierItems(supplierId);
        setSupplierItems(items);
      } catch (error) {
        console.error("Error loading supplier items:", error);
        toast.error(t("errorLoadingItems"));
      } finally {
        setLoadingItems(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (isOpen) {
      loadSuppliers();
    }
  }, [isOpen, loadSuppliers]);

  // Load supplier items when supplier changes
  useEffect(() => {
    if (formData.supplier) {
      loadSupplierItems(formData.supplier);
    } else {
      setSupplierItems([]);
    }
  }, [formData.supplier, loadSupplierItems]);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && returnItem) {
        setFormData({
          supplier: returnItem.supplier || "",
          purchase_item: returnItem.purchase_item || "",
          quantity: returnItem.quantity || 1,
          return_reason: returnItem.return_reason || "",
          created_at: returnItem.created_at
            ? returnItem.created_at.split("T")[0]
            : new Date().toISOString().split("T")[0],
        });
      } else {
        // Reset form for add mode
        setFormData({
          supplier: "",
          purchase_item: "",
          quantity: 1,
          return_reason: "",
          created_at: new Date().toISOString().split("T")[0],
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, returnItem]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleFieldChange = (field) => (e) => {
    handleInputChange(field, e.target.value);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.supplier) {
      newErrors.supplier = t("supplierRequired");
    }

    if (!formData.purchase_item) {
      newErrors.purchase_item = t("itemRequired");
    }

    if (!formData.return_reason.trim()) {
      newErrors.return_reason = t("returnReasonRequired");
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = t("validQuantityRequired");
    }

    if (!formData.created_at) {
      newErrors.created_at = t("dateRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("pleaseFixErrors"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for submission according to API schema
      const submitData = {
        supplier: parseInt(formData.supplier),
        purchase_item: formData.purchase_item, // Keep as is - might be string ID or integer
        quantity: parseInt(formData.quantity),
        return_reason: formData.return_reason,
        created_at: formData.created_at,
      };

      // Call the parent's onSubmit handler - let parent handle API call
      onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error("Error submitting return:", error);
      toast.error(t("errorSavingReturn"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      supplier: "",
      purchase_item: "",
      quantity: 1,
      return_reason: "",
      created_at: new Date().toISOString().split("T")[0],
    });
    setErrors({});
    setIsSubmitting(false);
    setSupplierItems([]);
    onClose();
  };

  const clearDraft = () => {
    setFormData({
      supplier: "",
      purchase_item: "",
      quantity: 1,
      return_reason: "",
      created_at: new Date().toISOString().split("T")[0],
    });
    setErrors({});
    setSupplierItems([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <RotateCcw className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === "add" ? t("createReturn") : t("editReturn")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === "add" ? t("createNewReturn") : t("updateReturnInfo")}
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
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("returnInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t("supplier")}
                type="select"
                value={formData.supplier}
                onChange={handleFieldChange("supplier")}
                options={[
                  {
                    value: "",
                    label: loadingSuppliers
                      ? t("loading")
                      : t("selectSupplier"),
                  },
                  ...suppliersList.map((supplier) => ({
                    value: supplier.id,
                    label: supplier.supplier_name || supplier.name,
                  })),
                ]}
                required
                error={errors.supplier}
                icon={Building}
                disabled={loadingSuppliers}
              />

              <FormField
                label={t("purchaseItem")}
                type="select"
                value={formData.purchase_item}
                onChange={handleFieldChange("purchase_item")}
                options={[
                  {
                    value: "",
                    label: loadingItems ? t("loading") : t("selectItem"),
                  },
                  ...supplierItems.map((item) => ({
                    value: item.id,
                    label: item.name,
                  })),
                ]}
                required
                error={errors.purchase_item}
                icon={Package}
                disabled={!formData.supplier || loadingItems}
              />

              <FormField
                label={t("quantity")}
                type="number"
                value={formData.quantity}
                onChange={handleFieldChange("quantity")}
                placeholder={t("enterQuantity")}
                required
                error={errors.quantity}
                min="1"
                step="1"
                icon={Package}
              />

              <FormField
                label={t("returnDate")}
                type="date"
                value={formData.created_at}
                onChange={handleFieldChange("created_at")}
                required
                error={errors.created_at}
                icon={Calendar}
              />
            </div>

            <div className="mt-4">
              <FormField
                label={t("returnReason")}
                type="textarea"
                value={formData.return_reason}
                onChange={handleFieldChange("return_reason")}
                placeholder={t("enterReturnReason")}
                required
                error={errors.return_reason}
                rows={3}
                icon={FileText}
              />
            </div>
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div
                className={`flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t("pleaseFixErrors")}
                </h4>
              </div>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div
            className={`flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearDraft}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t("clearForm")}
              </button>
            </div>

            <div
              className={`flex items-center gap-3 ${
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
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting
                  ? t("saving")
                  : mode === "add"
                  ? t("createReturn")
                  : t("updateReturn")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerReturnForm;
