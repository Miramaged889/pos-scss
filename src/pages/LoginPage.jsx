import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { LogIn, Globe, Mail, Sun, Moon } from "lucide-react";

import { loginUser } from "../store/slices/authSlice";
import { toggleLanguage, toggleTheme } from "../store/slices/languageSlice";
import { getRouteForRole } from "../utils/roleRouting";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage, isRTL, theme } = useSelector(
    (state) => state.language
  );
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error(t("enterEmailAndPassword"));
      return;
    }

    try {
      const result = await dispatch(
        loginUser({
          email: email.trim(),
          password: password.trim(),
        })
      );

      if (loginUser.fulfilled.match(result)) {
        toast.success(t("success"));

        // Navigate to role-based dashboard
        const userRole = result.payload.role;
        const dashboardRoute = getRouteForRole(userRole);

        // Navigate to the appropriate dashboard
        navigate(dashboardRoute);
      } else {
        toast.error(result.payload || t("loginFailed"));
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(t("loginFailed"));
    }
  };

  const handleLanguageToggle = () => {
    dispatch(toggleLanguage());
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        isRTL ? "rtl" : "ltr"
      } ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Controls */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleThemeToggle}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              theme === "dark"
                ? "text-gray-300 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
            title={t("toggleTheme")}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            {theme === "dark" ? t("lightMode") : t("darkMode")}
          </button>
          <button
            onClick={handleLanguageToggle}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              theme === "dark"
                ? "text-gray-300 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <Globe className="w-4 h-4" />
            {currentLanguage === "en" ? "العربية" : "English"}
          </button>
        </div>

        {/* Login Form */}
        <div
          className={`rounded-2xl shadow-xl p-8 ${
            theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}
        >
          <div className="text-center">
            <div
              className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
                theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
              }`}
            >
              <LogIn
                className={`w-8 h-8 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <h2
              className={`text-3xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {t("welcome")}
            </h2>
            <p
              className={`${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {t("loginTitle")}
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("email")}
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 ${
                    isRTL ? "right-0 pr-3" : "left-0 pl-3"
                  } flex items-center pointer-events-none`}
                >
                  <Mail
                    className={`h-5 w-5 ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full ${
                    isRTL ? "pr-10 text-right" : "pl-10"
                  } py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder={t("enterEmail")}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full ${
                  isRTL ? "text-right" : "text-left"
                } py-3 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder={t("enterPassword")}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                t("loginButton")
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div
          className={`text-center text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <p>
            {currentLanguage === "ar"
              ? "© 2024 نظام إدارة المبيعات والتوصيل"
              : "© 2024 Sales & Delivery Management System"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
