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
  searchable = true,
  pageable = true,
  pageSize = 10,
  emptyMessage,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { isRTL } = useSelector((state) => state.language);
  const { t } = useTranslation();

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      columns.some((column) => {
        const value = item[column.accessor];
        return value
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
      {/* Search Bar */}
      {searchable && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`relative max-w-sm ${isRTL ? "mr-auto" : "ml-auto"}`}>
            <Search
              className={`absolute ${
                isRTL ? "right-3" : "left-3"
              } top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4`}
            />
            <input
              type="text"
              placeholder={t("search")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full ${
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
              } py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                isRTL ? "text-right" : "text-left"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-spacing-0">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 ${
                    isRTL ? "text-right" : "text-left"
                  } text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 group"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
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
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Search className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm font-medium">
                      {emptyMessage || t("noDataFound")}
                    </p>
                    <p className="text-xs">{t("tryAdjustingSearchCriteria")}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageable && filteredData.length > pageSize && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div
            className={`flex items-center justify-between ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {t("showing")}{" "}
              <span className="font-medium">
                {Math.min(
                  (currentPage - 1) * pageSize + 1,
                  filteredData.length
                )}
              </span>{" "}
              {t("to")}{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, filteredData.length)}
              </span>{" "}
              {t("of")}{" "}
              <span className="font-medium">{filteredData.length}</span>{" "}
              {t("results")}
            </div>

            <div
              className={`flex items-center ${
                isRTL ? "space-x-reverse space-x-2" : "space-x-2"
              }`}
            >
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
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
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                title={t("previousPage")}
              >
                {isRTL ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    currentPage === page
                      ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg"
                      : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  title={t("goToPage", { page })}
                >
                  {page}
                </button>
              ))}

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
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
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
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
