import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Toaster } from "react-hot-toast";

import { store } from "./store";
import "./i18n";

import LoginPage from "./pages/LoginPage";
import SellerDashboard from "./pages/seller/SellerDashboard";
import KitchenDashboard from "./pages/kitchen/KitchenDashboard";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";

const AppContent = () => {
  const { i18n } = useTranslation();
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const { currentLanguage, isRTL } = useSelector((state) => state.language);

  console.log("Current auth state:", { isAuthenticated, role });

  useEffect(() => {
    // Sync i18n with Redux state
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }

    // Update document direction and language
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = currentLanguage;

    // Apply font family based on language
    document.body.className =
      currentLanguage === "ar" ? "font-arabic" : "font-english";
  }, [currentLanguage, isRTL, i18n]);

  const ProtectedRoute = ({ children, allowedRole }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRole && role !== allowedRole) {
      // Redirect to appropriate dashboard based on role
      switch (role) {
        case "seller":
          return <Navigate to="/seller" replace />;
        case "kitchen":
          return <Navigate to="/kitchen" replace />;
        case "delivery":
          return <Navigate to="/delivery" replace />;
        case "manager":
          return <Navigate to="/manager" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }

    return children;
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={`/${role}`} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        <Route
          path="/seller/*"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kitchen/*"
          element={
            <ProtectedRoute allowedRole="kitchen">
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/delivery/*"
          element={
            <ProtectedRoute allowedRole="delivery">
              <DeliveryDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/*"
          element={
            <ProtectedRoute allowedRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={`/${role}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast notifications */}
      <Toaster
        position={isRTL ? "top-left" : "top-right"}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            direction: isRTL ? "rtl" : "ltr",
          },
        }}
      />
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
};

export default App;
