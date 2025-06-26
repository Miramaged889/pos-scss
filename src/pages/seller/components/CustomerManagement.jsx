import React, { useState } from "react";
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
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import { formatCurrency, formatDateTime } from "../../../utils";

const CustomerManagement = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data
  const customers = [
    {
      id: "CUST-001",
      name: "أحمد محمد",
      email: "ahmed@example.com",
      phone: "+966501234567",
      address: "الرياض، حي النخيل",
      totalOrders: 15,
      totalSpent: 1250.75,
      lastOrder: "2024-01-15T10:30:00Z",
      status: "active",
      vip: true,
      joinDate: "2023-06-15T00:00:00Z",
    },
    {
      id: "CUST-002",
      name: "فاطمة علي",
      email: "fatima@example.com",
      phone: "+966509876543",
      address: "جدة، حي الصفا",
      totalOrders: 8,
      totalSpent: 580.25,
      lastOrder: "2024-01-14T16:20:00Z",
      status: "active",
      vip: false,
      joinDate: "2023-09-20T00:00:00Z",
    },
    {
      id: "CUST-003",
      name: "عبدالله سعد",
      email: "abdullah@example.com",
      phone: "+966555123456",
      address: "الدمام، حي الفيصلية",
      totalOrders: 25,
      totalSpent: 2150.5,
      lastOrder: "2024-01-13T14:45:00Z",
      status: "active",
      vip: true,
      joinDate: "2023-03-10T00:00:00Z",
    },
    {
      id: "CUST-004",
      name: "مريم أحمد",
      email: "mariam@example.com",
      phone: "+966502345678",
      address: "الرياض، حي العليا",
      totalOrders: 3,
      totalSpent: 125.0,
      lastOrder: "2023-12-20T11:15:00Z",
      status: "inactive",
      vip: false,
      joinDate: "2023-11-05T00:00:00Z",
    },
  ];

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
      customer.phone.includes(searchTerm);

    let matchesStatus = true;
    if (statusFilter === "vip") {
      matchesStatus = customer.vip;
    } else if (statusFilter !== "all") {
      matchesStatus = customer.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: t("customer"),
      accessor: "name",
      render: (customer) => (
        <div className="flex items-center gap-3">
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
          <div>
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
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-600 dark:text-gray-300">
              {customer.email}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-600 dark:text-gray-300">
              {customer.phone}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t("address"),
      accessor: "address",
      render: (customer) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {customer.address}
          </span>
        </div>
      ),
    },
    {
      header: t("orders"),
      accessor: "totalOrders",
      render: (customer) => (
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {customer.totalOrders}
          </span>
        </div>
      ),
    },
    {
      header: t("totalSpent"),
      accessor: "totalSpent",
      render: (customer) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="font-medium text-green-600 dark:text-green-400">
            {formatCurrency(customer.totalSpent)}
          </span>
        </div>
      ),
    },
    {
      header: t("lastOrder"),
      accessor: "lastOrder",
      render: (customer) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {formatDateTime(customer.lastOrder)}
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
      render: () => (
        <div className="flex items-center gap-2">
          <button
            className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all duration-200 hover:scale-110"
            title={t("viewCustomer")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-all duration-200 hover:scale-110"
            title={t("editCustomer")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all duration-200 hover:scale-110"
            title={t("deleteCustomer")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      label: t("totalCustomers"),
      value: customers.length,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      icon: User,
    },
    {
      label: t("activeCustomers"),
      value: customers.filter((c) => c.status === "active").length,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
      icon: User,
    },
    {
      label: t("vipCustomers"),
      value: customers.filter((c) => c.vip).length,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      icon: Star,
    },
    {
      label: t("totalRevenue"),
      value: formatCurrency(
        customers.reduce((sum, c) => sum + c.totalSpent, 0)
      ),
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("customerManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageCustomerDatabase")}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105">
          <Plus className="w-4 h-4" />
          {t("addCustomer")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bg} rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </div>
                  <div
                    className={`text-2xl font-bold ${stat.color} group-hover:scale-105 transition-transform duration-200`}
                  >
                    {stat.value}
                  </div>
                </div>
                <div
                  className={`p-3 rounded-xl bg-white dark:bg-gray-800 group-hover:scale-110 transition-all duration-300`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder={t("searchCustomers")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 appearance-none"
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
    </div>
  );
};

export default CustomerManagement;
