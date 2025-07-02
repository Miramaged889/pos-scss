import React from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Package,
  Users,
  FileText,
  ArrowLeft,
  TrendingUp,
  CreditCard,
  BarChart3,
  Plus,
  Settings,
} from "lucide-react";

import DashboardLayout from "../../components/Layout/DashboardLayout";
import { useAutoRefresh } from "../../hooks";

// Import seller components
import SellerHome from "./components/SellerHome";
import CheckoutPage from "./components/CheckoutPage";
import OrdersList from "./components/OrdersList";
import InventoryManagement from "./components/InventoryManagement";
import CustomerManagement from "./components/CustomerManagement";
import ReturnsManagement from "./components/ReturnsManagement";
import SupplierPurchase from "./components/SupplierPurchase";
import SalesReports from "./components/SalesReports";
import PaymentManagement from "./components/PaymentManagement";
import SellerSettings from "./components/SellerSettings";
import ProductSelectionPage from "./components/ProductSelectionPage";

const SellerDashboard = () => {
  const { t } = useTranslation();

  // Auto-refresh every 30 seconds
  useAutoRefresh(() => {
    // Refresh orders and inventory data
    console.log("Auto-refreshing seller data...");
  }, 30000);

  const sidebarItems = [
    {
      name: t("dashboard"),
      icon: BarChart3,
      href: "/seller/home",
      current: false,
    },
        {
          name: t("newSalesOrder"),
          icon: Plus,
          href: "/seller",
          current: false,
        },
    {
      name: t("orders"),
      icon: ShoppingCart,
      href: "/seller/orders",
      current: false,
    },
    {
      name: t("inventory"),
      icon: Package,
      href: "/seller/inventory",
      current: false,
    },
    {
      name: t("customers"),
      icon: Users,
      href: "/seller/customers",
      current: false,
    },
    {
      name: t("invoices"),
      icon: CreditCard,
      href: "/seller/invoices",
      current: false,
    },
    {
      name: t("returns"),
      icon: ArrowLeft,
      href: "/seller/returns",
      current: false,
    },
    {
      name: t("supplierPurchase"),
      icon: FileText,
      href: "/seller/supplier-purchase",
      current: false,
    },
    {
      name: t("reports"),
      icon: TrendingUp,
      href: "/seller/reports",
      current: false,
    },
    {
      name: t("settings"),
      icon: Settings,
      href: "/seller/settings",
      current: false,
    },
  ];

  return (
    <DashboardLayout title={t("sellerDashboard")} sidebarItems={sidebarItems}>
      <Routes>
        <Route path="/home" element={<SellerHome />} />
        <Route path="/" element={<ProductSelectionPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersList />} />
        <Route path="/inventory" element={<InventoryManagement />} />
        <Route path="/customers" element={<CustomerManagement />} />
        <Route path="/invoices" element={<PaymentManagement />} />
        <Route path="/returns" element={<ReturnsManagement />} />
        <Route path="/supplier-purchase" element={<SupplierPurchase />} />
        <Route path="/reports" element={<SalesReports />} />
        <Route path="/settings" element={<SellerSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default SellerDashboard;
