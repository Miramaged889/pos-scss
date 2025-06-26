import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  Truck,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  Navigation,
  Phone,
  CreditCard,
  Banknote,
  AlertCircle,
  Route as RouteIcon,
} from "lucide-react";

import DashboardLayout from "../components/Layout/DashboardLayout";
import StatsCard from "../components/Common/StatsCard";
import DataTable from "../components/Common/DataTable";
import { updateOrderStatus, assignDriver } from "../store/slices/ordersSlice";

const DeliveryDashboard = () => {
  const { t } = useTranslation();

  const sidebarItems = [
    {
      name: t("myOrders"),
      icon: Truck,
      href: "/delivery/orders",
      current: false,
    },
    {
      name: t("trackLocation"),
      icon: MapPin,
      href: "/delivery/location",
      current: false,
    },
    {
      name: "الدفعات",
      icon: DollarSign,
      href: "/delivery/payments",
      current: false,
    },
  ];

  return (
    <DashboardLayout title={t("delivery")} sidebarItems={sidebarItems}>
      <Routes>
        <Route path="/" element={<DeliveryHome />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/location" element={<LocationTracking />} />
        <Route path="/payments" element={<PaymentCollection />} />
        <Route path="/reports" element={<DeliveryReports />} />
      </Routes>
    </DashboardLayout>
  );
};

// Delivery Dashboard Home
const DeliveryHome = () => {
  const { t } = useTranslation();
  const { orders } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  // Mock driver name (in real app, this would come from user profile)
  const driverName = "سعد الأحمد";

  // Filter orders assigned to this driver
  const myOrders = orders.filter(
    (order) =>
      order.assignedDriver === driverName ||
      (order.status === "ready" && !order.assignedDriver)
  );

  const todaysOrders = myOrders.filter(
    (order) =>
      new Date(order.createdAt).toDateString() === new Date().toDateString()
  );

  const completedToday = todaysOrders.filter(
    (order) => order.status === "completed"
  );
  const pendingDeliveries = myOrders.filter((order) =>
    ["ready", "preparing"].includes(order.status)
  );
  const totalEarnings = completedToday.reduce(
    (sum, order) => sum + order.total * 0.1,
    0
  ); // 10% commission

  const stats = [
    {
      title: "طلبات اليوم",
      value: todaysOrders.length,
      icon: Truck,
      color: "blue",
    },
    {
      title: t("deliveriesCompleted"),
      value: completedToday.length,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: t("pendingDeliveries"),
      value: pendingDeliveries.length,
      icon: Clock,
      color: "yellow",
    },
    {
      title: "الأرباح اليوم",
      value: `${totalEarnings.toFixed(2)} ر.س`,
      icon: DollarSign,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Driver Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-900">
              مرحباً {driverName}
            </h3>
            <p className="text-sm text-blue-700">حالة النشاط: متاح للتوصيل</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-sm text-green-600">متصل</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          إجراءات سريعة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Truck className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">طلباتي</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <MapPin className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">
              تتبع الموقع
            </span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <DollarSign className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">الدفعات</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
            <RouteIcon className="w-6 h-6 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-yellow-900">المسار</span>
          </button>
        </div>
      </div>

      {/* Active Orders */}
      <MyOrders isHome={true} />
    </div>
  );
};

// My Orders Component
const MyOrders = ({ isHome = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Mock driver name
  const driverName = "سعد الأحمد";

  // Filter orders for this driver
  const myOrders = orders.filter(
    (order) =>
      order.assignedDriver === driverName ||
      (order.status === "ready" && !order.assignedDriver)
  );

  const displayOrders = isHome
    ? myOrders.filter((order) => order.status !== "completed").slice(0, 6)
    : myOrders;

  const handleAcceptOrder = (orderId) => {
    dispatch(assignDriver({ orderId, driverName }));
    toast.success("تم قبول الطلب");
  };

  const handleStartDelivery = (orderId) => {
    dispatch(updateOrderStatus({ orderId, status: "delivering" }));
    toast.success("تم بدء التوصيل");
  };

  const handleCompleteDelivery = (orderId) => {
    dispatch(updateOrderStatus({ orderId, status: "completed" }));
    toast.success("تم إكمال التوصيل");
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "delivering":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const openLocationModal = (order) => {
    setSelectedOrder(order);
    setShowLocationModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {isHome ? "طلبات نشطة" : t("myOrders")}
        </h3>
        {isHome && displayOrders.length > 0 && (
          <span className="text-sm text-gray-500">
            {displayOrders.length} طلب نشط
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            {/* Order Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  طلب #{order.id}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${getOrderStatusColor(
                    order.status
                  )}`}
                >
                  {order.status === "ready"
                    ? "جاهز للتوصيل"
                    : order.status === "delivering"
                    ? "جاري التوصيل"
                    : order.status === "completed"
                    ? "مكتمل"
                    : "في الانتظار"}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleTimeString("ar-SA")}
              </span>
            </div>

            {/* Customer Info */}
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.customer}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.deliveryAddress}
                  </p>
                </div>
                {order.customerPhone && (
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <div className="space-y-1">
                {order.products.slice(0, 2).map((product, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {product.quantity}x {product.name}
                    </span>
                  </div>
                ))}
                {order.products.length > 2 && (
                  <p className="text-xs text-gray-500">
                    +{order.products.length - 2} منتج أخر
                  </p>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    الإجمالي: {order.total} ر.س
                  </span>
                  <span className="text-xs text-green-600">
                    عمولة: {(order.total * 0.1).toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => openLocationModal(order)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                الموقع
              </button>

              {!order.assignedDriver && order.status === "ready" && (
                <button
                  onClick={() => handleAcceptOrder(order.id)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  قبول الطلب
                </button>
              )}

              {order.assignedDriver === driverName &&
                order.status === "ready" && (
                  <button
                    onClick={() => handleStartDelivery(order.id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    بدء التوصيل
                  </button>
                )}

              {order.status === "delivering" && (
                <button
                  onClick={() => handleCompleteDelivery(order.id)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  إكمال التوصيل
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {displayOrders.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد طلبات متاحة</p>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              موقع التوصيل
            </h3>

            {/* Mock map */}
            <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">خريطة تفاعلية</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedOrder.deliveryAddress}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span className="text-sm">المسافة: 3.2 كم</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm">الوقت المتوقع: 12 دقيقة</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  // Open navigation app
                  const address = encodeURIComponent(
                    selectedOrder.deliveryAddress
                  );
                  window.open(
                    `https://www.google.com/maps/search/${address}`,
                    "_blank"
                  );
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                فتح الخرائط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Location Tracking Component
const LocationTracking = () => {
  const [currentLocation, setCurrentLocation] = useState({
    lat: 24.7136,
    lng: 46.6753,
    address: "الرياض، المملكة العربية السعودية",
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          الموقع الحالي
        </h3>

        {/* Mock GPS Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-blue-900">GPS متصل</p>
              <p className="text-xs text-blue-700">آخر تحديث: منذ 2 ثانية</p>
            </div>
          </div>
        </div>

        {/* Mock Map */}
        <div className="bg-gray-100 h-64 rounded-lg mb-4 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">خريطة تفاعلية</p>
            <p className="text-sm text-gray-500">{currentLocation.address}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">خط العرض</p>
            <p className="text-sm font-medium">{currentLocation.lat}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">خط الطول</p>
            <p className="text-sm font-medium">{currentLocation.lng}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Collection Component
const PaymentCollection = () => {
  const { orders } = useSelector((state) => state.orders);
  const [payments, setPayments] = useState([
    {
      id: 1,
      orderId: 1,
      customer: "أحمد محمد",
      amount: 65,
      method: "cash",
      collected: true,
      date: new Date().toISOString(),
    },
    {
      id: 2,
      orderId: 2,
      customer: "فاطمة السعد",
      amount: 55,
      method: "digital",
      collected: true,
      date: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const totalCollected = payments
    .filter((p) => p.collected)
    .reduce((sum, p) => sum + p.amount, 0);

  const paymentColumns = [
    {
      header: "رقم الطلب",
      accessor: "orderId",
      render: (payment) => `#${payment.orderId}`,
    },
    {
      header: "العميل",
      accessor: "customer",
    },
    {
      header: "المبلغ",
      accessor: "amount",
      render: (payment) => `${payment.amount} ر.س`,
    },
    {
      header: "طريقة الدفع",
      accessor: "method",
      render: (payment) => (
        <div className="flex items-center gap-2">
          {payment.method === "cash" ? (
            <>
              <Banknote className="w-4 h-4 text-green-600" />
              <span>نقدي</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>إلكتروني</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: "الحالة",
      accessor: "collected",
      render: (payment) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            payment.collected
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {payment.collected ? "تم التحصيل" : "في الانتظار"}
        </span>
      ),
    },
    {
      header: "التاريخ",
      accessor: "date",
      render: (payment) => new Date(payment.date).toLocaleString("ar-SA"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">إجمالي المحصل</p>
              <p className="text-2xl font-bold text-green-700">
                {totalCollected} ر.س
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">نقدي</p>
              <p className="text-xl font-bold text-blue-700">
                {payments
                  .filter((p) => p.method === "cash" && p.collected)
                  .reduce((sum, p) => sum + p.amount, 0)}{" "}
                ر.س
              </p>
            </div>
            <Banknote className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">إلكتروني</p>
              <p className="text-xl font-bold text-purple-700">
                {payments
                  .filter((p) => p.method === "digital" && p.collected)
                  .reduce((sum, p) => sum + p.amount, 0)}{" "}
                ر.س
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <DataTable
        data={payments}
        columns={paymentColumns}
        emptyMessage="لا توجد دفعات"
      />
    </div>
  );
};

// Delivery Reports Component
const DeliveryReports = () => {
  const { t } = useTranslation();
  const { orders } = useSelector((state) => state.orders);

  // Mock driver name
  const driverName = "سعد الأحمد";

  const myOrders = orders.filter(
    (order) => order.assignedDriver === driverName
  );
  const todaysDeliveries = myOrders.filter(
    (order) =>
      new Date(order.createdAt).toDateString() === new Date().toDateString()
  );

  const completedDeliveries = todaysDeliveries.filter(
    (order) => order.status === "completed"
  );
  const pendingDeliveries = myOrders.filter((order) =>
    ["ready", "delivering"].includes(order.status)
  );
  const totalEarnings = completedDeliveries.reduce(
    (sum, order) => sum + order.total * 0.1,
    0
  );

  const reportStats = [
    {
      title: t("deliveriesCompleted"),
      value: completedDeliveries.length,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: t("pendingDeliveries"),
      value: pendingDeliveries.length,
      icon: Clock,
      color: "yellow",
    },
    {
      title: t("paymentsCollected"),
      value: `${totalEarnings.toFixed(2)} ر.س`,
      icon: DollarSign,
      color: "blue",
    },
    {
      title: t("deliveryTimeAvg"),
      value: "15 دقيقة",
      icon: Clock,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {t("dailyReport")} - التوصيل
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          أداء التوصيل الأسبوعي
        </h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">رسم بياني لأداء التوصيل</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
