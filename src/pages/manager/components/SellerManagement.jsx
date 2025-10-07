import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  User,
  ChefHat,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  fetchTenantUsers,
  createTenantUser,
  updateTenantUser,
  deleteTenantUser,
  clearError,
} from "../../../store/slices/tenantUsersSlice";
import { fetchTenantInfo } from "../../../store/slices/tenantSlice";

const UserManagement = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Get data from Redux store
  const {
    users: tenantUsers,
    loading,
    error,
  } = useSelector((state) => state.tenantUsers);

  // Get tenant info for user limits and module settings
  const { tenantInfo } = useSelector((state) => state.tenant);

  // Local state for UI
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state for creating/editing user - matching API schema
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Seller",
  });

  // Fetch tenant users and tenant info on component mount
  useEffect(() => {
    dispatch(fetchTenantUsers());
    dispatch(fetchTenantInfo());
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle error display
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Use tenant users directly from Redux
  const users = React.useMemo(() => tenantUsers || [], [tenantUsers]);

  // Calculate user limits and availability
  const userLimits = React.useMemo(() => {
    if (!tenantInfo) {
      return {
        currentUsers: users.length,
        maxUsers: 0,
        canAddUser: false,
        remainingUsers: 0,
      };
    }

    const currentUsers = users.length;
    const maxUsers = tenantInfo.no_users || 0;
    const canAddUser = currentUsers < maxUsers;
    const remainingUsers = Math.max(0, maxUsers - currentUsers);

    return {
      currentUsers,
      maxUsers,
      canAddUser,
      remainingUsers,
    };
  }, [tenantInfo, users.length]);

  // Get available roles based on enabled modules
  const availableRoles = React.useMemo(() => {
    if (!tenantInfo?.modules_enabled) {
      return [
        { value: "Seller", label: t("seller") },
        { value: "Manager", label: t("manager") },
      ];
    }

    const roles = [
      { value: "Seller", label: t("seller") },
      { value: "Manager", label: t("manager") },
    ];

    // Add kitchen role if kitchen module is enabled
    if (tenantInfo.modules_enabled.kitchen === true) {
      roles.push({ value: "Kitchen", label: t("kitchen") });
    }

    // Add delivery role if delivery module is enabled
    if (tenantInfo.modules_enabled.Delivery === true) {
      roles.push({ value: "Delivery", label: t("delivery") });
    }

    return roles;
  }, [tenantInfo, t]);

  const filterUsers = useCallback(() => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }

    let filtered = [...users];

    // Search filter - search by username, email, or role
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          (user.username &&
            user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email &&
            user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.role &&
            user.role.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (user) =>
          user.role && user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  // Mock data removed - now using Redux data

  const handleCreateUser = () => {
    // Check if user can add more users
    if (!userLimits.canAddUser) {
      toast.error(t("userLimitReached"));
      return;
    }

    setFormData({
      username: "",
      email: "",
      password: "",
      role: "Seller",
    });
    setSelectedUser(null);
    setShowCreateModal(true);
  };

  const handleEditUser = (user) => {
    setFormData({
      username: user.username || "",
      email: user.email || "",
      password: "", // Don't show password in edit mode
      role: user.role || "Seller", // Keep the exact role from API
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check user limits for new users
    if (showCreateModal && !userLimits.canAddUser) {
      toast.error(t("userLimitReached"));
      return;
    }

    // Validate username
    if (!formData.username.trim()) {
      toast.error(t("usernameRequired"));
      return;
    }

    // Validate email
    if (!formData.email.trim()) {
      toast.error(t("emailRequired"));
      return;
    }

    // Validate password for new users
    if (
      showCreateModal &&
      (!formData.password || formData.password.length < 6)
    ) {
      toast.error(t("passwordTooShort"));
      return;
    }

    try {
      if (showCreateModal) {
        // Create new user
        await dispatch(createTenantUser(formData)).unwrap();
        toast.success(t("userCreated"));
      } else {
        // Update existing user - only send fields that should be updated
        const updateData = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
        };

        // Only include password if it's provided
        if (formData.password && formData.password.length >= 6) {
          updateData.password = formData.password;
        }

        await dispatch(
          updateTenantUser({
            id: selectedUser.id,
            userData: updateData,
          })
        ).unwrap();
        toast.success(t("userUpdated"));
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "Seller",
      });
      setSelectedUser(null);
    } catch (error) {
      toast.error(error || t("operationFailed"));
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(t("confirmDeleteUser"))) {
      try {
        await dispatch(deleteTenantUser(user.id)).unwrap();
        toast.success(t("userDeleted"));
      } catch (error) {
        toast.error(error || t("deleteFailed"));
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle,
      },
      inactive: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: XCircle,
      },
      pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {t(status)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      seller: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        icon: User,
        text: t("seller"),
      },
      kitchen: {
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        icon: ChefHat,
        text: t("kitchen"),
      },
      delivery: {
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        icon: Truck,
        text: t("delivery"),
      },
      manager: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: User,
        text: t("manager"),
      },
    };

    // Normalize role to lowercase for comparison
    const normalizedRole = role ? role.toLowerCase() : "seller";
    const config = roleConfig[normalizedRole] || {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
      icon: User,
      text: role || t("unknown"),
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("userManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t("manageUsers")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateUser}
            disabled={!userLimits.canAddUser}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              userLimits.canAddUser
                ? "text-white bg-blue-600 hover:bg-blue-700"
                : "text-gray-400 bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
            }`}
            title={
              !userLimits.canAddUser ? t("userLimitReached") : t("addUser")
            }
          >
            <Plus className="w-4 h-4" />
            {t("addUser")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("search")}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("searchUsers")}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("role")}
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t("allRoles")}</option>
              {availableRoles.map((role) => (
                <option key={role.value} value={role.value.toLowerCase()}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div>
          {tenantInfo && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("userLimit")}: {userLimits.currentUsers}/{userLimits.maxUsers}{" "}
              ({userLimits.remainingUsers} {t("remaining")})
            </p>
          )}
        </div>
      </div>

      {/* User Limit Message - رسالة حد المستخدمين */}
      {!userLimits.canAddUser && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 rtl:mr-0 rtl:ml-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {t("userLimitReached")}
              </h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                {t("userLimit")}: {userLimits.currentUsers}/{userLimits.maxUsers}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {user.username || user.email}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status || "active")}
                  </div>
                  {user.created_at && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("joinDate")}:{" "}
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  {t("edit")}
                </button>
                <button
                  onClick={() => handleDeleteUser(user)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {showCreateModal ? t("addUser") : t("editUser")}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("username")} *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  placeholder={t("enterUsername")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("email")} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  placeholder={t("enterEmail")}
                />
              </div>

              {(showCreateModal || (showEditModal && formData.password)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("password")}{" "}
                    {showCreateModal
                      ? `(${t("min6Chars")})`
                      : `(${t("optional")})`}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required={showCreateModal}
                    minLength={6}
                    placeholder={
                      showEditModal ? t("leaveBlankToKeepCurrent") : ""
                    }
                  />
                  {formData.password.length > 0 &&
                    formData.password.length < 6 && (
                      <p className="text-red-500 text-xs mt-1">
                        {t("passwordTooShort")}
                      </p>
                    )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("role")}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {availableRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setFormData({
                      username: "",
                      email: "",
                      password: "",
                      role: "Seller",
                    });
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? t("loading")
                    : showCreateModal
                    ? t("create")
                    : t("update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
