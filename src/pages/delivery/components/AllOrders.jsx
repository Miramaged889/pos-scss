import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ArrowUp, ArrowDown, Eye, Loader2 } from "lucide-react";
import { syncDeliveryOrders } from "../../../utils/localStorage";

const AllOrders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Load delivery orders from localStorage
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use syncDeliveryOrders to get the latest orders
        const orders = await syncDeliveryOrders();
        setDeliveryOrders(orders || []);
      } catch (err) {
        console.error("Error loading orders:", err);
        setError(t("errorLoadingOrders"));
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [t]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = [...deliveryOrders];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toString().includes(searchLower) ||
          order.customer.toLowerCase().includes(searchLower) ||
          order.deliveryAddress.toLowerCase().includes(searchLower)
      );
    }

    // Sort orders
    result.sort((a, b) => {
      if (sortConfig.key === "createdAt") {
        return sortConfig.direction === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortConfig.key === "total") {
        return sortConfig.direction === "asc"
          ? a.total - b.total
          : b.total - a.total;
      }
      return 0;
    });

    return result;
  }, [deliveryOrders, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleViewDetails = (orderId) => {
    navigate(`/delivery/order/${orderId}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "delivering":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("allDeliveryOrders")}
        </h2>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("searchOrders")}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 flex-start dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-3  text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("orderId")}
              </th>
              <th className="px-6 py-3  text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("customer")}
              </th>
              <th className="px-6 py-3  text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("status")}
              </th>
              <th
                className="px-6 py-3  text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("total")}
              >
                <div className="flex items-center gap-2">
                  {t("total")}
                  {sortConfig.key === "total" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3  text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-2">
                  {t("date")}
                  {sortConfig.key === "createdAt" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-3  text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  #{order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.customer}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {order.deliveryAddress}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      order.deliveryStatus
                    )}`}
                  >
                    {t(order.deliveryStatus || "pending")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {order.total?.toFixed(2)} {t("currency")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleViewDetails(order.id)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("noOrdersFound")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("tryDifferentFilters")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrders;
