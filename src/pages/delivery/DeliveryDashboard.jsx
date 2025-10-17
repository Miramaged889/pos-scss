import React from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Truck, DollarSign, Clock, List, Home } from "lucide-react";

import DashboardLayout from "../../components/Layout/DashboardLayout";
import DeliveryHome from "./components/DeliveryHome";
import MyOrders from "./components/MyOrders";
import PaymentCollection from "./components/PaymentCollection";
import DeliveryReports from "./components/DeliveryReports";
import OrderDetails from "./components/OrderDetails";
import AllOrders from "./components/AllOrders";

const DeliveryDashboard = () => {
  const { t } = useTranslation();

  const sidebarItems = [
    {
      name: t("home"),
      icon: Home,
      href: "/delivery/home",
      current: false,
    },
    {
      name: t("myOrders"),
      icon: Truck,
      href: "/delivery/my-orders",
      current: false,
    },
    {
      name: t("allOrders"),
      icon: List,
      href: "/delivery/all-orders",
      current: false,
    },
    {
      name: t("payments"),
      icon: DollarSign,
      href: "/delivery/payments",
      current: false,
    },
    {
      name: t("reports"),
      icon: Clock,
      href: "/delivery/reports",
      current: false,
    },
  ];

  return (
    <DashboardLayout title={t("delivery")} sidebarItems={sidebarItems}>
      <Routes>
        <Route path="/home" element={<DeliveryHome />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/all-orders" element={<AllOrders />} />
        <Route path="/payments" element={<PaymentCollection />} />
        <Route path="/reports" element={<DeliveryReports />} />
        <Route path="/order/:orderId" element={<OrderDetails />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DeliveryDashboard;
