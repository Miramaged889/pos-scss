import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CreditCard,
  DollarSign,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

const PaymentMethodsManagement = () => {
  const { t } = useTranslation();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [filteredPaymentMethods, setFilteredPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Form state for creating/editing payment method
  const [formData, setFormData] = useState({
    name: "",
    type: "card",
    status: "",
    settings: {
      requireCVV: true,
      requireBillingAddress: true,
      allowPartialPayments: false,
      autoCapture: true,
    },
  });

  // Show/hide status field
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    filterPaymentMethods();
  }, [paymentMethods, searchTerm, statusFilter, filterPaymentMethods]);

  const loadPaymentMethods = () => {
    setLoading(true);
    // Mock data
    const mockPaymentMethods = [
      {
        id: 1,
        name: "Credit Card",
        type: "card",
        status: "active",
        settings: {
          requireCVV: true,
          requireBillingAddress: true,
          allowPartialPayments: false,
          autoCapture: true,
        },
        createdAt: "2024-01-01",
        totalTransactions: 1250,
        totalAmount: 45678.5,
      },
      {
        id: 2,
        name: "Cash on Delivery",
        type: "cash",
        status: "active",
        settings: {
          requireCVV: false,
          requireBillingAddress: true,
          allowPartialPayments: true,
          autoCapture: false,
        },
        createdAt: "2024-01-01",
        totalTransactions: 890,
        totalAmount: 23450.75,
      },
      {
        id: 3,
        name: "Bank Transfer",
        type: "bank",
        status: "active",
        settings: {
          requireCVV: false,
          requireBillingAddress: true,
          allowPartialPayments: true,
          autoCapture: false,
        },
        createdAt: "2024-01-05",
        totalTransactions: 320,
        totalAmount: 15678.25,
      },
      {
        id: 4,
        name: "Digital Wallet",
        type: "digital",
        status: "inactive",
        settings: {
          requireCVV: false,
          requireBillingAddress: false,
          allowPartialPayments: false,
          autoCapture: true,
        },
        createdAt: "2024-01-10",
        totalTransactions: 150,
        totalAmount: 5678.9,
      },
      {
        id: 5,
        name: "PayPal",
        type: "digital",
        status: "active",
        settings: {
          requireCVV: false,
          requireBillingAddress: false,
          allowPartialPayments: true,
          autoCapture: true,
        },
        createdAt: "2024-01-15",
        totalTransactions: 450,
        totalAmount: 18900.3,
      },
      {
        id: 6,
        name: "Stripe",
        type: "card",
        status: "active",
        settings: {
          requireCVV: true,
          requireBillingAddress: true,
          allowPartialPayments: false,
          autoCapture: true,
        },
        createdAt: "2024-01-20",
        totalTransactions: 780,
        totalAmount: 32450.8,
      },
    ];

    setTimeout(() => {
      setPaymentMethods(mockPaymentMethods);
      setFilteredPaymentMethods(mockPaymentMethods);
      setLoading(false);
    }, 1000);
  };

  const filterPaymentMethods = useCallback(() => {
    let filtered = [...paymentMethods];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (method) =>
          method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          method.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((method) => method.status === statusFilter);
    }

    setFilteredPaymentMethods(filtered);
  }, [paymentMethods, searchTerm, statusFilter]);

  const handleCreatePaymentMethod = () => {
    setFormData({
      name: "",
      type: "card",
      status: "",
      settings: {
        requireCVV: true,
        requireBillingAddress: true,
        allowPartialPayments: false,
        autoCapture: true,
      },
    });
    setShowStatus(false);
    setShowCreateModal(true);
  };

  const handleEditPaymentMethod = (method) => {
    setFormData({
      name: method.name,
      type: method.type,
      status: method.status,
      settings: method.settings,
    });
    setShowStatus(false);
    setSelectedMethod(method);
    setShowEditModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (showCreateModal) {
      // Create new payment method
      const newMethod = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
        totalTransactions: 0,
        totalAmount: 0,
      };

      setPaymentMethods([...paymentMethods, newMethod]);
      toast.success(t("paymentMethodCreated"));
    } else {
      // Update existing payment method
      const updatedMethods = paymentMethods.map((method) =>
        method.id === selectedMethod.id
          ? {
              ...method,
              ...formData,
            }
          : method
      );
      setPaymentMethods(updatedMethods);
      toast.success(t("paymentMethodUpdated"));
    }

    setShowCreateModal(false);
    setShowEditModal(false);
    setFormData({
      name: "",
      type: "card",
      status: "",
      settings: {
        requireCVV: true,
        requireBillingAddress: true,
        allowPartialPayments: false,
        autoCapture: true,
      },
    });
    setShowStatus(false);
  };

  const handleDeletePaymentMethod = (method) => {
    if (window.confirm(t("confirmDeletePaymentMethod"))) {
      const updatedMethods = paymentMethods.filter((m) => m.id !== method.id);
      setPaymentMethods(updatedMethods);
      toast.success(t("paymentMethodDeleted"));
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
        <CheckCircle className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      card: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        text: t("card"),
        icon: CreditCard,
      },
      cash: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        text: t("cash"),
        icon: DollarSign,
      },
      bank: {
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        text: t("bank"),
        icon: Settings,
      },
      digital: {
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        text: t("digital"),
        icon: Settings,
      },
    };

    const config = typeConfig[type] || typeConfig.card;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      card: CreditCard,
      cash: DollarSign,
      bank: Settings,
      digital: Settings,
    };
    return iconMap[type] || Settings;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("paymentMethodsManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("managePaymentMethods")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreatePaymentMethod}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("addPaymentMethod")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("filters")}
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? t("hideFilters") : t("showFilters")}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("search")}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("searchPaymentMethods")}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("status")}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">{t("allStatuses")}</option>
                  <option value="active">{t("active")}</option>
                  <option value="inactive">{t("inactive")}</option>
                  <option value="pending">{t("pending")}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("showing")} {filteredPaymentMethods.length} {t("of")}{" "}
          {paymentMethods.length} {t("paymentMethods")}
        </p>
      </div>

      {/* Payment Methods Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaymentMethods.map((method) => {
            const TypeIcon = getTypeIcon(method.type);
            return (
              <div
                key={method.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <TypeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {method.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getTypeBadge(method.type)}
                          {getStatusBadge(method.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditPaymentMethod(method)}
                        className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title={t("edit")}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePaymentMethod(method)}
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title={t("delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("transactions")}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {method.totalTransactions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("totalAmount")}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${method.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showCreateModal
                  ? t("addPaymentMethod")
                  : t("editPaymentMethod")}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("name")}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("type")}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="card">{t("card")}</option>
                    <option value="cash">{t("cash")}</option>
                    <option value="bank">{t("bank")}</option>
                    <option value="digital">{t("digital")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("status")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showStatus}
                      onChange={(e) => setShowStatus(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("showStatus")}
                    </span>
                  </div>
                </div>
              </div>

              {showStatus && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("status")}
                  </label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

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

export default PaymentMethodsManagement;
