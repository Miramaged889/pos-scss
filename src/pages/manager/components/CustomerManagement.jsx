import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
  FileText,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import { CustomerForm } from "../../../components/Forms";
import CustomerInvoiceForm from "../../../components/Forms/SellerForms/CustomerInvoiceForm";
import { formatCurrencyEnglish, formatNumberEnglish } from "../../../utils";
import { customerService } from "../../../services/customerService";
import { orderService } from "../../../services/orderService";
import { toast } from "react-hot-toast";

const CustomerManagement = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  // Local state management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [customerForInvoice, setCustomerForInvoice] = useState(null);
  const [orders, setOrders] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load orders from API
  const loadOrders = async () => {
    try {
      const response = await orderService.getOrders();
      setOrders(response);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error(t("errorLoadingOrders"));
    }
  };

  // Load customers from API
  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getCustomers();
      const transformedCustomers = response.map((customer) =>
        customerService.transformCustomerFromAPI(customer)
      );
      setCustomers(transformedCustomers);
    } catch (error) {
      console.error("Error loading customers:", error);
      setError(t("errorLoadingCustomers"));
      toast.error(t("errorLoadingCustomers"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setIsFormOpen(true);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  };

  const handleFormSubmit = async (customerData) => {
    try {
      if (selectedCustomer) {
        // Update existing customer
        await customerService.updateCustomer(selectedCustomer.id, customerData);
        toast.success(t("customerUpdatedSuccessfully"));
      } else {
        // Create new customer
        const newCustomer = await customerService.createCustomer(customerData);
        const transformedCustomer =
          customerService.transformCustomerFromAPI(newCustomer);
        setCustomers([transformedCustomer, ...customers]);
        toast.success(t("customerCreatedSuccessfully"));
      }
      setIsFormOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error(t("errorSavingCustomer"));
    }
  };

  const handleCreateInvoice = (customer) => {
    setCustomerForInvoice(customer);
    setInvoiceModalOpen(true);
  };

  const handleInvoiceSubmit = () => {
    // Close the invoice modal
    setInvoiceModalOpen(false);
    setCustomerForInvoice(null);
    // Show success message
    toast.success(t("invoiceCreatedSuccessfully"));
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteCustomer = (customer) => {
    setDeleteConfirm(customer);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      await customerService.deleteCustomer(deleteConfirm.id);
      setDeleteConfirm(null);
      // Reload customers to reflect the deletion
      await loadCustomers();
      toast.success(t("customerDeletedSuccessfully"));
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error(t("errorDeletingCustomer"));
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Calculate customer statistics from orders
  const getCustomerStats = (customerId) => {
    const customerOrders = orders.filter(
      (order) => order.customerId === customerId
    );
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0
    );

    return {
      totalOrders,
      totalSpent,
    };
  };

  // Calculate statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const vipCustomers = customers.filter((c) => c.vip).length;
  const totalOrders = orders.length;

  const columns = [
    {
      key: "name",
      label: t("customerName"),
      header: t("customerName"),
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
      header: t("contactInfo"),
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
      header: t("address"),
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
      header: t("status"),
      render: (customer) => getStatusBadge(customer),
    },
    {
      key: "stats",
      label: t("statistics"),
      header: t("statistics"),
      render: (customer) => {
        const stats = getCustomerStats(customer.id);
        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {stats.totalOrders} {t("orders")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {formatCurrencyEnglish(stats.totalSpent)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: t("actions"),
      header: t("actions"),
      render: (customer) => (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleViewCustomer(customer)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title={t("viewDetails")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditCustomer(customer)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            title={t("editCustomer")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteCustomer(customer)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title={t("deleteCustomer")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleCreateInvoice(customer)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            title={t("createInvoice")}
          >
            <FileText className="w-4 h-4" />
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
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleFormSubmit}
        customer={selectedCustomer}
        mode={selectedCustomer ? "edit" : "add"}
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
                        {getCustomerStats(selectedCustomer.id).totalOrders}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("totalSpent")}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatCurrencyEnglish(
                          getCustomerStats(selectedCustomer.id).totalSpent
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {t("close")}
                </button>
                <button
                  onClick={() => handleCreateInvoice(selectedCustomer)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {t("createInvoice")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Invoice Form Modal */}
      <CustomerInvoiceForm
        isOpen={invoiceModalOpen}
        onClose={() => {
          setInvoiceModalOpen(false);
          setCustomerForInvoice(null);
        }}
        onSubmit={handleInvoiceSubmit}
        customer={customerForInvoice}
        mode="add"
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div
                className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}
              >
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t("deleteCustomer")}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {deleteConfirm.name}
                  </p>
                </div>
              </div>
              <button
                onClick={cancelDelete}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {t("deleteConfirmationMessage")}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {t("deleteConfirmationWarning")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("customerName")}
                </label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">
                    {deleteConfirm.name}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("email")}
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">
                    {deleteConfirm.email}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("phoneNumber")}
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">
                    {deleteConfirm.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              className={`flex gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("cancel")}
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {t("deleting")}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t("delete")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
