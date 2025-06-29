import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Eye, Save, X } from "lucide-react";

const WasteLogForm = ({
  onSubmit,
  onClose,
  initialData = null,
  mode = "create",
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    reason: "",
    cost: "",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const reasonOptions = [
    { value: "expired", label: t("expired") },
    { value: "damaged", label: t("damaged") },
    { value: "overcooked", label: t("overcooked") },
    { value: "dropped", label: t("dropped") },
    { value: "other", label: t("other") },
  ];

  const handleChange = (e) => {
    if (mode === "view") return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "view") {
      onClose();
      return;
    }

    if (!formData.product || !formData.quantity || !formData.reason) {
      return;
    }

    const submissionData = {
      ...formData,
      id: formData.id || Date.now(),
      date: formData.date || new Date().toISOString(),
      quantity: parseInt(formData.quantity),
      cost: parseFloat(formData.cost || 0),
    };

    onSubmit(submissionData);
  };

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {isViewMode
              ? t("viewWasteItem")
              : isEditMode
              ? t("editWasteItem")
              : t("addWasteItem")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("productName")} {!isViewMode && "*"}
            </label>
            <input
              type="text"
              name="product"
              value={formData.product}
              onChange={handleChange}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70"
              placeholder={t("enterProductName")}
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("quantity")} {!isViewMode && "*"}
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70"
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("cost")} ({t("sar")})
              </label>
              <input
                type="number"
                name="cost"
                step="0.01"
                value={formData.cost}
                onChange={handleChange}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70"
                disabled={isViewMode}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("reason")} {!isViewMode && "*"}
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70"
              disabled={isViewMode}
            >
              <option value="">{t("selectReason")}</option>
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("notes")}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none disabled:opacity-70"
              placeholder={t("additionalNotes")}
              disabled={isViewMode}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
            >
              {isViewMode ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  {t("close")}
                </>
              ) : isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t("saveChanges")}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("addItem")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WasteLogForm;
