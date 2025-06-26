import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  ChefHat,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Timer,
  Package,
} from "lucide-react";

import DashboardLayout from "../components/Layout/DashboardLayout";
import StatsCard from "../components/Common/StatsCard";
import DataTable from "../components/Common/DataTable";
import { updateOrderStatus, refreshOrders } from "../store/slices/ordersSlice";

const KitchenDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Auto-refresh every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(refreshOrders());
    }, 20000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const sidebarItems = [
    {
      name: t("todaysOrders"),
      icon: ChefHat,
      href: "/kitchen/orders",
      current: false,
    },
    {
      name: "سجل الإهدار",
      icon: Package,
      href: "/kitchen/waste-log",
      current: false,
    },
  ];

  return (
    <DashboardLayout title={t("kitchen")} sidebarItems={sidebarItems}>
      <Routes>
        <Route path="/" element={<KitchenHome />} />
        <Route path="/orders" element={<TodaysOrders />} />
        <Route path="/waste-log" element={<WasteLog />} />
        <Route path="/reports" element={<KitchenReports />} />
      </Routes>
    </DashboardLayout>
  );
};

// Kitchen Dashboard Home
const KitchenHome = () => {
  const { orders } = useSelector((state) => state.orders);

  // Filter today's orders
  const todayOrders = orders.filter(
    (order) =>
      new Date(order.createdAt).toDateString() === new Date().toDateString()
  );

  const preparingOrders = todayOrders.filter(
    (order) => order.status === "preparing"
  );
  const readyOrders = todayOrders.filter((order) => order.status === "ready");
  const pendingOrders = todayOrders.filter(
    (order) => order.status === "pending"
  );

  // Calculate average preparation time (mock data)
  const avgPrepTime = 18; // minutes

  const stats = [
    {
      title: "طلبات في الانتظار",
      value: pendingOrders.length,
      icon: Clock,
      color: "yellow",
    },
    {
      title: "قيد التحضير",
      value: preparingOrders.length,
      icon: ChefHat,
      color: "blue",
    },
    {
      title: "جاهز للتوصيل",
      value: readyOrders.length,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "متوسط وقت التحضير",
      value: `${avgPrepTime} دقيقة`,
      icon: Timer,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Auto-refresh notification */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <RefreshCw className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-sm text-blue-800">
            يتم تحديث الطلبات تلقائياً كل 20 ثانية
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Today's Orders Overview */}
      <TodaysOrders isHome={true} />
    </div>
  );
};

// Today's Orders Component
const TodaysOrders = ({ isHome = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [notes, setNotes] = useState("");

  // Filter and sort today's orders by time
  const todayOrders = orders
    .filter(
      (order) =>
        new Date(order.createdAt).toDateString() === new Date().toDateString()
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const displayOrders = isHome ? todayOrders.slice(0, 8) : todayOrders;

  const handleStatusUpdate = (orderId) => {
    setSelectedOrder(orderId);
    setStatusUpdateModal(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedOrder) {
      dispatch(
        updateOrderStatus({
          orderId: selectedOrder,
          status: getNextStatus(
            orders.find((o) => o.id === selectedOrder)?.status
          ),
          notes: notes,
        })
      );

      toast.success(t("orderUpdated"));
      setStatusUpdateModal(false);
      setSelectedOrder(null);
      setNotes("");
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return "preparing";
      case "preparing":
        return "ready";
      case "ready":
        return "completed";
      default:
        return currentStatus;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "preparing":
        return <ChefHat className="w-4 h-4" />;
      case "ready":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getOrderPriority = (order) => {
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const hoursDiff = (now - orderTime) / (1000 * 60 * 60);

    if (hoursDiff > 1) return "high";
    if (hoursDiff > 0.5) return "medium";
    return "normal";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {isHome ? "طلبات اليوم" : t("todaysOrders")}
        </h3>
        {isHome && (
          <span className="text-sm text-gray-500">
            عرض {displayOrders.length} من {todayOrders.length} طلب
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayOrders.map((order) => {
          const priority = getOrderPriority(order);
          return (
            <div
              key={order.id}
              className={`bg-white rounded-lg shadow-sm border-2 p-4 ${
                priority === "high"
                  ? "border-red-200 bg-red-50"
                  : priority === "medium"
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-gray-200"
              }`}
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    طلب #{order.id}
                  </span>
                  {priority === "high" && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleTimeString("ar-SA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Customer Info */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900">
                  {order.customer}
                </p>
                {order.customerPhone && (
                  <p className="text-xs text-gray-500">{order.customerPhone}</p>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <div className="space-y-1">
                  {order.products.map((product, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {product.quantity}x {product.name}
                      </span>
                    </div>
                  ))}
                </div>
                {order.kitchenNotes && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                    <strong>ملاحظة:</strong> {order.kitchenNotes}
                  </div>
                )}
              </div>

              {/* Status and Action */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  {t(order.status)}
                </span>

                {order.status !== "completed" && (
                  <button
                    onClick={() => handleStatusUpdate(order.id)}
                    className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {order.status === "pending"
                      ? "بدء التحضير"
                      : order.status === "preparing"
                      ? "جاهز"
                      : order.status === "ready"
                      ? "تم التوصيل"
                      : ""}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {displayOrders.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد طلبات اليوم</p>
        </div>
      )}

      {/* Status Update Modal */}
      {statusUpdateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              تحديث حالة الطلب
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أي ملاحظات خاصة بالطلب..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStatusUpdateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                تأكيد التحديث
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Waste Log Component
const WasteLog = () => {
  const [wasteItems] = useState([
    {
      id: 1,
      product: "برجر لحم",
      quantity: 2,
      reason: "تلف",
      date: new Date().toISOString(),
      cost: 50,
    },
    {
      id: 2,
      product: "سلطة خضراء",
      quantity: 1,
      reason: "انتهاء الصلاحية",
      date: new Date(Date.now() - 86400000).toISOString(),
      cost: 20,
    },
  ]);

  const wasteColumns = [
    {
      header: "المنتج",
      accessor: "product",
    },
    {
      header: "الكمية",
      accessor: "quantity",
    },
    {
      header: "السبب",
      accessor: "reason",
    },
    {
      header: "التاريخ",
      accessor: "date",
      render: (item) => new Date(item.date).toLocaleDateString("ar-SA"),
    },
    {
      header: "التكلفة",
      accessor: "cost",
      render: (item) => `${item.cost} ر.س`,
    },
  ];

  const totalWasteCost = wasteItems.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-red-900">إجمالي الإهدار</h3>
            <p className="text-2xl font-bold text-red-700">
              {totalWasteCost} ر.س
            </p>
          </div>
          <Package className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <DataTable
        data={wasteItems}
        columns={wasteColumns}
        emptyMessage="لا توجد عناصر مهدرة"
      />
    </div>
  );
};

// Kitchen Reports Component
const KitchenReports = () => {
  const { t } = useTranslation();
  const { orders } = useSelector((state) => state.orders);

  const todayOrders = orders.filter(
    (order) =>
      new Date(order.createdAt).toDateString() === new Date().toDateString()
  );

  const preparedOrders = todayOrders.filter((order) =>
    ["preparing", "ready", "completed"].includes(order.status)
  ).length;

  const delayedOrders = 2; // Mock data
  const avgTime = 18; // Mock data

  const reportStats = [
    {
      title: t("ordersPreapred"),
      value: preparedOrders,
      icon: ChefHat,
      color: "green",
    },
    {
      title: t("delayedOrders"),
      value: delayedOrders,
      icon: AlertTriangle,
      color: "red",
    },
    {
      title: t("averageTime"),
      value: `${avgTime} دقيقة`,
      icon: Timer,
      color: "blue",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {t("dailyReport")} - المطبخ
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Additional report content can be added here */}
    </div>
  );
};

export default KitchenDashboard;
