import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Package,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Clock,
} from "lucide-react";

import StatsCard from "../../../components/Common/StatsCard";
import DataTable from "../../../components/Common/DataTable";
import {
  formatCurrencyEnglish,
  formatDateTimeEnglish,
  formatNumberEnglish,
} from "../../../utils";
import { fetchOrders } from "../../../store/slices/ordersSlice";
import { fetchCustomers } from "../../../store/slices/customerSlice";

const SellerHome = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state) => state.language);
  const { products } = useSelector((state) => state.inventory);
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state) => state.orders);
  const {
    customers,
    loading: customersLoading,
    error: customersError,
  } = useSelector((state) => state.customers);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState({
    todayOrders: [],
    yesterdayOrders: [],
    pendingOrders: [],
    completedOrders: [],
    todayRevenue: 0,
    yesterdayRevenue: 0,
    orderChange: 0,
    revenueChange: 0,
    avgOrderValue: 0,
    newCustomersThisWeek: 0,
  });

  // Calculate statistics based on current data
  const calculateStatistics = useCallback(
    (currentOrders, currentCustomers) => {
      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Filter orders by date
        const todayOrders = currentOrders.filter(
          (order) =>
            new Date(order.createdAt).toDateString() === today.toDateString()
        );

        const yesterdayOrders = currentOrders.filter(
          (order) =>
            new Date(order.createdAt).toDateString() ===
            yesterday.toDateString()
        );

        const completedOrders = currentOrders.filter(
          (order) => order.status === "completed"
        );

        const pendingOrders = currentOrders.filter(
          (order) => order.status === "pending"
        );

        // Calculate revenues
        const todayRevenue = todayOrders.reduce(
          (sum, order) => sum + (Number(order.total) || 0),
          0
        );
        const yesterdayRevenue = yesterdayOrders.reduce(
          (sum, order) => sum + (Number(order.total) || 0),
          0
        );

        // Calculate changes
        const orderChange = yesterdayOrders.length
          ? ((todayOrders.length - yesterdayOrders.length) /
              yesterdayOrders.length) *
            100
          : 0;

        const revenueChange = yesterdayRevenue
          ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
          : 0;

        // Calculate new customers this week
        const newCustomersThisWeek = currentCustomers.filter(
          (customer) => new Date(customer.createdAt) >= weekAgo
        ).length;

        // Calculate average order value for this month
        const thisMonthOrders = completedOrders.filter(
          (order) => new Date(order.createdAt) >= thisMonth
        );

        const totalOrderValue = thisMonthOrders.reduce(
          (sum, order) => sum + (Number(order.total) || 0),
          0
        );

        const avgOrderValue =
          thisMonthOrders.length > 0
            ? totalOrderValue / thisMonthOrders.length
            : 0;

        const newSalesData = {
          todayOrders,
          yesterdayOrders,
          pendingOrders,
          completedOrders,
          todayRevenue,
          yesterdayRevenue,
          orderChange,
          revenueChange,
          avgOrderValue,
          newCustomersThisWeek,
        };

        return newSalesData;
      } catch (err) {
        console.error("Error calculating statistics:", err);
        throw new Error(t("errorCalculatingStats"));
      }
    },
    [t]
  );

  // Load data from Redux
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch data from API via Redux
      await Promise.all([dispatch(fetchOrders()), dispatch(fetchCustomers())]);

      setError(null);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(t("errorLoadingData"));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, t]);

  // Initialize data and set up auto-refresh
  useEffect(() => {
    loadData();

    // Refresh data every minute
    const intervalId = setInterval(loadData, 60000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [loadData]);

  // Calculate statistics when data changes
  useEffect(() => {
    if (!ordersLoading && !customersLoading && orders && customers) {
      try {
        const newSalesData = calculateStatistics(orders, customers);
        setSalesData(newSalesData);
      } catch (err) {
        console.error("Error calculating statistics:", err);
        setError(t("errorCalculatingStats"));
      }
    }
  }, [
    orders,
    customers,
    ordersLoading,
    customersLoading,
    calculateStatistics,
    t,
  ]);

  // Handle low stock products
  const lowStockProducts = products.filter(
    (product) => product.stock <= product.minStock
  );

  // Quick stats
  const stats = [
    {
      title: t("todayOrders"),
      value: formatNumberEnglish(salesData.todayOrders.length || 0),
      icon: ShoppingCart,
      color: "blue",
      change: Number(salesData.orderChange.toFixed(1)),
      changeText: t("fromYesterday"),
      trend: salesData.orderChange >= 0 ? "up" : "down",
    },
    {
      title: t("todayRevenue"),
      value: formatCurrencyEnglish(salesData.todayRevenue || 0, t("currency")),
      icon: DollarSign,
      color: "green",
      change: Number(salesData.revenueChange.toFixed(1)),
      changeText: t("fromYesterday"),
      trend: salesData.revenueChange >= 0 ? "up" : "down",
    },
    {
      title: t("pendingOrders"),
      value: formatNumberEnglish(salesData.pendingOrders.length || 0),
      icon: Clock,
      color: "yellow",
      subtitle: t("needsAttention"),
    },
    {
      title: t("avgOrderValue"),
      value: formatCurrencyEnglish(salesData.avgOrderValue || 0, t("currency")),
      icon: TrendingUp,
      color: "purple",
      subtitle: t("thisMonth"),
    },
    {
      title: t("totalProducts"),
      value: formatNumberEnglish(products.length || 0),
      icon: Package,
      color: "indigo",
      subtitle: `${formatNumberEnglish(lowStockProducts.length || 0)} ${t(
        "lowStock"
      )}`,
    },
    {
      title: t("totalCustomers"),
      value: formatNumberEnglish(customers.length || 0),
      icon: Users,
      color: "pink",
      change: salesData.newCustomersThisWeek,
      changeText: t("newThisWeek"),
      trend: "up",
    },
  ];

  // Recent orders for table
  const recentOrders = orders.slice(0, 8);

  const orderColumns = [
    {
      header: t("orderId"),
      accessor: "id",
      render: (order) => (
        <span className="font-mono text-sm font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
          {order.id}
        </span>
      ),
    },
    {
      header: t("customer"),
      accessor: "customer",
    },
    {
      header: t("total"),
      accessor: "total",
      render: (order) => formatCurrencyEnglish(order.total || 0, t("currency")),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (order) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            order.status === "completed"
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
              : order.status === "pending"
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
              : order.status === "preparing"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
          }`}
        >
          {t(order.status)}
        </span>
      ),
    },
    {
      header: t("orderTime"),
      accessor: "createdAt",
      render: (order) => formatDateTimeEnglish(order.createdAt),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: (order) => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Link
            to={`/seller/orders/${order.id}`}
            className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
            title={t("viewOrder")}
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            to={`/seller/orders/${order.id}/edit`}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors duration-200"
            title={t("editOrder")}
          >
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  if (isLoading || ordersLoading || customersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || ordersError || customersError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <p>{error || ordersError || customersError}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t("tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-xl shadow-soft dark:shadow-soft-dark p-6 text-white transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <div
          className={`flex items-center justify-between ${
            isRTL ? "flex-row" : ""
          }`}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-2xl font-bold mb-2">
              {t("welcomeToSellerDashboard")}
            </h1>
            <p className="text-blue-100 dark:text-blue-200">
              {t("manageOrdersInventoryCustomers")}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 dark:bg-white/10 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <ShoppingCart className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <h3
          className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("quickActions")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/seller/new-order"
            className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-105 group border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
          >
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-md">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {t("newOrder")}
            </span>
          </Link>

          <Link
            to="/seller/inventory"
            className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all duration-200 hover:scale-105 group border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700"
          >
            <div className="w-12 h-12 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {t("inventory")}
            </span>
          </Link>

          <Link
            to="/seller/customers"
            className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200 hover:scale-105 group border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700"
          >
            <div className="w-12 h-12 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {t("customers")}
            </span>
          </Link>

          <Link
            to="/seller/reports"
            className="flex flex-col items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-all duration-200 hover:scale-105 group border border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700"
          >
            <div className="w-12 h-12 bg-yellow-600 dark:bg-yellow-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {t("reports")}
            </span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3
                className={`text-lg font-medium text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("recentOrders")}
              </h3>
            </div>
            <DataTable
              data={recentOrders}
              columns={orderColumns}
              searchable={false}
              pageable={false}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
            <div
              className={`flex items-center gap-3 mb-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3
                className={`text-lg font-medium text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("lowStockProducts")}
              </h3>
            </div>
            <div className="space-y-3">
              {lowStockProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors duration-200"
                >
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatNumberEnglish(product.stock)} {t("remaining")}
                    </p>
                  </div>
                  <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                    {t("lowStock")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
            <h3
              className={`text-lg font-medium text-gray-900 dark:text-white mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("todaySummary")}
            </h3>
            <div className="space-y-4">
              <div
                className={`flex justify-between ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <span className="text-gray-600 dark:text-gray-400">
                  {t("orders")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatNumberEnglish(23)}
                </span>
              </div>
              <div
                className={`flex justify-between ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <span className="text-gray-600 dark:text-gray-400">
                  {t("revenue")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrencyEnglish(2450.75, t("currency"))}
                </span>
              </div>
              <div
                className={`flex justify-between ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <span className="text-gray-600 dark:text-gray-400">
                  {t("customers")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatNumberEnglish(19)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div
                  className={`flex justify-between ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("avgOrderValue")}
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatCurrencyEnglish(106.55, t("currency"))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerHome;
