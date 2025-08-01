import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Globe,
  Palette,
  Save,
  Eye,
  EyeOff,
  Key,
  Mail,
  Phone,
  MapPin,
  Building,
  Lock,
  Sun,
  Moon,
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  toggleLanguage,
  toggleTheme,
} from "../../../store/slices/languageSlice";

const ManagerSettings = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentLanguage, theme, isRTL } = useSelector(
    (state) => state.language
  );

  // Load profile data from localStorage or use defaults
  const loadProfileData = () => {
    const savedProfile = localStorage.getItem("managerProfile");
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (error) {
        console.error("Error parsing saved profile:", error);
      }
    }
    return {
      firstName: user?.firstName || "Manager",
      lastName: user?.lastName || "User",
      email: user?.email || "manager@company.com",
      phone: user?.phone || "+966 50 123 4567",
      address: user?.address || "Riyadh, Saudi Arabia",
      company: user?.company || "Sales & Delivery Management",
      bio:
        user?.bio ||
        "System Manager with 8 years of experience in operations management",
    };
  };

  const [profileData, setProfileData] = useState(loadProfileData);
  const [loading, setLoading] = useState(false);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderAlerts: true,
    sellerAlerts: true,
    paymentAlerts: true,
    systemAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    lowInventoryAlerts: true,
    performanceAlerts: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    showPassword: false,
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    language: "en",
    theme: "light",
    timezone: "Asia/Riyadh",
    dateFormat: "DD/MM/YYYY",
    currency: "SAR",
    decimalPlaces: 2,
    autoBackup: true,
    backupFrequency: "daily",
    autoRefresh: true,
    soundNotifications: false,
  });

  // Save profile data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("managerProfile", JSON.stringify(profileData));
  }, [profileData]);

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field) => {
    setNotificationSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSystemChange = (field, value) => {
    setSystemSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleLanguageToggle = () => {
    dispatch(toggleLanguage());
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleProfileSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(t("profileUpdated"));
      setLoading(false);
    }, 1000);
  };

  const handleNotificationSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(t("notificationSettingsUpdated"));
      setLoading(false);
    }, 1000);
  };

  const handleSecuritySave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(t("securitySettingsUpdated"));
      setLoading(false);
    }, 1000);
  };

  const handleSystemSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(t("systemSettingsUpdated"));
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className={isRTL ? "text-right" : "text-left"}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("settings")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageYourPreferences")}
          </p>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${
          isRTL ? "lg:grid-flow-col-dense" : ""
        }`}
      >
        {/* Main Content */}
        <div className={`lg:col-span-2 space-y-6 ${isRTL ? "lg:order-2" : ""}`}>
          {/* Profile Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
            <div
              className={`flex items-center gap-3 mb-6 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("personalInformation")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("firstName")}
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) =>
                    handleProfileChange("firstName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("lastName")}
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) =>
                    handleProfileChange("lastName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("email")}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed ${
                      isRTL ? "pr-10 pl-10 text-right" : "pl-10 pr-10 text-left"
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                  <Mail
                    className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 ${
                      isRTL ? "right-3" : "left-3"
                    }`}
                  />
                  <Lock
                    className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 ${
                      isRTL ? "left-3" : "right-3"
                    }`}
                  />
                </div>
                <p
                  className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("emailCannotBeChanged")}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("phone")}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      handleProfileChange("phone", e.target.value)
                    }
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                      isRTL ? "pr-10 text-right" : "pl-10 text-left"
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                  <Phone
                    className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 ${
                      isRTL ? "right-3" : "left-3"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("company")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) =>
                      handleProfileChange("company", e.target.value)
                    }
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                      isRTL ? "pr-10 text-right" : "pl-10 text-left"
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                  <Building
                    className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 ${
                      isRTL ? "right-3" : "left-3"
                    }`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("address")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) =>
                      handleProfileChange("address", e.target.value)
                    }
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                      isRTL ? "pr-10 text-right" : "pl-10 text-left"
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                  <MapPin
                    className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 ${
                      isRTL ? "right-3" : "left-3"
                    }`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("bio")}
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  placeholder={t("tellUsAboutYourself")}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
            </div>

            <div
              className={`flex mt-6 ${isRTL ? "justify-start" : "justify-end"}`}
            >
              <button
                onClick={handleProfileSave}
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <Save className="w-4 h-4" />
                {loading ? t("saving") : t("saveChanges")}
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
            <div
              className={`flex items-center gap-3 mb-6 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("notificationPreferences")}
              </h3>
            </div>

            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t(key)}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t(`${key}Description`)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      enabled
                        ? "bg-blue-600 dark:bg-blue-500"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                    dir="ltr"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        enabled
                          ? isRTL
                            ? "translate-x-1"
                            : "translate-x-6"
                          : isRTL
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div
              className={`flex mt-6 ${isRTL ? "justify-start" : "justify-end"}`}
            >
              <button
                onClick={handleNotificationSave}
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <Save className="w-4 h-4" />
                {loading ? t("saving") : t("saveChanges")}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`space-y-6 ${isRTL ? "lg:order-1" : ""}`}>
          {/* Language & Theme Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
            <div
              className={`flex items-center gap-3 mb-6 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Palette className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("languageAndPreferences")}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-2 ${
                    isRTL ? "flex-row" : ""
                  }`}
                >
                  <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("language")}
                  </label>
                </div>
                <button
                  onClick={handleLanguageToggle}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  {currentLanguage === "ar" ? "English" : "العربية"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-2 ${
                    isRTL ? "flex-row" : ""
                  }`}
                >
                  {theme === "light" ? (
                    <Sun className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("darkMode")}
                  </label>
                </div>
                <button
                  onClick={handleThemeToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    theme === "dark"
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                  dir="ltr"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      theme === "dark"
                        ? isRTL
                          ? "translate-x-1"
                          : "translate-x-6"
                        : isRTL
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("timezone")}
                </label>
                <select
                  value={systemSettings.timezone}
                  onChange={(e) =>
                    handleSystemChange("timezone", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Asia/Riyadh">Asia/Riyadh</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("currency")}
                </label>
                <select
                  value={systemSettings.currency}
                  onChange={(e) =>
                    handleSystemChange("currency", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="SAR">SAR (ريال)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
            <div
              className={`flex items-center gap-3 mb-6 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("security")}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("twoFactorAuth")}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("enable2FA")}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSecurityChange(
                      "twoFactorAuth",
                      !securitySettings.twoFactorAuth
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    securitySettings.twoFactorAuth
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                  dir="ltr"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      securitySettings.twoFactorAuth
                        ? isRTL
                          ? "translate-x-1"
                          : "translate-x-6"
                        : isRTL
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("sessionTimeout")} ({t("minutes")})
                </label>
                <select
                  value={securitySettings.sessionTimeout}
                  onChange={(e) =>
                    handleSecurityChange(
                      "sessionTimeout",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value={15}>15 {t("minutes")}</option>
                  <option value={30}>30 {t("minutes")}</option>
                  <option value={60}>1 {t("hour")}</option>
                  <option value={120}>2 {t("hours")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("maxLoginAttempts")}
                </label>
                <select
                  value={securitySettings.loginAttempts}
                  onChange={(e) =>
                    handleSecurityChange(
                      "loginAttempts",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div
                  className={`flex items-center gap-2 ${
                    isRTL ? "flex-row" : ""
                  }`}
                >
                  <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("password")}
                  </span>
                </div>
                <p
                  className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("passwordManagedByAdmin")}
                </p>
              </div>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div
                  className={`flex items-center gap-2 ${
                    isRTL ? "flex-row" : ""
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {t("accountSecure")}
                  </span>
                </div>
                <p
                  className={`text-xs text-green-600 dark:text-green-400 mt-1 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("lastLoginToday")}
                </p>
              </div>
            </div>

            <div
              className={`flex mt-6 ${isRTL ? "justify-start" : "justify-end"}`}
            >
              <button
                onClick={handleSecuritySave}
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <Save className="w-4 h-4" />
                {loading ? t("saving") : t("saveChanges")}
              </button>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
            <div
              className={`flex items-center gap-3 mb-6 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("systemPreferences")}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("dateFormat")}
                </label>
                <select
                  value={systemSettings.dateFormat}
                  onChange={(e) =>
                    handleSystemChange("dateFormat", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("decimalPlaces")}
                </label>
                <select
                  value={systemSettings.decimalPlaces}
                  onChange={(e) =>
                    handleSystemChange(
                      "decimalPlaces",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value={0}>0</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("backupFrequency")}
                </label>
                <select
                  value={systemSettings.backupFrequency}
                  onChange={(e) =>
                    handleSystemChange("backupFrequency", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="daily">{t("daily")}</option>
                  <option value="weekly">{t("weekly")}</option>
                  <option value="monthly">{t("monthly")}</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("autoBackup")}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("enableAutoBackup")}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSystemChange("autoBackup", !systemSettings.autoBackup)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    systemSettings.autoBackup
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                  dir="ltr"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      systemSettings.autoBackup
                        ? isRTL
                          ? "translate-x-1"
                          : "translate-x-6"
                        : isRTL
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("autoRefresh")}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("autoRefreshDescription")}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSystemChange(
                      "autoRefresh",
                      !systemSettings.autoRefresh
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    systemSettings.autoRefresh
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                  dir="ltr"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      systemSettings.autoRefresh
                        ? isRTL
                          ? "translate-x-1"
                          : "translate-x-6"
                        : isRTL
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("soundNotifications")}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("soundNotificationsDescription")}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSystemChange(
                      "soundNotifications",
                      !systemSettings.soundNotifications
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    systemSettings.soundNotifications
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                  dir="ltr"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      systemSettings.soundNotifications
                        ? isRTL
                          ? "translate-x-1"
                          : "translate-x-6"
                        : isRTL
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div
              className={`flex mt-6 ${isRTL ? "justify-start" : "justify-end"}`}
            >
              <button
                onClick={handleSystemSave}
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <Save className="w-4 h-4" />
                {loading ? t("saving") : t("saveChanges")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSettings;
