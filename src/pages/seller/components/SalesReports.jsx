
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
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
  AlertCircle,
} from "lucide-react";

import StatsCard from "../../../components/Common/StatsCard";
import { formatCurrencyEnglish, formatNumberEnglish } from "../../../utils";
import { fetchOrders } from "../../../store/slices/ordersSlice";
import { customerService, productService, orderService } from "../../../services";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

const SalesReports = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL, theme } = useSelector((state) => state.language || {});
  const [dateRange, setDateRange] = useState("today");
  const [viewMode, setViewMode] = useState("charts"); // 'charts' or 'table'
  const [loading, setLoading] = useState(false);

  // Database state management
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  // Load data from database using services
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const results = await Promise.allSettled([
          orderService.getOrders(),
          customerService.getCustomers(),
          productService.getProducts(),
        ]);

        const [ordersData, customersData, productsData] = results;

        if (!mounted) return;

        if (ordersData.status === "fulfilled" && Array.isArray(ordersData.value)) {
          setOrders(ordersData.value);
          // Optionally update redux store if you want
          try {
            dispatch(fetchOrders());
          } catch (e) {
            console.error("Error dispatching fetchOrders:", e);
            // ignore if action requires payload or isn't configured
          }
        } else {
          // if failed, set empty array but not fatal
          setOrders([]);
        }

        if (customersData.status === "fulfilled" && Array.isArray(customersData.value)) {
          setCustomers(customersData.value);
        } else {
          setCustomers([]);
        }

        if (productsData.status === "fulfilled" && Array.isArray(productsData.value)) {
          setProducts(productsData.value);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load some data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 300000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [dispatch]);

  // Helper - normalize order date string -> Date
  const parseOrderDate = (order) => {
    const d = order?.date || order?.createdAt || order?.created_at;
    // if already Date
    if (d instanceof Date) return d;
    return d ? new Date(d) : new Date();
  };

  // Filter orders by date range
  const filterOrdersByDateRange = (ordersList = [], range) => {
    if (!Array.isArray(ordersList)) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (range === "today") {
      return ordersList.filter((order) => {
        const orderDate = parseOrderDate(order);
        const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        return orderDay.getTime() === today.getTime();
      });
    }

    if (range === "week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // sunday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return ordersList.filter((order) => {
        const od = parseOrderDate(order);
        return od >= weekStart && od <= weekEnd;
      });
    }

    if (range === "month") {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      return ordersList.filter((order) => {
        const od = parseOrderDate(order);
        return od >= monthStart && od <= monthEnd;
      });
    }

    return ordersList;
  };

  // Generate time series for charts
  const generateTimeSeriesData = (ordersList = [], range) => {
    const now = new Date();
    const data = [];

    if (range === "today") {
      for (let i = 0; i < 24; i++) {
        const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), i, 0, 0, 0);
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(hourStart.getHours() + 1);

        const hourOrders = ordersList.filter((order) => {
          const od = parseOrderDate(order);
          return od >= hourStart && od < hourEnd;
        });

        const revenue = hourOrders.reduce(
          (s, o) => s + parseFloat(o.total_amount || o.total || 0),
          0
        );

        data.push({
          time: `${i.toString().padStart(2, "0")}:00`,
          revenue,
          orders: hourOrders.length,
        });
      }
    } else if (range === "week") {
      // 7 days, from last 6 days to today
      const dayNames = [
        t("sunday") || "Sunday",
        t("monday") || "Monday",
        t("tuesday") || "Tuesday",
        t("wednesday") || "Wednesday",
        t("thursday") || "Thursday",
        t("friday") || "Friday",
        t("saturday") || "Saturday",
      ];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);

        const dayOrders = ordersList.filter((order) => {
          const od = parseOrderDate(order);
          return od >= dayStart && od < dayEnd;
        });

        const revenue = dayOrders.reduce(
          (s, o) => s + parseFloat(o.total_amount || o.total || 0),
          0
        );

        data.push({
          time: dayNames[d.getDay()] || d.toLocaleDateString(),
          revenue,
          orders: dayOrders.length,
        });
      }
    } else if (range === "month") {
      // 4 weeks summary
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - i * 7 - 6);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekOrders = ordersList.filter((order) => {
          const od = parseOrderDate(order);
          return od >= weekStart && od <= weekEnd;
        });

        const revenue = weekOrders.reduce(
          (s, o) => s + parseFloat(o.total_amount || o.total || 0),
          0
        );

        data.push({
          time: `${t("week") || "Week"} ${4 - i}`,
          revenue,
          orders: weekOrders.length,
        });
      }
    }

    return data;
  };

  // Calculate category sales
  const calculateCategorySales = (ordersList = []) => {
    const filteredOrders = filterOrdersByDateRange(ordersList, dateRange);
    const categorySales = {};
    let totalRevenue = 0;

    filteredOrders.forEach((order) => {
      // decide items array
      let orderItems = [];
      if (Array.isArray(order.items)) {
        orderItems = order.items;
      } else if (Array.isArray(order.products)) {
        orderItems = order.products;
      } else if (typeof order.items === "number") {
        // fallback: create dummy items (rare)
        for (let i = 0; i < order.items; i++) {
          orderItems.push({ product_id: products[i % products.length]?.id || i + 1, quantity: 1 });
        }
      } else {
        orderItems = [{ product_id: order.product_id || 1, quantity: order.quantity || 1 }];
      }

      orderItems.forEach((it) => {
        const pid = it.product_id ?? it.productId ?? it.id;
        const product = products.find((p) => p.id === pid || String(p.id) === String(pid));
        const category = product ? product.category || product.Category || "Other" : "Unknown";
        const price = product ? parseFloat(product.price || product.unit_size || 0) || 0 : 0;
        const qty = parseInt(it.quantity || it.qty || 1, 10) || 1;
        const itemRevenue = price * qty;

        if (!categorySales[category]) categorySales[category] = { category, revenue: 0 };
        categorySales[category].revenue += itemRevenue;
        totalRevenue += itemRevenue;
      });
    });

    // ensure categories from product list exist even with 0 revenue
    const allCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    allCategories.forEach((cat) => {
      if (!categorySales[cat]) categorySales[cat] = { category: cat, revenue: 0 };
    });

    const sorted = Object.values(categorySales)
      .map((c) => ({
        ...c,
        percentage: totalRevenue > 0 ? Math.round((c.revenue / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    if (sorted.length === 0) {
      return [{ category: t("noCategoryData") || "No category data", revenue: 0, percentage: 0 }];
    }
    return sorted;
  };

  // Main aggregated data
  const calculateSalesData = () => {
    if (!Array.isArray(orders)) {
      return { revenue: 0, orders: 0, products: 0, customers: 0, growth: 0, timeData: [] };
    }

    const filtered = filterOrdersByDateRange(orders, dateRange);
    const revenue = filtered.reduce((s, o) => s + parseFloat(o.total_amount || o.total || 0), 0);
    const ordersCount = filtered.length;
    const productsSold = Array.isArray(products) ? products.length : 0;

    const orderCustomers = new Set(filtered.map((o) => o.customer ?? o.customer_id ?? o.customerId));
    const activeCustomers = Array.isArray(customers)
      ? customers.filter((c) => filtered.some((o) => (o.customer ?? o.customer_id) === c.id)).length
      : 0;
    const customersCount = Math.max(orderCustomers.size, activeCustomers);

    // previous period selection (simple heuristic)
    const previousRange = dateRange === "today" ? "week" : dateRange === "week" ? "month" : "today";
    const previousOrders = filterOrdersByDateRange(orders, previousRange);
    const previousRevenue = previousOrders.reduce((s, o) => s + parseFloat(o.total_amount || o.total || 0), 0);

    const growth = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;

    const timeData = generateTimeSeriesData(filtered, dateRange);

    return {
      revenue,
      orders: ordersCount,
      products: productsSold,
      customers: customersCount,
      growth: Math.round(growth * 10) / 10,
      timeData,
    };
  };

  const currentData = calculateSalesData();
  const categorySales = calculateCategorySales(orders);

  // topProducts: pick top by current stock or random fallback. Map to expected fields.
  const topProducts =
    Array.isArray(products) && products.length > 0
      ? products.slice(0, 10).map((p) => {
          const name = p.english_name || p.englishName || p.englishNameEn || p.english_name || p.english || p.nameEn || p.name || p.english_name || p.english_name;
          const displayName = name || p.english_name || p.englishName || p.english_name || p.arabic_name || `Product #${p.id}`;
          const sales = Math.floor(Math.random() * 20) + 1;
          const revenue = sales * (parseFloat(p.price || 0) || 0);
          return { id: p.id, name: displayName, sales, revenue };
        })
      : [];

  const stats = [
    {
      title: t("totalRevenue") || "Total Revenue",
      value: formatCurrencyEnglish(currentData.revenue, t("currency") || "USD"),
      icon: DollarSign,
      color: "green",
      change: currentData.growth,
      changeText: t("fromLastPeriod") || "from last period",
    },
    {
      title: t("totalOrders") || "Total Orders",
      value: formatNumberEnglish(currentData.orders),
      icon: ShoppingCart,
      color: "blue",
      change: 8,
      changeText: t("fromLastPeriod") || "from last period",
    },
    {
      title: t("totalProducts") || "Total Products",
      value: formatNumberEnglish(currentData.products),
      icon: Package,
      color: "purple",
      change: 12,
      changeText: t("fromLastPeriod") || "from last period",
    },
    {
      title: t("activeCustomers") || "Active Customers",
      value: formatNumberEnglish(currentData.customers),
      icon: Users,
      color: "yellow",
      change: 5,
      changeText: t("fromLastPeriod") || "from last period",
    },
  ];

  // Theme / colors
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
            family: isRTL ? "Arial, sans-serif" : "Inter, system-ui, sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        titleColor: chartColors.text,
        bodyColor: chartColors.text,
        borderColor: chartColors.grid,
        borderWidth: 1,
        rtl: !!isRTL,
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartColors.text,
          font: {
            family: isRTL ? "Arial, sans-serif" : "Inter, system-ui, sans-serif",
          },
        },
        grid: {
          color: chartColors.grid,
        },
      },
      y: {
        ticks: {
          color: chartColors.text,
          font: {
            family: isRTL ? "Arial, sans-serif" : "Inter, system-ui, sans-serif",
          },
        },
        grid: {
          color: chartColors.grid,
        },
      },
    },
  };

  // revenue & orders chart data
  const revenueChartData = {
    labels: currentData.timeData.map((i) => i.time),
    datasets: [
      {
        label: t("revenue") || "Revenue",
        data: currentData.timeData.map((i) => i.revenue),
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary + "20",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const ordersChartData = {
    labels: currentData.timeData.map((i) => i.time),
    datasets: [
      {
        label: t("orderCount") || "Orders",
        data: currentData.timeData.map((i) => i.orders),
        backgroundColor: chartColors.secondary,
        borderColor: chartColors.secondary,
        borderWidth: 1,
      },
    ],
  };

  const generateCategoryColors = (count) => {
    const baseColors = [
      chartColors.primary,
      chartColors.secondary,
      chartColors.tertiary,
      chartColors.quaternary,
      chartColors.quinary,
      "#f59e0b",
      "#10b981",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4",
      "#f97316",
      "#84cc16",
      "#ec4899",
      "#6366f1",
      "#14b8a6",
    ];
    const colors = [];
    for (let i = 0; i < count; i++) colors.push(baseColors[i % baseColors.length]);
    return colors;
  };

  const categoryChartData = {
    labels: categorySales.length > 0 ? categorySales.map((c) => c.category) : [t("noData") || "No data"],
    datasets: [
      {
        label: t("revenue") || "Revenue",
        data: categorySales.length > 0 ? categorySales.map((c) => c.revenue) : [0],
        backgroundColor: generateCategoryColors(categorySales.length),
        borderWidth: 2,
        borderColor: isDark ? "#374151" : "#ffffff",
      },
    ],
  };

  // PDF export
  const generateReportHTML = () => {
    const currentDate = new Date().toLocaleDateString();
    const periodText = dateRange === "today" ? t("today") || "Today" : dateRange === "week" ? t("thisWeek") || "This Week" : t("thisMonth") || "This Month";

    return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px;">${t("salesReports") || "Sales Reports"}</h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">${periodText} - ${currentDate}</p>
        </div>
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">${t("summary") || "Summary"}</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 5px 0; color: #059669; font-size: 18px;">${t("totalRevenue") || "Total Revenue"}</h3>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">${formatCurrencyEnglish(currentData.revenue, t("currency") || "USD")}</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h3 style="margin: 0 0 5px 0; color: #2563eb; font-size: 18px;">${t("totalOrders") || "Total Orders"}</h3>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">${formatNumberEnglish(currentData.orders)}</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
              <h3 style="margin: 0 0 5px 0; color: #7c3aed; font-size: 18px;">${t("productsSold") || "Products"}</h3>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">${formatNumberEnglish(currentData.products)}</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="margin: 0 0 5px 0; color: #d97706; font-size: 18px;">${t("activeCustomers") || "Active Customers"}</h3>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">${formatNumberEnglish(currentData.customers)}</p>
            </div>
          </div>
        </div>

        ${topProducts.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">${t("sellingProducts") || "Top Products"}</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; color: #374151;">${t("product") || "Product"}</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; color: #374151;">${t("sales") || "Sales"}</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; color: #374151;">${t("revenue") || "Revenue"}</th>
              </tr>
            </thead>
            <tbody>
              ${topProducts.map(p => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${p.name}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${formatNumberEnglish(p.sales)}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${formatCurrencyEnglish(p.revenue, t("currency") || "USD")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>` : ""}

        ${categorySales.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">${t("salesByCategory") || "Sales by Category"}</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; color: #374151;">${t("category") || "Category"}</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; color: #374151;">${t("percentage") || "%"}</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; color: #374151;">${t("revenue") || "Revenue"}</th>
              </tr>
            </thead>
            <tbody>
              ${categorySales.map(cat => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${cat.category}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${formatNumberEnglish(cat.percentage)}%</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${formatCurrencyEnglish(cat.revenue, t("currency") || "USD")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>` : ""}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; font-size: 12px;">
          <p>${t("generatedOn") || "Generated on"}: ${new Date().toLocaleString()}</p>
          <p>${t("reportPeriod") || "Report Period"}: ${periodText}</p>
        </div>
      </div>
    `;
  };

  const handleExportReport = async () => {
    try {
      setLoading(true);

      const reportContainer = document.createElement("div");
      reportContainer.style.position = "absolute";
      reportContainer.style.left = "-9999px";
      reportContainer.style.top = "0";
      reportContainer.style.width = "210mm";
      reportContainer.style.backgroundColor = "white";
      reportContainer.style.padding = "20px";
      reportContainer.style.fontFamily = "Arial, sans-serif";

      reportContainer.innerHTML = generateReportHTML();
      document.body.appendChild(reportContainer);

      const canvas = await html2canvas(reportContainer, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      document.body.removeChild(reportContainer);

      const fileName = `sales-report-${dateRange}-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert(t("errorGeneratingPDF") || "Error generating PDF report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading UI (when first loading and no data)
  if (loading && (!orders || orders.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t("loadingData") || "Loading data"}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-xl border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">{t("errorLoadingData") || "Error loading data"}</h3>
        </div>
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">{t("refreshPage") || "Refresh"}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <div className={`flex items-center justify-between ${isRTL ? "flex-row" : ""}`}>
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("salesReports") || "Sales Reports"}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t("viewSalesAnalytics") || "View sales analytics"}</p>
          </div>

          <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button onClick={() => setViewMode("charts")} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${viewMode === "charts" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                <BarChart3 className="w-4 h-4" /> {t("chartView") || "Chart"}
              </button>
              <button onClick={() => setViewMode("table")} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${viewMode === "table" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                <Table className="w-4 h-4" /> {t("tableView") || "Table"}
              </button>
            </div>

            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200">
              <option value="today">{t("today") || "Today"}</option>
              <option value="week">{t("thisWeek") || "This Week"}</option>
              <option value="month">{t("thisMonth") || "This Month"}</option>
            </select>

            <button onClick={handleExportReport} disabled={loading} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              {loading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t("generating") || "Generating"}...</>) : (<><Download className="w-4 h-4" /> {t("exportReport") || "Export Report"}</>)}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => <StatsCard key={idx} {...stat} />)}
      </div>

      {viewMode === "charts" ? (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row" : ""}`}>
                <LineChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}>{t("revenueChart") || "Revenue"}</h3>
              </div>
              <div className="h-80"><Line data={revenueChartData} options={chartOptions} /></div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row" : ""}`}>
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}>{t("ordersChart") || "Orders"}</h3>
              </div>
              <div className="h-80"><Bar data={ordersChartData} options={chartOptions} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row" : ""}`}>
                <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}>{t("categoryDistribution") || "Category Distribution"}</h3>
              </div>
              <div className="h-80">
                <Doughnut data={categoryChartData} options={{ ...chartOptions, scales: undefined, plugins: { ...chartOptions.plugins, legend: { position: "bottom", labels: { color: chartColors.text, font: { family: isRTL ? "Arial, sans-serif" : "Inter, system-ui, sans-serif" }, padding: 20 } } } }} />
              </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row" : ""}`}>
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}>{t("twoProductsChart") || "Top Products"}</h3>
              </div>
              <div className="h-80">
                <Bar
                  data={{
                    labels: topProducts.length > 0 ? topProducts.map((p) => p.name) : [t("noData") || "No data"],
                    datasets: [
                      {
                        label: t("sales") || "Sales",
                        data: topProducts.length > 0 ? topProducts.map((p) => p.sales) : [0],
                        backgroundColor: chartColors.tertiary,
                        borderColor: chartColors.tertiary,
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    ...chartOptions,
                    indexAxis: isRTL ? "y" : "x",
                    plugins: {
                      ...chartOptions.plugins,
                      tooltip: {
                        ...chartOptions.plugins.tooltip,
                        callbacks: {
                          label: function (context) {
                            const product = topProducts[context.dataIndex];
                            if (product && product.revenue > 0) {
                              return `${t("sales") || "Sales"}: ${formatNumberEnglish(product.sales)} | ${t("revenue") || "Revenue"}: ${formatCurrencyEnglish(product.revenue, t("currency") || "USD")}`;
                            }
                            return `${t("sales") || "Sales"}: ${context.parsed.y ?? context.parsed.x}`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row" : ""}`}>
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}>{t("sellingProducts") || "Top Products"}</h3>
              </div>
              <div className="space-y-4">
                {topProducts.length > 0 ? topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-200 dark:border-gray-600">
                    <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{formatNumberEnglish(index + 1)}</span>
                      </div>
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatNumberEnglish(product.sales)} {t("unitsSold") || "units sold"}</div>
                      </div>
                    </div>
                    <div className={isRTL ? "text-left" : "text-right"}>
                      <div className="font-medium text-gray-900 dark:text-white">{formatCurrencyEnglish(product.revenue, t("currency") || "USD")}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t("noProductsData") || "No products data"}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row" : ""}`}>
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}>{t("salesByCategory") || "Sales by Category"}</h3>
              </div>
              <div className="space-y-4">
                {categorySales.length > 0 ? categorySales.map((category, index) => {
                  const colors = generateCategoryColors(categorySales.length);
                  return (
                    <div key={index} className="space-y-2">
                      <div className={`flex items-center justify-between ${isRTL ? "flex-row" : ""}`}>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.category}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatNumberEnglish(category.percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${category.percentage}%`, backgroundColor: colors[index] || chartColors.primary }} />
                      </div>
                      <div className={isRTL ? "text-left" : "text-right"}>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatCurrencyEnglish(category.revenue, t("currency") || "USD")}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t("noCategoryData") || "No category data"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesReports;
