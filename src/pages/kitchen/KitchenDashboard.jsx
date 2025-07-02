import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  ChefHat,
  Clock,
  Package,
  BarChart3,
  Settings,
  ClipboardList,
  ListFilter,
} from "lucide-react";

import DashboardLayout from "../../components/Layout/DashboardLayout";
import KitchenHome from "./components/KitchenHome";
import ActiveOrders from "./components/ActiveOrders";

import KitchenReports from "./components/KitchenReports";
import KitchenSettings from "./components/KitchenSettings";
import AllOrders from "./components/AllOrders";
import { refreshOrders } from "../../store/slices/ordersSlice";

const KitchenDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.language);

  // Auto-refresh every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(refreshOrders());
    }, 20000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const sidebarItems = [
    {
      name: t("dashboard"),
      icon: ChefHat,
      href: "/kitchen/home",
      current: false,
    },
    {
      name: t("activeOrders"),
      icon: ClipboardList,
      href: "/kitchen",
      current: false,
    },
    {
      name: t("allOrders"),
      icon: ListFilter,
      href: "/kitchen/all-orders",
      current: false,
    },

    {
      name: t("reports"),
      icon: BarChart3,
      href: "/kitchen/reports",
      current: false,
    },
    {
      name: t("settings"),
      icon: Settings,
      href: "/kitchen/settings",
      current: false,
    },
  ];

  return (
    <DashboardLayout
      title={t("kitchenDashboard")}
      sidebarItems={sidebarItems}
      theme={theme}
    >
      <Routes>
        <Route path="/home" element={<KitchenHome />} />
        <Route path="/" element={<ActiveOrders />} />
        <Route path="/all-orders" element={<AllOrders />} />

        <Route path="/reports" element={<KitchenReports />} />
        <Route path="/settings" element={<KitchenSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default KitchenDashboard;
