import React from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  Users,
  ShoppingCart,
  FileText,
  BarChart3,
  Building,
  RotateCcw,
  Receipt,
  CreditCard,
} from "lucide-react";

import DashboardLayout from "../../components/Layout/DashboardLayout";
import ManagerHome from "./components/ManagerHome";
import UserManagement from "./components/SellerManagement";
import PaymentMethodsManagement from "./components/PaymentMethodsManagement";
import OrdersManagement from "./components/OrdersManagement";
import InvoicesManagement from "./components/InvoicesManagement";
import ManagerReports from "./components/ManagerReports";
import SuppliersManagement from "./components/SuppliersManagement";
import SupplierInvoicesManagement from "./components/SupplierInvoicesManagement";
import SupplierReturnsManagement from "./components/SupplierReturnsManagement";
import FinancialReceiptVoucher from "./components/FinancialReceiptVoucher";
import VouchersPage from "./components/VouchersPage";
import BranchesManagement from "./components/BranchesManagement";

const ManagerDashboard = () => {
  const { t } = useTranslation();


  const sidebarItems = [
    {
      key: "home",
      title: t("home"),
      href: "/manager/home",
      icon: Home,
    },
    {
      key: "users",
      title: t("users"),
      href: "/manager/users",
      icon: Users,
    },
    {
      key: "branches",
      title: t("branches"),
      href: "/manager/branches",
      icon: Building,
    },
    {
      key: "payment-methods",
      title: t("paymentMethods"),
      href: "/manager/payment-methods",
      icon: CreditCard,
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
      href: "/manager/suppliers-management",
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
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <Routes>
        <Route index element={<ManagerHome />} />
        <Route path="/home" element={<ManagerHome />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="payment-methods" element={<PaymentMethodsManagement />} />
        <Route path="branches" element={<BranchesManagement />} />
        <Route path="orders" element={<OrdersManagement />} />
        <Route path="invoices" element={<InvoicesManagement />} />
        <Route path="financial-receipt" element={<FinancialReceiptVoucher />} />
        <Route path="vouchers" element={<VouchersPage />} />
        <Route path="reports" element={<ManagerReports />} />
        <Route path="suppliers-management" element={<SuppliersManagement />} />
        <Route
          path="supplier-invoices"
          element={<SupplierInvoicesManagement />}
        />
        <Route
          path="supplier-returns"
          element={<SupplierReturnsManagement />}
        />
      </Routes>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
