import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  Globe,
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  ChefHat,
  Truck,
  Sun,
  Moon,
} from "lucide-react";

import { logout } from "../../store/slices/authSlice";
import { toggleLanguage, toggleTheme } from "../../store/slices/languageSlice";

const DashboardLayout = ({ children, title, sidebarItems = [] }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const { user, role } = useSelector((state) => state.auth);
  const { currentLanguage, isRTL, theme } = useSelector(
    (state) => state.language
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleLanguageToggle = () => {
    dispatch(toggleLanguage());
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "seller":
        return <ShoppingCart className="w-5 h-5" />;
      case "kitchen":
        return <ChefHat className="w-5 h-5" />;
      case "delivery":
        return <Truck className="w-5 h-5" />;
      default:
        return <Home className="w-5 h-5" />;
    }
  };

  const getRoleTitle = (role) => {
    switch (role) {
      case "seller":
        return t("sellerDashboard");
      case "kitchen":
        return t("kitchenDashboard");
      case "delivery":
        return t("deliveryDashboard");
      default:
        return t("dashboard");
    }
  };

  // Check if a link is active
  const isLinkActive = (href) => {
    if (href === `/${role}`) {
      return (
        location.pathname === `/${role}` || location.pathname === `/${role}/`
      );
    }
    return location.pathname.startsWith(href);
  };

  const allSidebarItems = sidebarItems;

  return (
    <div
      className={`flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full"
            : "-translate-x-full"
        } fixed inset-y-0 ${
          isRTL ? "right-0" : "left-0"
        } z-50 w-64 bg-white dark:bg-gray-800 shadow-lg dark:shadow-soft-dark transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              {getRoleIcon(role)}
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {getRoleTitle(role)}
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-5 px-2 space-y-1">
          {allSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = isLinkActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg border-l-4 transition-all duration-200 hover:scale-[1.02]`}
              >
                <Icon
                  className={`${
                    isRTL ? "ml-3" : "mr-3"
                  } w-5 h-5 transition-transform group-hover:scale-110`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={handleThemeToggle}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
                title={
                  theme === "light"
                    ? t("switchToDarkMode")
                    : t("switchToLightMode")
                }
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>

              {/* Language Toggle */}
              <button
                onClick={handleLanguageToggle}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <Globe className="w-4 h-4" />
                {currentLanguage === "en" ? "العربية" : "English"}
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:inline">{user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("logout")}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="container mx-auto px-4 py-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
