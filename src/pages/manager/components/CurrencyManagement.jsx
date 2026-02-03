import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  X,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { currencyService } from "../../../services";

const CurrencyManagement = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  // Form state for creating/editing currency
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
    display_order: 0,
    requires_confirmation: false,
    icon: null,
  });

  // Fetch currencies function
  const fetchCurrencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await currencyService.getCurrencies();
      const currenciesList = Array.isArray(response) ? response : [];
      setCurrencies(currenciesList);
      setFilteredCurrencies(currenciesList);
    } catch (err) {
      console.error("Error fetching currencies:", err);
      setError(err.message || t("failedToFetchCurrencies"));
      toast.error(err.message || t("failedToFetchCurrencies"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch currencies on component mount
  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  // Filter currencies based on search term and status
  const filterCurrencies = useCallback(() => {
    if (!Array.isArray(currencies)) {
      setFilteredCurrencies([]);
      return;
    }

    let filtered = [...currencies];

    // Search filter - search by name or code
    if (searchTerm) {
      filtered = filtered.filter(
        (currency) =>
          (currency.name &&
            currency.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (currency.code &&
            currency.code.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((currency) => currency.is_active === true);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((currency) => currency.is_active === false);
    }

    setFilteredCurrencies(filtered);
  }, [currencies, searchTerm, statusFilter]);

  useEffect(() => {
    filterCurrencies();
  }, [filterCurrencies]);

  const handleCreateCurrency = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      is_active: true,
      display_order: 0,
      requires_confirmation: false,
      icon: null,
    });
    setSelectedCurrency(null);
    setShowCreateModal(true);
  };

  const handleEditCurrency = (currency) => {
    setFormData({
      name: currency.name || "",
      code: currency.code || "",
      description: currency.description || "",
      is_active: currency.is_active !== undefined ? currency.is_active : true,
      display_order: currency.display_order || 0,
      requires_confirmation: currency.requires_confirmation !== undefined ? currency.requires_confirmation : false,
      icon: currency.icon || null,
    });
    setSelectedCurrency(currency);
    setShowEditModal(true);
  };

  const handleDeleteCurrency = async (currency) => {
    if (window.confirm(t("confirmDeleteCurrency", { name: currency.name }))) {
      try {
        await currencyService.deleteCurrency(currency.id);
        toast.success(t("currencyDeleted"));
        fetchCurrencies();
      } catch (error) {
        toast.error(error.message || t("deleteFailed"));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error(t("currencyNameRequired"));
      return;
    }

    if (!formData.code.trim()) {
      toast.error(t("currencyCodeRequired"));
      return;
    }

    try {
      const currencyData = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim() || null,
        is_active: formData.is_active,
        display_order: formData.display_order || 0,
        requires_confirmation: formData.requires_confirmation,
        icon: formData.icon || null,
      };

      if (showCreateModal) {
        await currencyService.createCurrency(currencyData);
        toast.success(t("currencyCreated"));
      } else {
        await currencyService.updateCurrency(selectedCurrency.id, currencyData);
        toast.success(t("currencyUpdated"));
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setFormData({
        name: "",
        code: "",
        description: "",
        is_active: true,
        display_order: 0,
        requires_confirmation: false,
        icon: null,
      });
      setSelectedCurrency(null);
      fetchCurrencies();
    } catch (error) {
      console.error("Currency operation error:", error);
      toast.error(error.message || t("operationFailed"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <div className={isRTL ? "text-right" : "text-left"}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("currencyManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("managePaymentCurrencies")}
          </p>
        </div>
        <button
          onClick={handleCreateCurrency}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-md ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Plus className="w-4 h-4" />
          {t("addCurrency")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div>
            <div className="relative">
              <Search
                className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />
              <input
                type="text"
                placeholder={t("searchCurrencies")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                  isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="active">{t("active")}</option>
              <option value="inactive">{t("inactive")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("showing")} {filteredCurrencies.length} {t("of")}{" "}
          {currencies.length} {t("currencies")}
        </p>
      </div>

      {/* Loading State */}
      {loading && currencies.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              {t("loading")}
            </p>
          </div>
        </div>
      ) : error && currencies.length === 0 ? (
        /* Error State */
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchCurrencies}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("retry")}
            </button>
          </div>
        </div>
      ) : (
        /* Currency Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCurrencies.map((currency) => (
            <div
              key={currency.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {currency.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currency.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditCurrency(currency)}
                      className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title={t("edit")}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCurrency(currency)}
                      className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title={t("delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {currency.description && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("description")}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {currency.description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      {currency.is_active ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-xs text-green-600 dark:text-green-400">
                            {t("active")}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="text-xs text-red-600 dark:text-red-400">
                            {t("inactive")}
                          </span>
                        </>
                      )}
                    </div>
                    {currency.requires_confirmation && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-xs text-orange-600 dark:text-orange-400">
                          {t("requiresConfirmation")}
                        </span>
                      </div>
                    )}
                  </div>

                  {currency.display_order !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("displayOrder")}: {currency.display_order}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCurrencies.length === 0 && currencies.length > 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t("noCurrenciesFound")}
          </p>
        </div>
      )}

      {!loading && currencies.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("noCurrencies")}
          </p>
          <button
            onClick={handleCreateCurrency}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("addFirstCurrency")}
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showCreateModal
                  ? t("addCurrency")
                  : t("editCurrency")}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("name")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("code")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("description")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("displayOrder")}
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  min="0"
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("isActive")}
                </label>
              </div>

              {/* Requires Confirmation */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requires_confirmation}
                  onChange={(e) =>
                    setFormData({ ...formData, requires_confirmation: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("requiresConfirmation")}
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {showCreateModal ? t("create") : t("update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyManagement;

