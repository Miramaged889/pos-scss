import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Package,
  User,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import {
  formatCurrencyEnglish,
  formatDateTimeEnglish,
  formatNumberEnglish,
} from "../../../utils";
import {
  deleteOrder,
  updateOrder,
  fetchOrders,
} from "../../../store/slices/ordersSlice";
import { productService, customerService } from "../../../services";

const OrdersList = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const { orders } = useSelector((state) => state.orders);
  const dispatch = useDispatch();

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all"); // all | today | week | month | custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Load orders, products, and customers from API on component mount
  useEffect(() => {
    dispatch(fetchOrders());
    fetchProducts();
    fetchCustomersData();
  }, [dispatch]);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productService.getProducts();
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
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

  // Helper function to get product name by ID
  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      return isRTL ? product.name : product.nameEn || product.name;
    }
    return `Product #${productId}`;
  };

  // Helper function to get product price by ID
  const getProductPrice = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? parseFloat(product.price) : 0;
  };

  // Helper function to get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.customer_name : `Customer #${customerId}`;
  };

  // Helper function to get customer phone by ID
  const getCustomerPhone = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.customer_phone : "";
  };

  // Normalize helpers for mixed shapes (mapped by service vs raw API)
  const getCustomerIdFromOrder = (order) => {
    // Prefer numeric id if present on order.customer; else use order.customerId
    if (typeof order.customer === "number") return order.customer;
    if (order.customerId) return order.customerId;
    // Try to parse patterns like "Customer #5"
    if (typeof order.customer === "string") {
      const match = order.customer.match(/#(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    return undefined;
  };

  const getOrderItemsCount = (order) => {
    if (Array.isArray(order.items)) return order.items.length;
    if (Array.isArray(order.products)) return order.products.length;
    if (typeof order.items === "number") return order.items; // mapped service provides number
    return 0;
  };

  const getOrderTotal = (order) => {
    // Raw API uses total_amount; mapped service sets total (number)
    if (order.total_amount != null) return parseFloat(order.total_amount) || 0;
    if (order.total != null) return parseFloat(order.total) || 0;
    return 0;
  };

  const getOrderDateValue = (order) => {
    // Raw API uses date, mapped may use createdAt
    return order.date || order.createdAt || order.created_at || null;
  };

  // Filter orders based on status, search term and date range
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    // Get customer name and phone for search (normalize id first)
    const customerId = getCustomerIdFromOrder(order);
    const customerName = customerId
      ? getCustomerName(customerId)
      : String(order.customer || "");
    const customerPhone = customerId
      ? getCustomerPhone(customerId)
      : String(order.phone || "");

    const matchesSearch =
      customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerPhone?.includes(searchTerm) ||
      (order.id &&
        order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()));

    // Date filter
    let matchesDate = true;
    if (dateRange !== "all") {
      const created = new Date(getOrderDateValue(order));
      const now = new Date();
      if (dateRange === "today") {
        const todayStr = new Date().toDateString();
        matchesDate = created.toDateString() === todayStr;
      } else if (dateRange === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = created >= weekAgo && created <= now;
      } else if (dateRange === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = created >= monthAgo && created <= now;
      } else if (dateRange === "custom") {
        const fromOk = startDate ? created >= new Date(startDate) : true;
        const toOk = endDate
          ? created <= new Date(endDate + "T23:59:59")
          : true;
        matchesDate = fromOk && toOk;
      }
    }
    return matchesStatus && matchesSearch && matchesDate;
  });

  const statusOptions = [
    { value: "all", label: t("allOrders") },
    { value: "pending", label: t("pending") },
    { value: "processing", label: t("processing") },
    { value: "completed", label: t("completed") },
    { value: "cancelled", label: t("cancelled") },
  ];

  // Handle view order
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  // Handle edit order
  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditFormData({
      customer: getCustomerName(getCustomerIdFromOrder(order)),
      phone: getCustomerPhone(getCustomerIdFromOrder(order)),
      status: order.status,
      payment_type: order.payment_type,
      delivery_option: order.delivery_option,
      discount: order.discount,
    });
    setShowEditModal(true);
  };

  // Handle delete order
  const handleDeleteOrder = (order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  // Helper function to ensure customer exists
  const ensureCustomerExists = async (orderData) => {
    try {
      // Check if customer exists by name or phone
      const customerExists = customers.some(
        (c) =>
          (c.customer_name &&
            orderData.customer &&
            c.customer_name.toLowerCase() ===
              orderData.customer.toLowerCase()) ||
          (c.customer_phone &&
            orderData.phone &&
            c.customer_phone === orderData.phone)
      );

      if (!customerExists && orderData.customer) {
        // Create new customer via API
        const newCustomer = {
          customer_name: orderData.customer,
          customer_email: "",
          customer_phone: orderData.phone || "",
          customer_address: "",
          connect_way: "phone",
          status: "active",
          VIP: false,
          notes: `Auto-created from order #${selectedOrder?.id}`,
        };

        await customerService.createCustomer(newCustomer);
        // Refresh customers list
        await fetchCustomersData();
      }
    } catch (error) {
      console.error("Error ensuring customer exists:", error);
    }
  };

  // Save edited order and ensure customer exists
  const handleSaveEdit = async () => {
    if (selectedOrder) {
      try {
        await ensureCustomerExists(editFormData);

        // Find customer ID by name or phone
        const customer = customers.find(
          (c) =>
            (c.customer_name && c.customer_name === editFormData.customer) ||
            (c.customer_phone && c.customer_phone === editFormData.phone)
        );

        const updates = {
          customer: customer?.id || selectedOrder.customer,
          status: editFormData.status,
          payment_type: editFormData.payment_type,
          delivery_option: editFormData.delivery_option,
          discount: editFormData.discount,
        };

        await dispatch(
          updateOrder({
            id: selectedOrder.id,
            updates,
          })
        );
        setShowEditModal(false);
        setSelectedOrder(null);
        setEditFormData({});
      } catch (error) {
        console.error("Error saving order:", error);
      }
    }
  };

  // Confirm delete order
  const handleConfirmDelete = async () => {
    if (selectedOrder) {
      try {
        await dispatch(deleteOrder(selectedOrder.id));
        setShowDeleteModal(false);
        setSelectedOrder(null);
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  // Close all modals
  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedOrder(null);
    setEditFormData({});
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
      processing:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      completed:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      cancelled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    };

    return (
      <div className={`flex ${isRTL ? "justify-start" : "justify-left"}`}>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-current border-opacity-20 whitespace-nowrap ${
            statusClasses[status] || statusClasses.pending
          }`}
        >
          {t(status)}
        </span>
      </div>
    );
  };

  const orderColumns = [
    {
      header: t("orderId"),
      accessor: "id",
      render: (order) => (
        <div className={`${isRTL ? "text-right" : "text-left"}`}>
          <span className="font-mono text-sm font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
            {order.id}
          </span>
        </div>
      ),
    },
    {
      header: t("customer"),
      accessor: "customer",
      render: (order) => (
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div
            className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}
          >
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {customersLoading
                ? "..."
                : getCustomerName(getCustomerIdFromOrder(order))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {customersLoading
                ? "..."
                : getCustomerPhone(getCustomerIdFromOrder(order))}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: t("items"),
      accessor: "items",
      render: (order) => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? " flex-row " : "justify-left"
          }`}
        >
          <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatNumberEnglish(getOrderItemsCount(order))} {t("items")}
          </span>
        </div>
      ),
    },
    {
      header: t("total"),
      accessor: "total",
      render: (order) => (
        <div
          className={`flex items-center gap-1 ${
            isRTL ? " flex-row" : "justify-left"
          }`}
        >
          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="font-semibold text-green-600 dark:text-green-400">
            {formatCurrencyEnglish(getOrderTotal(order), t("currency"))}
          </span>
        </div>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (order) => (
        <div
          className={`flex items-center ${
            isRTL ? "justify-start" : "justify-left"
          }`}
        >
          {getStatusBadge(order.status)}
        </div>
      ),
    },
    {
      header: t("date"),
      accessor: "date",
      render: (order) => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? " flex-row" : "justify-left"
          }`}
        >
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {formatDateTimeEnglish(getOrderDateValue(order))}
          </span>
        </div>
      ),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: (order) => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row" : "justify-left"
          }`}
        >
          <button
            onClick={() => handleViewOrder(order)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("viewOrder")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOrder(order)}
            className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("editOrder")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteOrder(order)}
            className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110"
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      title: t("totalOrders"),
      value: formatNumberEnglish(orders.length),
      icon: Package,
      color: "blue",
      subtitle: t("allOrdersCount"),
    },
    {
      title: t("pendingOrders"),
      value: formatNumberEnglish(
        orders.filter((o) => o.status === "pending").length
      ),
      icon: Calendar,
      color: "yellow",
      subtitle: t("awaitingProcessing"),
    },
    {
      title: t("completedOrders"),
      value: formatNumberEnglish(
        orders.filter((o) => o.status === "completed").length
      ),
      icon: Package,
      color: "green",
      subtitle: t("successfullyCompleted"),
    },
    {
      title: t("totalRevenue"),
      value: formatCurrencyEnglish(
        orders.reduce(
          (sum, order) => sum + parseFloat(order.total_amount || 0),
          0
        ),
        t("currency")
      ),
      icon: DollarSign,
      color: "purple",
      subtitle: t("totalEarnings"),
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
            {t("ordersManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageAllCustomerOrders")}
          </p>
        </div>
        <Link
          to="/seller/product-selection"
          className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-md ${
            isRTL ? "flex-row" : ""
          }`}
        >
          <Plus className="w-4 h-4" />
          {t("newOrder")}
        </Link>
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
                placeholder={t("searchOrders")}
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
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="sm:w-56">
            <div className="relative">
              <Calendar
                className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 appearance-none ${
                  isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
              >
                <option value="all">{t("allTime")}</option>
                <option value="today">{t("today")}</option>
                <option value="week">{t("thisWeek")}</option>
                <option value="month">{t("thisMonth")}</option>
                <option value="custom">{t("customRange")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom date pickers */}
        {dateRange === "custom" && (
          <div
            className={`mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 ${
              isRTL ? "sm:flex-row-reverse" : ""
            }`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("fromDate")}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("toDate")}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <DataTable
          data={filteredOrders}
          columns={orderColumns}
          searchable={false}
          pageable={true}
          pageSize={10}
        />
      </div>

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div
                className={`flex items-center justify-between ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("viewOrder")} #{formatNumberEnglish(selectedOrder.id)}
                </h3>
                <button
                  onClick={closeModals}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("customer")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {customersLoading
                      ? "..."
                      : getCustomerName(getCustomerIdFromOrder(selectedOrder))}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("phoneNumber")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {customersLoading
                      ? "..."
                      : getCustomerPhone(getCustomerIdFromOrder(selectedOrder))}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("status")}
                  </label>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("total")}
                  </label>
                  <p className="text-green-600 dark:text-green-400 font-semibold">
                    {formatCurrencyEnglish(
                      parseFloat(selectedOrder.total_amount || 0),
                      t("currency")
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("paymentType")}
                  </label>
                  <p className="text-gray-900 dark:text-white capitalize">
                    {selectedOrder.payment_type === "cash"
                      ? t("cash")
                      : selectedOrder.payment_type === "card"
                      ? t("card")
                      : selectedOrder.payment_type === "bank_transfer"
                      ? t("bankTransfer")
                      : selectedOrder.payment_type}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("deliveryOption")}
                  </label>
                  <p className="text-gray-900 dark:text-white capitalize">
                    {selectedOrder.delivery_option === "pickup"
                      ? t("pickup")
                      : selectedOrder.delivery_option === "delivery"
                      ? t("delivery")
                      : selectedOrder.delivery_option}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("products")}
                </label>
                <div className="space-y-2">
                  {(Array.isArray(selectedOrder.items)
                    ? selectedOrder.items
                    : Array.isArray(selectedOrder.products)
                    ? selectedOrder.products.map((p) => ({
                        product_id: p.id,
                        quantity: p.quantity,
                      }))
                    : []
                  ).map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-gray-900 dark:text-white">
                        {productsLoading
                          ? "..."
                          : getProductName(item.product_id)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatNumberEnglish(item.quantity)} ×{" "}
                        {formatCurrencyEnglish(
                          getProductPrice(item.product_id),
                          t("currency")
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("subtotal")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatCurrencyEnglish(
                      parseFloat(selectedOrder.subtotal || 0),
                      t("currency")
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("discount")}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatCurrencyEnglish(
                      parseFloat(selectedOrder.discount || 0),
                      t("currency")
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div
                className={`flex items-center justify-between ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("editOrder")} #{formatNumberEnglish(selectedOrder.id)}
                </h3>
                <button
                  onClick={closeModals}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("customerName")}
                  </label>
                  <input
                    type="text"
                    value={editFormData.customer}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        customer: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("phoneNumber")}
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("status")}
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="pending">{t("pending")}</option>
                    <option value="processing">{t("processing")}</option>
                    <option value="completed">{t("completed")}</option>
                    <option value="cancelled">{t("cancelled")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("paymentType")}
                  </label>
                  <select
                    value={editFormData.payment_type}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        payment_type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="cash">{t("cash")}</option>
                    <option value="card">{t("card")}</option>
                    <option value="bank_transfer">{t("bankTransfer")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("deliveryOption")}
                  </label>
                  <select
                    value={editFormData.delivery_option}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        delivery_option: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="pickup">{t("pickup")}</option>
                    <option value="delivery">{t("delivery")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("discount")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.discount}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        discount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div
                className={`flex gap-3 pt-4 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {t("save")}
                </button>
                <button
                  onClick={closeModals}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t("cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("delete")} {t("order")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    #{formatNumberEnglish(selectedOrder.id)}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {t("areYouSureDeleteOrder")} {t("thisActionCannotBeUndone")}
              </p>
              <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                <button
                  onClick={handleConfirmDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("delete")}
                </button>
                <button
                  onClick={closeModals}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t("cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
