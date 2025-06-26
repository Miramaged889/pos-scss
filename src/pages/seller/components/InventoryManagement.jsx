import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Package,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  Eye,
  DollarSign,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import { formatCurrencyEnglish, formatNumberEnglish } from "../../../utils";

const InventoryManagement = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const { products } = useSelector((state) => state.inventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Calculate inventory stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (product) => product.stock <= product.minStock
  );
  const outOfStockProducts = products.filter((product) => product.stock === 0);
  const totalValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: t("allCategories") },
    { value: "main", label: t("mainCourse") },
    { value: "side", label: t("sideDish") },
    { value: "beverages", label: t("beverages") },
    { value: "desserts", label: t("desserts") },
  ];

  const getStockStatus = (product) => {
    if (product.stock === 0) {
      return {
        status: "out",
        label: t("outOfStock"),
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-900/20",
      };
    } else if (product.stock <= product.minStock) {
      return {
        status: "low",
        label: t("lowStock"),
        color: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
      };
    }
    return {
      status: "good",
      label: t("inStock"),
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    };
  };

  const stats = [
    {
      title: t("totalProducts"),
      value: formatNumberEnglish(totalProducts),
      icon: Package,
      color: "blue",
    },
    {
      title: t("lowStock"),
      value: formatNumberEnglish(lowStockProducts.length),
      icon: AlertTriangle,
      color: "yellow",
      subtitle: t("needsAttention"),
    },
    {
      title: t("outOfStock"),
      value: formatNumberEnglish(outOfStockProducts.length),
      icon: AlertTriangle,
      color: "red",
      subtitle: t("criticalStatus"),
    },
    {
      title: t("inventoryValue"),
      value: formatCurrencyEnglish(totalValue, t("currency")),
      icon: TrendingUp,
      color: "green",
      subtitle: t("totalWorth"),
    },
  ];

  const productColumns = [
    {
      header: t("product"),
      accessor: "name",
      render: (product) => (
        <div
          className={`flex items-center gap-3 ${
            isRTL ? "flex-row" : ""
          }`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div
            className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}
          >
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {isRTL ? product.name : product.nameEn || product.name}
            </div>
            {product.sku && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {t("sku")}: {product.sku}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: t("category"),
      accessor: "category",
      render: (product) => (
        <div className={`flex ${isRTL ? "justify-start" : "justify-center"}`}>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
            {t(product.category)}
          </span>
        </div>
      ),
    },
    {
      header: t("stock"),
      accessor: "stock",
      render: (product) => {
        return (
          <div className={`${isRTL ? "text-right" : "text-center"}`}>
            <div className="font-bold text-lg text-gray-900 dark:text-white mb-1">
              {formatNumberEnglish(product.stock)}
            </div>
          </div>
        );
      },
    },
    {
      header: t("minStock"),
      accessor: "minStock",
      render: (product) => (
        <div className={`${isRTL ? "text-right" : "text-center"}`}>
          <span className="font-semibold text-gray-900 dark:text-white text-base">
            {formatNumberEnglish(product.minStock)}
          </span>
        </div>
      ),
    },
    {
      header: t("price"),
      accessor: "price",
      render: (product) => (
        <div
          className={`flex items-center gap-1 ${
            isRTL ? "justify-start flex-row-reverse" : "justify-center"
          }`}
        >

          <span className="font-semibold text-green-600 dark:text-green-400">
            {formatCurrencyEnglish(product.price, t("currency"))}
          </span>
        </div>
      ),
    },
    {
      header: t("totalWorth"),
      accessor: "value",
      render: (product) => (
        <div className={`${isRTL ? "text-right" : "text-center"}`}>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatCurrencyEnglish(
              product.price * product.stock,
              t("currency")
            )}
          </span>
        </div>
      ),
    },
    {
      header: t("supplier"),
      accessor: "supplier",
      render: (product) => (
        <div className={`${isRTL ? "text-right" : "text-center"}`}>
          <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md inline-block">
            {product.supplier || t("noSupplier")}
          </span>
        </div>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (product) => {
        const stockStatus = getStockStatus(product);
        return (
          <div className={`flex ${isRTL ? "justify-start" : "justify-center"}`}>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color} border border-current border-opacity-20 whitespace-nowrap`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isRTL ? "ml-1.5" : "mr-1.5"
                } ${stockStatus.color.replace("text-", "bg-")}`}
              ></div>
              {stockStatus.label}
            </span>
          </div>
        );
      },
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: () => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "justify-start flex-row-reverse" : "justify-center"
          }`}
        >
          <button
            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("viewProduct")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("editProduct")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("deleteProduct")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          isRTL ? "flex-row" : ""
        }`}
      >
        <div className={isRTL ? "text-right" : "text-left"}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("inventoryManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageProductInventory")}
          </p>
        </div>
        <button
          className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-md ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Plus className="w-4 h-4" />
          {t("addProduct")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <div
          className={`flex flex-col sm:flex-row gap-4 ${
            isRTL ? "sm:flex-row-reverse" : ""
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
                placeholder={t("searchProducts")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                  isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 appearance-none ${
                  isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <DataTable
          data={filteredProducts}
          columns={productColumns}
          searchable={false}
          pageable={true}
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default InventoryManagement;
