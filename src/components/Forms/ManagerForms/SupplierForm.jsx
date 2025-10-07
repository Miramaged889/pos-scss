import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
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
import {
  createSupplier,
  updateSupplier,
} from "../../../store/slices/supplierSlice";

import FormField from "../FormField";

const SupplierForm = ({
  isOpen,
  onClose,
  onSubmit,
  supplier = null,
  mode = "add", // "add" or "edit"
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state) => state.language);

  const [formData, setFormData] = useState({
    supplier_name: "",
    email: "",
    phone_number: "",
    address: "",
    company: "",
    contact_person: "",
    notes: "",
    status: "Active",
    rating: 4.0,
    payment_terms: "Cash",
    credit_limit: 0,
    join_date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && supplier) {
        setFormData({
          supplier_name: supplier.supplier_name || supplier.name || "",
          email: supplier.email || "",
          phone_number: supplier.phone_number || supplier.phone || "",
          address: supplier.address || "",
          company: supplier.company || "",
          contact_person:
            supplier.contact_person || supplier.contactPerson || "",
          notes: supplier.notes || "",
          status: supplier.status || "Active",
          rating: supplier.rating || 4.0,
          payment_terms:
            supplier.payment_terms || supplier.paymentTerms || "Cash",
          credit_limit: supplier.credit_limit || supplier.creditLimit || 0,
          join_date:
            supplier.join_date || supplier.joinDate
              ? (supplier.join_date || supplier.joinDate).split("T")[0]
              : new Date().toISOString().split("T")[0],
        });
      } else {
        // Reset form for add mode
        setFormData({
          supplier_name: "",
          email: "",
          phone_number: "",
          address: "",
          company: "",
          contact_person: "",
          notes: "",
          status: "Active",
          rating: 4.0,
          payment_terms: "Cash",
          credit_limit: 0,
          join_date: new Date().toISOString().split("T")[0],
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
    if (!formData.supplier_name.trim()) {
      newErrors.supplier_name = t("supplierNameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("invalidEmailFormat");
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = t("phoneRequired");
    }

    if (!formData.address.trim()) {
      newErrors.address = t("addressRequired");
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = t("contactPersonRequired");
    }

    // Rating validation
    if (formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = t("ratingRangeError");
    }

    // Credit limit validation
    if (formData.credit_limit < 0) {
      newErrors.credit_limit = t("creditLimitPositive");
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
      // Prepare data for submission
      const submitData = {
        ...formData,
        join_date: new Date(formData.join_date).toISOString().split("T")[0],
      };

      if (mode === "add") {
        await dispatch(createSupplier(submitData)).unwrap();
        toast.success(t("supplierAddedSuccessfully"));
      } else {
        await dispatch(
          updateSupplier({
            id: supplier.id,
            updates: submitData,
          })
        ).unwrap();
        toast.success(t("supplierUpdatedSuccessfully"));
      }

      onSubmit();
      handleClose();
    } catch (error) {
      console.error("Error submitting supplier:", error);
      toast.error(error || t("errorSavingSupplier"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      supplier_name: "",
      email: "",
      phone_number: "",
      address: "",
      company: "",
      contact_person: "",
      notes: "",
      status: "Active",
      rating: 4.0,
      payment_terms: "Cash",
      credit_limit: 0,
      join_date: new Date().toISOString().split("T")[0],
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const clearDraft = () => {
    setFormData({
      supplier_name: "",
      email: "",
      phone_number: "",
      address: "",
      company: "",
      contact_person: "",
      notes: "",
      status: "Active",
      rating: 4.0,
      payment_terms: "Cash",
      credit_limit: 0,
      join_date: new Date().toISOString().split("T")[0],
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
              isRTL ? "flex-row" : ""
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
                value={formData.supplier_name}
                onChange={handleFieldChange("supplier_name")}
                placeholder={t("enterSupplierName")}
                required
                error={errors.supplier_name}
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
                value={formData.phone_number}
                onChange={handleFieldChange("phone_number")}
                placeholder={t("enterPhoneNumber")}
                required
                error={errors.phone_number}
                icon={Phone}
              />

              <FormField
                label={t("contactPerson")}
                value={formData.contact_person}
                onChange={handleFieldChange("contact_person")}
                placeholder={t("enterContactPerson")}
                required
                error={errors.contact_person}
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
                value={formData.join_date}
                onChange={handleFieldChange("join_date")}
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
                  { value: "Active", label: t("active") },
                  { value: "Inactive", label: t("inactive") },
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
                label={t("paymentMethod")}
                type="select"
                value={formData.payment_terms}
                onChange={handleFieldChange("payment_terms")}
                options={[
                  { value: "Cash", label: t("cash") },
                  { value: "Credit Card", label: t("creditCard") },
                  { value: "Bank Transfer", label: t("bankTransfer") },
                  { value: "Check", label: t("check") },
                ]}
                required
              />

              <FormField
                label={t("creditLimit")}
                type="number"
                value={formData.credit_limit}
                onChange={handleFieldChange("credit_limit")}
                min={0}
                step={1000}
                required
                error={errors.credit_limit}
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

export default SupplierForm;
