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
  getFromStorage,
  setToStorage,
  deleteCustomer,
} from "../../../utils/localStorage";

// Constants for localStorage keys
const STORAGE_KEYS = {
  ORDERS: "sales_app_orders",
  CUSTOMERS: "sales_app_customers",
};

const CustomerManagement = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formMode, setFormMode] = useState("add");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [customers, setCustomers] = useState([]);

  // Helper function to generate sequential customer ID
  const generateCustomerId = (existingCustomers) => {
    const maxId =
      existingCustomers.length > 0
        ? Math.max(
            ...existingCustomers
              .map((c) => c.id)
              .filter((id) => id.startsWith("CUST-"))
              .map((id) => parseInt(id.replace("CUST-", "")) || 0)
          )
        : 2;
    return `CUST-${maxId + 1}`;
  };

  // Load customers from localStorage and create from orders if needed
  useEffect(() => {
    const loadCustomers = () => {
      const storedCustomers = getFromStorage(STORAGE_KEYS.CUSTOMERS, []);
      const orders = getFromStorage(STORAGE_KEYS.ORDERS, []);

      // Create a map of existing customers for quick lookup
      const existingCustomersMap = new Map();
      storedCustomers.forEach((customer) => {
        existingCustomersMap.set(customer.name?.toLowerCase(), customer);
        if (customer.phone) {
          existingCustomersMap.set(customer.phone, customer);
        }
      });

      // Find customers from orders who don't exist in stored customers
      const orderCustomers = new Map();
      orders.forEach((order) => {
        if (!order.customer) return; // Skip if no customer info

        const customerKey = order.customer.toLowerCase();
        const phoneKey = order.phone;

        // Check if customer already exists
        if (
          !existingCustomersMap.has(customerKey) &&
          !existingCustomersMap.has(phoneKey)
        ) {
          // Create customer from order data
          const customerId = generateCustomerId([
            ...storedCustomers,
            ...Array.from(orderCustomers.values()),
          ]);

          const newCustomer = {
            id: customerId,
            name: order.customer,
            email: "",
            phone: order.phone || "",
            address: order.deliveryAddress || "",
            company: "",
            notes: `Auto-created from order #${order.id}`,
            vip: false,
            status: "active",
            joinDate: order.createdAt || new Date().toISOString(),
            dateOfBirth: "",
            preferredContactMethod: "phone",
          };

          orderCustomers.set(customerKey, newCustomer);
          existingCustomersMap.set(customerKey, newCustomer);
          if (phoneKey) {
            existingCustomersMap.set(phoneKey, newCustomer);
          }
        }
      });

      // Combine stored customers with auto-created customers
      const allCustomers = [
        ...storedCustomers,
        ...Array.from(orderCustomers.values()),
      ];

      // Save new customers to localStorage
      if (orderCustomers.size > 0) {
        setToStorage(STORAGE_KEYS.CUSTOMERS, allCustomers);
      }

      // Calculate customer statistics from orders
      const customersWithStats = allCustomers.map((customer) => {
        const customerOrders = orders.filter(
          (order) =>
            (order.customer &&
              customer.name &&
              order.customer.toLowerCase() === customer.name.toLowerCase()) ||
            (order.phone && customer.phone && order.phone === customer.phone)
        );

        const totalOrders = customerOrders.length;
        const totalSpent = customerOrders.reduce(
          (sum, order) => sum + (Number(order.total) || 0),
          0
        );
        const lastOrder =
          customerOrders.length > 0
            ? customerOrders.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              )[0].createdAt
            : null;

        return {
          ...customer,
          totalOrders,
          totalSpent,
          lastOrder,
        };
      });

      setCustomers(customersWithStats);
    };

    loadCustomers();
  }, []);

  const statusOptions = [
    { value: "all", label: t("allCustomers") },
    { value: "active", label: t("active") },
    { value: "inactive", label: t("inactive") },
    { value: "vip", label: t("vipCustomers") },
  ];

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

    let matchesStatus = true;
    if (statusFilter === "vip") {
      matchesStatus = customer.vip;
    } else if (statusFilter !== "all") {
      matchesStatus = customer.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
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

  const confirmDelete = () => {
    // Delete from localStorage
    deleteCustomer(customerToDelete.id);

    // Update local state
    setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
    setDeleteModalOpen(false);
    setCustomerToDelete(null);

    // Show success message
    alert(t("customerDeletedSuccessfully"));
  };

  const handleFormSubmit = () => {
    // Reload customers from localStorage to get updated data with stats
    const loadCustomers = () => {
      const storedCustomers = getFromStorage(STORAGE_KEYS.CUSTOMERS, []);
      const orders = getFromStorage(STORAGE_KEYS.ORDERS, []);

      // Create a map of existing customers for quick lookup
      const existingCustomersMap = new Map();
      storedCustomers.forEach((customer) => {
        existingCustomersMap.set(customer.name?.toLowerCase(), customer);
        if (customer.phone) {
          existingCustomersMap.set(customer.phone, customer);
        }
      });

      // Find customers from orders who don't exist in stored customers
      const orderCustomers = new Map();
      orders.forEach((order) => {
        if (!order.customer) return; // Skip if no customer info

        const customerKey = order.customer.toLowerCase();
        const phoneKey = order.phone;

        // Check if customer already exists
        if (
          !existingCustomersMap.has(customerKey) &&
          !existingCustomersMap.has(phoneKey)
        ) {
          // Create customer from order data
          const customerId = generateCustomerId([
            ...storedCustomers,
            ...Array.from(orderCustomers.values()),
          ]);

          const newCustomer = {
            id: customerId,
            name: order.customer,
            email: "",
            phone: order.phone || "",
            address: order.deliveryAddress || "",
            company: "",
            notes: `Auto-created from order #${order.id}`,
            vip: false,
            status: "active",
            joinDate: order.createdAt || new Date().toISOString(),
            dateOfBirth: "",
            preferredContactMethod: "phone",
          };

          orderCustomers.set(customerKey, newCustomer);
          existingCustomersMap.set(customerKey, newCustomer);
          if (phoneKey) {
            existingCustomersMap.set(phoneKey, newCustomer);
          }
        }
      });

      // Combine stored customers with auto-created customers
      const allCustomers = [
        ...storedCustomers,
        ...Array.from(orderCustomers.values()),
      ];

      // Save new customers to localStorage
      if (orderCustomers.size > 0) {
        setToStorage(STORAGE_KEYS.CUSTOMERS, allCustomers);
      }

      // Calculate customer statistics from orders
      const customersWithStats = allCustomers.map((customer) => {
        const customerOrders = orders.filter(
          (order) =>
            (order.customer &&
              customer.name &&
              order.customer.toLowerCase() === customer.name.toLowerCase()) ||
            (order.phone && customer.phone && order.phone === customer.phone)
        );

        const totalOrders = customerOrders.length;
        const totalSpent = customerOrders.reduce(
          (sum, order) => sum + (Number(order.total) || 0),
          0
        );
        const lastOrder =
          customerOrders.length > 0
            ? customerOrders.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              )[0].createdAt
            : null;

        return {
          ...customer,
          totalOrders,
          totalSpent,
          lastOrder,
        };
      });

      setCustomers(customersWithStats);
    };

    loadCustomers();

    if (formMode === "add") {
      alert(t("customerAddedSuccessfully"));
    } else {
      alert(t("customerUpdatedSuccessfully"));
    }
  };

  const columns = [
    {
      header: t("customer"),
      accessor: "name",
      render: (customer) => (
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            {customer.vip && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-yellow-800" />
              </div>
            )}
          </div>
          <div className={isRTL ? "text-right" : "text-left"}>
            <div className="font-medium text-gray-900 dark:text-white">
              {customer.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {customer.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: t("contact"),
      accessor: "contact",
      render: (customer) => (
        <div className="space-y-1">
          <div
            className={`flex items-center gap-2 text-sm ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-600 dark:text-gray-300">
              {customer.email}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 text-sm ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-600 dark:text-gray-300">
              {customer.phone}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t("company"),
      accessor: "company",
      render: (customer) => (
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
          <Building className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {customer.company || t("noCompany")}
          </span>
        </div>
      ),
    },
    {
      header: t("orders"),
      accessor: "totalOrders",
      render: (customer) => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {formatNumberEnglish(customer.totalOrders)}
          </span>
        </div>
      ),
    },
    {
      header: t("totalSpent"),
      accessor: "totalSpent",
      render: (customer) => (
        <div className={`flex items-center gap-1 ${isRTL ? "flex-row" : ""}`}>
          <span className="font-medium text-green-600 dark:text-green-400">
            {formatCurrencyEnglish(customer.totalSpent, t("currency"))}
          </span>
        </div>
      ),
    },
    {
      header: t("lastOrder"),
      accessor: "lastOrder",
      render: (customer) => (
        <div className={`flex items-center gap-1 ${isRTL ? "flex-row" : ""}`}>
          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {customer.lastOrder
              ? formatDateTimeEnglish(customer.lastOrder)
              : t("noOrders")}
          </span>
        </div>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (customer) => getStatusBadge(customer),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: (customer) => (
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
          <button
            onClick={() => handleViewCustomer(customer)}
            className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all duration-200 hover:scale-110"
            title={t("viewCustomerDetails")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditCustomer(customer)}
            className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-all duration-200 hover:scale-110"
            title={t("editCustomerInfo")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteCustomer(customer)}
            className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all duration-200 hover:scale-110"
            title={t("deleteCustomerRecord")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      title: t("totalCustomers"),
      value: formatNumberEnglish(customers.length),
      icon: Users,
      color: "blue",
      change: 12,
      changeText: t("fromLastMonth"),
    },
    {
      title: t("activeCustomers"),
      value: formatNumberEnglish(
        customers.filter((c) => c.status === "active").length
      ),
      icon: User,
      color: "green",
      change: 8,
      changeText: t("fromLastMonth"),
    },
    {
      title: t("vipCustomers"),
      value: formatNumberEnglish(customers.filter((c) => c.vip).length),
      icon: Star,
      color: "yellow",
      change: 5,
      changeText: t("fromLastMonth"),
    },
    {
      title: t("totalRevenue"),
      value: formatCurrencyEnglish(
        customers.reduce((sum, c) => sum + c.totalSpent, 0),
        t("currency")
      ),
      icon: DollarSign,
      color: "purple",
      change: 15,
      changeText: t("fromLastMonth"),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
            isRTL ? "flex-row" : ""
          }`}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("customerManagement")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("manageCustomerDatabase")}
            </p>
          </div>
          <button
            onClick={handleAddCustomer}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-md ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Plus className="w-4 h-4" />
            {t("addCustomer")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div
          className={`flex flex-col sm:flex-row gap-4 ${
            isRTL ? "flex-row" : ""
          }`}
        >
          <div className="flex-1">
            <div className="relative">
              <Search
                className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />
              <input
                type="text"
                placeholder={t("searchCustomers")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                  isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter
                className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 appearance-none ${
                  isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <DataTable
        data={filteredCustomers}
        columns={columns}
        searchable={false}
        pageable={true}
        pageSize={10}
      />

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
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("viewCustomerDetails")}
                </h2>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("customerName")}
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedCustomer.name}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("email")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedCustomer.email}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("phoneNumber")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedCustomer.phone}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("company")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedCustomer.company || t("noCompany")}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("address")}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedCustomer.address}
                    </p>
                  </div>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("totalOrders")}
                  </label>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {formatNumberEnglish(selectedCustomer.totalOrders)}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("totalSpent")}
                  </label>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatCurrencyEnglish(
                      selectedCustomer.totalSpent,
                      t("currency")
                    )}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("status")}
                  </label>
                  <div className="mt-1">{getStatusBadge(selectedCustomer)}</div>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("joinDate")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDateTimeEnglish(selectedCustomer.joinDate)}
                  </p>
                </div>
                {selectedCustomer.notes && (
                  <div className="md:col-span-2">
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("notes")}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedCustomer.notes}
                      </p>
                    </div>
                  </div>
                )}
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
              <div
                className={`flex items-center gap-3 mb-4 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("deleteCustomer")}
                </h3>
              </div>
              <p
                className={`text-gray-600 dark:text-gray-400 mb-6 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("areYouSureDeleteCustomer")}{" "}
                <strong>{customerToDelete.name}</strong>?{" "}
                {t("thisActionCannotBeUndone")}
              </p>
              <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200"
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
