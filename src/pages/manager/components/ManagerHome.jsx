import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Plus,
} from "lucide-react";

import StatsCard from "../../../components/Common/StatsCard";
import DataTable from "../../../components/Common/DataTable";
import { fetchOrders } from "../../../store/slices/ordersSlice";
import { fetchProducts } from "../../../store/slices/inventorySlice";
import { formatCurrencyEnglish, formatNumberEnglish } from "../../../utils";
import {
  productService,
  customerService,
  tenantUsersService,
} from "../../../services";

const ManagerHome = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Get data from Redux store
  const { orders, loading: ordersLoading } = useSelector(
    (state) => state.orders
  );
  const { products, loading: productsLoading } = useSelector(
    (state) => state.inventory
  );


  // Data states for API fetched data
  const [productsDataLoading, setProductsDataLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [sellersData, setSellersData] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(false);

  // Fetch products from API
  const fetchProductsData = async () => {
    try {
      setProductsDataLoading(true);
      await productService.getProducts();
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsDataLoading(false);
    }
  };

  // Fetch customers from API
  const fetchCustomersData = async () => {
    try {
      setCustomersLoading(true);
      const response = await customerService.getCustomers();
      setCustomers(response);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Fetch sellers from API
  const fetchSellersData = async () => {
    try {
      setSellersLoading(true);
      const response = await tenantUsersService.getTenantUsers();
      setSellersData(response);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    } finally {
      setSellersLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data from API
    dispatch(fetchOrders());
    dispatch(fetchProducts());
    fetchProductsData();
    fetchCustomersData();
    fetchSellersData();
  }, [dispatch]);

  // Helper function to get customer name by ID
  const getCustomerName = React.useCallback(
    (customerId) => {
      if (!customerId) return "Unknown Customer";

      // Extract actual ID from strings like "Customer #1"
      let actualId = customerId;
      if (typeof customerId === "string" && customerId.includes("#")) {
        const match = customerId.match(/#(\d+)/);
        actualId = match ? parseInt(match[1]) : customerId;
      }

      // Try both string and number comparison
      const customer = customers.find(
        (c) =>
          c.id === actualId ||
          c.id === parseInt(actualId) ||
          c.id === actualId.toString() ||
          c.id === customerId ||
          c.id === parseInt(customerId) ||
          c.id === customerId.toString()
      );

      if (customer) {
        return (
          customer.customer_name || customer.name || `Customer #${actualId}`
        );
      }
      return `Customer #${actualId}`;
    },
    [customers]
  );

  // Helper function to get seller name by ID
  const getSellerName = React.useCallback(
    (sellerId) => {
      if (!sellerId) return "Unknown Seller";

      // Extract actual ID from strings like "Seller #2"
      let actualId = sellerId;
      if (typeof sellerId === "string" && sellerId.includes("#")) {
        const match = sellerId.match(/#(\d+)/);
        actualId = match ? parseInt(match[1]) : sellerId;
      }

      // Try both string and number comparison
      const seller = sellersData.find(
        (s) =>
          s.id === actualId ||
          s.id === parseInt(actualId) ||
          s.id === actualId.toString() ||
          s.id === sellerId ||
          s.id === parseInt(sellerId) ||
          s.id === sellerId.toString()
      );

      return seller
        ? seller.username ||
            seller.name ||
            seller.user_name ||
            `Seller #${actualId}`
        : `Seller #${actualId}`;
    },
    [sellersData]
  );

  // Helper function to get seller email by ID
  const getSellerEmail = React.useCallback(
    (sellerId) => {
      if (!sellerId) return "N/A";

      // Extract actual ID from strings like "Seller #2"
      let actualId = sellerId;
      if (typeof sellerId === "string" && sellerId.includes("#")) {
        const match = sellerId.match(/#(\d+)/);
        actualId = match ? parseInt(match[1]) : sellerId;
      }

      // Try both string and number comparison
      const seller = sellersData.find(
        (s) =>
          s.id === actualId ||
          s.id === parseInt(actualId) ||
          s.id === actualId.toString() ||
          s.id === sellerId ||
          s.id === parseInt(sellerId) ||
          s.id === sellerId.toString()
      );

      return seller ? seller.email || seller.user_email : "N/A";
    },
    [sellersData]
  );

  // Compute recent orders from Redux data
  const recentOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];

    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      )
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        customer: customersLoading ? "..." : getCustomerName(order.customer),
        seller: sellersLoading ? "..." : getSellerName(order.sellerId),
        amount: (() => {
          const amount =
            order.total_amount || order.totalAmount || order.total || 0;
          return typeof amount === "string" ? parseFloat(amount) : amount;
        })(),
        status: order.status || "pending",
        date:
          order.createdAt ||
          order.date ||
          new Date().toISOString().split("T")[0],
      }));
  }, [
    orders,
    customersLoading,
    sellersLoading,
    getCustomerName,
    getSellerName,
  ]);

  // Compute top sellers from orders data
  const topSellers = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];

    const sellerStats = {};

    orders.forEach((order) => {
      const sellerId = order.sellerId;
      const sellerName = getSellerName(sellerId);
      const sellerEmail = getSellerEmail(sellerId);

      if (!sellerStats[sellerId]) {
        sellerStats[sellerId] = {
          id: sellerId,
          name: sellerName,
          email: sellerEmail,
          sales: 0,
          orders: 0,
        };
      }

      const amount =
        order.total_amount || order.totalAmount || order.total || 0;
      sellerStats[sellerId].sales +=
        typeof amount === "string" ? parseFloat(amount) : amount;
      sellerStats[sellerId].orders += 1;
    });

    return Object.values(sellerStats)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3)
      .map((seller, index) => ({
        id: index + 1,
        ...seller,
        rating: 4.5 + Math.random() * 0.5, // Mock rating for now
      }));
  }, [orders, getSellerName, getSellerEmail]);

  useEffect(() => {
    // Generate alerts based on real data
    const newAlerts = [];

    // Ensure products is an array before filtering
    if (Array.isArray(products)) {
      // Low inventory alert
      const lowStockProducts = products.filter(
        (product) => (product.stockQuantity || 0) < 10
      );

      if (lowStockProducts.length > 0) {
        newAlerts.push({
          id: 1,
          type: "warning",
          message: `${t("lowInventoryAlert")} for ${
            lowStockProducts.length
          } products`,
          time: "2 hours ago",
        });
      }
    }

    // Ensure orders is an array before filtering
    if (Array.isArray(orders)) {
      // Pending orders alert
      const pendingOrders = orders.filter(
        (order) => order.status === "pending"
      );
      if (pendingOrders.length > 5) {
        newAlerts.push({
          id: 2,
          type: "info",
          message: `${pendingOrders.length} ${t("pendingOrders")}`,
          time: "1 hour ago",
        });
      }

      // Daily sales achievement
      const today = new Date().toISOString().split("T")[0];
      const todayOrders = orders.filter((order) =>
        (order.createdAt || order.date || "").startsWith(today)
      );
      const todaySales = todayOrders.reduce(
        (sum, order) => sum + (order.totalAmount || order.total || 0),
        0
      );

      if (todaySales > 1000) {
        newAlerts.push({
          id: 3,
          type: "success",
          message: `${t("dailySalesTargetAchieved")}: ${formatCurrencyEnglish(
            todaySales
          )}`,
          time: "30 minutes ago",
        });
      }
    }

  }, [orders, products, t]);

  // Compute statistics from Redux data
  const statsCards = React.useMemo(() => {
    if (!Array.isArray(orders) || !Array.isArray(products)) {
      return [
        {
          title: t("totalOrders"),
          value: "0",
          change: "0%",
          changeType: "neutral",
          icon: ShoppingCart,
          color: "blue",
        },
        {
          title: t("activeSellers"),
          value: "0",
          change: "0%",
          changeType: "neutral",
          icon: Users,
          color: "green",
        },
        {
          title: t("totalRevenue"),
          value: "$0",
          change: "0%",
          changeType: "neutral",
          icon: DollarSign,
          color: "purple",
        },
        {
          title: t("pendingOrders"),
          value: "0",
          change: "0%",
          changeType: "neutral",
          icon: Clock,
          color: "orange",
        },
      ];
    }

    const totalOrders = orders.length;
    const uniqueSellers = new Set(
      orders.map((order) => order.sellerId).filter(Boolean)
    ).size;
    const totalRevenue = orders.reduce((sum, order) => {
      const amount =
        order.total_amount || order.totalAmount || order.total || 0;
      return sum + (typeof amount === "string" ? parseFloat(amount) : amount);
    }, 0);
    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;

    return [
      {
        title: t("totalOrders"),
        value: formatNumberEnglish(totalOrders),
        change: "+12%", // TODO: Calculate real change from previous period
        changeType: "positive",
        icon: ShoppingCart,
        color: "blue",
      },
      {
        title: t("activeSellers"),
        value: formatNumberEnglish(uniqueSellers),
        change: "+3", // TODO: Calculate real change
        changeType: "positive",
        icon: Users,
        color: "green",
      },
      {
        title: t("totalRevenue"),
        value: formatCurrencyEnglish(totalRevenue),
        change: "+8.5%", // TODO: Calculate real change
        changeType: "positive",
        icon: DollarSign,
        color: "purple",
      },
      {
        title: t("pendingOrders"),
        value: formatNumberEnglish(pendingOrders),
        change: pendingOrders > 10 ? "-5" : "+2", // Dynamic based on current state
        changeType: pendingOrders > 10 ? "negative" : "positive",
        icon: Clock,
        color: "orange",
      },
    ];
  }, [orders, products, t]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock,
      },
      processing: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        icon: Package,
      },
      completed: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle,
      },
      cancelled: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {t(status)}
      </span>
    );
  };

 

  // Show loading state
  if (
    ordersLoading ||
    productsLoading ||
    productsDataLoading ||
    customersLoading ||
    sellersLoading
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("recentOrders")}
              </h3>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                {t("viewAll")}
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.id}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customer} - {order.seller}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${order.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.date}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Sellers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("topSellers")}
              </h3>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                {t("viewAll")}
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topSellers.map((seller, index) => (
                <div
                  key={seller.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {seller.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {seller.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${seller.sales.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {seller.orders} {t("orders")} • ⭐ {seller.rating}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerHome;
