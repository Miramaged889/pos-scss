import { useSelector } from "react-redux";

/**
 * Custom hook for role-based permissions
 * @returns {object} - Permission check functions
 */
const usePermissions = () => {
  const { user } = useSelector((state) => state.auth);

  const userRole = user?.role || "guest";

  // Define permissions for each role
  const permissions = {
    seller: {
      canCreateOrders: true,
      canViewOrders: true,
      canEditOrders: true,
      canDeleteOrders: true,
      canManageInventory: true,
      canViewReports: true,
      canManageCustomers: true,
      canProcessReturns: true,
      canManageSuppliers: true,
    },
    kitchen: {
      canCreateOrders: false,
      canViewOrders: true,
      canEditOrders: false,
      canDeleteOrders: false,
      canUpdateOrderStatus: true,
      canManageInventory: false,
      canViewReports: true,
      canLogWaste: true,
    },
    delivery: {
      canCreateOrders: false,
      canViewOrders: true,
      canEditOrders: false,
      canDeleteOrders: false,
      canUpdateOrderStatus: true,
      canManageInventory: false,
      canViewReports: true,
      canTrackLocation: true,
      canCollectPayments: true,
    },
    admin: {
      canCreateOrders: true,
      canViewOrders: true,
      canEditOrders: true,
      canDeleteOrders: true,
      canManageInventory: true,
      canViewReports: true,
      canManageCustomers: true,
      canProcessReturns: true,
      canManageSuppliers: true,
      canUpdateOrderStatus: true,
      canLogWaste: true,
      canTrackLocation: true,
      canCollectPayments: true,
      canManageUsers: true,
    },
    guest: {}, // No permissions for guests
  };

  // Get permissions for current user role
  const userPermissions = permissions[userRole] || {};

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    return userPermissions[permission] === true;
  };

  // Check if user has any of the given permissions
  const hasAnyPermission = (permissionList) => {
    return permissionList.some((permission) => hasPermission(permission));
  };

  // Check if user has all of the given permissions
  const hasAllPermissions = (permissionList) => {
    return permissionList.every((permission) => hasPermission(permission));
  };

  // Check if user can access a specific route
  const canAccessRoute = (route) => {
    const routePermissions = {
      "/seller": ["canCreateOrders", "canViewOrders"],
      "/seller/new-order": ["canCreateOrders"],
      "/seller/orders": ["canViewOrders"],
      "/seller/inventory": ["canManageInventory"],
      "/seller/customers": ["canManageCustomers"],
      "/seller/returns": ["canProcessReturns"],
      "/seller/supplier-purchase": ["canManageSuppliers"],
      "/kitchen": ["canViewOrders"],
      "/kitchen/orders": ["canViewOrders"],
      "/kitchen/waste-log": ["canLogWaste"],
      "/delivery": ["canViewOrders"],
      "/delivery/orders": ["canViewOrders"],
      "/delivery/location": ["canTrackLocation"],
      "/delivery/payments": ["canCollectPayments"],
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) return true; // Allow access to routes without specific permissions

    return hasAnyPermission(requiredPermissions);
  };

  // Get user role display name
  const getRoleDisplayName = () => {
    const roleNames = {
      seller: "بائع",
      kitchen: "مطبخ",
      delivery: "توصيل",
      admin: "مدير",
      guest: "زائر",
    };
    return roleNames[userRole] || "غير محدد";
  };

  return {
    userRole,
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    getRoleDisplayName,
  };
};

export default usePermissions;
