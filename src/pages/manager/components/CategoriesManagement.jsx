import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Tag,
  AlertCircle,
  X,
  CheckCircle,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { categoriesService, subcategoriesService } from "../../../services";

const CategoriesManagement = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("categories"); // "categories" or "subcategories"

  // Subcategories state
  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [searchTermSubcategories, setSearchTermSubcategories] = useState("");
  const [currentPageSubcategories, setCurrentPageSubcategories] = useState(1);
  const [itemsPerPageSubcategories] = useState(12);
  const [showCreateSubcategoryModal, setShowCreateSubcategoryModal] = useState(false);
  const [showEditSubcategoryModal, setShowEditSubcategoryModal] = useState(false);
  const [showDeleteSubcategoryModal, setShowDeleteSubcategoryModal] = useState(false);
  const [showViewSubcategoryModal, setShowViewSubcategoryModal] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: "",
    description: "",
    category_id: "",
  });

  // Form state for creating/editing category
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Fetch categories function
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriesService.getCategories();
      const categoriesList = Array.isArray(response) ? response : [];
      setCategories(categoriesList);
      setFilteredCategories(categoriesList);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || t("failedToFetchCategories"));
      toast.error(err.message || t("failedToFetchCategories"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch subcategories function
  const fetchSubcategories = useCallback(async () => {
    try {
      setLoadingSubcategories(true);
      const response = await subcategoriesService.getSubcategories();
      const subcategoriesList = Array.isArray(response) ? response : [];
      setSubcategories(subcategoriesList);
      setFilteredSubcategories(subcategoriesList);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      toast.error(err.message || t("failedToFetchSubcategories"));
    } finally {
      setLoadingSubcategories(false);
    }
  }, [t]);

  // Fetch subcategories when tab is active or when component mounts (to show subcategory status in categories table)
  useEffect(() => {
    fetchSubcategories();
  }, [fetchSubcategories]);

  // Filter categories based on search term
  const filterCategories = useCallback(() => {
    if (!Array.isArray(categories)) {
      setFilteredCategories([]);
      return;
    }

    let filtered = [...categories];

    // Search filter - search by name or description
    if (searchTerm) {
      filtered = filtered.filter(
        (category) =>
          (category.name &&
            category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (category.description &&
            category.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  useEffect(() => {
    filterCategories();
    setCurrentPage(1);
  }, [filterCategories]);

  // Filter subcategories based on search term
  const filterSubcategories = useCallback(() => {
    if (!Array.isArray(subcategories)) {
      setFilteredSubcategories([]);
      return;
    }

    let filtered = [...subcategories];

    // Search filter - search by name or description
    if (searchTermSubcategories) {
      filtered = filtered.filter(
        (subcategory) =>
          (subcategory.name &&
            subcategory.name.toLowerCase().includes(searchTermSubcategories.toLowerCase())) ||
          (subcategory.description &&
            subcategory.description
              .toLowerCase()
              .includes(searchTermSubcategories.toLowerCase()))
      );
    }

    setFilteredSubcategories(filtered);
  }, [subcategories, searchTermSubcategories]);

  useEffect(() => {
    if (activeTab === "subcategories") {
      filterSubcategories();
      setCurrentPageSubcategories(1);
    }
  }, [filterSubcategories, activeTab]);

  useEffect(() => {
    if (activeTab === "subcategories") {
      setCurrentPageSubcategories(1);
    }
  }, [searchTermSubcategories, activeTab]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const totalPagesSubcategories = Math.ceil(filteredSubcategories.length / itemsPerPageSubcategories);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);
  
  const startIndexSubcategories = (currentPageSubcategories - 1) * itemsPerPageSubcategories;
  const endIndexSubcategories = startIndexSubcategories + itemsPerPageSubcategories;
  const currentSubcategories = filteredSubcategories.slice(startIndexSubcategories, endIndexSubcategories);

  const handleCreateCategory = () => {
    setFormData({
      name: "",
      description: "",
    });
    setSelectedCategory(null);
    setShowCreateModal(true);
  };

  const handleEditCategory = (category) => {
    setFormData({
      name: category.name || "",
      description: category.description || "",
    });
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error(t("categoryNameRequired"));
      return;
    }

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      };

      if (showCreateModal) {
        await categoriesService.createCategory(categoryData);
        toast.success(t("categoryCreated"));
      } else {
        await categoriesService.updateCategory(
          selectedCategory.id,
          categoryData
        );
        toast.success(t("categoryUpdated"));
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setFormData({
        name: "",
        description: "",
      });
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Category operation error:", error);
      toast.error(error.message || t("operationFailed"));
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedCategory) {
      try {
        await categoriesService.deleteCategory(selectedCategory.id);
        toast.success(t("categoryDeleted"));
        setShowDeleteModal(false);
        setSelectedCategory(null);
        fetchCategories();
      } catch (error) {
        toast.error(error.message || t("deleteFailed"));
      }
    }
  };

  // Subcategories handlers
  const handleCreateSubcategory = () => {
    setSubcategoryFormData({
      name: "",
      description: "",
      category_id: "",
    });
    setSelectedSubcategory(null);
    setShowCreateSubcategoryModal(true);
  };

  const handleEditSubcategory = (subcategory) => {
    setSubcategoryFormData({
      name: subcategory.name || "",
      description: subcategory.description || "",
      category_id: subcategory.category_id?.toString() || subcategory.category_id || "",
    });
    setSelectedSubcategory(subcategory);
    setShowEditSubcategoryModal(true);
  };

  const handleDeleteSubcategory = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setShowDeleteSubcategoryModal(true);
  };

  const handleViewSubcategory = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setShowViewSubcategoryModal(true);
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();

    if (!subcategoryFormData.name.trim()) {
      toast.error(t("subcategoryNameRequired") || "Subcategory name is required");
      return;
    }

    if (!subcategoryFormData.category_id) {
      toast.error(t("categoryRequired") || "Category is required");
      return;
    }

    try {
      const subcategoryData = {
        name: subcategoryFormData.name.trim(),
        description: subcategoryFormData.description.trim() || null,
        category_id: parseInt(subcategoryFormData.category_id),
      };

      if (showCreateSubcategoryModal) {
        await subcategoriesService.createSubcategory(subcategoryData);
        toast.success(t("subcategoryCreated") || "Subcategory created successfully");
      } else {
        await subcategoriesService.updateSubcategory(
          selectedSubcategory.id,
          subcategoryData
        );
        toast.success(t("subcategoryUpdated") || "Subcategory updated successfully");
      }

      setShowCreateSubcategoryModal(false);
      setShowEditSubcategoryModal(false);
      setSubcategoryFormData({
        name: "",
        description: "",
        category_id: "",
      });
      setSelectedSubcategory(null);
      fetchSubcategories();
    } catch (error) {
      console.error("Subcategory operation error:", error);
      toast.error(error.message || t("operationFailed"));
    }
  };

  const handleConfirmDeleteSubcategory = async () => {
    if (selectedSubcategory) {
      try {
        await subcategoriesService.deleteSubcategory(selectedSubcategory.id);
        toast.success(t("subcategoryDeleted") || "Subcategory deleted successfully");
        setShowDeleteSubcategoryModal(false);
        setSelectedSubcategory(null);
        fetchSubcategories();
      } catch (error) {
        toast.error(error.message || t("deleteFailed"));
      }
    }
  };

  // Helper function to get category name by ID
  const getCategoryNameById = (categoryId) => {
    if (!categoryId || !categories.length) return t("category");
    const category = categories.find(
      (c) => c.id?.toString() === categoryId?.toString() || c.id === categoryId
    );
    return category ? category.name : t("category");
  };

  // Helper function to check if category has subcategories
  const hasSubcategories = (categoryId) => {
    if (!categoryId || !subcategories.length) return false;
    return subcategories.some(
      (sub) => sub.category_id?.toString() === categoryId?.toString() || sub.category_id === categoryId
    );
  };

  // Helper function to get subcategories count for a category
  const getSubcategoriesCount = (categoryId) => {
    if (!categoryId || !subcategories.length) return 0;
    return subcategories.filter(
      (sub) => sub.category_id?.toString() === categoryId?.toString() || sub.category_id === categoryId
    ).length;
  };

  // Show loading state
  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("categoriesManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageProductCategories")}
          </p>
        </div>
        <button
          onClick={activeTab === "categories" ? handleCreateCategory : handleCreateSubcategory}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-md"
        >
          <Plus className="w-4 h-4" />
          {activeTab === "categories" ? t("addCategory") : (t("addSubcategory") || "Add Subcategory")}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "categories"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {t("categories")}
          </button>
          <button
            onClick={() => setActiveTab("subcategories")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "subcategories"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {t("subcategories") || "Subcategories"}
          </button>
        </div>
      </div>

      {/* Categories Tab Content */}
      {activeTab === "categories" && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 ${
                      isRTL ? "right-3" : "left-3"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t("searchCategories")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                      isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Categories Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("loading")}
                </p>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Tag className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? t("noCategoriesFound") || "No categories found" : t("noCategories") || "No categories available"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentCategories.map((category) => {
                  const hasSubs = hasSubcategories(category.id);
                  const subCount = getSubcategoriesCount(category.id);
                  return (
                    <div
                      key={category.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 truncate">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          <div className="mb-4">
                            {hasSubs ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                {subCount} {t("subcategory") || "Subcategory"}{subCount > 1 ? "s" : ""}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                {t("noSubcategories") || "No Subcategories"}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewCategory(category)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                              title={t("viewCategory") || "View Category"}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                              title={t("editCategory")}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category)}
                              className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                              title={t("deleteCategory")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("previous") || "Previous"}
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {t("page") || "Page"} {currentPage} {t("of") || "of"} {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("next") || "Next"}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Subcategories Tab Content */}
      {activeTab === "subcategories" && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 ${
                      isRTL ? "right-3" : "left-3"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t("searchSubcategories") || "Search subcategories..."}
                    value={searchTermSubcategories}
                    onChange={(e) => setSearchTermSubcategories(e.target.value)}
                    className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                      isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subcategories Cards */}
          {loadingSubcategories ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("loading")}
                </p>
              </div>
            </div>
          ) : filteredSubcategories.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Tag className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTermSubcategories ? t("noSubcategoriesFound") || "No subcategories found" : t("noSubcategories") || "No subcategories available"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentSubcategories.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Tag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 truncate">
                          {subcategory.name}
                        </h3>
                        <div className="mb-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            {getCategoryNameById(subcategory.category_id)}
                          </span>
                        </div>
                        {subcategory.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {subcategory.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewSubcategory(subcategory)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                            title={t("viewSubcategory") || "View Subcategory"}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditSubcategory(subcategory)}
                            className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                            title={t("editSubcategory") || "Edit Subcategory"}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubcategory(subcategory)}
                            className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                            title={t("deleteSubcategory") || "Delete Subcategory"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPagesSubcategories > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPageSubcategories((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPageSubcategories === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("previous") || "Previous"}
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {t("page") || "Page"} {currentPageSubcategories} {t("of") || "of"} {totalPagesSubcategories}
                  </span>
                  <button
                    onClick={() => setCurrentPageSubcategories((prev) => Math.min(prev + 1, totalPagesSubcategories))}
                    disabled={currentPageSubcategories === totalPagesSubcategories}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("next") || "Next"}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full" dir={isRTL ? "rtl" : "ltr"}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {showCreateModal
                    ? t("addCategory")
                    : t("editCategory")}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setFormData({ name: "", description: "" });
                    setSelectedCategory(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("categoryName")} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  placeholder={t("enterCategoryName")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("description")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t("enterDescription")}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setFormData({ name: "", description: "" });
                    setSelectedCategory(null);
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

      {/* View Category Modal */}
      {showViewModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full" dir={isRTL ? "rtl" : "ltr"}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("viewCategory") || "View Category"}
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedCategory(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("categoryName")}
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                  {selectedCategory.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("description")}
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white min-h-[100px]">
                  {selectedCategory.description || (
                    <span className="text-gray-400 dark:text-gray-500 italic">
                      {t("noDescription")}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("id") || "ID"}
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                  {selectedCategory.id}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {t("close") || "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full" dir={isRTL ? "rtl" : "ltr"}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("deleteCategory")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedCategory.name}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {t("areYouSureDeleteCategory")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("delete")}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCategory(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t("cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Subcategory Modal */}
      {(showCreateSubcategoryModal || showEditSubcategoryModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full" dir={isRTL ? "rtl" : "ltr"}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {showCreateSubcategoryModal
                    ? t("addSubcategory") || "Add Subcategory"
                    : t("editSubcategory") || "Edit Subcategory"}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateSubcategoryModal(false);
                    setShowEditSubcategoryModal(false);
                    setSubcategoryFormData({ name: "", description: "", category_id: "" });
                    setSelectedSubcategory(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubcategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("category")} *
                </label>
                <select
                  value={subcategoryFormData.category_id}
                  onChange={(e) =>
                    setSubcategoryFormData({ ...subcategoryFormData, category_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">{t("selectCategory") || "Select Category"}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("subcategoryName") || "Subcategory Name"} *
                </label>
                <input
                  type="text"
                  value={subcategoryFormData.name}
                  onChange={(e) =>
                    setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  placeholder={t("enterSubcategoryName") || "Enter subcategory name"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("description")}
                </label>
                <textarea
                  value={subcategoryFormData.description}
                  onChange={(e) =>
                    setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t("enterDescription")}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateSubcategoryModal(false);
                    setShowEditSubcategoryModal(false);
                    setSubcategoryFormData({ name: "", description: "", category_id: "" });
                    setSelectedSubcategory(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loadingSubcategories}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingSubcategories
                    ? t("loading")
                    : showCreateSubcategoryModal
                    ? t("create")
                    : t("update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Subcategory Modal */}
      {showViewSubcategoryModal && selectedSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full" dir={isRTL ? "rtl" : "ltr"}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("viewSubcategory") || "View Subcategory"}
                </h3>
                <button
                  onClick={() => {
                    setShowViewSubcategoryModal(false);
                    setSelectedSubcategory(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("category")}
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {getCategoryNameById(selectedSubcategory.category_id)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("subcategoryName") || "Subcategory Name"}
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                  {selectedSubcategory.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("description")}
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white min-h-[100px]">
                  {selectedSubcategory.description || (
                    <span className="text-gray-400 dark:text-gray-500 italic">
                      {t("noDescription")}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("id") || "ID"}
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                  {selectedSubcategory.id}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewSubcategoryModal(false);
                    setSelectedSubcategory(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {t("close") || "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subcategory Confirmation Modal */}
      {showDeleteSubcategoryModal && selectedSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full" dir={isRTL ? "rtl" : "ltr"}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("deleteSubcategory") || "Delete Subcategory"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedSubcategory.name}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {t("areYouSureDeleteSubcategory") ||
                  "Are you sure you want to delete this subcategory? This action cannot be undone."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDeleteSubcategory}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("delete")}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteSubcategoryModal(false);
                    setSelectedSubcategory(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t("cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;