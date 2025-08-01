import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { toast } from "react-hot-toast";

const UserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state for creating/editing user
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "seller",
  });

  const filterUsers = useCallback(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const loadUsers = () => {
    setLoading(true);
    // Mock data with different user types
    const mockUsers = [
      {
        id: 1,
        email: "mohamed.ali@company.com",
        role: "seller",
        status: "active",
        joinDate: "2024-01-01",
      },
      {
        id: 2,
        email: "ali.hassan@company.com",
        role: "seller",
        status: "active",
        joinDate: "2024-01-05",
      },
      {
        id: 3,
        email: "sara.mohamed@company.com",
        role: "kitchen",
        status: "active",
        joinDate: "2024-01-10",
      },
      {
        id: 4,
        email: "ahmed.khalid@company.com",
        role: "delivery",
        status: "active",
        joinDate: "2024-01-15",
      },
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  };

  const handleCreateUser = () => {
    setFormData({
      email: "",
      password: "",
      role: "seller",
    });
    setShowCreateModal(true);
  };

  const handleEditUser = (user) => {
    setFormData({
      email: user.email,
      password: "", // Don't show password in edit mode
      role: user.role,
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate email length
    if (formData.email.length > 20) {
      toast.error(t("emailTooLong"));
      return;
    }

    // Validate password
    if (showCreateModal && formData.password.length < 6) {
      toast.error(t("passwordTooShort"));
      return;
    }

    if (showCreateModal) {
      // Create new user
      const newUser = {
        id: Date.now(),
        ...formData,
        status: "active",
        joinDate: new Date().toISOString().split("T")[0],
      };

      setUsers([...users, newUser]);
      toast.success(t("userCreated"));
    } else {
      // Update existing user
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id ? { ...user, ...formData } : user
      );
      setUsers(updatedUsers);
      toast.success(t("userUpdated"));
    }

    setShowCreateModal(false);
    setShowEditModal(false);
    setFormData({
      email: "",
      password: "",
      role: "seller",
    });
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(t("confirmDeleteUser"))) {
      const updatedUsers = users.filter((u) => u.id !== user.id);
      setUsers(updatedUsers);
      toast.success(t("userDeleted"));
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
    };

    const config = roleConfig[role] || roleConfig.seller;
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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
              <option value="seller">{t("seller")}</option>
              <option value="kitchen">{t("kitchen")}</option>
              <option value="delivery">{t("delivery")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("showing")} {filteredUsers.length} {t("of")} {users.length}{" "}
          {t("users")}
        </p>
      </div>

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
                    {user.email}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("joinDate")}:{" "}
                    {new Date(user.joinDate).toLocaleDateString()}
                  </p>
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
                  {t("email")} ({t("max20Chars")})
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  maxLength={20}
                />
                {formData.email.length > 20 && (
                  <p className="text-red-500 text-xs mt-1">
                    {t("emailTooLong")}
                  </p>
                )}
              </div>

              {showCreateModal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("password")} ({t("min6Chars")})
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    minLength={6}
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
                  <option value="seller">{t("seller")}</option>
                  <option value="kitchen">{t("kitchen")}</option>
                  <option value="delivery">{t("delivery")}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {showCreateModal ? t("create") : t("update")}
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
