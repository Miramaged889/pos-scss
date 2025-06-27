import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  Package,
  Plus,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";

import DataTable from "../../../components/Common/DataTable";
import {
  getFromStorage as getFromLocalStorage,
  setToStorage as saveToLocalStorage,
} from "../../../utils/localStorage";

const WasteLog = () => {
  const { t } = useTranslation();
  const { theme } = useSelector((state) => state.language);
  const [wasteItems, setWasteItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWasteItem, setNewWasteItem] = useState({
    product: "",
    quantity: "",
    reason: "",
    cost: "",
    notes: "",
  });
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

  // Add new waste item
  const handleAddWasteItem = () => {
    if (
      !newWasteItem.product ||
      !newWasteItem.quantity ||
      !newWasteItem.reason
    ) {
      return;
    }

    const wasteItem = {
      id: Date.now(),
      ...newWasteItem,
      date: new Date().toISOString(),
      quantity: parseInt(newWasteItem.quantity),
      cost: parseFloat(newWasteItem.cost || 0),
    };

    const updatedItems = [wasteItem, ...wasteItems];
    saveWasteItems(updatedItems);

    setNewWasteItem({
      product: "",
      quantity: "",
      reason: "",
      cost: "",
      notes: "",
    });
    setShowAddModal(false);
  };

  // Delete waste item
  const handleDeleteWasteItem = (id) => {
    const updatedItems = wasteItems.filter((item) => item.id !== id);
    saveWasteItems(updatedItems);
  };

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
      render: (item) => t(item.reason) || item.reason,
    },
    {
      header: t("date"),
      accessor: "date",
      render: (item) => new Date(item.date).toLocaleDateString("ar-SA"),
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
        <button
          onClick={() => handleDeleteWasteItem(item.id)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        >
          <Trash2 className="w-4 h-4" />
        </button>
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
          {t("wasteLog")}
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("addWasteItem")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("totalWasteCost")}
              </h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalWasteCost.toFixed(2)} {t("sar")}
              </p>
            </div>
            <Package className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("todayWaste")}
              </h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {todayWasteCost.toFixed(2)} {t("sar")}
              </p>
              <div className="flex items-center mt-1">
                {costTrend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span
                  className={`text-sm ${
                    costTrend > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {Math.abs(costTrend).toFixed(1)}%
                </span>
              </div>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("wasteItems")}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredWasteItems.length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <DataTable
          data={filteredWasteItems}
          columns={wasteColumns}
          emptyMessage={t("noWasteItems")}
        />
      </div>

      {/* Add Waste Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("addWasteItem")}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("productName")} *
                </label>
                <input
                  type="text"
                  value={newWasteItem.product}
                  onChange={(e) =>
                    setNewWasteItem({
                      ...newWasteItem,
                      product: e.target.value,
                    })
                  }
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t("enterProductName")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("quantity")} *
                  </label>
                  <input
                    type="number"
                    value={newWasteItem.quantity}
                    onChange={(e) =>
                      setNewWasteItem({
                        ...newWasteItem,
                        quantity: e.target.value,
                      })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("cost")} ({t("sar")})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newWasteItem.cost}
                    onChange={(e) =>
                      setNewWasteItem({ ...newWasteItem, cost: e.target.value })
                    }
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("reason")} *
                </label>
                <select
                  value={newWasteItem.reason}
                  onChange={(e) =>
                    setNewWasteItem({ ...newWasteItem, reason: e.target.value })
                  }
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t("selectReason")}</option>
                  {reasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("notes")}
                </label>
                <textarea
                  value={newWasteItem.notes}
                  onChange={(e) =>
                    setNewWasteItem({ ...newWasteItem, notes: e.target.value })
                  }
                  rows={3}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder={t("additionalNotes")}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleAddWasteItem}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t("addItem")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteLog;
