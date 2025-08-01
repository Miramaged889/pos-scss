import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const DataTable = ({
  data = [],
  columns = [],
  pageable = true,
  pageSize = 10,
  emptyMessage,
  className = "",
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { isRTL } = useSelector((state) => state.language);
  const { t } = useTranslation();

  // Filter data based on search term
  const filteredData = useMemo(() => {
    return data;
  }, [data]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pageable) return filteredData;

    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize, pageable]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${className}`}
    >


      {/* Table */}
      <div className="overflow-x-auto">
        <table
          className={`w-full border-collapse ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 ${
                    isRTL ? "text-right" : "text-left"
                  } text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-700/50 ${
                    index === 0 
                      ? isRTL 
                        ? "rounded-tr-lg" 
                        : "rounded-tl-lg"
                      : ""
                  } ${
                    index === columns.length - 1
                      ? isRTL
                        ? "rounded-tl-lg"
                        : "rounded-tr-lg"
                      : ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/30 transition-all duration-200 group border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 text-sm text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-all duration-200 ${
                        isRTL ? "text-right" : "text-left"
                      } ${colIndex === 0 ? "font-medium" : ""}`}
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      {column.render
                        ? column.render(item, rowIndex)
                        : item[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-gray-500 dark:text-gray-400"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center shadow-lg">
                      <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                        {emptyMessage || t("noDataFound")}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("tryAdjustingSearchCriteria")}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageable && filteredData.length > pageSize && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700/30 dark:to-gray-800/50">
          <div
            className={`flex items-center justify-between ${
              isRTL ? "flex-row" : ""
            }`}
          >
            {/* Results Info */}
            <div
              className={`text-sm text-gray-700 dark:text-gray-300 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <span className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
                {t("showing")}{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {Math.min(
                    (currentPage - 1) * pageSize + 1,
                    filteredData.length
                  )}
                </span>{" "}
                {t("to")}{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {Math.min(currentPage * pageSize, filteredData.length)}
                </span>{" "}
                {t("of")}{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {filteredData.length}
                </span>{" "}
                {t("results")}
              </span>
            </div>

            {/* Pagination Controls */}
            <div
              className={`flex items-center ${
                isRTL ? "space-x-reverse space-x-1" : "space-x-1"
              }`}
            >
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                title={t("firstPage")}
              >
                {isRTL ? (
                  <ChevronsRight className="w-4 h-4" />
                ) : (
                  <ChevronsLeft className="w-4 h-4" />
                )}
              </button>

              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                title={t("previousPage")}
              >
                {isRTL ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md ${
                      currentPage === page
                        ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg border-2 border-blue-600 dark:border-blue-500"
                        : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                    title={t("goToPage", { page })}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                title={t("nextPage")}
              >
                {isRTL ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                title={t("lastPage")}
              >
                {isRTL ? (
                  <ChevronsLeft className="w-4 h-4" />
                ) : (
                  <ChevronsRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
