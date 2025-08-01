import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Star,
  X,
  Save,
  AlertCircle,
} from "lucide-react";

import FormField from "../FormField";
import { isValidEmail, isValidPhone } from "../../../utils/validators";
import {
  addCustomer as addCustomerToStorage,
  updateCustomer as updateCustomerInStorage,
  saveFormDraft,
  getFormDraft,
  clearFormDraft,
} from "../../../utils/localStorage";

const CustomerForm = ({
  isOpen,
  onClose,
  onSubmit,
  customer = null,
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
    notes: "",
    vip: false,
    status: "active",
    dateOfBirth: "",
    preferredContactMethod: "phone",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load form draft or customer data when component mounts
  useEffect(() => {
    if (customer && mode === "edit") {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        company: customer.company || "",
        notes: customer.notes || "",
        vip: customer.vip || false,
        status: customer.status || "active",
        dateOfBirth: customer.dateOfBirth || "",
        preferredContactMethod: customer.preferredContactMethod || "phone",
      });
    } else if (mode === "add") {
      // Try to load draft for new customer form
      const draft = getFormDraft("customer_add");
      if (draft) {
        setFormData({
          name: draft.name || "",
          email: draft.email || "",
          phone: draft.phone || "",
          address: draft.address || "",
          company: draft.company || "",
          notes: draft.notes || "",
          vip: draft.vip || false,
          status: draft.status || "active",
          dateOfBirth: draft.dateOfBirth || "",
          preferredContactMethod: draft.preferredContactMethod || "phone",
        });
      } else {
        // Reset form for new customer
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          company: "",
          notes: "",
          vip: false,
          status: "active",
          dateOfBirth: "",
          preferredContactMethod: "phone",
        });
      }
    }
    setErrors({});
  }, [customer, mode, isOpen]);

  // Auto-save form draft when form data changes (for add mode only)
  useEffect(() => {
    if (mode === "add" && isOpen) {
      const timeoutId = setTimeout(() => {
        // Only save if form has some data
        if (formData.name || formData.email || formData.phone) {
          saveFormDraft("customer_add", formData);
        }
      }, 1000); // Save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, mode, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle form field changes (for FormField component)
  const handleFieldChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    handleInputChange(field, value);
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t("customerNameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("nameMustBeAtLeast2Characters");
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t("emailRequired");
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = t("invalidEmailFormat");
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = t("phoneNumberRequired");
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = t("invalidPhoneFormat");
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = t("addressRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let savedCustomer;

      if (mode === "edit" && customer) {
        // Update existing customer in local storage
        savedCustomer = updateCustomerInStorage(customer.id, formData);
      } else {
        // Add new customer to local storage
        savedCustomer = addCustomerToStorage(formData);
        // Clear the form draft after successful submission
        clearFormDraft("customer_add");
      }

      // Call the parent onSubmit with the saved customer data
      if (onSubmit) {
        await onSubmit(savedCustomer);
      }

      onClose();

      // Reset form only if adding new customer
      if (mode === "add") {
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          company: "",
          notes: "",
          vip: false,
          status: "active",
          dateOfBirth: "",
          preferredContactMethod: "phone",
        });
      }
      setErrors({});
    } catch (error) {
      console.error("Error submitting customer:", error);
      setErrors({ submit: t("errorSavingCustomer") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Save draft before closing if in add mode and form has data
    if (mode === "add" && (formData.name || formData.email || formData.phone)) {
      saveFormDraft("customer_add", formData);
    }
    onClose();
  };

  const clearDraft = () => {
    clearFormDraft("customer_add");
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      notes: "",
      vip: false,
      status: "active",
      dateOfBirth: "",
      preferredContactMethod: "phone",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === "add" ? t("addCustomer") : t("editCustomer")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === "add"
                  ? t("fillCustomerDetailsToAdd")
                  : t("updateCustomerInformation")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === "add" && getFormDraft("customer_add") && (
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
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Draft indicator */}
        {mode === "add" && getFormDraft("customer_add") && (
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
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("basicInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t("customerName")}
                type="text"
                value={formData.name}
                onChange={handleFieldChange("name")}
                placeholder={t("enterCustomerName")}
                error={errors.name}
                required
              />

              <FormField
                label={t("email")}
                type="email"
                value={formData.email}
                onChange={handleFieldChange("email")}
                placeholder={t("enterEmailAddress")}
                error={errors.email}
                required
              />

              <FormField
                label={t("phoneNumber")}
                type="tel"
                value={formData.phone}
                onChange={handleFieldChange("phone")}
                placeholder={t("enterPhoneNumber")}
                error={errors.phone}
                required
              />


              <div className="md:col-span-2">
                <FormField
                  label={t("address")}
                  type="textarea"
                  value={formData.address}
                  onChange={handleFieldChange("address")}
                  placeholder={t("enterFullAddress")}
                  error={errors.address}
                  required
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("additionalInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t("dateOfBirth")}
                type="date"
                value={formData.dateOfBirth}
                onChange={handleFieldChange("dateOfBirth")}
              />

              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("preferredContactMethod")}
                </label>
                <select
                  value={formData.preferredContactMethod}
                  onChange={handleFieldChange("preferredContactMethod")}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <option value="phone">{t("phone")}</option>
                  <option value="email">{t("email")}</option>
                  <option value="sms">{t("sms")}</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("status")}
                </label>
                <select
                  value={formData.status}
                  onChange={handleFieldChange("status")}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <option value="active">{t("active")}</option>
                  <option value="inactive">{t("inactive")}</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="vip"
                  checked={formData.vip}
                  onChange={handleFieldChange("vip")}
                  className="w-4 h-4 text-yellow-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:ring-2"
                />
                <label
                  htmlFor="vip"
                  className={`flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer ${
                    isRTL ? "flex-row" : ""
                  }`}
                >
                  <Star className="w-4 h-4 text-yellow-500" />
                  {t("vipCustomer")}
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <FormField
              label={t("notes")}
              type="textarea"
              value={formData.notes}
              onChange={handleFieldChange("notes")}
              placeholder={t("anyAdditionalNotes")}
              rows={3}
            />
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400">
                {errors.submit}
              </span>
            </div>
          )}

          {/* Actions */}
          <div
            className={`flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ${
            isRTL ? "flex-row" : ""
            }`}
          >
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {mode === "add" ? t("addCustomer") : t("updateCustomer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
