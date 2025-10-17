import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Search, Filter, ArrowUp, ArrowDown, Eye, Loader2 } from "lucide-react";
import {
  fetchOrders,
  updateOrderStatus,
} from "../../../store/slices/ordersSlice";
import { customerService } from "../../../services";

const AllOrders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [statusInput, setStatusInput] = useState("");
  const [editingStatus, setEditingStatus] = useState(null);

  // Customer data states
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

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

  // Helper function to get customer name by ID
  const getCustomerName = (customerId) => {
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
      return customer.customer_name || customer.name || `Customer #${actualId}`;
    }
    return `Customer #${actualId}`;
  };

  // Helper function to get customer address by ID
  const getCustomerAddress = (customerId) => {
    if (!customerId) return "N/A";

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

    return customer ? customer.customer_address || customer.address : "N/A";
  };

  // Load delivery orders from API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        await dispatch(fetchOrders());
      } catch (err) {
        console.error("Error loading orders:", err);
      }
    };

    loadOrders();
    fetchCustomersData();
    const interval = setInterval(loadOrders, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  // Filter and sort orders - only delivery orders
  const filteredOrders = useMemo(() => {
    // First filter to only include delivery orders
    let result = [...(orders || [])].filter(
      (order) => order.delivery_option === "delivery"
    );

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
  }, [orders, searchTerm, sortConfig]);

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

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} status to: ${newStatus}`);

      await dispatch(
        updateOrderStatus({
          id: orderId,
          status: newStatus,
        })
      );

      setEditingStatus(null);
      setStatusInput("");
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };



  const handleCancelEditStatus = () => {
    setEditingStatus(null);
    setStatusInput("");
  };

  const getStatusColor = (order) => {
    const status = order.status || order.deliveryStatus;
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
      case "delivering":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  const getStatusText = (order) => {
    const status = order.status || order.deliveryStatus;
    switch (status?.toLowerCase()) {
      case "completed":
        return t("completed");
      case "delivered":
        return t("delivered");
      case "pending":
        return t("pending");
      case "delivering":
        return t("delivering");
      case "cancelled":
        return t("cancelled");
      default:
        return status || t("pending");
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
                      {customersLoading
                        ? "..."
                        : getCustomerName(order.customer)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {customersLoading
                        ? "..."
                        : getCustomerAddress(order.customer)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingStatus === order.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={statusInput}
                        onChange={(e) => setStatusInput(e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Enter status"
                      />
                      <button
                        onClick={() =>
                          handleStatusUpdate(order.id, statusInput)
                        }
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelEditStatus}
                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order
                      )}`}
                    >
                      {getStatusText(order)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {(order.total_amount || order.total || 0).toFixed(2)}{" "}
                  {t("currency")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(order.date || order.createdAt).toLocaleString()}
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
