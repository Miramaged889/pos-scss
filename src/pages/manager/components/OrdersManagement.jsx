import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Users,
  X,
  Save,
} from "lucide-react";
import { toast } from "react-hot-toast";

import DataTable from "../../../components/Common/DataTable";
import {
  fetchOrders,
  updateOrder,
  deleteOrder,
} from "../../../store/slices/ordersSlice";
import {
  productService,
  customerService,
  tenantUsersService,
} from "../../../services";

const OrdersManagement = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Get data from Redux store
  const { orders, loading, error } = useSelector((state) => state.orders);
  const { isRTL } = useSelector((state) => state.language);

  // Local state for UI
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Modal states
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Data states
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [sellersData, setSellersData] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(false);

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

  // Helper function to get both English and Arabic product names
  const getProductNameBothLanguages = (productId) => {
    if (!productId)
      return { english: "Unknown Product", arabic: "منتج غير معروف" };

    // Extract actual ID from strings like "Product #3"
    let actualId = productId;
    if (typeof productId === "string" && productId.includes("#")) {
      const match = productId.match(/#(\d+)/);
      actualId = match ? parseInt(match[1]) : productId;
    }

    // Try both string and number comparison
    const product = products.find(
      (p) =>
        p.id === actualId ||
        p.id === parseInt(actualId) ||
        p.id === actualId.toString() ||
        p.id === productId ||
        p.id === parseInt(productId) ||
        p.id === productId.toString()
    );

    if (product) {
      return {
        english: product.nameEn || product.name || `Product #${actualId}`,
        arabic: product.name || product.nameEn || `منتج #${actualId}`,
      };
    }
    return {
      english: `Product #${actualId}`,
      arabic: `منتج #${actualId}`,
    };
  };

  // Helper function to get product price by ID
  const getProductPrice = (productId) => {
    if (!productId) return 0;

    // Extract actual ID from strings like "Product #3"
    let actualId = productId;
    if (typeof productId === "string" && productId.includes("#")) {
      const match = productId.match(/#(\d+)/);
      actualId = match ? parseInt(match[1]) : productId;
    }

    // Try both string and number comparison
    const product = products.find(
      (p) =>
        p.id === actualId ||
        p.id === parseInt(actualId) ||
        p.id === actualId.toString() ||
        p.id === productId ||
        p.id === parseInt(productId) ||
        p.id === productId.toString()
    );

    return product ? parseFloat(product.price) : 0;
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

  // Helper function to get customer phone by ID
  const getCustomerPhone = (customerId) => {
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

    return customer ? customer.customer_phone || customer.phone : "N/A";
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

  // Helper function to get seller name by ID
  const getSellerName = (sellerId) => {
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
  };

  // Helper function to get seller email by ID
  const getSellerEmail = (sellerId) => {
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
  };

  const filterOrders = useCallback(() => {
    if (!Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          (order.id || "")
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (order.customer?.name || order.customerName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (order.seller?.name || order.sellerName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (order.customer?.phone || order.customerPhone || "").includes(
            searchTerm
          )
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Seller filter
    if (sellerFilter !== "all") {
      filtered = filtered.filter(
        (order) =>
          (order.seller?.email || order.sellerEmail || "") === sellerFilter
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(
          order.createdAt || order.orderDate || order.date
        );
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sellerFilter, dateRange]);

  useEffect(() => {
    dispatch(fetchOrders());
    fetchProducts();
    fetchCustomersData();
    fetchSellersData();
  }, [dispatch]);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  // Compute unique sellers from orders
  const sellers = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];

    const uniqueSellers = new Set();
    orders.forEach((order) => {
      const sellerEmail = order.seller?.email || order.sellerEmail;
      const sellerName = order.seller?.name || order.sellerName;
      if (sellerEmail && sellerName) {
        uniqueSellers.add(
          JSON.stringify({ email: sellerEmail, name: sellerName })
        );
      }
    });

    return Array.from(uniqueSellers).map((seller) => JSON.parse(seller));
  }, [orders]);

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
        icon: ShoppingCart,
      },
      completed: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle,
      },
      cancelled: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: XCircle,
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

  const getPaymentMethodBadge = (method) => {
    const methodConfig = {
      cash: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        text: t("cash"),
      },
      card: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        text: t("card"),
      },
      online: {
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        text: t("online"),
      },
    };

    const config = methodConfig[method] || methodConfig.cash;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const columns = [
    {
      header: t("orderId"),
      accessor: "id",
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {item.id}
        </span>
      ),
    },
    {
      header: t("customer"),
      accessor: "customerName",
      render: (item) => {
        const customerId = item.customer;

        return (
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {customersLoading ? "..." : getCustomerName(customerId)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {customersLoading ? "..." : getCustomerPhone(customerId) || "N/A"}
            </p>
          </div>
        );
      },
    },
    {
      header: t("seller"),
      accessor: "sellerName",
      render: (item) => {
        const sellerId = item.sellerId;
        return (
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {sellersLoading ? "..." : getSellerName(sellerId)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {sellersLoading ? "..." : getSellerEmail(sellerId) || "N/A"}
            </p>
          </div>
        );
      },
    },
    {
      header: t("items"),
      accessor: "items",
      render: (item) => (
        <div className="max-w-xs">
          {Array.isArray(item.items) ? (
            item.items.map((orderItem, index) => (
              <div key={index} className="text-sm">
                <span className="text-gray-900 dark:text-white">
                  {orderItem.quantity || 1}x{" "}
                  {productsLoading
                    ? "..."
                    : orderItem.product_id
                    ? (() => {
                        const names = getProductNameBothLanguages(
                          orderItem.product_id
                        );
                        return isRTL ? names.arabic : names.english;
                      })()
                    : orderItem.name || orderItem.product?.name || "Item"}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  $
                  {productsLoading
                    ? "..."
                    : (orderItem.product_id
                        ? getProductPrice(orderItem.product_id)
                        : orderItem.price || orderItem.product?.price || 0
                      ).toFixed(2)}
                </span>
              </div>
            ))
          ) : Array.isArray(item.products) ? (
            item.products.map((product, index) => (
              <div key={index} className="text-sm">
                <span className="text-gray-900 dark:text-white">
                  {product.quantity || 1}x{" "}
                  {productsLoading
                    ? "..."
                    : product.id
                    ? (() => {
                        const names = getProductNameBothLanguages(product.id);
                        return isRTL ? names.arabic : names.english;
                      })()
                    : product.name || product.nameEn || "Item"}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  $
                  {productsLoading
                    ? "..."
                    : (product.id
                        ? getProductPrice(product.id)
                        : product.price || 0
                      ).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm">
              <span className="text-gray-900 dark:text-white">
                {typeof item.items === "number" ? item.items : 0} items
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: t("total"),
      accessor: "totalAmount",
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">
          ${(item.total_amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (item) => getStatusBadge(item.status || "pending"),
    },
    {
      header: t("payment"),
      accessor: "paymentMethod",
      render: (item) => getPaymentMethodBadge(item.paymentMethod || "cash"),
    },
    {
      header: t("date"),
      accessor: "orderDate",
      render: (item) => {
        const orderDate =
          item.createdAt ||
          item.orderDate ||
          item.date ||
          new Date().toISOString();
        return (
          <div>
            <p className="text-sm text-gray-900 dark:text-white">
              {new Date(orderDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(orderDate).toLocaleTimeString()}
            </p>
          </div>
        );
      },
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewOrder(item)}
            className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title={t("view")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOrder(item)}
            className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            title={t("edit")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteOrder(item)}
            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status || "pending",
      notes: order.notes || "",
      deliveryDate: order.deliveryDate ? order.deliveryDate.split("T")[0] : "",
    });
    setEditModal(true);
  };

  const handleDeleteOrder = (order) => {
    setSelectedOrder(order);
    setDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder) return;

    try {
      const updates = {
        status: editForm.status,
        notes: editForm.notes,
        deliveryDate: editForm.deliveryDate
          ? `${editForm.deliveryDate}T${
              (selectedOrder.deliveryDate || new Date().toISOString()).split(
                "T"
              )[1]
            }`
          : selectedOrder.deliveryDate,
      };

      await dispatch(updateOrder({ id: selectedOrder.id, updates }));
      setEditModal(false);
      setSelectedOrder(null);
      setEditForm({});
      toast.success(t("orderUpdated"));
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(t("errorUpdatingOrder"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;

    try {
      await dispatch(deleteOrder(selectedOrder.id));
      setDeleteModal(false);
      setSelectedOrder(null);
      toast.success(t("orderDeleted"));
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(t("errorDeletingOrder"));
    }
  };

  const handleExportOrders = () => {
    console.log("Export orders");
    // Implement export functionality
    toast.success(t("ordersExported"));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSellerFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // Get statistics
  const getStats = () => {
    if (!Array.isArray(orders)) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: "0.00",
      };
    }

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === "completed"
    ).length;
    const totalRevenue = orders.reduce((sum, order) => {
      const amount =
        order.total_amount || order.totalAmount || order.total || 0;
      return sum + (typeof amount === "string" ? parseFloat(amount) : amount);
    }, 0);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue.toFixed(2),
    };
  };

  const stats = getStats();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("ordersManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageAllOrders")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportOrders}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t("export")}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("totalOrders")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalOrders}
              </p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("pendingOrders")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pendingOrders}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("completedOrders")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completedOrders}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("totalRevenue")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.totalRevenue}
              </p>
            </div>
            <User className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters - Always Visible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("filters")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("search")}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("searchOrders")}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("status")}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">{t("allStatuses")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="processing">{t("processing")}</option>
                <option value="completed">{t("completed")}</option>
                <option value="cancelled">{t("cancelled")}</option>
              </select>
            </div>

            {/* Seller Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("seller")}
              </label>
              <select
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">{t("allSellers")}</option>
                {sellers.map((seller, index) => (
                  <option key={index} value={seller.email}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("dateRange")}
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t("clearFilters")}
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("showing")} {filteredOrders.length} {t("of")} {orders.length}{" "}
          {t("orders")}
        </p>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sellers.length} {t("activeSellers")}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <DataTable
          data={filteredOrders}
          columns={columns}
          loading={loading}
          searchable={false}
        />
      </div>

      {/* View Modal */}
      {viewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("orderDetails")} - {selectedOrder.id}
              </h2>
              <button
                onClick={() => setViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("customerInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("name")}:</strong>{" "}
                    {customersLoading
                      ? "..."
                      : getCustomerName(selectedOrder.customer)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("phone")}:</strong>{" "}
                    {customersLoading
                      ? "..."
                      : getCustomerPhone(selectedOrder.customer) || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("address")}:</strong>{" "}
                    {customersLoading
                      ? "..."
                      : getCustomerAddress(selectedOrder.customer) || "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("sellerInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("name")}:</strong>{" "}
                    {sellersLoading
                      ? "..."
                      : getSellerName(selectedOrder.sellerId)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("email")}:</strong>{" "}
                    {sellersLoading
                      ? "..."
                      : getSellerEmail(selectedOrder.sellerId) || "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("orderInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("status")}:</strong>{" "}
                    {getStatusBadge(selectedOrder.status || "pending")}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("paymentMethod")}:</strong>{" "}
                    {getPaymentMethodBadge(
                      selectedOrder.paymentMethod || "cash"
                    )}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("total")}:</strong> $
                    {(selectedOrder.total_amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t("items")}
                </h3>
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
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="text-sm text-gray-900 dark:text-white">
                        {item.quantity || 1}x{" "}
                        {productsLoading
                          ? "..."
                          : item.product_id
                          ? (() => {
                              const names = getProductNameBothLanguages(
                                item.product_id
                              );
                              return (
                                <span>
                                  {isRTL ? (
                                    <>
                                      {names.arabic}
                                      {names.english !== names.arabic && (
                                        <span className="text-xs text-gray-500 ml-1">
                                          ({names.english})
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {names.english}
                                      {names.english !== names.arabic && (
                                        <span className="text-xs text-gray-500 ml-1">
                                          ({names.arabic})
                                        </span>
                                      )}
                                    </>
                                  )}
                                </span>
                              );
                            })()
                          : item.name || item.product?.name || "Item"}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        $
                        {(item.product_id
                          ? getProductPrice(item.product_id)
                          : item.price || item.product?.price || 0
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("notes")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("editOrder")} - {selectedOrder.id}
              </h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("status")}
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="pending">{t("pending")}</option>
                  <option value="processing">{t("processing")}</option>
                  <option value="completed">{t("completed")}</option>
                  <option value="cancelled">{t("cancelled")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("deliveryDate")}
                </label>
                <input
                  type="date"
                  value={editForm.deliveryDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, deliveryDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("notes")}
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t("saveChanges")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("deleteOrder")}
              </h2>
              <button
                onClick={() => setDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {t("confirmDeleteOrder")}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {t("orderId")}: {selectedOrder.id}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("deleteOrderWarning")}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
