import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { clearManagerError } from "../../../store/slices/managerSlice";
import { fetchOrders } from "../../../store/slices/ordersSlice";
import { fetchSuppliers } from "../../../store/slices/supplierSlice";
import { fetchCustomers } from "../../../store/slices/customerSlice";
import {
  customerService,
  tenantUsersService,
  supplierService,
  financialService,
  customerInvoiceService,
  returnService,
  apiService,
  API_ENDPOINTS,
} from "../../../services";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  LineChart,
  PieChart,
  Eye,
  Table,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Receipt,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";

import StatsCard from "../../../components/Common/StatsCard";
import { formatCurrencyEnglish, formatNumberEnglish } from "../../../utils";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ManagerReports = () => {
  const { t } = useTranslation();
  const { isRTL, theme } = useSelector((state) => state.language);
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector((state) => state.manager);

  // Get data from Redux store
  const { orders, loading: ordersLoading } = useSelector(
    (state) => state.orders
  );
  const { suppliers } = useSelector((state) => state.suppliers);
  const { customers } = useSelector((state) => state.customers);

  // Local state for API data
  const [customersLoading, setCustomersLoading] = useState(false);
  const [sellersData, setSellersData] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [realReportsData, setRealReportsData] = useState({});

  // Supplier-specific state
  const [selectedSupplierId, setSelectedSupplierId] = useState("all");
  const [supplierInvoices, setSupplierInvoices] = useState([]);
  const [supplierReturns, setSupplierReturns] = useState([]);
  const [supplierPurchases, setSupplierPurchases] = useState([]);
  const [supplierDataLoading, setSupplierDataLoading] = useState(false);

  // Customer-specific state
  const [selectedCustomerId, setSelectedCustomerId] = useState("all");
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [customerReturns, setCustomerReturns] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerDataLoading, setCustomerDataLoading] = useState(false);

  // Voucher-specific state
  const [selectedVoucherType, setSelectedVoucherType] = useState("all");
  const [vouchers, setVouchers] = useState([]);
  const [voucherDataLoading, setVoucherDataLoading] = useState(false);

  // Overview-specific state
  const [overviewData, setOverviewData] = useState({});
  const [overviewDataLoading, setOverviewDataLoading] = useState(false);

  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const [viewMode, setViewMode] = useState("charts");

  // Date filter state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);

  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Fetch customers from API (for potential future use)
  const fetchCustomersData = async () => {
    try {
      setCustomersLoading(true);
      await customerService.getCustomers();
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

  // Fetch supplier-specific data (invoices, returns, purchases)
  const fetchSupplierData = async (supplierId) => {
    try {
      setSupplierDataLoading(true);

      // Fetch supplier invoices
      const invoicesResponse = await financialService.getSupplierInvoices();
      const invoicesList = Array.isArray(invoicesResponse)
        ? invoicesResponse
        : invoicesResponse.data || [];

      // Fetch supplier returns
      const returnsResponse = await supplierService.getSupplierReturns();
      const returnsList = Array.isArray(returnsResponse)
        ? returnsResponse
        : returnsResponse.data || [];

      // Fetch supplier purchases
      const purchasesResponse = await supplierService.getPurchaseOrders();
      const purchasesList = Array.isArray(purchasesResponse)
        ? purchasesResponse
        : purchasesResponse.data || [];

      // Filter by supplier if specific supplier is selected
      if (supplierId && supplierId !== "all") {
        const numericSupplierId = parseInt(supplierId);

        setSupplierInvoices(
          invoicesList.filter(
            (inv) =>
              inv.supplier === numericSupplierId ||
              inv.supplier === supplierId ||
              inv.supplier_id === numericSupplierId ||
              inv.supplier_id === supplierId ||
              inv.supplierId === numericSupplierId ||
              inv.supplierId === supplierId
          )
        );
        setSupplierReturns(
          returnsList.filter(
            (ret) =>
              ret.supplier === numericSupplierId ||
              ret.supplier === supplierId ||
              ret.supplier_id === numericSupplierId ||
              ret.supplier_id === supplierId ||
              ret.supplierId === numericSupplierId ||
              ret.supplierId === supplierId
          )
        );
        setSupplierPurchases(
          purchasesList.filter(
            (pur) =>
              pur.supplier === numericSupplierId ||
              pur.supplier === supplierId ||
              pur.supplier_id === numericSupplierId ||
              pur.supplier_id === supplierId ||
              pur.supplierId === numericSupplierId ||
              pur.supplierId === supplierId
          )
        );
      } else {
        setSupplierInvoices(invoicesList);
        setSupplierReturns(returnsList);
        setSupplierPurchases(purchasesList);
      }
    } catch (error) {
      console.error("Error fetching supplier data:", error);
      toast.error(t("errorFetchingSupplierData"));
    } finally {
      setSupplierDataLoading(false);
    }
  };

  // Fetch overview data (sales, purchases, expenses)
  const fetchOverviewData = async () => {
    try {
      setOverviewDataLoading(true);

      // Fetch all necessary data in parallel
      const [
        ordersResponse,
        supplierInvoicesResponse,
        vouchersResponse,
        customerInvoicesResponse,
      ] = await Promise.all([
        apiService.get(API_ENDPOINTS.ORDERS.LIST),
        financialService.getSupplierInvoices(),
        financialService.getVouchers(),
        customerInvoiceService.getCustomerInvoices(),
      ]);

      // Process orders data (sales)
      const ordersList = Array.isArray(ordersResponse)
        ? ordersResponse
        : ordersResponse.data || [];
      const totalSales = ordersList.reduce((sum, order) => {
        const amount =
          order.total_amount || order.totalAmount || order.total || 0;
        const numericAmount =
          typeof amount === "string" ? parseFloat(amount) : amount;
        return sum + (isNaN(numericAmount) ? 0 : numericAmount);
      }, 0);

      // Process supplier invoices (purchases)
      const supplierInvoicesList = Array.isArray(supplierInvoicesResponse)
        ? supplierInvoicesResponse
        : supplierInvoicesResponse.data || [];
      const totalPurchases = supplierInvoicesList.reduce((sum, invoice) => {
        const amount =
          invoice.total || invoice.total_amount || invoice.amount || 0;
        const numericAmount =
          typeof amount === "string" ? parseFloat(amount) : amount;
        return sum + (isNaN(numericAmount) ? 0 : numericAmount);
      }, 0);

      // Process vouchers (expenses)
      const vouchersList = Array.isArray(vouchersResponse)
        ? vouchersResponse
        : vouchersResponse.data || [];
      const expenseVouchers = vouchersList.filter((v) => {
        const voucherType = v.type || v.voucher_type || v.voucherType;
        return voucherType === "expense" || voucherType === "Expense";
      });
      const totalExpenses = expenseVouchers.reduce((sum, voucher) => {
        const amount =
          voucher.amount || voucher.total_amount || voucher.total || 0;
        const numericAmount =
          typeof amount === "string" ? parseFloat(amount) : amount;
        return sum + (isNaN(numericAmount) ? 0 : numericAmount);
      }, 0);

      // Process customer invoices (additional sales data)
      const customerInvoicesList = Array.isArray(customerInvoicesResponse)
        ? customerInvoicesResponse
        : customerInvoicesResponse.data || [];
      const totalCustomerSales = customerInvoicesList.reduce((sum, invoice) => {
        const amount =
          invoice.total || invoice.total_amount || invoice.amount || 0;
        const numericAmount =
          typeof amount === "string" ? parseFloat(amount) : amount;
        return sum + (isNaN(numericAmount) ? 0 : numericAmount);
      }, 0);

      // Calculate net profit
      const totalRevenue = totalSales + totalCustomerSales;
      const netProfit = totalRevenue - totalPurchases - totalExpenses;

      setOverviewData({
        totalSales: totalRevenue,
        totalPurchases,
        totalExpenses,
        netProfit,
        totalOrders: ordersList.length,
        totalInvoices: supplierInvoicesList.length,
        totalVouchers: expenseVouchers.length,
        ordersList,
        supplierInvoicesList,
        expenseVouchers,
      });
    } catch (error) {
      console.error("Error fetching overview data:", error);
      toast.error(t("errorFetchingOverviewData"));
    } finally {
      setOverviewDataLoading(false);
    }
  };

  // Fetch voucher-specific data
  const fetchVoucherData = async (voucherType) => {
    try {
      setVoucherDataLoading(true);

      // Fetch all vouchers
      const vouchersResponse = await financialService.getVouchers();
      const vouchersList = Array.isArray(vouchersResponse)
        ? vouchersResponse
        : vouchersResponse.data || [];

      // Filter by voucher type if specific type is selected
      if (voucherType && voucherType !== "all") {
        setVouchers(
          vouchersList.filter((voucher) => {
            // Check multiple possible type fields
            const voucherTypeField =
              voucher.type || voucher.voucher_type || voucher.voucherType;

            // Map frontend types to backend types
            if (voucherType === "expense") {
              return (
                voucherTypeField === "expense" || voucherTypeField === "Expense"
              );
            } else if (voucherType === "payment") {
              return (
                voucherTypeField === "payment" ||
                voucherTypeField === "Payment" ||
                voucherTypeField === "supplier" ||
                voucherTypeField === "Supplier"
              );
            }

            return (
              voucherTypeField === voucherType ||
              voucherTypeField?.toLowerCase() === voucherType.toLowerCase()
            );
          })
        );
      } else {
        setVouchers(vouchersList);
      }
    } catch (error) {
      console.error("Error fetching voucher data:", error);
      toast.error(t("errorFetchingVoucherData"));
    } finally {
      setVoucherDataLoading(false);
    }
  };

  // Fetch customer-specific data (invoices, returns, orders)
  const fetchCustomerData = async (customerId) => {
    try {
      setCustomerDataLoading(true);

      // Fetch customer invoices
      let invoicesList = [];
      try {
        const invoicesResponse =
          await customerInvoiceService.getCustomerInvoices();

        invoicesList = Array.isArray(invoicesResponse)
          ? invoicesResponse
          : invoicesResponse.data || [];
      } catch (invoiceError) {
        console.error("Error fetching customer invoices:", invoiceError);
        console.error("Invoice error details:", {
          message: invoiceError.message,
          status: invoiceError.response?.status,
          data: invoiceError.response?.data,
        });

        // Try direct API call as fallback
        try {
          const directResponse = await apiService.get(
            API_ENDPOINTS.CUSTOMER_INVOICES.LIST
          );
          invoicesList = Array.isArray(directResponse)
            ? directResponse
            : directResponse.data || [];
        } catch (directError) {
          console.error("Direct API call also failed:", directError);
          invoicesList = [];
        }
      }

      // Fetch customer returns
      const returnsResponse = await returnService.getReturns();
      const returnsList = Array.isArray(returnsResponse)
        ? returnsResponse
        : returnsResponse.data || [];

      // Filter orders by customer if specific customer is selected
      let filteredOrders = orders;
      if (customerId && customerId !== "all") {
        const numericCustomerId = parseInt(customerId);
        filteredOrders = orders.filter(
          (order) =>
            order.customerId === numericCustomerId ||
            order.customerId === customerId ||
            order.customer_id === numericCustomerId ||
            order.customer_id === customerId ||
            order.customer === numericCustomerId ||
            order.customer === customerId
        );
      }

      // Filter by customer if specific customer is selected
      if (customerId && customerId !== "all") {
        const numericCustomerId = parseInt(customerId);

        // Find the customer name for filtering
        const selectedCustomer = customers.find(
          (c) => c.id === numericCustomerId || c.id === customerId
        );
        const customerName =
          selectedCustomer?.customer_name || selectedCustomer?.name;

        setCustomerInvoices(
          invoicesList.filter((inv) => {
            // Check multiple possible customer identification fields
            const matchesId =
              inv.customerId === numericCustomerId ||
              inv.customerId === customerId ||
              inv.customer_id === numericCustomerId ||
              inv.customer_id === customerId ||
              inv.customer === numericCustomerId ||
              inv.customer === customerId;

            // Check customer name match
            const matchesName =
              customerName &&
              (inv.customer_name === customerName ||
                inv.customerName === customerName ||
                inv.customer_name === customerId ||
                inv.customerName === customerId);

            const matches = matchesId || matchesName;

            return matches;
          })
        );
        setCustomerReturns(
          returnsList.filter((ret) => {
            // Check multiple possible customer identification fields
            const matchesId =
              ret.customerId === numericCustomerId ||
              ret.customerId === customerId ||
              ret.customer_id === numericCustomerId ||
              ret.customer_id === customerId ||
              ret.customer === numericCustomerId ||
              ret.customer === customerId;

            // Check customer name match
            const matchesName =
              customerName &&
              (ret.customer_name === customerName ||
                ret.customerName === customerName ||
                ret.customer_name === customerId ||
                ret.customerName === customerId);

            return matchesId || matchesName;
          })
        );
        setCustomerOrders(filteredOrders);
      } else {
        // Show all invoices when "all" is selected
        setCustomerInvoices(invoicesList);
        setCustomerReturns(returnsList);
        setCustomerOrders(filteredOrders);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
      toast.error(t("errorFetchingCustomerData"));
    } finally {
      setCustomerDataLoading(false);
    }
  };

  // Helper function to get seller name by ID
  const getSellerName = React.useCallback(
    (sellerId) => {
      if (!sellerId) return "Unknown Seller";

      let actualId = sellerId;
      if (typeof sellerId === "string" && sellerId.includes("#")) {
        const match = sellerId.match(/#(\d+)/);
        actualId = match ? parseInt(match[1]) : sellerId;
      }

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

  // Helper function to filter orders by date range
  const filterOrdersByDateRange = React.useCallback(
    (ordersList) => {
      if (!Array.isArray(ordersList) || ordersList.length === 0) {
        return ordersList;
      }

      let filteredOrders = ordersList;

      // Apply custom date range filter if enabled
      if (useCustomDateRange && (fromDate || toDate)) {
        filteredOrders = ordersList.filter((order) => {
          const orderDate = order.createdAt || order.date || order.orderDate;
          if (!orderDate) return false;

          const orderDateObj = new Date(orderDate);
          const fromDateObj = fromDate ? new Date(fromDate) : null;
          const toDateObj = toDate ? new Date(toDate) : null;

          // Check if order date is within the range
          if (fromDateObj && orderDateObj < fromDateObj) return false;
          if (toDateObj && orderDateObj > toDateObj) return false;

          return true;
        });
      } else if (dateRange !== "all") {
        // Apply predefined date range filter
        const now = new Date();
        let startDate = new Date();

        switch (dateRange) {
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "quarter":
            startDate.setMonth(now.getMonth() - 3);
            break;
          default:
            startDate = new Date(0); // All time
        }

        filteredOrders = ordersList.filter((order) => {
          const orderDate = order.createdAt || order.date || order.orderDate;
          if (!orderDate) return false;

          const orderDateObj = new Date(orderDate);
          return orderDateObj >= startDate && orderDateObj <= now;
        });
      }

      return filteredOrders;
    },
    [useCustomDateRange, fromDate, toDate, dateRange]
  );

  // Helper function to filter supplier data by date range
  const filterSupplierDataByDateRange = React.useCallback(
    (dataList) => {
      if (!Array.isArray(dataList) || dataList.length === 0) {
        return dataList;
      }

      let filteredData = dataList;

      // Apply custom date range filter if enabled
      if (useCustomDateRange && (fromDate || toDate)) {
        filteredData = dataList.filter((item) => {
          const itemDate =
            item.created_at ||
            item.date ||
            item.invoice_date ||
            item.purchase_date ||
            item.issue_date ||
            item.expected_delivery;
          if (!itemDate) return true; // Include items without dates

          const itemDateObj = new Date(itemDate);
          const fromDateObj = fromDate ? new Date(fromDate) : null;
          const toDateObj = toDate ? new Date(toDate) : null;

          if (fromDateObj && itemDateObj < fromDateObj) return false;
          if (toDateObj && itemDateObj > toDateObj) return false;

          return true;
        });
      } else if (dateRange !== "all") {
        // Apply predefined date range filter
        const now = new Date();
        let startDate = new Date();

        switch (dateRange) {
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "quarter":
            startDate.setMonth(now.getMonth() - 3);
            break;
          default:
            startDate = new Date(0); // All time
        }

        filteredData = dataList.filter((item) => {
          const itemDate =
            item.created_at ||
            item.date ||
            item.invoice_date ||
            item.purchase_date ||
            item.issue_date ||
            item.expected_delivery;
          if (!itemDate) return true; // Include items without dates

          const itemDateObj = new Date(itemDate);
          return itemDateObj >= startDate && itemDateObj <= now;
        });
      }

      return filteredData;
    },
    [useCustomDateRange, fromDate, toDate, dateRange]
  );

  // Calculate real reports data from API data
  const calculateRealReportsData = React.useCallback(() => {
    if (!Array.isArray(orders) || orders.length === 0) {
      return {};
    }

    // Filter orders by date range
    const filteredOrders = filterOrdersByDateRange(orders);

    // Calculate total orders
    const totalOrders = filteredOrders.length;

    // Calculate active sellers (unique seller IDs)
    const activeSellers = new Set(
      filteredOrders.map((order) => order.sellerId).filter(Boolean)
    ).size;

    // Calculate order status counts
    const orderStatusCounts = filteredOrders.reduce((acc, order) => {
      const status = order.status || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Calculate top sellers performance
    const sellerStats = {};
    filteredOrders.forEach((order) => {
      const sellerId = order.sellerId;
      if (!sellerId) return;

      if (!sellerStats[sellerId]) {
        sellerStats[sellerId] = {
          id: sellerId,
          name: getSellerName(sellerId),
          sales: 0,
          orders: 0,
        };
      }

      const amount =
        order.total_amount || order.totalAmount || order.total || 0;
      const numericAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      const validAmount = isNaN(numericAmount) ? 0 : numericAmount;
      sellerStats[sellerId].sales += validAmount;
      sellerStats[sellerId].orders += 1;
    });

    const topSellers = Object.values(sellerStats)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((seller) => ({
        ...seller,
        growth: Math.random() * 20 - 5, // Mock growth for now
        rating: 4.0 + Math.random() * 1.0,
      }));

    // Calculate time-based data based on date range
    const timeData = [];
    let daysToShow = 7; // Default to 7 days

    // Adjust days to show based on date range
    if (dateRange === "week") {
      daysToShow = 7;
    } else if (dateRange === "month") {
      daysToShow = 30;
    } else if (dateRange === "quarter") {
      daysToShow = 90;
    } else if (useCustomDateRange && fromDate && toDate) {
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      daysToShow =
        Math.ceil((toDateObj - fromDateObj) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Limit to reasonable number of data points
    const maxDays = 30;
    const step = Math.max(1, Math.floor(daysToShow / maxDays));

    for (let i = daysToShow - 1; i >= 0; i -= step) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayOrders = filteredOrders.filter((order) => {
        const orderDate = order.createdAt || order.date || order.orderDate;
        return orderDate && orderDate.startsWith(dateStr);
      });

      const dayRevenue = dayOrders.reduce((sum, order) => {
        const amount =
          order.total_amount || order.totalAmount || order.total || 0;
        const numericAmount =
          typeof amount === "string" ? parseFloat(amount) : amount;
        const validAmount = isNaN(numericAmount) ? 0 : numericAmount;
        return sum + validAmount;
      }, 0);

      timeData.push({
        month: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: dayRevenue,
        orders: dayOrders.length,
        completed: dayOrders.filter((o) => o.status === "completed").length,
        pending: dayOrders.filter((o) => o.status === "pending").length,
        ready: dayOrders.filter((o) => o.status === "ready").length,
        active: activeSellers,
        new: Math.floor(Math.random() * 3), // Mock new sellers
        avgTime: Math.floor(Math.random() * 30) + 15, // Mock avg time
      });
    }

    // Calculate supplier reports data
    const filteredInvoices = filterSupplierDataByDateRange(supplierInvoices);
    const filteredReturns = filterSupplierDataByDateRange(supplierReturns);
    const filteredPurchases = filterSupplierDataByDateRange(supplierPurchases);

    const totalInvoices = filteredInvoices.length;
    const totalReturns = filteredReturns.length;
    const totalPurchases = filteredPurchases.length;

    const totalInvoiceAmount = filteredInvoices.reduce((sum, inv) => {
      const amount = inv.total || inv.total_amount || inv.amount || 0;
      const numericAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      return sum + (isNaN(numericAmount) ? 0 : numericAmount);
    }, 0);

    const totalReturnAmount = filteredReturns.reduce((sum, ret) => {
      // Returns don't have a total, calculate from quantity
      const quantity = ret.quantity || 0;
      return sum + quantity;
    }, 0);

    const totalPurchaseAmount = filteredPurchases.reduce((sum, pur) => {
      const amount = pur.total || pur.total_amount || pur.amount || 0;
      const numericAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      return sum + (isNaN(numericAmount) ? 0 : numericAmount);
    }, 0);

    // Calculate customer reports data
    const filteredCustomerInvoices =
      filterSupplierDataByDateRange(customerInvoices);
    const filteredCustomerReturns =
      filterSupplierDataByDateRange(customerReturns);
    const filteredCustomerOrders = filterOrdersByDateRange(customerOrders);

    const totalCustomerInvoices = filteredCustomerInvoices.length;
    const totalCustomerReturns = filteredCustomerReturns.length;
    const totalCustomerOrders = filteredCustomerOrders.length;

    const totalCustomerInvoiceAmount = filteredCustomerInvoices.reduce(
      (sum, inv) => {
        const amount = inv.total || inv.total_amount || inv.amount || 0;
        const numericAmount =
          typeof amount === "string" ? parseFloat(amount) : amount;
        return sum + (isNaN(numericAmount) ? 0 : numericAmount);
      },
      0
    );

    const totalCustomerReturnAmount = filteredCustomerReturns.reduce(
      (sum, ret) => {
        const amount = ret.refundAmount || ret.refund_amount || 0;
        const numericAmount =
          typeof amount === "string" ? parseFloat(amount) : amount;
        return sum + (isNaN(numericAmount) ? 0 : numericAmount);
      },
      0
    );

    const totalCustomerOrderAmount = filteredCustomerOrders.reduce(
      (sum, order) => {
        const amount =
          order.total_amount || order.totalAmount || order.total || 0;
        const numericAmount =
          typeof amount === "string" ? parseFloat(amount) : amount;
        return sum + (isNaN(numericAmount) ? 0 : numericAmount);
      },
      0
    );

    // Calculate voucher reports data
    const filteredVouchers = filterSupplierDataByDateRange(vouchers);
    const totalVouchers = filteredVouchers.length;

    const expenseVouchers = filteredVouchers.filter((v) => {
      const voucherType = v.type || v.voucher_type || v.voucherType;
      return voucherType === "expense" || voucherType === "Expense";
    });
    const paymentVouchers = filteredVouchers.filter((v) => {
      const voucherType = v.type || v.voucher_type || v.voucherType;
      return (
        voucherType === "payment" ||
        voucherType === "Payment" ||
        voucherType === "supplier" ||
        voucherType === "Supplier"
      );
    });

    const totalExpenseVouchers = expenseVouchers.length;
    const totalPaymentVouchers = paymentVouchers.length;

    const totalExpenseAmount = expenseVouchers.reduce((sum, voucher) => {
      const amount =
        voucher.amount || voucher.total_amount || voucher.total || 0;
      const numericAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      return sum + (isNaN(numericAmount) ? 0 : numericAmount);
    }, 0);

    const totalPaymentAmount = paymentVouchers.reduce((sum, voucher) => {
      const amount =
        voucher.amount || voucher.total_amount || voucher.total || 0;
      const numericAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      return sum + (isNaN(numericAmount) ? 0 : numericAmount);
    }, 0);

    // Calculate time-based supplier data
    const supplierTimeData = [];
    for (let i = daysToShow - 1; i >= 0; i -= step) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayInvoices = filteredInvoices.filter((item) => {
        const itemDate =
          item.created_at || item.date || item.invoice_date || item.issue_date;
        return itemDate && itemDate.startsWith(dateStr);
      });

      const dayReturns = filteredReturns.filter((item) => {
        const itemDate = item.created_at || item.date;
        return itemDate && itemDate.startsWith(dateStr);
      });

      const dayPurchases = filteredPurchases.filter((item) => {
        const itemDate =
          item.created_at ||
          item.date ||
          item.purchase_date ||
          item.expected_delivery;
        return itemDate && itemDate.startsWith(dateStr);
      });

      supplierTimeData.push({
        month: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        invoices: dayInvoices.length,
        returns: dayReturns.length,
        purchases: dayPurchases.length,
        invoiceAmount: dayInvoices.reduce((sum, inv) => {
          const amount = inv.total || inv.total_amount || inv.amount || 0;
          const numericAmount =
            typeof amount === "string" ? parseFloat(amount) : amount;
          return sum + (isNaN(numericAmount) ? 0 : numericAmount);
        }, 0),
      });
    }

    // Calculate time-based customer data
    const customerTimeData = [];
    for (let i = daysToShow - 1; i >= 0; i -= step) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayCustomerInvoices = filteredCustomerInvoices.filter((item) => {
        const itemDate =
          item.created_at ||
          item.createdAt ||
          item.date ||
          item.invoice_date ||
          item.issue_date ||
          item.issueDate;
        return itemDate && itemDate.startsWith(dateStr);
      });

      const dayCustomerReturns = filteredCustomerReturns.filter((item) => {
        const itemDate =
          item.created_at || item.createdAt || item.date || item.returnDate;
        return itemDate && itemDate.startsWith(dateStr);
      });

      const dayCustomerOrders = filteredCustomerOrders.filter((item) => {
        const itemDate =
          item.createdAt || item.created_at || item.date || item.orderDate;
        return itemDate && itemDate.startsWith(dateStr);
      });

      customerTimeData.push({
        month: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        invoices: dayCustomerInvoices.length,
        returns: dayCustomerReturns.length,
        orders: dayCustomerOrders.length,
        invoiceAmount: dayCustomerInvoices.reduce((sum, inv) => {
          const amount = inv.total || inv.total_amount || inv.amount || 0;
          const numericAmount =
            typeof amount === "string" ? parseFloat(amount) : amount;
          return sum + (isNaN(numericAmount) ? 0 : numericAmount);
        }, 0),
        orderAmount: dayCustomerOrders.reduce((sum, order) => {
          const amount =
            order.total_amount || order.totalAmount || order.total || 0;
          const numericAmount =
            typeof amount === "string" ? parseFloat(amount) : amount;
          return sum + (isNaN(numericAmount) ? 0 : numericAmount);
        }, 0),
      });
    }

    // Calculate time-based voucher data
    const voucherTimeData = [];
    for (let i = daysToShow - 1; i >= 0; i -= step) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayExpenseVouchers = expenseVouchers.filter((voucher) => {
        const itemDate =
          voucher.created_at ||
          voucher.createdAt ||
          voucher.date ||
          voucher.voucher_date ||
          voucher.issue_date;
        return itemDate && itemDate.startsWith(dateStr);
      });

      const dayPaymentVouchers = paymentVouchers.filter((voucher) => {
        const itemDate =
          voucher.created_at ||
          voucher.createdAt ||
          voucher.date ||
          voucher.voucher_date ||
          voucher.issue_date;
        return itemDate && itemDate.startsWith(dateStr);
      });

      voucherTimeData.push({
        month: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        expenses: dayExpenseVouchers.length,
        payments: dayPaymentVouchers.length,
        expenseAmount: dayExpenseVouchers.reduce((sum, voucher) => {
          const amount =
            voucher.amount || voucher.total_amount || voucher.total || 0;
          const numericAmount =
            typeof amount === "string" ? parseFloat(amount) : amount;
          return sum + (isNaN(numericAmount) ? 0 : numericAmount);
        }, 0),
        paymentAmount: dayPaymentVouchers.reduce((sum, voucher) => {
          const amount =
            voucher.amount || voucher.total_amount || voucher.total || 0;
          const numericAmount =
            typeof amount === "string" ? parseFloat(amount) : amount;
          return sum + (isNaN(numericAmount) ? 0 : numericAmount);
        }, 0),
      });
    }

    return {
      orders: {
        totalOrders,
        completed: orderStatusCounts.completed || 0,
        pending: orderStatusCounts.pending || 0,
        ready: orderStatusCounts.ready || 0,
        cancelled: orderStatusCounts.cancelled || 0,
        timeData,
        orderStatus: Object.entries(orderStatusCounts).map(
          ([status, count]) => ({
            status,
            count,
            percentage:
              totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
          })
        ),
      },
      sellers: {
        totalSellers: sellersData.filter((seller) => {
          const role =
            seller.role || seller.user_role || seller.role_type || "";
          return role.toLowerCase().includes("seller");
        }).length,
        activeSellers,
        newSellers: Math.floor(Math.random() * 5), // Mock new sellers
        avgPerformance: Math.floor(Math.random() * 20) + 80, // Mock performance
        timeData,
        sellerPerformance: topSellers,
      },
      suppliers: {
        totalInvoices,
        totalReturns,
        totalPurchases,
        totalInvoiceAmount,
        totalReturnAmount,
        totalPurchaseAmount,
        timeData: supplierTimeData,
        invoicesList: filteredInvoices,
        returnsList: filteredReturns,
        purchasesList: filteredPurchases,
      },
      customers: {
        totalInvoices: totalCustomerInvoices,
        totalReturns: totalCustomerReturns,
        totalOrders: totalCustomerOrders,
        totalInvoiceAmount: totalCustomerInvoiceAmount,
        totalReturnAmount: totalCustomerReturnAmount,
        totalOrderAmount: totalCustomerOrderAmount,
        timeData: customerTimeData,
        invoicesList: filteredCustomerInvoices,
        returnsList: filteredCustomerReturns,
        ordersList: filteredCustomerOrders,
      },
      vouchers: {
        totalVouchers,
        totalExpenseVouchers,
        totalPaymentVouchers,
        totalExpenseAmount,
        totalPaymentAmount,
        timeData: voucherTimeData,
        vouchersList: filteredVouchers,
        expenseVouchersList: expenseVouchers,
        paymentVouchersList: paymentVouchers,
      },
    };
  }, [
    orders,
    sellersData,
    getSellerName,
    filterOrdersByDateRange,
    supplierInvoices,
    supplierReturns,
    supplierPurchases,
    filterSupplierDataByDateRange,
    customerInvoices,
    customerReturns,
    customerOrders,
    vouchers,
    dateRange,
    useCustomDateRange,
    fromDate,
    toDate,
  ]);

  // Update real reports data when orders or sellers data changes
  useEffect(() => {
    const realData = calculateRealReportsData();
    setRealReportsData(realData);
  }, [calculateRealReportsData]);

  // No need for fetchFinancialReports since we're using real data

  // Initialize date inputs with default values
  useEffect(() => {
    if (useCustomDateRange && !fromDate && !toDate) {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);

      setFromDate(lastMonth.toISOString().split("T")[0]);
      setToDate(today.toISOString().split("T")[0]);
    }
  }, [useCustomDateRange, fromDate, toDate]);

  // Load all data on component mount
  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchSuppliers());
    dispatch(fetchCustomers());
    fetchCustomersData();
    fetchSellersData();
  }, [dispatch]);

  // Fetch supplier data when supplier is selected or report type changes
  useEffect(() => {
    if (selectedReport === "suppliers") {
      fetchSupplierData(selectedSupplierId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport, selectedSupplierId]);

  // Fetch customer data when customer is selected or report type changes
  useEffect(() => {
    if (selectedReport === "customers") {
      fetchCustomerData(selectedCustomerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport, selectedCustomerId]);

  // Fetch voucher data when voucher type is selected or report type changes
  useEffect(() => {
    if (selectedReport === "vouchers") {
      fetchVoucherData(selectedVoucherType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport, selectedVoucherType]);

  // Fetch overview data when overview report is selected
  useEffect(() => {
    if (selectedReport === "overview") {
      fetchOverviewData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearManagerError());
    };
  }, [dispatch]);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      console.error("Error:", error);
      toast.error(error);
    }
  }, [error]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest(".export-dropdown")) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportDropdown]);

  // Get current report data from real API data or fallback to Redux store
  const currentData = realReportsData[selectedReport] ||
    reports[selectedReport] || {
      // Default fallback data structure
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      activeSellers: 0,
      growth: 0,
      timeData: [],
      topSellers: [],
      totalDeliveries: 0,
      completedDeliveries: 0,
      avgDeliveryTime: 0,
      satisfaction: 0,
      totalSellers: 0,
      completed: 0,
      pending: 0,
      ready: 0,
      cancelled: 0,
      orderStatus: [],
      sellerPerformance: [],
      kitchenPerformance: [],
      deliveryPerformance: [],
    };

  // Chart configuration
  const isDark = theme === "dark";
  const chartColors = {
    primary: isDark ? "#3b82f6" : "#2563eb",
    secondary: isDark ? "#10b981" : "#059669",
    tertiary: isDark ? "#f59e0b" : "#d97706",
    quaternary: isDark ? "#ef4444" : "#dc2626",
    quinary: isDark ? "#8b5cf6" : "#7c3aed",
    text: isDark ? "#f1f5f9" : "#0f172a",
    grid: isDark ? "#374151" : "#e5e7eb",
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: chartColors.text,
          font: {
            family: isRTL
              ? "Arial, sans-serif"
              : "Inter, system-ui, sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        titleColor: chartColors.text,
        bodyColor: chartColors.text,
        borderColor: chartColors.grid,
        borderWidth: 1,
        rtl: isRTL,
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartColors.text,
          font: {
            family: isRTL
              ? "Arial, sans-serif"
              : "Inter, system-ui, sans-serif",
          },
        },
        grid: {
          color: chartColors.grid,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: chartColors.text,
          font: {
            family: isRTL
              ? "Arial, sans-serif"
              : "Inter, system-ui, sans-serif",
          },
          precision: 0,
        },
        grid: {
          color: chartColors.grid,
        },
      },
    },
  };

  const getStats = () => {
    switch (selectedReport) {
      case "overview":
        return [
          {
            title: t("totalSales"),
            value: formatCurrencyEnglish(
              overviewData.totalSales || 0,
              t("currency")
            ),
            icon: DollarSign,
            color: "green",
            change: 12.5,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("totalPurchases"),
            value: formatCurrencyEnglish(
              overviewData.totalPurchases || 0,
              t("currency")
            ),
            icon: ShoppingCart,
            color: "blue",
            change: 8.3,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("totalExpenses"),
            value: formatCurrencyEnglish(
              overviewData.totalExpenses || 0,
              t("currency")
            ),
            icon: FileText,
            color: "red",
            change: -5.2,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("netProfit"),
            value: formatCurrencyEnglish(
              overviewData.netProfit || 0,
              t("currency")
            ),
            icon: TrendingUp,
            color: overviewData.netProfit >= 0 ? "green" : "red",
            change: 15.7,
            changeText: t("fromLastMonth"),
          },
        ];
      case "orders":
        return [
          {
            title: t("totalOrders"),
            value: formatNumberEnglish(currentData.totalOrders),
            icon: ShoppingCart,
            color: "blue",
            change: 12.5,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("completed"),
            value: formatNumberEnglish(currentData.completed),
            icon: Package,
            color: "green",
            change: 8.3,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("pending"),
            value: formatNumberEnglish(currentData.pending),
            icon: Calendar,
            color: "yellow",
            change: -5.2,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("ready"),
            value: formatNumberEnglish(currentData.ready),
            icon: TrendingUp,
            color: "purple",
            change: 15.7,
            changeText: t("fromLastMonth"),
          },
        ];
      case "sellers":
        return [
          {
            title: t("totalSellers"),
            value: formatNumberEnglish(currentData.totalSellers),
            icon: Users,
            color: "blue",
            change: 15.6,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("activeSellers"),
            value: formatNumberEnglish(currentData.activeSellers),
            icon: TrendingUp,
            color: "green",
            change: 8.3,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("newSellers"),
            value: formatNumberEnglish(currentData.newSellers),
            icon: Users,
            color: "orange",
            change: 25.0,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("avgPerformance"),
            value: formatNumberEnglish(currentData.avgPerformance) + "%",
            icon: BarChart3,
            color: "purple",
            change: 2.1,
            changeText: t("fromLastMonth"),
          },
        ];
      case "suppliers":
        return [
          {
            title: t("totalInvoices"),
            value: formatNumberEnglish(currentData.totalInvoices || 0),
            icon: FileText,
            color: "blue",
            change: 10.2,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("totalPurchases"),
            value: formatNumberEnglish(currentData.totalPurchases || 0),
            icon: ShoppingCart,
            color: "green",
            change: 5.8,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("totalReturns"),
            value: formatNumberEnglish(currentData.totalReturns || 0),
            icon: Package,
            color: "red",
            change: -3.2,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("totalAmount"),
            value: formatCurrencyEnglish(
              currentData.totalInvoiceAmount || 0,
              t("currency")
            ),
            icon: DollarSign,
            color: "purple",
            change: 8.5,
            changeText: t("fromLastMonth"),
          },
        ];
      case "customers":
        return [
          {
            title: t("totalInvoices"),
            value: formatNumberEnglish(currentData.totalInvoices || 0),
            icon: FileText,
            color: "blue",
            change: 12.3,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("totalOrders"),
            value: formatNumberEnglish(currentData.totalOrders || 0),
            icon: ShoppingCart,
            color: "green",
            change: 7.2,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("totalReturns"),
            value: formatNumberEnglish(currentData.totalReturns || 0),
            icon: Package,
            color: "red",
            change: -2.1,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("totalAmount"),
            value: formatCurrencyEnglish(
              currentData.totalOrderAmount || 0,
              t("currency")
            ),
            icon: DollarSign,
            color: "purple",
            change: 9.8,
            changeText: t("fromLastMonth"),
          },
        ];
      case "vouchers":
        return [
          {
            title: t("totalVouchers"),
            value: formatNumberEnglish(currentData.totalVouchers || 0),
            icon: Receipt,
            color: "blue",
            change: 8.5,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("expenseVouchers"),
            value: formatNumberEnglish(currentData.totalExpenseVouchers || 0),
            icon: FileText,
            color: "red",
            change: 5.2,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("paymentVouchers"),
            value: formatNumberEnglish(currentData.totalPaymentVouchers || 0),
            icon: CreditCard,
            color: "green",
            change: 12.1,
            changeText: t("fromLastMonth"),
          },
          {
            title: t("totalAmount"),
            value: formatCurrencyEnglish(
              (currentData.totalExpenseAmount || 0) +
                (currentData.totalPaymentAmount || 0),
              t("currency")
            ),
            icon: DollarSign,
            color: "purple",
            change: 7.3,
            changeText: t("fromLastMonth"),
          },
        ];
      default:
        return [];
    }
  };

  const getChartData = () => {
    // Use real time data from currentData for all reports
    const timeData = currentData.timeData || [];
    const labels =
      timeData.length > 0 ? timeData.map((item) => item.month) : [];

    // Helper function to extract real data from timeData
    const extractTimeData = (field) => {
      return timeData.map((item) => item[field] || 0);
    };

    switch (selectedReport) {
      case "overview":
        return {
          overview: {
            labels: [t("sales"), t("purchases"), t("expenses")],
            datasets: [
              {
                label: t("amount"),
                data: [
                  overviewData.totalSales || 0,
                  overviewData.totalPurchases || 0,
                  overviewData.totalExpenses || 0,
                ],
                backgroundColor: [
                  chartColors.secondary,
                  chartColors.primary,
                  chartColors.quaternary,
                ],
                borderColor: [
                  chartColors.secondary,
                  chartColors.primary,
                  chartColors.quaternary,
                ],
                borderWidth: 1,
              },
            ],
          },
          profitLoss: {
            labels: [t("revenue"), t("costs"), t("profit")],
            datasets: [
              {
                label: t("amount"),
                data: [
                  overviewData.totalSales || 0,
                  (overviewData.totalPurchases || 0) +
                    (overviewData.totalExpenses || 0),
                  overviewData.netProfit || 0,
                ],
                backgroundColor: [
                  chartColors.secondary,
                  chartColors.quaternary,
                  (overviewData.netProfit || 0) >= 0
                    ? chartColors.secondary
                    : chartColors.quaternary,
                ],
                borderColor: [
                  chartColors.secondary,
                  chartColors.quaternary,
                  (overviewData.netProfit || 0) >= 0
                    ? chartColors.secondary
                    : chartColors.quaternary,
                ],
                borderWidth: 1,
              },
            ],
          },
        };
      case "orders":
        return {
          status: {
            labels,
            datasets: [
              {
                label: t("completed"),
                data: extractTimeData("completed"),
                backgroundColor: chartColors.secondary,
                borderColor: chartColors.secondary,
                borderWidth: 2,
              },
              {
                label: t("pending"),
                data: extractTimeData("pending"),
                backgroundColor: chartColors.tertiary,
                borderColor: chartColors.tertiary,
                borderWidth: 2,
              },
              {
                label: t("ready"),
                data: extractTimeData("ready"),
                backgroundColor: chartColors.primary,
                borderColor: chartColors.primary,
                borderWidth: 2,
              },
            ],
          },
        };
      case "sellers":
        return {
          performance: {
            labels,
            datasets: [
              {
                label: t("activeSellers"),
                data: extractTimeData("active"),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primary + "20",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
              },
              {
                label: t("newSellers"),
                data: extractTimeData("new"),
                backgroundColor: chartColors.secondary,
                borderColor: chartColors.secondary,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: false,
                tension: 0.4,
              },
            ],
          },
        };
      case "suppliers":
        return {
          transactions: {
            labels,
            datasets: [
              {
                label: t("invoices"),
                data: extractTimeData("invoices"),
                backgroundColor: chartColors.primary,
                borderColor: chartColors.primary,
                borderWidth: 2,
              },
              {
                label: t("purchases"),
                data: extractTimeData("purchases"),
                backgroundColor: chartColors.secondary,
                borderColor: chartColors.secondary,
                borderWidth: 2,
              },
              {
                label: t("returns"),
                data: extractTimeData("returns"),
                backgroundColor: chartColors.quaternary,
                borderColor: chartColors.quaternary,
                borderWidth: 2,
              },
            ],
          },
          amounts: {
            labels,
            datasets: [
              {
                label: t("invoiceAmount"),
                data: extractTimeData("invoiceAmount"),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primary + "20",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
              },
            ],
          },
        };
      case "customers":
        return {
          transactions: {
            labels,
            datasets: [
              {
                label: t("invoices"),
                data: extractTimeData("invoices"),
                backgroundColor: chartColors.primary,
                borderColor: chartColors.primary,
                borderWidth: 2,
              },
              {
                label: t("orders"),
                data: extractTimeData("orders"),
                backgroundColor: chartColors.secondary,
                borderColor: chartColors.secondary,
                borderWidth: 2,
              },
              {
                label: t("returns"),
                data: extractTimeData("returns"),
                backgroundColor: chartColors.quaternary,
                borderColor: chartColors.quaternary,
                borderWidth: 2,
              },
            ],
          },
          amounts: {
            labels,
            datasets: [
              {
                label: t("orderAmount"),
                data: extractTimeData("orderAmount"),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primary + "20",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
              },
            ],
          },
        };
      case "vouchers":
        return {
          transactions: {
            labels,
            datasets: [
              {
                label: t("expenseVouchers"),
                data: extractTimeData("expenses"),
                backgroundColor: chartColors.quaternary,
                borderColor: chartColors.quaternary,
                borderWidth: 2,
              },
              {
                label: t("paymentVouchers"),
                data: extractTimeData("payments"),
                backgroundColor: chartColors.secondary,
                borderColor: chartColors.secondary,
                borderWidth: 2,
              },
            ],
          },
          amounts: {
            labels,
            datasets: [
              {
                label: t("expenseAmount"),
                data: extractTimeData("expenseAmount"),
                borderColor: chartColors.quaternary,
                backgroundColor: chartColors.quaternary + "20",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
              },
              {
                label: t("paymentAmount"),
                data: extractTimeData("paymentAmount"),
                borderColor: chartColors.secondary,
                backgroundColor: chartColors.secondary + "20",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
              },
            ],
          },
        };
      default:
        return {};
    }
  };

  const handleExportPDF = () => {
    const reportTitle = {
      orders: t("ordersReport"),
      sellers: t("sellersReport"),
      suppliers: t("suppliersReport"),
      customers: t("customersReport"),
      vouchers: t("vouchersReport"),
    }[selectedReport];

    const pdfContent = `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>${reportTitle}</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 20px; 
              direction: rtl;
              text-align: right;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .stats-section {
              margin: 20px 0;
              padding: 20px;
              border: 2px solid #333;
              border-radius: 8px;
              text-align: center;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin: 20px 0;
            }
            .stat-item {
              padding: 15px;
              border: 1px solid #333;
              border-radius: 8px;
              text-align: center;
            }
            .chart-section {
              margin: 30px 0;
              padding: 20px;
              border: 2px solid #333;
              border-radius: 8px;
            }
            .table-section {
              margin: 30px 0;
              padding: 20px;
              border: 2px solid #333;
              border-radius: 8px;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .data-table th,
            .data-table td {
              border: 1px solid #333;
              padding: 8px;
              text-align: right;
            }
            .data-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <h2>${new Date().toLocaleDateString()}</h2>
            <p>${t("dateRange")}: ${t(dateRange)}</p>
          </div>
          
          <div class="stats-section">
            <h2>${t("summary")}</h2>
            <div class="stats-grid">
              ${stats
                .map(
                  (stat) => `
                <div class="stat-item">
                  <h3>${stat.title}</h3>
                  <p style="font-size: 24px; font-weight: bold; color: #2563eb;">${
                    stat.value
                  }</p>
                  <p style="color: ${stat.change > 0 ? "green" : "red"};">
                    ${stat.change > 0 ? "+" : ""}${stat.change}% ${
                    stat.changeText
                  }
                  </p>
                </div>
              `
                )
                .join("")}
            </div>
          </div>

          ${
            selectedReport === "orders" && currentData.orderStatus
              ? `
            <div class="table-section">
              <h2>${t("orderStatusTable")}</h2>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>${t("status")}</th>
                    <th>${t("count")}</th>
                    <th>${t("percentage")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentData.orderStatus
                    .map(
                      (status) => `
                    <tr>
                      <td>${t(status.status)}</td>
                      <td>${status.count}</td>
                      <td>${status.percentage}%</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
              : ""
          }

          ${
            selectedReport === "sellers" && currentData.sellerPerformance
              ? `
            <div class="table-section">
              <h2>${t("sellerPerformanceTable")}</h2>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>${t("seller")}</th>
                    <th>${t("sales")}</th>
                    <th>${t("orders")}</th>
                    <th>${t("rating")}</th>
                    <th>${t("growth")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentData.sellerPerformance
                    .map(
                      (seller) => `
                    <tr>
                      <td>${seller.name}</td>
                      <td>$${seller.sales.toFixed(2)}</td>
                      <td>${seller.orders}</td>
                      <td>⭐ ${seller.rating}</td>
                      <td>${seller.growth > 0 ? "+" : ""}${seller.growth}%</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
              : ""
          }

          ${
            selectedReport === "suppliers" && currentData.invoicesList
              ? `
            <div class="table-section">
              <h2>${t("supplierInvoices")}</h2>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>${t("invoiceNumber")}</th>
                    <th>${t("date")}</th>
                    <th>${t("amount")}</th>
                    <th>${t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentData.invoicesList
                    .slice(0, 10)
                    .map(
                      (invoice) => `
                    <tr>
                        <td>${
                          invoice.invoice_number ||
                          invoice.order_id ||
                          invoice.id ||
                          "-"
                        }</td>
                        <td>${(() => {
                          const dateField =
                            invoice.issue_date ||
                            invoice.issueDate ||
                            invoice.created_at ||
                            invoice.createdAt ||
                            invoice.date ||
                            invoice.invoice_date;

                          if (!dateField) return "N/A";

                          try {
                            const date = new Date(dateField);
                            if (isNaN(date.getTime())) {
                              return "Invalid Date";
                            }
                            return date.toLocaleDateString();
                          } catch {
                            return "Invalid Date";
                          }
                        })()}</td>
                        <td>${formatCurrencyEnglish(
                          invoice.total ||
                            invoice.total_amount ||
                            invoice.amount ||
                            0,
                          t("currency")
                        )}</td>
                      <td>${invoice.status || t("pending")}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
              : ""
          }

          ${
            selectedReport === "customers" && currentData.invoicesList
              ? `
            <div class="table-section">
              <h2>${t("customerInvoices")}</h2>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>${t("invoiceNumber")}</th>
                    <th>${t("date")}</th>
                    <th>${t("amount")}</th>
                    <th>${t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentData.invoicesList
                    .slice(0, 10)
                    .map(
                      (invoice) => `
                    <tr>
                        <td>${
                          invoice.invoice_number ||
                          invoice.order_id ||
                          invoice.id ||
                          "-"
                        }</td>
                        <td>${(() => {
                          const dateField =
                            invoice.issue_date ||
                            invoice.issueDate ||
                            invoice.created_at ||
                            invoice.createdAt ||
                            invoice.date ||
                            invoice.invoice_date;

                          if (!dateField) return "N/A";

                          try {
                            const date = new Date(dateField);
                            if (isNaN(date.getTime())) {
                              return "Invalid Date";
                            }
                            return date.toLocaleDateString();
                          } catch {
                            return "Invalid Date";
                          }
                        })()}</td>
                        <td>${formatCurrencyEnglish(
                          invoice.total ||
                            invoice.total_amount ||
                            invoice.amount ||
                            0,
                          t("currency")
                        )}</td>
                      <td>${invoice.status || t("pending")}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
              : ""
          }

          ${
            selectedReport === "vouchers" && currentData.vouchersList
              ? `
            <div class="table-section">
              <h2>${t("vouchers")}</h2>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>${t("type")}</th>
                    <th>${t("voucherNumber")}</th>
                    <th>${t("date")}</th>
                    <th>${t("amount")}</th>
                    <th>${t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentData.vouchersList
                    .slice(0, 10)
                    .map(
                      (voucher) => `
                    <tr>
                        <td>${(() => {
                          const voucherType =
                            voucher.type ||
                            voucher.voucher_type ||
                            voucher.voucherType;
                          if (
                            voucherType === "expense" ||
                            voucherType === "Expense"
                          ) {
                            return t("expenses");
                          } else if (
                            voucherType === "supplier" ||
                            voucherType === "Supplier"
                          ) {
                            return t("payments");
                          } else {
                            return t(voucherType?.toLowerCase() || "expenses");
                          }
                        })()}</td>
                        <td>${voucher.voucher_number || voucher.id || "-"}</td>
                        <td>${(() => {
                          const dateField =
                            voucher.created_at ||
                            voucher.createdAt ||
                            voucher.date ||
                            voucher.voucher_date ||
                            voucher.issue_date;

                          if (!dateField) return "N/A";

                          try {
                            const date = new Date(dateField);
                            if (isNaN(date.getTime())) {
                              return "Invalid Date";
                            }
                            return date.toLocaleDateString();
                          } catch {
                            return "Invalid Date";
                          }
                        })()}</td>
                        <td>${formatCurrencyEnglish(
                          voucher.amount ||
                            voucher.total_amount ||
                            voucher.total ||
                            0,
                          t("currency")
                        )}</td>
                      <td>${t(voucher.status?.toLowerCase() || "pending")}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
              : ""
          }

          <div class="no-print" style="margin-top: 50px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              ${t("print")}
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
              ${t("close")}
            </button>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(pdfContent);
    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
    toast.success(t("reportExportedPDF"));
  };

  const handleExportExcel = () => {
    let csvContent = "";

    // Add summary data
    csvContent += `${t("summary")}\n`;
    csvContent += `${t("title")},${t("value")},${t("change")}\n`;
    stats.forEach((stat) => {
      csvContent += `"${stat.title}","${stat.value}","${
        stat.change > 0 ? "+" : ""
      }${stat.change}%"\n`;
    });

    csvContent += "\n";

    // Add detailed data based on report type
    if (selectedReport === "orders" && currentData.orderStatus) {
      csvContent += `${t("orderStatusTable")}\n`;
      csvContent += `${t("status")},${t("count")},${t("percentage")}\n`;
      currentData.orderStatus.forEach((status) => {
        csvContent += `"${t(status.status)}","${status.count}","${
          status.percentage
        }%"\n`;
      });
    }

    if (selectedReport === "sellers" && currentData.sellerPerformance) {
      csvContent += `${t("sellerPerformanceTable")}\n`;
      csvContent += `${t("seller")},${t("sales")},${t("orders")},${t(
        "rating"
      )},${t("growth")}\n`;
      currentData.sellerPerformance.forEach((seller) => {
        csvContent += `"${seller.name}","$${seller.sales.toFixed(2)}","${
          seller.orders
        }","${seller.rating}","${seller.growth > 0 ? "+" : ""}${
          seller.growth
        }%"\n`;
      });
    }

    if (selectedReport === "suppliers") {
      if (currentData.invoicesList && currentData.invoicesList.length > 0) {
        csvContent += `\n${t("supplierInvoices")}\n`;
        csvContent += `${t("invoiceNumber")},${t("date")},${t("amount")},${t(
          "status"
        )}\n`;
        currentData.invoicesList.forEach((invoice) => {
          csvContent += `"${
            invoice.invoice_number || invoice.order_id || invoice.id || "-"
          }","${(() => {
            const dateField =
              invoice.issue_date ||
              invoice.issueDate ||
              invoice.created_at ||
              invoice.createdAt ||
              invoice.date ||
              invoice.invoice_date;

            if (!dateField) return "N/A";

            try {
              const date = new Date(dateField);
              if (isNaN(date.getTime())) {
                return "Invalid Date";
              }
              return date.toLocaleDateString();
            } catch {
              return "Invalid Date";
            }
          })()}","${formatCurrencyEnglish(
            invoice.total || invoice.total_amount || invoice.amount || 0,
            t("currency")
          )}","${invoice.status || t("pending")}"\n`;
        });
      }

      if (currentData.purchasesList && currentData.purchasesList.length > 0) {
        csvContent += `\n${t("supplierPurchases")}\n`;
        csvContent += `${t("purchaseNumber")},${t("date")},${t("amount")},${t(
          "status"
        )}\n`;
        currentData.purchasesList.forEach((purchase) => {
          csvContent += `"${
            purchase.purchase_number || purchase.id || "-"
          }","${new Date(
            purchase.created_at || purchase.date || purchase.purchase_date
          ).toLocaleDateString()}","${formatCurrencyEnglish(
            purchase.total_amount || purchase.total || purchase.amount || 0,
            t("currency")
          )}","${purchase.status || t("pending")}"\n`;
        });
      }

      if (currentData.returnsList && currentData.returnsList.length > 0) {
        csvContent += `\n${t("supplierReturns")}\n`;
        csvContent += `${t("returnNumber")},${t("date")},${t("amount")},${t(
          "status"
        )}\n`;
        currentData.returnsList.forEach((returnItem) => {
          csvContent += `"${
            returnItem.return_number || returnItem.id || "-"
          }","${new Date(
            returnItem.created_at || returnItem.date
          ).toLocaleDateString()}","${formatCurrencyEnglish(
            returnItem.total_amount ||
              returnItem.total ||
              returnItem.amount ||
              0,
            t("currency")
          )}","${returnItem.status || t("pending")}"\n`;
        });
      }
    }

    if (selectedReport === "customers") {
      if (currentData.invoicesList && currentData.invoicesList.length > 0) {
        csvContent += `\n${t("customerInvoices")}\n`;
        csvContent += `${t("invoiceNumber")},${t("date")},${t("amount")},${t(
          "status"
        )}\n`;
        currentData.invoicesList.forEach((invoice) => {
          csvContent += `"${
            invoice.invoice_number || invoice.order_id || invoice.id || "-"
          }","${(() => {
            const dateField =
              invoice.issue_date ||
              invoice.issueDate ||
              invoice.created_at ||
              invoice.createdAt ||
              invoice.date ||
              invoice.invoice_date;

            if (!dateField) return "N/A";

            try {
              const date = new Date(dateField);
              if (isNaN(date.getTime())) {
                return "Invalid Date";
              }
              return date.toLocaleDateString();
            } catch {
              return "Invalid Date";
            }
          })()}","${formatCurrencyEnglish(
            invoice.total || invoice.total_amount || invoice.amount || 0,
            t("currency")
          )}","${invoice.status || t("pending")}"\n`;
        });
      }

      if (currentData.ordersList && currentData.ordersList.length > 0) {
        csvContent += `\n${t("customerOrders")}\n`;
        csvContent += `${t("orderNumber")},${t("date")},${t("amount")},${t(
          "status"
        )}\n`;
        currentData.ordersList.forEach((order) => {
          csvContent += `"${order.id || "-"}","${new Date(
            order.createdAt || order.date || order.orderDate
          ).toLocaleDateString()}","${formatCurrencyEnglish(
            order.total_amount || order.totalAmount || order.total || 0,
            t("currency")
          )}","${order.status || t("pending")}"\n`;
        });
      }

      if (currentData.returnsList && currentData.returnsList.length > 0) {
        csvContent += `\n${t("customerReturns")}\n`;
        csvContent += `${t("returnNumber")},${t("date")},${t("amount")},${t(
          "status"
        )}\n`;
        currentData.returnsList.forEach((returnItem) => {
          csvContent += `"${returnItem.id || "-"}","${new Date(
            returnItem.created_at || returnItem.date
          ).toLocaleDateString()}","${formatCurrencyEnglish(
            returnItem.refundAmount || returnItem.refund_amount || 0,
            t("currency")
          )}","${t("returned")}"\n`;
        });
      }
    }

    if (selectedReport === "vouchers") {
      if (currentData.vouchersList && currentData.vouchersList.length > 0) {
        csvContent += `\n${t("vouchers")}\n`;
        csvContent += `${t("type")},${t("voucherNumber")},${t("date")},${t(
          "amount"
        )},${t("status")}\n`;
        currentData.vouchersList.forEach((voucher) => {
          csvContent += `"${(() => {
            const voucherType =
              voucher.type || voucher.voucher_type || voucher.voucherType;
            if (voucherType === "expense" || voucherType === "Expense") {
              return t("expenses");
            } else if (
              voucherType === "supplier" ||
              voucherType === "Supplier"
            ) {
              return t("payments");
            } else {
              return t(voucherType?.toLowerCase() || "expenses");
            }
          })()}","${voucher.voucher_number || voucher.id || "-"}","${(() => {
            const dateField =
              voucher.created_at ||
              voucher.createdAt ||
              voucher.date ||
              voucher.voucher_date ||
              voucher.issue_date;

            if (!dateField) return "N/A";

            try {
              const date = new Date(dateField);
              if (isNaN(date.getTime())) {
                return "Invalid Date";
              }
              return date.toLocaleDateString();
            } catch {
              return "Invalid Date";
            }
          })()}","${formatCurrencyEnglish(
            voucher.amount || voucher.total_amount || voucher.total || 0,
            t("currency")
          )}","${t(voucher.status?.toLowerCase() || "pending")}"\n`;
        });
      }
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${selectedReport}_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t("reportExportedExcel"));
  };

  const chartData = getChartData();
  const stats = getStats();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("reports")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("viewAndAnalyzeData")}
              {useCustomDateRange && (fromDate || toDate) && (
                <span className="block sm:inline sm:ml-2 text-blue-600 dark:text-blue-400 text-sm mt-1 sm:mt-0">
                  ({t("filteredBy")}: {fromDate || t("start")} -{" "}
                  {toDate || t("end")})
                </span>
              )}
            </p>
          </div>

          {/* Export Dropdown */}
          <div className="relative export-dropdown">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{t("exportReport")}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showExportDropdown && (
              <div
                className={`absolute top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-48 ${
                  isRTL ? "left-0" : "right-0"
                }`}
              >
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors duration-200"
                >
                  <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="truncate">{t("exportPDF")}</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-green-600 dark:text-green-400 transition-colors duration-200"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="truncate">{t("exportExcel")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-4 transition-all duration-300">
        <div
          className={`flex flex-wrap items-center gap-3 ${
            isRTL ? "flex-row" : ""
          }`}
        >
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("charts")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                viewMode === "charts"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {t("chartView")}
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                viewMode === "table"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Table className="w-4 h-4" />
              {t("tableView")}
            </button>
          </div>

          {/* Report Type Selector */}
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 min-w-40"
          >
            <option value="overview">{t("overviewReport")}</option>
            <option value="orders">{t("ordersReport")}</option>
            <option value="sellers">{t("sellersReport")}</option>
            <option value="suppliers">{t("suppliersReport")}</option>
            <option value="customers">{t("customersReport")}</option>
            <option value="vouchers">{t("vouchersReport")}</option>
          </select>

          {/* Supplier Selector - Show only when suppliers report is selected */}
          {selectedReport === "suppliers" && (
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 min-w-40"
            >
              <option value="all">{t("allSuppliers")}</option>
              {Array.isArray(suppliers) &&
                suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name ||
                      supplier.supplier_name ||
                      `Supplier #${supplier.id}`}
                  </option>
                ))}
            </select>
          )}

          {/* Customer Selector - Show only when customers report is selected */}
          {selectedReport === "customers" && (
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 min-w-40"
            >
              <option value="all">{t("allCustomers")}</option>
              {Array.isArray(customers) &&
                customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_name ||
                      customer.name ||
                      `Customer #${customer.id}`}
                  </option>
                ))}
            </select>
          )}

          {/* Voucher Type Selector - Show only when vouchers report is selected */}
          {selectedReport === "vouchers" && (
            <select
              value={selectedVoucherType}
              onChange={(e) => setSelectedVoucherType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 min-w-40"
            >
              <option value="all">{t("allVouchers")}</option>
              <option value="expense">{t("expenseVouchers")}</option>
              <option value="payment">{t("paymentVouchers")}</option>
            </select>
          )}

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              setUseCustomDateRange(e.target.value === "custom");
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 min-w-32"
          >
            <option value="all">{t("allTime")}</option>
            <option value="week">{t("thisWeek")}</option>
            <option value="month">{t("thisMonth")}</option>
            <option value="quarter">{t("thisQuarter")}</option>
            <option value="custom">{t("customRange")}</option>
          </select>

          {/* Custom Date Range Filter */}
          {useCustomDateRange && (
            <div
              className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}
            >
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t("from")}
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors duration-200"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t("to")}
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors duration-200"
                />
              </div>
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                  setDateRange("month");
                  setUseCustomDateRange(false);
                }}
                className="px-3 py-2 text-sm text-gray-500 dark:text-gray-200 transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-200"
                title={t("clearFilters")}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {viewMode === "charts" ? (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
              <div
                className={`flex items-center gap-3 mb-6 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <LineChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {selectedReport === "overview" && t("overviewChart")}
                  {selectedReport === "orders" && t("orderStatusChart")}
                  {selectedReport === "sellers" && t("sellerPerformanceChart")}
                  {selectedReport === "suppliers" &&
                    t("supplierTransactionsChart")}
                  {selectedReport === "customers" &&
                    t("customerTransactionsChart")}
                  {selectedReport === "vouchers" &&
                    t("voucherTransactionsChart")}
                </h3>
              </div>
              <div className="h-80">
                {loading ||
                ordersLoading ||
                customersLoading ||
                sellersLoading ||
                supplierDataLoading ||
                customerDataLoading ||
                voucherDataLoading ||
                overviewDataLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="ml-2 text-gray-600 dark:text-gray-400">
                      {t("loading")}...
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedReport === "overview" && chartData.overview && (
                      <Bar data={chartData.overview} options={chartOptions} />
                    )}
                    {selectedReport === "orders" && chartData.status && (
                      <Bar data={chartData.status} options={chartOptions} />
                    )}
                    {selectedReport === "sellers" && chartData.performance && (
                      <Line
                        data={chartData.performance}
                        options={chartOptions}
                      />
                    )}
                    {selectedReport === "suppliers" &&
                      chartData.transactions && (
                        <Bar
                          data={chartData.transactions}
                          options={chartOptions}
                        />
                      )}
                    {selectedReport === "customers" &&
                      chartData.transactions && (
                        <Bar
                          data={chartData.transactions}
                          options={chartOptions}
                        />
                      )}
                    {selectedReport === "vouchers" &&
                      chartData.transactions && (
                        <Bar
                          data={chartData.transactions}
                          options={chartOptions}
                        />
                      )}
                  </>
                )}
              </div>
            </div>

            {/* Secondary Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
              <div
                className={`flex items-center gap-3 mb-6 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3
                  className={`text-lg font-medium text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {selectedReport === "overview" && t("profitLossChart")}
                  {selectedReport === "orders" && t("orderTrendsChart")}
                  {selectedReport === "sellers" && t("sellerGrowthChart")}
                  {selectedReport === "suppliers" && t("supplierAmountsChart")}
                  {selectedReport === "customers" && t("customerAmountsChart")}
                  {selectedReport === "vouchers" && t("voucherAmountsChart")}
                </h3>
              </div>
              <div className="h-80">
                {loading ||
                ordersLoading ||
                customersLoading ||
                sellersLoading ||
                supplierDataLoading ||
                customerDataLoading ||
                voucherDataLoading ||
                overviewDataLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="ml-2 text-gray-600 dark:text-gray-400">
                      {t("loading")}...
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedReport === "overview" && chartData.profitLoss && (
                      <Bar data={chartData.profitLoss} options={chartOptions} />
                    )}
                    {selectedReport === "orders" && chartData.status && (
                      <Line data={chartData.status} options={chartOptions} />
                    )}
                    {selectedReport === "sellers" && chartData.performance && (
                      <Bar
                        data={chartData.performance}
                        options={chartOptions}
                      />
                    )}
                    {selectedReport === "suppliers" && chartData.amounts && (
                      <Line data={chartData.amounts} options={chartOptions} />
                    )}
                    {selectedReport === "customers" && chartData.amounts && (
                      <Line data={chartData.amounts} options={chartOptions} />
                    )}
                    {selectedReport === "vouchers" && chartData.amounts && (
                      <Line data={chartData.amounts} options={chartOptions} />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Table View */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
            <div
              className={`flex items-center gap-3 mb-6 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <Table className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3
                className={`text-lg font-medium text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {selectedReport === "overview" && t("overviewTable")}
                {selectedReport === "orders" && t("orderStatusTable")}
                {selectedReport === "sellers" && t("sellerPerformanceTable")}
                {selectedReport === "suppliers" &&
                  t("supplierTransactionsTable")}
                {selectedReport === "customers" &&
                  t("customerTransactionsTable")}
                {selectedReport === "vouchers" && t("voucherTransactionsTable")}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full ${isRTL ? "text-right" : "text-left"}`}>
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {selectedReport === "overview" && (
                      <>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("category")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("amount")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("percentage")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("status")}
                        </th>
                      </>
                    )}
                    {selectedReport === "orders" && (
                      <>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("status")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("count")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("percentage")}
                        </th>
                      </>
                    )}
                    {selectedReport === "sellers" && (
                      <>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("seller")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("sales")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("orders")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("rating")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("growth")}
                        </th>
                      </>
                    )}
                    {selectedReport === "suppliers" && (
                      <>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("type")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("number")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("date")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("amount")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("status")}
                        </th>
                      </>
                    )}
                    {selectedReport === "customers" && (
                      <>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("type")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("number")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("date")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("amount")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("status")}
                        </th>
                      </>
                    )}
                    {selectedReport === "vouchers" && (
                      <>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("type")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("voucherNumber")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("date")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("amount")}
                        </th>
                        <th
                          className={`px-6 py-3 ${
                            isRTL ? "text-right" : "text-left"
                          } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                        >
                          {t("status")}
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedReport === "overview" && (
                    <>
                      <tr>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            {t("totalSales")}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrencyEnglish(
                              overviewData.totalSales || 0,
                              t("currency")
                            )}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm text-gray-900 dark:text-white">
                            100%
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {t("revenue")}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {t("totalPurchases")}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrencyEnglish(
                              overviewData.totalPurchases || 0,
                              t("currency")
                            )}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm text-gray-900 dark:text-white">
                            {overviewData.totalSales > 0
                              ? Math.round(
                                  ((overviewData.totalPurchases || 0) /
                                    overviewData.totalSales) *
                                    100
                                )
                              : 0}
                            %
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {t("cost")}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm font-medium text-red-600 dark:text-red-400">
                            {t("totalExpenses")}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrencyEnglish(
                              overviewData.totalExpenses || 0,
                              t("currency")
                            )}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm text-gray-900 dark:text-white">
                            {overviewData.totalSales > 0
                              ? Math.round(
                                  ((overviewData.totalExpenses || 0) /
                                    overviewData.totalSales) *
                                    100
                                )
                              : 0}
                            %
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {t("expense")}
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div
                            className={`text-sm font-bold ${
                              (overviewData.netProfit || 0) >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {t("netProfit")}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div
                            className={`text-sm font-bold ${
                              (overviewData.netProfit || 0) >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {formatCurrencyEnglish(
                              overviewData.netProfit || 0,
                              t("currency")
                            )}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div
                            className={`text-sm font-bold ${
                              (overviewData.netProfit || 0) >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {overviewData.totalSales > 0
                              ? Math.round(
                                  ((overviewData.netProfit || 0) /
                                    overviewData.totalSales) *
                                    100
                                )
                              : 0}
                            %
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              (overviewData.netProfit || 0) >= 0
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {(overviewData.netProfit || 0) >= 0
                              ? t("profit")
                              : t("loss")}
                          </span>
                        </td>
                      </tr>
                    </>
                  )}
                  {selectedReport === "orders" &&
                    currentData.orderStatus?.map((status, index) => (
                      <tr key={index}>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {t(status.status)}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumberEnglish(status.count)}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumberEnglish(status.percentage)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  {selectedReport === "sellers" &&
                    currentData.sellerPerformance?.map((seller, index) => (
                      <tr key={index}>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {seller.name}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrencyEnglish(seller.sales, t("currency"))}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumberEnglish(seller.orders)}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm text-gray-900 dark:text-white">
                            ⭐ {seller.rating}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="flex items-center">
                            <span
                              className={`text-sm font-medium ${
                                seller.growth > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {seller.growth > 0 ? "+" : ""}
                              {seller.growth}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {selectedReport === "suppliers" && (
                    <>
                      {currentData.invoicesList?.map((invoice, index) => (
                        <tr key={`invoice-${index}`}>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {t("invoices")}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {invoice.invoice_number ||
                                invoice.order_id ||
                                invoice.id ||
                                "-"}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {(() => {
                                const dateField =
                                  invoice.issue_date ||
                                  invoice.issueDate ||
                                  invoice.created_at ||
                                  invoice.createdAt ||
                                  invoice.date ||
                                  invoice.invoice_date;

                                if (!dateField) return "N/A";

                                try {
                                  const date = new Date(dateField);
                                  if (isNaN(date.getTime())) {
                                    return "Invalid Date";
                                  }
                                  return date.toLocaleDateString();
                                } catch {
                                  return "Invalid Date";
                                }
                              })()}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatCurrencyEnglish(
                                invoice.total ||
                                  invoice.total_amount ||
                                  invoice.amount ||
                                  0,
                                t("currency")
                              )}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                invoice.status === "Paid" ||
                                invoice.status === "paid"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : invoice.status === "Pending" ||
                                    invoice.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {t(invoice.status?.toLowerCase() || "pending")}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {currentData.purchasesList?.map((purchase, index) => (
                        <tr key={`purchase-${index}`}>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                              {t("purchases")}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              #{purchase.id || "-"}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {purchase.expected_delivery
                                ? new Date(
                                    purchase.expected_delivery
                                  ).toLocaleDateString()
                                : new Date(
                                    purchase.created_at ||
                                      purchase.date ||
                                      purchase.purchase_date
                                  ).toLocaleDateString()}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {t("notAvailable")}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                purchase.status === "Delivered" ||
                                purchase.status === "delivered" ||
                                purchase.status === "completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : purchase.status === "Pending" ||
                                    purchase.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {t(purchase.status?.toLowerCase() || "pending")}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {currentData.returnsList?.map((returnItem, index) => (
                        <tr key={`return-${index}`}>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm font-medium text-red-600 dark:text-red-400">
                              {t("returns")}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              #{returnItem.id || "-"}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {returnItem.created_at
                                ? new Date(
                                    returnItem.created_at
                                  ).toLocaleDateString()
                                : new Date(
                                    returnItem.date
                                  ).toLocaleDateString()}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {t("quantity")}: {returnItem.quantity || 0}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {t("returned")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  {selectedReport === "customers" && (
                    <>
                      {currentData.invoicesList?.map((invoice, index) => (
                        <tr key={`customer-invoice-${index}`}>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {t("invoices")}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {invoice.invoice_number ||
                                invoice.order_id ||
                                invoice.id ||
                                "-"}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {(() => {
                                const dateField =
                                  invoice.issue_date ||
                                  invoice.issueDate ||
                                  invoice.created_at ||
                                  invoice.createdAt ||
                                  invoice.date ||
                                  invoice.invoice_date;

                                if (!dateField) return "N/A";

                                try {
                                  const date = new Date(dateField);
                                  if (isNaN(date.getTime())) {
                                    return "Invalid Date";
                                  }
                                  return date.toLocaleDateString();
                                } catch {
                                  return "Invalid Date";
                                }
                              })()}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatCurrencyEnglish(
                                invoice.total ||
                                  invoice.total_amount ||
                                  invoice.amount ||
                                  0,
                                t("currency")
                              )}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                invoice.status === "Paid" ||
                                invoice.status === "paid"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : invoice.status === "Pending" ||
                                    invoice.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {t(invoice.status?.toLowerCase() || "pending")}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {currentData.ordersList?.map((order, index) => (
                        <tr key={`customer-order-${index}`}>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                              {t("orders")}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              #{order.id || "-"}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {new Date(
                                order.createdAt || order.date || order.orderDate
                              ).toLocaleDateString()}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatCurrencyEnglish(
                                order.total_amount ||
                                  order.totalAmount ||
                                  order.total ||
                                  0,
                                t("currency")
                              )}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === "completed" ||
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : order.status === "ready"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {t(order.status?.toLowerCase() || "pending")}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {currentData.returnsList?.map((returnItem, index) => (
                        <tr key={`customer-return-${index}`}>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm font-medium text-red-600 dark:text-red-400">
                              {t("returns")}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              #{returnItem.id || "-"}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {returnItem.created_at
                                ? new Date(
                                    returnItem.created_at
                                  ).toLocaleDateString()
                                : new Date(
                                    returnItem.date
                                  ).toLocaleDateString()}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatCurrencyEnglish(
                                returnItem.refundAmount ||
                                  returnItem.refund_amount ||
                                  0,
                                t("currency")
                              )}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {t("returned")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  {selectedReport === "vouchers" && (
                    <>
                      {currentData.vouchersList?.map((voucher, index) => (
                        <tr key={`voucher-${index}`}>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div
                              className={`text-sm font-medium ${
                                (voucher.type ||
                                  voucher.voucher_type ||
                                  voucher.voucherType) === "expense" ||
                                (voucher.type ||
                                  voucher.voucher_type ||
                                  voucher.voucherType) === "Expense"
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            >
                              {(() => {
                                const voucherType =
                                  voucher.type ||
                                  voucher.voucher_type ||
                                  voucher.voucherType;
                                if (
                                  voucherType === "expense" ||
                                  voucherType === "Expense"
                                ) {
                                  return t("expenses");
                                } else if (
                                  voucherType === "supplier" ||
                                  voucherType === "Supplier"
                                ) {
                                  return t("payments");
                                } else {
                                  return t(
                                    voucherType?.toLowerCase() || "expenses"
                                  );
                                }
                              })()}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {voucher.voucher_number || voucher.id || "-"}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {(() => {
                                const dateField =
                                  voucher.created_at ||
                                  voucher.createdAt ||
                                  voucher.date ||
                                  voucher.voucher_date ||
                                  voucher.issue_date;

                                if (!dateField) return "N/A";

                                try {
                                  const date = new Date(dateField);
                                  if (isNaN(date.getTime())) {
                                    return "Invalid Date";
                                  }
                                  return date.toLocaleDateString();
                                } catch {
                                  return "Invalid Date";
                                }
                              })()}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatCurrencyEnglish(
                                voucher.amount ||
                                  voucher.total_amount ||
                                  voucher.total ||
                                  0,
                                t("currency")
                              )}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {t("confirmed")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerReports;
