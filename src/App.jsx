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
import { getRouteForRole } from "./utils/roleRouting";

const AppContent = () => {
  const { i18n } = useTranslation();
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const { currentLanguage, isRTL } = useSelector((state) => state.language);

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

    // If user is authenticated but trying to access wrong role dashboard
    if (allowedRole && role?.toLowerCase() !== allowedRole.toLowerCase()) {
      // Redirect to user's correct dashboard based on their role
      const correctRoute = getRouteForRole(role);
      return <Navigate to={correctRoute} replace />;
    }

    return children;
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated && role ? (
              <Navigate to={getRouteForRole(role)} replace />
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

        {/* Debug route to test role routing */}
        <Route
          path="/debug-role"
          element={
            <div style={{ padding: "20px", backgroundColor: "#f0f0f0" }}>
              <h1>Role Debug Information</h1>
              <p>
                <strong>Current Role:</strong> {role}
              </p>
              <p>
                <strong>Is Authenticated:</strong>{" "}
                {isAuthenticated ? "Yes" : "No"}
              </p>
              <p>
                <strong>Should Redirect To:</strong>{" "}
                {isAuthenticated && role ? getRouteForRole(role) : "/login"}
              </p>
              <div style={{ marginTop: "20px" }}>
                <h2>Available Role Routes:</h2>
                <ul>
                  <li>Manager: /manager</li>
                  <li>Seller: /seller</li>
                  <li>Kitchen: /kitchen</li>
                  <li>Delivery: /delivery</li>
                </ul>
              </div>
            </div>
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated && role ? (
              <Navigate to={getRouteForRole(role)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to={getRouteForRole(role)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
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
