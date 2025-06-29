import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  Package,
  Plus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import StatsCard from "../../../components/Common/StatsCard";
import WasteLogForm from "../../../components/Forms/WasteLogForm";
import {
  getFromStorage as getFromLocalStorage,
  setToStorage as saveToLocalStorage,
} from "../../../utils/localStorage";

const WasteLog = () => {
  const { t } = useTranslation();
  const { theme } = useSelector((state) => state.language);
  const [wasteItems, setWasteItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [filters, setFilters] = useState({
    dateRange: "today",
    reason: "all",
  });

  // Load waste items from localStorage
  useEffect(() => {
    const savedWasteItems = getFromLocalStorage("wasteItems", []);
    setWasteItems(savedWasteItems);
  }, []);

  // Save waste items to localStorage
  const saveWasteItems = (items) => {
    setWasteItems(items);
    saveToLocalStorage("wasteItems", items);
  };

  const handleModalOpen = (mode, item = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalMode("create");
  };

  // Handle form submission (create/edit)
  const handleFormSubmit = (formData) => {
    if (modalMode === "edit") {
      const updatedItems = wasteItems.map((item) =>
        item.id === formData.id ? formData : item
      );
      saveWasteItems(updatedItems);
    } else {
      const updatedItems = [formData, ...wasteItems];
      saveWasteItems(updatedItems);
    }
    handleModalClose();
  };

  // Delete waste item
  const handleDeleteWasteItem = (id) => {
    if (window.confirm(t("confirmDelete"))) {
      const updatedItems = wasteItems.filter((item) => item.id !== id);
      saveWasteItems(updatedItems);
    }
  };

  // Filter waste items based on selected filters
  const filteredWasteItems = wasteItems.filter((item) => {
    const itemDate = new Date(item.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    let dateMatch = true;
    switch (filters.dateRange) {
      case "today":
        dateMatch = itemDate.toDateString() === today.toDateString();
        break;
      case "yesterday":
        dateMatch = itemDate.toDateString() === yesterday.toDateString();
        break;
      case "week":
        dateMatch = itemDate >= weekAgo;
        break;
      default:
        dateMatch = true;
    }

    const reasonMatch =
      filters.reason === "all" || item.reason === filters.reason;

    return dateMatch && reasonMatch;
  });

  // Calculate statistics
  const todayWaste = wasteItems.filter(
    (item) => new Date(item.date).toDateString() === new Date().toDateString()
  );
  const yesterdayWaste = wasteItems.filter((item) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return new Date(item.date).toDateString() === yesterday.toDateString();
  });

  const totalWasteCost = filteredWasteItems.reduce(
    (sum, item) => sum + parseFloat(item.cost || 0),
    0
  );
  const todayWasteCost = todayWaste.reduce(
    (sum, item) => sum + parseFloat(item.cost || 0),
    0
  );
  const yesterdayWasteCost = yesterdayWaste.reduce(
    (sum, item) => sum + parseFloat(item.cost || 0),
    0
  );

  const costTrend =
    yesterdayWasteCost === 0
      ? 0
      : ((todayWasteCost - yesterdayWasteCost) / yesterdayWasteCost) * 100;

  const wasteColumns = [
    {
      header: t("product"),
      accessor: "product",
    },
    {
      header: t("quantity"),
      accessor: "quantity",
    },
    {
      header: t("reason"),
      accessor: "reason",
      render: (item) => t(item.reason),
    },
    {
      header: t("date"),
      accessor: "date",
      render: (item) => new Date(item.date).toLocaleDateString(),
    },
    {
      header: t("cost"),
      accessor: "cost",
      render: (item) => `${item.cost} ${t("sar")}`,
    },
    {
      header: t("actions"),
      accessor: "id",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleModalOpen("view", item)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title={t("view")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleModalOpen("edit", item)}
            className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
            title={t("edit")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteWasteItem(item.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const reasonOptions = [
    { value: "expired", label: t("expired") },
    { value: "damaged", label: t("damaged") },
    { value: "overcooked", label: t("overcooked") },
    { value: "dropped", label: t("dropped") },
    { value: "other", label: t("other") },
  ];

  return (
    <div className={`space-y-6 ${theme === "dark" ? "dark" : ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("wasteLogTitle")}
        </h2>
        <button
          onClick={() => handleModalOpen("create")}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("addWasteItem")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title={t("totalWasteCost")}
          value={`${totalWasteCost.toFixed(2)} ${t("sar")}`}
          icon={Package}
          color="red"
        />

        <StatsCard
          title={t("todayWaste")}
          value={`${todayWasteCost.toFixed(2)} ${t("sar")}`}
          icon={Calendar}
          color="orange"
          change={Math.abs(costTrend)}
          trend={costTrend > 0 ? "down" : "up"}
          changeText={t("vsYesterday")}
        />

        <StatsCard
          title={t("wasteItems")}
          value={filteredWasteItems.length}
          icon={AlertTriangle}
          color="yellow"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("dateRange")}
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters({ ...filters, dateRange: e.target.value })
              }
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="today">{t("today")}</option>
              <option value="yesterday">{t("yesterday")}</option>
              <option value="week">{t("thisWeek")}</option>
              <option value="all">{t("allTime")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("reason")}
            </label>
            <select
              value={filters.reason}
              onChange={(e) =>
                setFilters({ ...filters, reason: e.target.value })
              }
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">{t("allReasons")}</option>
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Waste Items Table */}
      <DataTable
        data={filteredWasteItems}
        columns={wasteColumns}
        emptyMessage={t("noWasteItems")}
      />

      {/* Modal Form */}
      {showModal && (
        <WasteLogForm
          onSubmit={handleFormSubmit}
          onClose={handleModalClose}
          initialData={selectedItem}
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default WasteLog;
