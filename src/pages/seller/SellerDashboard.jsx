import React from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Package,
  Users,
  FileText,
  TrendingUp,
  BarChart3,
  Plus,
  Settings,
  Receipt,
  Building,
  RotateCcw,
  RefreshCw,
  FileSpreadsheet,
  ReceiptText,
  Store,
} from "lucide-react";

import DashboardLayout from "../../components/Layout/DashboardLayout";

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
import CartPage from "./components/CartPage";
import FinancialReceiptVoucher from "./components/FinancialReceiptVoucher";
import SellerSuppliersManagement from "./components/SellerSuppliersManagement";
import SellerInvoicesManagement from "./components/SellerInvoicesManagement";
import SellerReturnsManagement from "./components/SellerReturnsManagement";
import VouchersPage from "./components/VouchersPage";

const SellerDashboard = () => {
  const { t } = useTranslation();


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
      href: "/seller/product-selection",
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
      name: t("invoicesofcustomer"),
      icon: ReceiptText,
      href: "/seller/invoices",
      current: false,
    },
    {
      name: t("returnsofcustomer"),
      icon: RefreshCw,
      href: "/seller/returns",
      current: false,
    },
    {
      name: t("financialReceipt.title"),
      icon: Receipt,
      href: "/seller/financial-receipt",
      current: false,
    },

    {
      name: t("suppliers"),
      icon: Building,
      href: "/seller/suppliers-management",
      current: false,
    },
    {
      name: t("supplierPurchase"),
      icon: Store,
      href: "/seller/supplier-purchase",
      current: false,
    },
    {
      name: t("invoicesofsupplier"),
      icon: FileSpreadsheet,
      href: "/seller/invoices-management",
      current: false,
    },
    {
      name: t("returnsofsupplier"),
      icon: RotateCcw,
      href: "/seller/returns-management",
      current: false,
    },
    {
      name: t("vouchers"),
      icon: FileText,
      href: "/seller/vouchers",
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
        <Route path="/product-selection" element={<ProductSelectionPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersList />} />
        <Route path="/inventory" element={<InventoryManagement />} />
        <Route path="/customers" element={<CustomerManagement />} />
        <Route path="/invoices" element={<PaymentManagement />} />
        <Route path="/returns" element={<ReturnsManagement />} />
        <Route
          path="/suppliers-management"
          element={<SellerSuppliersManagement />}
        />
        <Route path="/supplier-purchase" element={<SupplierPurchase />} />
        <Route path="/reports" element={<SalesReports />} />
        <Route
          path="/invoices-management"
          element={<SellerInvoicesManagement />}
        />
        <Route
          path="/returns-management"
          element={<SellerReturnsManagement />}
        />
        <Route
          path="/financial-receipt"
          element={<FinancialReceiptVoucher />}
        />
        <Route path="/vouchers" element={<VouchersPage />} />
        <Route path="/settings" element={<SellerSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default SellerDashboard;
