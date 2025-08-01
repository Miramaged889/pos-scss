import React, { useState, useEffect } from "react";
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

const ManagerHome = () => {
  const { t } = useTranslation();
  const [recentOrders, setRecentOrders] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Load mock data
    const mockRecentOrders = [
      {
        id: "ORD-001",
        customer: "أحمد محمد",
        seller: "محمد علي",
        amount: 150.0,
        status: "pending",
        date: "2024-01-15",
      },
      {
        id: "ORD-002",
        customer: "فاطمة أحمد",
        seller: "علي حسن",
        amount: 89.5,
        status: "completed",
        date: "2024-01-14",
      },
      {
        id: "ORD-003",
        customer: "خالد سعد",
        seller: "سارة محمد",
        amount: 220.75,
        status: "processing",
        date: "2024-01-13",
      },
    ];

    const mockTopSellers = [
      {
        id: 1,
        name: "محمد علي",
        email: "mohamed.ali@company.com",
        sales: 15420.5,
        orders: 45,
        rating: 4.8,
      },
      {
        id: 2,
        name: "علي حسن",
        email: "ali.hassan@company.com",
        sales: 12850.75,
        orders: 38,
        rating: 4.6,
      },
      {
        id: 3,
        name: "سارة محمد",
        email: "sara.mohamed@company.com",
        sales: 11200.25,
        orders: 32,
        rating: 4.7,
      },
    ];

    const mockAlerts = [
      {
        id: 1,
        type: "warning",
        message: t("lowInventoryAlert") + " for Product XYZ",
        time: "2 hours ago",
      },
      {
        id: 2,
        type: "info",
        message: t("newSellerRegistration") + ": أحمد محمد",
        time: "4 hours ago",
      },
      {
        id: 3,
        type: "success",
        message: t("monthlySalesTargetAchieved"),
        time: "1 day ago",
      },
    ];

    setRecentOrders(mockRecentOrders);
    setTopSellers(mockTopSellers);
    setAlerts(mockAlerts);
  }, [t]);

  const statsCards = [
    {
      title: t("totalOrders"),
      value: "1,234",
      change: "+12%",
      changeType: "positive",
      icon: ShoppingCart,
      color: "blue",
    },
    {
      title: t("activeSellers"),
      value: "45",
      change: "+3",
      changeType: "positive",
      icon: Users,
      color: "green",
    },
    {
      title: t("totalRevenue"),
      value: "$45,678",
      change: "+8.5%",
      changeType: "positive",
      icon: DollarSign,
      color: "purple",
    },
    {
      title: t("pendingOrders"),
      value: "23",
      change: "-5",
      changeType: "negative",
      icon: Clock,
      color: "orange",
    },
  ];

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

  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Eye className="w-4 h-4 text-blue-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

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

      {/* Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("recentAlerts")}
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {alert.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerHome;
