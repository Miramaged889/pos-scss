import React from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  Users,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  Building,
  RotateCcw,
  Receipt,
} from "lucide-react";

import DashboardLayout from "../../components/Layout/DashboardLayout";
import ManagerHome from "./components/ManagerHome";
import UserManagement from "./components/SellerManagement";
import OrdersManagement from "./components/OrdersManagement";
import InvoicesManagement from "./components/InvoicesManagement";
import ManagerReports from "./components/ManagerReports";
import ManagerSettings from "./components/ManagerSettings";
import SuppliersManagement from "./components/SuppliersManagement";
import SupplierInvoicesManagement from "./components/SupplierInvoicesManagement";
import SupplierReturnsManagement from "./components/SupplierReturnsManagement";
import FinancialReceiptVoucher from "./components/FinancialReceiptVoucher";
import VouchersPage from "./components/VouchersPage";

const ManagerDashboard = () => {
  const { t } = useTranslation();

  const sidebarItems = [
    {
      key: "home",
      title: t("home"),
      href: "/manager",
      icon: Home,
    },
    {
      key: "users",
      title: t("users"),
      href: "/manager/users",
      icon: Users,
    },
    {
      key: "orders",
      title: t("orders"),
      href: "/manager/orders",
      icon: ShoppingCart,
    },
    {
      key: "invoices",
      title: t("invoices"),
      href: "/manager/invoices",
      icon: FileText,
    },
    {
      key: "financial-receipt",
      title: t("financialReceipt.title"),
      href: "/manager/financial-receipt",
      icon: Receipt,
    },
    {
      key: "vouchers",
      title: t("vouchers"),
      href: "/manager/vouchers",
      icon: FileText,
    },
    {
      key: "reports",
      title: t("reports"),
      href: "/manager/reports",
      icon: BarChart3,
    },
    {
      key: "suppliers",
      title: t("suppliers"),
      href: "/manager/suppliers",
      icon: Building,
    },
    {
      key: "supplier-invoices",
      title: t("supplierInvoices"),
      href: "/manager/supplier-invoices",
      icon: FileText,
    },
    {
      key: "supplier-returns",
      title: t("supplierReturns"),
      href: "/manager/supplier-returns",
      icon: RotateCcw,
    },
    {
      key: "settings",
      title: t("settings"),
      href: "/manager/settings",
      icon: Settings,
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <Routes>
        <Route path="/" element={<ManagerHome />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/orders" element={<OrdersManagement />} />
        <Route path="/invoices" element={<InvoicesManagement />} />
        <Route
          path="/financial-receipt"
          element={<FinancialReceiptVoucher />}
        />
        <Route path="/vouchers" element={<VouchersPage />} />
        <Route path="/reports" element={<ManagerReports />} />
        <Route path="/suppliers" element={<SuppliersManagement />} />
        <Route
          path="/supplier-invoices"
          element={<SupplierInvoicesManagement />}
        />
        <Route
          path="/supplier-returns"
          element={<SupplierReturnsManagement />}
        />
        <Route path="/settings" element={<ManagerSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
