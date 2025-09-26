import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Plus,
  Edit,
  Eye,
  Search,
  Filter,
  Star,
  User,
  Calendar,
  DollarSign,
  ShoppingBag,
  Trash2,
  Building,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import { CustomerForm } from "../../../components/Forms";
import {
  formatCurrencyEnglish,
  formatDateTimeEnglish,
  formatNumberEnglish,
} from "../../../utils";
import {
  fetchCustomers,
  deleteCustomer,
} from "../../../store/slices/customerSlice";

const CustomerManagement = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state) => state.language);
  const { customers, loading, error } = useSelector((state) => state.customers);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formMode, setFormMode] = useState("add");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Load customers from API
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const getStatusBadge = (customer) => {
    if (customer.vip) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
          <Star className="w-3 h-3 mr-1" />
          {t("vip")}
        </span>
      );
    }

    const statusClasses = {
      active:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      inactive: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusClasses[customer.status] || statusClasses.active
        }`}
      >
        {t(customer.status)}
      </span>
    );
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setFormMode("add");
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  };

  const handleDeleteCustomer = (customer) => {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteCustomer(customerToDelete.id));
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const handleFormSubmit = () => {
    // Refresh customers from API
    dispatch(fetchCustomers());
    setIsFormOpen(false);
  };

  // Calculate statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const vipCustomers = customers.filter((c) => c.vip).length;
  const totalOrders = customers.reduce(
    (sum, c) => sum + (c.totalOrders || 0),
    0
  );

  const columns = [
    {
      key: "name",
      label: t("customerName"),
      render: (customer) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {customer.name}
            </div>
            {customer.company && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Building className="w-3 h-3" />
                {customer.company}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: t("contactInfo"),
      render: (customer) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {customer.phone}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {customer.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "address",
      label: t("address"),
      render: (customer) => (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="truncate max-w-32">{customer.address}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: t("status"),
      render: (customer) => getStatusBadge(customer),
    },
    {
      key: "stats",
      label: t("statistics"),
      render: (customer) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {customer.totalOrders || 0} {t("orders")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {formatCurrencyEnglish(customer.totalSpent || 0)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: t("actions"),
      render: (customer) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewCustomer(customer)}
            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title={t("viewDetails")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditCustomer(customer)}
            className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title={t("edit")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteCustomer(customer)}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("customerManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageCustomerInformationAndOrders")}
          </p>
        </div>
        <button
          onClick={handleAddCustomer}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          {t("addCustomer")}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t("totalCustomers")}
          value={formatNumberEnglish(totalCustomers)}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title={t("activeCustomers")}
          value={formatNumberEnglish(activeCustomers)}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title={t("vipCustomers")}
          value={formatNumberEnglish(vipCustomers)}
          icon={Star}
          color="yellow"
        />
        <StatsCard
          title={t("totalOrders")}
          value={formatNumberEnglish(totalOrders)}
          icon={ShoppingBag}
          color="purple"
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t("searchCustomers")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <DataTable
          data={filteredCustomers}
          columns={columns}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          loading={loading}
        />
      </div>

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        customer={selectedCustomer}
        mode={formMode}
      />

      {/* View Customer Modal */}
      {viewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("customerDetails")}
              </h2>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t("basicInformation")}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("customerName")}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedCustomer.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("email")}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedCustomer.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("phoneNumber")}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedCustomer.phone}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("address")}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedCustomer.address}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t("statistics")}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("totalOrders")}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedCustomer.totalOrders || 0}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("totalSpent")}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatCurrencyEnglish(
                          selectedCustomer.totalSpent || 0
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("status")}
                      </label>
                      <div className="mt-1">
                        {getStatusBadge(selectedCustomer)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && customerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("confirmDelete")}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("areYouSureDeleteCustomer")}{" "}
                <strong>{customerToDelete.name}</strong>?
                {t("thisActionCannotBeUndone")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
