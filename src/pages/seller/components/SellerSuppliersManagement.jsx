import { useState, useEffect } from "react";
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
  Package,
  FileText,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import { SellerSupplierForm } from "../../../components/Forms/SellerForms";
import {
  formatCurrencyEnglish,
  formatDateTimeEnglish,
  formatNumberEnglish,
} from "../../../utils";

const SellerSuppliersManagement = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formMode, setFormMode] = useState("add");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    // Mock data for suppliers
    const mockSuppliers = [
      {
        id: "SUP-001",
        name: "شركة الأغذية المتحدة",
        email: "info@unitedfoods.com",
        phone: "+966 50 123 4567",
        address: "الرياض، المملكة العربية السعودية",
        company: "شركة الأغذية المتحدة",
        notes: "مورد رئيسي للمواد الغذائية الأساسية",
        status: "active",
        joinDate: "2023-01-15T10:30:00",
        rating: 4.8,
        totalProducts: 150,
        totalOrders: 45,
        totalSpent: 125000.5,
        lastOrder: "2024-01-10T14:30:00",
        contactPerson: "أحمد محمد",
        paymentTerms: "30 days",
        creditLimit: 50000,
      },
      {
        id: "SUP-002",
        name: "مؤسسة البناء الحديث",
        email: "contact@modernbuilding.com",
        phone: "+966 50 234 5678",
        address: "جدة، المملكة العربية السعودية",
        company: "مؤسسة البناء الحديث",
        notes: "مورد مواد البناء والتشييد",
        status: "active",
        joinDate: "2023-03-20T09:15:00",
        rating: 4.6,
        totalProducts: 89,
        totalOrders: 32,
        totalSpent: 89000.75,
        lastOrder: "2024-01-08T16:45:00",
        contactPerson: "فاطمة أحمد",
        paymentTerms: "45 days",
        creditLimit: 75000,
      },
      {
        id: "SUP-003",
        name: "شركة الإلكترونيات المتقدمة",
        email: "sales@advancedelectronics.com",
        phone: "+966 50 345 6789",
        address: "الدمام، المملكة العربية السعودية",
        company: "شركة الإلكترونيات المتقدمة",
        notes: "مورد الأجهزة الإلكترونية والكهربائية",
        status: "inactive",
        joinDate: "2023-06-10T11:20:00",
        rating: 4.7,
        totalProducts: 234,
        totalOrders: 67,
        totalSpent: 156000.25,
        lastOrder: "2023-12-15T13:20:00",
        contactPerson: "خالد سعد",
        paymentTerms: "60 days",
        creditLimit: 100000,
      },
      {
        id: "SUP-004",
        name: "مصنع النسيج الوطني",
        email: "info@nationaltextile.com",
        phone: "+966 50 456 7890",
        address: "الرياض، المملكة العربية السعودية",
        company: "مصنع النسيج الوطني",
        notes: "مورد الأقمشة والمنسوجات",
        status: "active",
        joinDate: "2023-08-05T14:45:00",
        rating: 4.9,
        totalProducts: 78,
        totalOrders: 28,
        totalSpent: 67000.9,
        lastOrder: "2024-01-12T10:15:00",
        contactPerson: "نورا عبدالله",
        paymentTerms: "30 days",
        creditLimit: 40000,
      },
      {
        id: "SUP-005",
        name: "شركة الأدوية العالمية",
        email: "orders@globalpharma.com",
        phone: "+966 50 567 8901",
        address: "جدة، المملكة العربية السعودية",
        company: "شركة الأدوية العالمية",
        notes: "مورد الأدوية والمستلزمات الطبية",
        status: "active",
        joinDate: "2023-11-12T08:30:00",
        rating: 4.5,
        totalProducts: 456,
        totalOrders: 89,
        totalSpent: 234000.6,
        lastOrder: "2024-01-14T15:30:00",
        contactPerson: "عمر خالد",
        paymentTerms: "90 days",
        creditLimit: 150000,
      },
    ];

    setSuppliers(mockSuppliers);
  };

  const statusOptions = [
    { value: "all", label: t("allSuppliers") },
    { value: "active", label: t("active") },
    { value: "inactive", label: t("inactive") },
    { value: "vip", label: t("vipSuppliers") },
  ];

  const getStatusBadge = (supplier) => {
    if (supplier.rating >= 4.8) {
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
          statusClasses[supplier.status] || statusClasses.active
        }`}
      >
        {t(supplier.status)}
      </span>
    );
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm) ||
      supplier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "vip") {
      matchesStatus = supplier.rating >= 4.8;
    } else if (statusFilter !== "all") {
      matchesStatus = supplier.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setFormMode("add");
    setIsFormOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setViewModalOpen(true);
  };

  const handleDeleteSupplier = (supplier) => {
    setSupplierToDelete(supplier);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setSuppliers((prev) => prev.filter((s) => s.id !== supplierToDelete.id));
    setDeleteModalOpen(false);
    setSupplierToDelete(null);
    alert(t("supplierDeletedSuccessfully"));
  };

  const handleFormSubmit = () => {
    if (formMode === "add") {
      alert(t("supplierAddedSuccessfully"));
    } else {
      alert(t("supplierUpdatedSuccessfully"));
    }
  };

  const columns = [
    {
      header: t("supplier"),
      accessor: "name",
      render: (supplier) => (
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            {supplier.rating >= 4.8 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-yellow-800" />
              </div>
            )}
          </div>
          <div className={isRTL ? "text-right" : "text-left"}>
            <div className="font-medium text-gray-900 dark:text-white">
              {supplier.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {supplier.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: t("contact"),
      accessor: "contact",
      render: (supplier) => (
        <div className="space-y-1">
          <div
            className={`flex items-center gap-2 text-sm ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-600 dark:text-gray-300">
              {supplier.email}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 text-sm ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-600 dark:text-gray-300">
              {supplier.phone}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t("contactPerson"),
      accessor: "contactPerson",
      render: (supplier) => (
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
          <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {supplier.contactPerson}
          </span>
        </div>
      ),
    },
    {
      header: t("products"),
      accessor: "totalProducts",
      render: (supplier) => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {formatNumberEnglish(supplier.totalProducts)}
          </span>
        </div>
      ),
    },
    {
      header: t("orders"),
      accessor: "totalOrders",
      render: (supplier) => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {formatNumberEnglish(supplier.totalOrders)}
          </span>
        </div>
      ),
    },
    {
      header: t("totalSpent"),
      accessor: "totalSpent",
      render: (supplier) => (
        <div className={`flex items-center gap-1 ${isRTL ? "flex-row" : ""}`}>
          <span className="font-medium text-green-600 dark:text-green-400">
            {formatCurrencyEnglish(supplier.totalSpent, t("currency"))}
          </span>
        </div>
      ),
    },
    {
      header: t("rating"),
      accessor: "rating",
      render: (supplier) => (
        <div className={`flex items-center gap-1 ${isRTL ? "flex-row" : ""}`}>
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-medium text-gray-900 dark:text-white">
            {supplier.rating}
          </span>
        </div>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (supplier) => getStatusBadge(supplier),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: (supplier) => (
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
          <button
            onClick={() => handleViewSupplier(supplier)}
            className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all duration-200 hover:scale-110"
            title={t("viewSupplierDetails")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditSupplier(supplier)}
            className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-all duration-200 hover:scale-110"
            title={t("editSupplierInfo")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteSupplier(supplier)}
            className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all duration-200 hover:scale-110"
            title={t("deleteSupplierRecord")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      title: t("totalSuppliers"),
      value: formatNumberEnglish(suppliers.length),
      icon: Users,
      color: "blue",
      change: 8,
      changeText: t("fromLastMonth"),
    },
    {
      title: t("activeSuppliers"),
      value: formatNumberEnglish(
        suppliers.filter((s) => s.status === "active").length
      ),
      icon: User,
      color: "green",
      change: 5,
      changeText: t("fromLastMonth"),
    },
    {
      title: t("vipSuppliers"),
      value: formatNumberEnglish(
        suppliers.filter((s) => s.rating >= 4.8).length
      ),
      icon: Star,
      color: "yellow",
      change: 2,
      changeText: t("fromLastMonth"),
    },
    {
      title: t("totalSpent"),
      value: formatCurrencyEnglish(
        suppliers.reduce((sum, s) => sum + s.totalSpent, 0),
        t("currency")
      ),
      icon: DollarSign,
      color: "purple",
      change: 12,
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
              {t("suppliersManagement")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("manageSupplierDatabase")}
            </p>
          </div>
          <button
            onClick={handleAddSupplier}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 hover:scale-105 shadow-md ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Plus className="w-4 h-4" />
            {t("addSupplier")}
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
                placeholder={t("searchSuppliers")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
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
                className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 appearance-none ${
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

      {/* Suppliers Table */}
      <DataTable
        data={filteredSuppliers}
        columns={columns}
        searchable={false}
        pageable={true}
        pageSize={10}
      />

      {/* Supplier Form Modal */}
      <SellerSupplierForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        supplier={selectedSupplier}
        mode={formMode}
      />

      {/* View Supplier Modal */}
      {viewModalOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("viewSupplierDetails")}
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
                    {t("supplierName")}
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedSupplier.name}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("email")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedSupplier.email}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("phoneNumber")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedSupplier.phone}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("contactPerson")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedSupplier.contactPerson}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("address")}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedSupplier.address}
                    </p>
                  </div>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("totalProducts")}
                  </label>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {formatNumberEnglish(selectedSupplier.totalProducts)}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("totalOrders")}
                  </label>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatNumberEnglish(selectedSupplier.totalOrders)}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("totalSpent")}
                  </label>
                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {formatCurrencyEnglish(
                      selectedSupplier.totalSpent,
                      t("currency")
                    )}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("rating")}
                  </label>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedSupplier.rating}
                    </span>
                  </div>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("status")}
                  </label>
                  <div className="mt-1">{getStatusBadge(selectedSupplier)}</div>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("joinDate")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDateTimeEnglish(selectedSupplier.joinDate)}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("paymentTerms")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedSupplier.paymentTerms}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("creditLimit")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatCurrencyEnglish(
                      selectedSupplier.creditLimit,
                      t("currency")
                    )}
                  </p>
                </div>
                {selectedSupplier.notes && (
                  <div className="md:col-span-2">
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("notes")}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedSupplier.notes}
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
      {deleteModalOpen && supplierToDelete && (
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
                  {t("deleteSupplier")}
                </h3>
              </div>
              <p
                className={`text-gray-600 dark:text-gray-400 mb-6 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("areYouSureDeleteSupplier")}{" "}
                <strong>{supplierToDelete.name}</strong>?{" "}
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

export default SellerSuppliersManagement;
