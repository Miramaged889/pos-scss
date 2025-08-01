import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { LogIn, Globe, Mail } from "lucide-react";

import { login, ROLE_EMAILS } from "../store/slices/authSlice";
import { toggleLanguage } from "../store/slices/languageSlice";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useSelector((state) => state.language);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t("enterEmail"));
      return;
    }

    if (!ROLE_EMAILS[email]) {
      toast.error(t("invalidEmail"));
      return;
    }

    setIsLoading(true);

    // Simulate login delay
    setTimeout(() => {
      dispatch(login({ email: email.trim() }));
      toast.success(t("success"));
      setIsLoading(false);
    }, 1000);
  };

  const handleLanguageToggle = () => {
    dispatch(toggleLanguage());
  };

  const demoEmails = [
    { email: "seller@company.com", role: t("seller") },
    { email: "kitchen@company.com", role: t("kitchen") },
    { email: "delivery@company.com", role: t("delivery") },
    { email: "manager@company.com", role: t("manager") },
  ];

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Language Toggle */}
        <div className="flex justify-end">
          <button
            onClick={handleLanguageToggle}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
          >
            <Globe className="w-4 h-4" />
            {currentLanguage === "en" ? "العربية" : "English"}
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t("welcome")}
            </h2>
            <p className="text-gray-600">{t("loginTitle")}</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("email")}
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 ${
                    isRTL ? "right-0 pr-3" : "left-0 pl-3"
                  } flex items-center pointer-events-none`}
                >
                  <Mail className="h-5 w-5 text-gray-400" />
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
                  } py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                  placeholder={t("enterEmail")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                t("loginButton")
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 text-center mb-4">
              {currentLanguage === "ar" ? "حسابات تجريبية:" : "Demo Accounts:"}
            </p>
            <div className="space-y-2">
              {demoEmails.map(({ email: demoEmail, role }) => (
                <button
                  key={demoEmail}
                  onClick={() => setEmail(demoEmail)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {role}
                    </span>
                    <span className="text-xs text-gray-500">{demoEmail}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
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
