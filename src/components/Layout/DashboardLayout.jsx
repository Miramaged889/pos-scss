import React, { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  User,
} from "lucide-react";

import { logout } from "../../store/slices/authSlice";
import { toggleLanguage, toggleTheme } from "../../store/slices/languageSlice";

const DashboardLayout = ({ children, title, sidebarItems = [] }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const { user, role } = useSelector((state) => state.auth);
  const { currentLanguage, isRTL, theme } = useSelector(
    (state) => state.language
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setUserDropdownOpen(false);
  };

  const handleLanguageToggle = () => {
    dispatch(toggleLanguage());
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleSettingsClick = () => {
    navigate(`/${role}/settings`);
    setUserDropdownOpen(false);
  };

  // Initialize default seller profile if it doesn't exist
  const initializeProfile = () => {
    try {
      const profileKey =
        role === "kitchen" ? "kitchenProfile" : "sellerProfile";
      const existingProfile = localStorage.getItem(profileKey);
      if (!existingProfile) {
        const defaultProfile = [
          {
            id: 1,
            email: user?.email || `${role}@example.com`,
            firstName: role === "kitchen" ? "Kitchen" : "Seller",
            lastName: "User",
            name: `${role === "kitchen" ? "Kitchen" : "Seller"} User`,
            role: role,
            phone: "+966 50 123 4567",
            address: "Riyadh, Saudi Arabia",
            joinDate: new Date().toISOString(),
          },
        ];
        localStorage.setItem(profileKey, JSON.stringify(defaultProfile));
      }
    } catch (error) {
      console.error(`Error initializing ${role} profile:`, error);
    }
  };

  const getUserName = () => {
    try {
      // Get profile from localStorage based on role
      const profileKey =
        role === "kitchen" ? "kitchenProfile" : "sellerProfile";
      const profileData = localStorage.getItem(profileKey);

      if (profileData) {
        const profile = JSON.parse(profileData);

        let userProfile = null;

        // Handle both object and array formats
        if (Array.isArray(profile)) {
          // Array format: find by email or use first
          userProfile =
            profile.find((p) => p.email === user?.email) || profile[0];
        } else if (typeof profile === "object" && profile !== null) {
          // Direct object format
          userProfile = profile;
        }

        if (userProfile) {
          if (userProfile.name) return userProfile.name;
          if (userProfile.fullName) return userProfile.fullName;
          if (userProfile.firstName && userProfile.lastName) {
            return `${userProfile.firstName} ${userProfile.lastName}`;
          }
          if (userProfile.firstName) return userProfile.firstName;
          if (userProfile.lastName) return userProfile.lastName;
          if (userProfile.managerName) return userProfile.managerName;
        }
      } else {
        // Initialize profile if it doesn't exist
        initializeProfile();
      }
    } catch (error) {
      console.error(`Error reading ${role} profile from localStorage:`, error);
    }

    // Fallback to user data
    if (user?.name) return user.name;
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return t("user");
  };

  const getUserInitials = () => {
    const name = getUserName();
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
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
        } z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
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
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
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

            <div
              className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}
            >
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

              {/* User Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105 ${
                    isRTL ? "flex-row" : ""
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div
                    className={`hidden sm:block ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    <div className="font-medium">{getUserName()}</div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className={`absolute top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-2 z-50 ${
                      isRTL ? "left-0" : "right-0"
                    }`}
                  >
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row" : ""
                        }`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {getUserInitials()}
                          </span>
                        </div>
                        <div
                          className={`flex-1 min-w-0 ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {getUserName()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                            {t(role)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleSettingsClick}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                          isRTL ? "flex-row-reverse text-right" : "text-left"
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        {t("settings")}
                      </button>

                      <button
                        onClick={() => {
                          handleLanguageToggle();
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                          isRTL ? "flex-row-reverse text-right" : "text-left"
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        <span className="flex items-center gap-2">
                          {t("language")}:{" "}
                          {currentLanguage === "en" ? "العربية" : "English"}
                        </span>
                      </button>

                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 ${
                          isRTL ? "flex-row-reverse text-right" : "text-left"
                        }`}
                      >
                        <LogOut className="w-4 h-4" />
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                )}
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
