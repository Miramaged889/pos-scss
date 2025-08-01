import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  X,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

import FormField from "../FormField";

const SellerSupplierForm = ({
  isOpen,
  onClose,
  onSubmit,
  supplier = null,
  mode = "add", // "add" or "edit"
}) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    contactPerson: "",
    notes: "",
    status: "active",
    rating: 4.0,
    paymentTerms: "30 days",
    creditLimit: 0,
    joinDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && supplier) {
        setFormData({
          name: supplier.name || "",
          email: supplier.email || "",
          phone: supplier.phone || "",
          address: supplier.address || "",
          company: supplier.company || "",
          contactPerson: supplier.contactPerson || "",
          notes: supplier.notes || "",
          status: supplier.status || "active",
          rating: supplier.rating || 4.0,
          paymentTerms: supplier.paymentTerms || "30 days",
          creditLimit: supplier.creditLimit || 0,
          joinDate: supplier.joinDate
            ? supplier.joinDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
        });
      } else {
        // Reset form for add mode
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          company: "",
          contactPerson: "",
          notes: "",
          status: "active",
          rating: 4.0,
          paymentTerms: "30 days",
          creditLimit: 0,
          joinDate: new Date().toISOString().split("T")[0],
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, supplier]);

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
    if (!formData.name.trim()) {
      newErrors.name = t("supplierNameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("invalidEmailFormat");
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t("phoneRequired");
    }

    if (!formData.address.trim()) {
      newErrors.address = t("addressRequired");
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = t("contactPersonRequired");
    }

    // Rating validation
    if (formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = t("ratingRangeError");
    }

    // Credit limit validation
    if (formData.creditLimit < 0) {
      newErrors.creditLimit = t("creditLimitPositive");
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Prepare data for submission
      const submitData = {
        ...formData,
        joinDate: new Date(formData.joinDate).toISOString(),
        totalProducts: 0,
        totalOrders: 0,
        totalSpent: 0,
        lastOrder: null,
      };

      onSubmit(submitData);
      handleClose();
      toast.success(
        mode === "add"
          ? t("supplierAddedSuccessfully")
          : t("supplierUpdatedSuccessfully")
      );
    } catch (error) {
      console.error("Error submitting supplier:", error);
      toast.error(t("errorSavingSupplier"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      contactPerson: "",
      notes: "",
      status: "active",
      rating: 4.0,
      paymentTerms: "30 days",
      creditLimit: 0,
      joinDate: new Date().toISOString().split("T")[0],
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const clearDraft = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      contactPerson: "",
      notes: "",
      status: "active",
      rating: 4.0,
      paymentTerms: "30 days",
      creditLimit: 0,
      joinDate: new Date().toISOString().split("T")[0],
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Building className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === "add" ? t("addSupplier") : t("editSupplier")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === "add" ? t("addNewSupplier") : t("updateSupplierInfo")}
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
              {t("basicInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t("supplierName")}
                value={formData.name}
                onChange={handleFieldChange("name")}
                placeholder={t("enterSupplierName")}
                required
                error={errors.name}
                icon={Building}
              />

              <FormField
                label={t("email")}
                type="email"
                value={formData.email}
                onChange={handleFieldChange("email")}
                placeholder={t("enterEmail")}
                required
                error={errors.email}
                icon={Mail}
              />

              <FormField
                label={t("phoneNumber")}
                value={formData.phone}
                onChange={handleFieldChange("phone")}
                placeholder={t("enterPhoneNumber")}
                required
                error={errors.phone}
                icon={Phone}
              />

              <FormField
                label={t("contactPerson")}
                value={formData.contactPerson}
                onChange={handleFieldChange("contactPerson")}
                placeholder={t("enterContactPerson")}
                required
                error={errors.contactPerson}
                icon={User}
              />

              <FormField
                label={t("company")}
                value={formData.company}
                onChange={handleFieldChange("company")}
                placeholder={t("enterCompanyName")}
                icon={Building}
              />

              <FormField
                label={t("joinDate")}
                type="date"
                value={formData.joinDate}
                onChange={handleFieldChange("joinDate")}
                required
                icon={Calendar}
              />
            </div>

            <div className="mt-4">
              <FormField
                label={t("address")}
                value={formData.address}
                onChange={handleFieldChange("address")}
                placeholder={t("enterAddress")}
                required
                error={errors.address}
                icon={MapPin}
                rows={3}
              />
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("businessInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t("status")}
                type="select"
                value={formData.status}
                onChange={handleFieldChange("status")}
                options={[
                  { value: "active", label: t("active") },
                  { value: "inactive", label: t("inactive") },
                ]}
                required
              />

              <FormField
                label={t("rating")}
                type="number"
                value={formData.rating}
                onChange={handleFieldChange("rating")}
                min={0}
                max={5}
                step={0.1}
                required
                error={errors.rating}
                icon={Star}
              />

              <FormField
                label={t("paymentTerms")}
                type="select"
                value={formData.paymentTerms}
                onChange={handleFieldChange("paymentTerms")}
                options={[
                  { value: "30 days", label: "30 days" },
                  { value: "45 days", label: "45 days" },
                  { value: "60 days", label: "60 days" },
                  { value: "90 days", label: "90 days" },
                ]}
                required
              />

              <FormField
                label={t("creditLimit")}
                type="number"
                value={formData.creditLimit}
                onChange={handleFieldChange("creditLimit")}
                min={0}
                step={1000}
                required
                error={errors.creditLimit}
                icon={DollarSign}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("additionalInformation")}
            </h3>
            <FormField
              label={t("notes")}
              value={formData.notes}
              onChange={handleFieldChange("notes")}
              placeholder={t("enterNotes")}
              rows={4}
              icon={FileText}
            />
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
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting
                  ? t("saving")
                  : mode === "add"
                  ? t("addSupplier")
                  : t("updateSupplier")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerSupplierForm;
