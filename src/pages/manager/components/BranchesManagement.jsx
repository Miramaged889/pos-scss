import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  fetchBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  clearError,
} from "../../../store/slices/branchesSlice";
import {
  fetchTenantInfo,
  checkBranchLimits,
  updateBranchCount,
  clearTenantError,
} from "../../../store/slices/tenantSlice";

const BranchesManagement = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Get data from Redux store
  const { branches, loading, error } = useSelector((state) => state.branches);
  const { branchLimits } = useSelector((state) => state.tenant);

  const [filteredBranches, setFilteredBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Form state for creating/editing branch - matching API schema
  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
  });

  // Fetch branches and tenant info on component mount
  useEffect(() => {
    dispatch(fetchBranches());
    dispatch(fetchTenantInfo());
    dispatch(checkBranchLimits());
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearTenantError());
    };
  }, [dispatch]);

  // Use branches directly from state
  const safeBranches = React.useMemo(() => branches || [], [branches]);

  // Update branch count when branches change
  useEffect(() => {
    if (safeBranches.length !== branchLimits.currentBranches) {
      dispatch(updateBranchCount(safeBranches.length));
    }
  }, [safeBranches.length, branchLimits.currentBranches, dispatch]);

  // Handle error display
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filterBranches = useCallback(() => {
    if (!Array.isArray(safeBranches)) {
      setFilteredBranches([]);
      return;
    }

    let filtered = [...safeBranches];

    // Search filter - search by name, email, or phone
    if (searchTerm) {
      filtered = filtered.filter(
        (branch) =>
          (branch.name &&
            branch.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (branch.contact_email &&
            branch.contact_email
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (branch.contact_phone &&
            branch.contact_phone.toString().includes(searchTerm))
      );
    }

    setFilteredBranches(filtered);
  }, [safeBranches, searchTerm]);

  useEffect(() => {
    filterBranches();
  }, [filterBranches]);

  // Fetch function is now handled by Redux useEffect above

  const handleCreateBranch = () => {
    setFormData({
      name: "",
      contact_email: "",
      contact_phone: "",
    });
    setSelectedBranch(null);
    setShowCreateModal(true);
  };

  const handleEditBranch = (branch) => {
    setFormData({
      name: branch.name || "",
      contact_email: branch.contact_email || "",
      contact_phone: branch.contact_phone || "",
    });
    setSelectedBranch(branch);
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check branch limits before creating a new branch
    if (showCreateModal && !branchLimits.canAddBranch) {
      toast.error(t("maxBranchesReached"));
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error(t("branchNameRequired"));
      return;
    }

    if (!formData.contact_email.trim()) {
      toast.error(t("contactEmailRequired"));
      return;
    }

    if (!formData.contact_phone.trim()) {
      toast.error(t("contactPhoneRequired"));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      toast.error(t("invalidEmailFormat"));
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(formData.contact_phone)) {
      toast.error(t("invalidPhoneFormat"));
      return;
    }

    try {
      if (showCreateModal) {
        // Double-check branch limits before API call
        if (branchLimits.currentBranches >= branchLimits.maxBranches) {
          toast.error(t("branchLimitExceeded"));
          return;
        }

        // Create new branch
        await dispatch(createBranch(formData)).unwrap();
        toast.success(t("branchCreated"));
        // Update branch count after successful creation
        dispatch(updateBranchCount(safeBranches.length + 1));
      } else {
        // Update existing branch
        await dispatch(
          updateBranch({
            id: selectedBranch.id,
            branchData: formData,
          })
        ).unwrap();
        toast.success(t("branchUpdated"));
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setFormData({
        name: "",
        contact_email: "",
        contact_phone: "",
      });
      setSelectedBranch(null);
    } catch (error) {
      console.error("Branch operation error:", error);

      // Handle specific error cases
      if (error && error.includes("Number of branches exceeded")) {
        toast.error(t("branchLimitExceeded"));
      } else if (error && error.includes("Invalid branch data")) {
        toast.error(t("invalidBranchData"));
      } else if (error && error.includes("400")) {
        toast.error(t("invalidBranchData"));
      } else {
        toast.error(error || t("operationFailed"));
      }
    }
  };

  const handleDeleteBranch = async (branch) => {
    if (window.confirm(t("confirmDeleteBranch"))) {
      try {
        await dispatch(deleteBranch(branch.id)).unwrap();
        toast.success(t("branchDeleted"));
        // Update branch count after successful deletion
        dispatch(updateBranchCount(safeBranches.length - 1));
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

    const config = statusConfig[status] || statusConfig.active;
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

  // Show loading state
  if (loading && branches.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (error && branches.length === 0) {
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
            {t("branchesManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageBranches")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateBranch}
            disabled={!branchLimits.canAddBranch}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              branchLimits.canAddBranch
                ? "text-white bg-blue-600 hover:bg-blue-700"
                : "text-gray-400 bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4" />
            {t("addBranch")}
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
                placeholder={t("searchBranches")}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("branchLimit")}: {branchLimits.currentBranches}/
            {branchLimits.maxBranches} ({branchLimits.remainingBranches}{" "}
            {t("remaining")})
          </p>
        </div>
      </div>

      {/* Branch Limit Message - رسالة حد الفروع */}
      {!branchLimits.canAddBranch && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 rtl:mr-0 rtl:ml-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {t("maxBranchesReached")}
              </h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                {t("branchLimit")}: {branchLimits.currentBranches}/
                {branchLimits.maxBranches}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Branches Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {branch.name}
                    </h3>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{branch.contact_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{branch.contact_phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {getStatusBadge(branch.status || "active")}
                  </div>

                  {branch.created_at && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("createdDate")}:{" "}
                      {new Date(branch.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditBranch(branch)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  {t("edit")}
                </button>
                <button
                  onClick={() => handleDeleteBranch(branch)}
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
              {showCreateModal ? t("addBranch") : t("editBranch")}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("branchName")} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  placeholder={t("enterBranchName")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("contactEmail")} *
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  placeholder={t("enterContactEmail")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("contactPhone")} *
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  placeholder={t("enterContactPhone")}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setFormData({
                      name: "",
                      contact_email: "",
                      contact_phone: "",
                    });
                    setSelectedBranch(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    loading || (showCreateModal && !branchLimits.canAddBranch)
                  }
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

export default BranchesManagement;
