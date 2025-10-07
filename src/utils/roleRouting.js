/**
 * Role-based Routing Utilities
 * Handles navigation based on user roles
 */

import { ROUTES } from "./constants";

// Role to route mapping
export const ROLE_ROUTES = {
  Manager: "/manager/home",
  manager: "/manager/home",
  MANAGER: "/manager/home",

  Seller: "/seller/product-selection",
  seller: "/seller/product-selection",
  SELLER: "/seller/product-selection",

  Kitchen: "/kitchen/active-orders",
  kitchen: "/kitchen/active-orders",
  KITCHEN: "/kitchen/active-orders",

  Delivery: "/delivery/home",
  delivery: "/delivery/home",
  DELIVERY: "/delivery/home",
};

// Default route for unknown roles
const DEFAULT_ROUTE = ROUTES.LOGIN;

/**
 * Get the appropriate route for a user role
 * @param {string} role - The user's role
 * @returns {string} The route path
 */
export const getRouteForRole = (role) => {
  if (!role) {
    return DEFAULT_ROUTE;
  }

  const route = ROLE_ROUTES[role];

  if (!route) {
    return DEFAULT_ROUTE;
  }

  return route;
};

/**
 * Check if a user has access to a specific route
 * @param {string} role - The user's role
 * @param {string} route - The route to check
 * @returns {boolean} Whether the user has access
 */
export const hasAccessToRoute = (role, route) => {
  if (!role || !route) return false;

  const allowedRoute = getRouteForRole(role);
  return allowedRoute === route;
};

/**
 * Get role display name
 * @param {string} role - The role
 * @returns {string} Display name for the role
 */
export const getRoleDisplayName = (role) => {
  const displayNames = {
    Manager: "Manager",
    manager: "Manager",
    MANAGER: "Manager",

    Seller: "Sales Representative",
    seller: "Sales Representative",
    SELLER: "Sales Representative",

    Kitchen: "Kitchen Staff",
    kitchen: "Kitchen Staff",
    KITCHEN: "Kitchen Staff",

    Delivery: "Delivery Driver",
    delivery: "Delivery Driver",
    DELIVERY: "Delivery Driver",
  };

  return displayNames[role] || role;
};

/**
 * Get role permissions
 * @param {string} role - The role
 * @returns {object} Permissions object
 */
export const getRolePermissions = (role) => {
  const permissions = {
    // Manager has all permissions
    Manager: {
      canViewDashboard: true,
      canManageOrders: true,
      canManageCustomers: true,
      canManageProducts: true,
      canManageSuppliers: true,
      canViewReports: true,
      canManageUsers: true,
    },

    // Seller permissions
    Seller: {
      canViewDashboard: true,
      canManageOrders: true,
      canManageCustomers: true,
      canManageProducts: true,
      canManageSuppliers: false,
      canViewReports: true,
      canManageUsers: false,
    },

    // Kitchen permissions
    Kitchen: {
      canViewDashboard: true,
      canManageOrders: true,
      canManageCustomers: false,
      canManageProducts: true,
      canManageSuppliers: false,
      canViewReports: true,
      canManageUsers: false,
    },

    // Delivery permissions
    Delivery: {
      canViewDashboard: true,
      canManageOrders: true,
      canManageCustomers: false,
      canManageProducts: false,
      canManageSuppliers: false,
      canViewReports: false,
      canManageUsers: false,
    },
  };

  // Normalize role case
  const normalizedRole =
    role?.charAt(0).toUpperCase() + role?.slice(1).toLowerCase();

  return (
    permissions[normalizedRole] ||
    permissions[role] || {
      canViewDashboard: false,
      canManageOrders: false,
      canManageCustomers: false,
      canManageProducts: false,
      canManageSuppliers: false,
      canViewReports: false,
      canManageUsers: false,
    }
  );
};

export default {
  getRouteForRole,
  hasAccessToRoute,
  getRoleDisplayName,
  getRolePermissions,
  ROLE_ROUTES,
};
