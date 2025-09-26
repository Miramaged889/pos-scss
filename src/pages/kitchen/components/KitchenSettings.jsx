import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Bell,
  Volume2,
  VolumeX,
  RefreshCw,
  Palette,
  Monitor,
  Save,
  RotateCcw,
  User,
  Phone,
  MapPin,
  Building,
  Shield,
  Mail,
  Lock,
  ChefHat,
  Clock,
} from "lucide-react";

import { toggleTheme, setLanguage } from "../../../store/slices/languageSlice";

const KitchenSettings = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { theme, currentLanguage, isRTL } = useSelector(
    (state) => state.language
  );
  const { user } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    kitchenName: user?.kitchenName || "المطبخ الرئيسي",
    managerName: user?.managerName || "محمد أحمد",
    phone: user?.phone || "+966501234567",
    location: user?.location || "المطبخ المركزي - الطابق الأول",
    capacity: user?.capacity || "50 طلب/ساعة",
    description:
      user?.description || "مطبخ متخصص في تحضير الوجبات السريعة والمشويات",
  });
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [kitchenSettings, setKitchenSettings] = useState({
    autoRefresh: true,
    refreshInterval: 20,
    soundNotifications: true,
    notificationVolume: 70,
    showPriorityAlerts: true,
    priorityThreshold: 30,
    maxOrdersPerView: 12,
    compactView: false,
    showCustomerPhone: true,
    showOrderNotes: true,
    autoMarkReady: false,
    confirmStatusUpdates: true,
  });

  // Settings are now managed in component state only

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const updateSetting = (key, value) => {
    setKitchenSettings((prev) => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const handleLanguageChange = (lang) => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  // Save settings (now managed in component state)
  const saveSettings = () => {
    // Settings are now managed in component state
    setUnsavedChanges(false);
  };

  // Reset settings to default
  const resetSettings = () => {
    setKitchenSettings({
      autoRefresh: true,
      refreshInterval: 20,
      soundNotifications: true,
      notificationVolume: 70,
      showPriorityAlerts: true,
      priorityThreshold: 30,
      maxOrdersPerView: 12,
      compactView: false,
      showCustomerPhone: true,
      showOrderNotes: true,
      autoMarkReady: false,
      confirmStatusUpdates: true,
    });
    setUnsavedChanges(true);
  };

  // Test notification sound
  const testNotificationSound = () => {
    if (kitchenSettings.soundNotifications) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = kitchenSettings.notificationVolume / 100;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div
          className={`flex items-center justify-between ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("kitchenSettings")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("customizeKitchenDashboard")}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetSettings}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("resetToDefaults")}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${
          isRTL ? "lg:grid-flow-col-dense" : ""
        }`}
      >
        {/* Kitchen Information */}
        <div className={`lg:col-span-2 space-y-6 ${isRTL ? "lg:order-2" : ""}`}>
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
            <div
              className={`flex items-center gap-3 mb-6 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ChefHat className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("kitchenInformation")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("kitchenName")}
                </label>
                <input
                  type="text"
                  value={profileData.kitchenName}
                  onChange={(e) =>
                    handleProfileChange("kitchenName", e.target.value)
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
                  {t("managerName")}
                </label>
                <input
                  type="text"
                  value={profileData.managerName}
                  onChange={(e) =>
                    handleProfileChange("managerName", e.target.value)
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
                  {t("phoneNumber")}
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
                  {t("capacity")}
                </label>
                <input
                  type="text"
                  value={profileData.capacity}
                  onChange={(e) =>
                    handleProfileChange("capacity", e.target.value)
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
                  {t("location")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) =>
                      handleProfileChange("location", e.target.value)
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
                  {t("description")}
                </label>
                <textarea
                  value={profileData.description}
                  onChange={(e) =>
                    handleProfileChange("description", e.target.value)
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
            </div>

            <div
              className={`flex mt-6 ${isRTL ? "justify-start" : "justify-end"}`}
            >
              <button
                onClick={saveSettings}
                className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-all duration-200 hover:scale-105 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <Save className="w-4 h-4" />
                {t("saveChanges")}
              </button>
            </div>
          </div>

          {/* Notifications Settings */}
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
                {t("notificationSettings")}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Sound Notifications */}
              <div className="flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("soundNotifications")}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("playNotificationSounds")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateSetting(
                        "soundNotifications",
                        !kitchenSettings.soundNotifications
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      kitchenSettings.soundNotifications
                        ? "bg-blue-600 dark:bg-blue-500"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                    dir="ltr"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        kitchenSettings.soundNotifications
                          ? isRTL
                            ? "translate-x-1"
                            : "translate-x-6"
                          : isRTL
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                  {kitchenSettings.soundNotifications && (
                    <button
                      onClick={testNotificationSound}
                      className="text-blue-600 hover:text-blue-700 text-xs"
                    >
                      {t("test")}
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Volume */}
              {kitchenSettings.soundNotifications && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    {t("volume")}: {kitchenSettings.notificationVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={kitchenSettings.notificationVolume}
                    onChange={(e) =>
                      updateSetting(
                        "notificationVolume",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              {/* Priority Alerts */}
              <div className="flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("priorityAlerts")}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("highlightDelayedOrders")}
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting(
                      "showPriorityAlerts",
                      !kitchenSettings.showPriorityAlerts
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    kitchenSettings.showPriorityAlerts
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                  dir="ltr"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      kitchenSettings.showPriorityAlerts
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

              {/* Priority Threshold */}
              {kitchenSettings.showPriorityAlerts && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    {t("priorityThreshold")}:{" "}
                    {kitchenSettings.priorityThreshold} {t("minutes")}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={kitchenSettings.priorityThreshold}
                    onChange={(e) =>
                      updateSetting(
                        "priorityThreshold",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`space-y-6 ${isRTL ? "lg:order-1" : ""}`}>
          {/* Language & Theme */}
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
                {t("appearance")}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Language Selection */}
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
                  onClick={() =>
                    handleLanguageChange(currentLanguage === "ar" ? "en" : "ar")
                  }
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  {currentLanguage === "ar" ? "English" : "العربية"}
                </button>
              </div>

              {/* Theme Toggle */}
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
            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
            <div
              className={`flex items-center gap-3 mb-6 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Monitor className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("displaySettings")}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Max Orders Per View */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("maxOrdersPerView")}: {kitchenSettings.maxOrdersPerView}
                </label>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="2"
                  value={kitchenSettings.maxOrdersPerView}
                  onChange={(e) =>
                    updateSetting("maxOrdersPerView", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Compact View */}
              <div className="flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("compactView")}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("showMoreOrdersInLessSpace")}
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting("compactView", !kitchenSettings.compactView)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    kitchenSettings.compactView
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                  dir="ltr"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      kitchenSettings.compactView
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

              {/* Show Customer Phone */}
              <div className="flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("showCustomerPhone")}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("displayPhoneInOrderCards")}
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting(
                      "showCustomerPhone",
                      !kitchenSettings.showCustomerPhone
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    kitchenSettings.showCustomerPhone
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                  dir="ltr"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      kitchenSettings.showCustomerPhone
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

              {/* Show Order Notes */}
              <div className="flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("showOrderNotes")}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("displayNotesInOrderCards")}
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting(
                      "showOrderNotes",
                      !kitchenSettings.showOrderNotes
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    kitchenSettings.showOrderNotes
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                  dir="ltr"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      kitchenSettings.showOrderNotes
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
          </div>

          {/* Auto-Refresh Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
            <div
              className={`flex items-center gap-3 mb-6 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("autoRefresh")}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Auto Refresh Toggle */}
              <div className="flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("enableAutoRefresh")}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("automaticallyUpdateOrders")}
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting("autoRefresh", !kitchenSettings.autoRefresh)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    kitchenSettings.autoRefresh
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                  dir="ltr"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      kitchenSettings.autoRefresh
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

              {/* Refresh Interval */}
              {kitchenSettings.autoRefresh && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    {t("refreshInterval")}: {kitchenSettings.refreshInterval}{" "}
                    {t("seconds")}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={kitchenSettings.refreshInterval}
                    onChange={(e) =>
                      updateSetting("refreshInterval", parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {unsavedChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              {t("unsavedChangesWarning")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenSettings;
