import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Printer,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  Plus,
  X,
  Save,
  AlertCircle,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  fetchSupplierInvoices,
  createSupplierInvoice,
  updateSupplierInvoice,
  deleteSupplierInvoice,
  clearManagerError,
} from "../../../store/slices/managerSlice";
import { fetchSuppliers } from "../../../store/slices/supplierSlice";

import DataTable from "../../../components/Common/DataTable";
import { SupplierInvoiceForm } from "../../../components/Forms";

const SupplierInvoicesManagement = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state) => state.language);

  // Redux state
  const { invoices, loading, error } = useSelector((state) => state.manager);
  const { suppliers } = useSelector((state) => state.suppliers);

  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Modal states
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Form modal states
  const [formModal, setFormModal] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedInvoiceForForm, setSelectedInvoiceForForm] = useState(null);

  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchSupplierInvoices());
    dispatch(fetchSuppliers());
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearManagerError());
    };
  }, [dispatch]);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest(".export-dropdown")) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportDropdown]);

  // Safe supplier data getter
  const getSafeSuppliers = useCallback(() => {
    if (!suppliers) return [];
    if (Array.isArray(suppliers)) return suppliers;
    if (
      typeof suppliers === "object" &&
      suppliers.data &&
      Array.isArray(suppliers.data)
    ) {
      return suppliers.data;
    }
    return [];
  }, [suppliers]);

  // Get supplier name by ID
  const getSupplierName = useCallback(
    (supplierId) => {
      const safeSuppliers = getSafeSuppliers();
      const supplier = safeSuppliers.find((s) => s.id === supplierId);
      return supplier
        ? supplier.supplier_name || supplier.name
        : `Supplier ${supplierId}`;
    },
    [getSafeSuppliers]
  );

  // Get supplier email by ID
  const getSupplierEmail = useCallback(
    (supplierId) => {
      const safeSuppliers = getSafeSuppliers();
      const supplier = safeSuppliers.find((s) => s.id === supplierId);
      return supplier ? supplier.email : "";
    },
    [getSafeSuppliers]
  );

  const filterInvoices = useCallback(() => {
    let filtered = [...(invoices || [])];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.id
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.order_id
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getSupplierName(invoice.supplier)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getSupplierEmail(invoice.supplier)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    // Supplier filter
    if (supplierFilter !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.supplier?.toString() === supplierFilter.toString()
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((invoice) => {
        if (!invoice.issue_date) return false;
        const invoiceDate = new Date(invoice.issue_date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    }

    setFilteredInvoices(filtered);
  }, [
    invoices,
    searchTerm,
    statusFilter,
    supplierFilter,
    dateRange,
    getSupplierName,
    getSupplierEmail,
  ]);

  useEffect(() => {
    filterInvoices();
  }, [filterInvoices]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      Paid: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle,
      },
      Pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock,
      },
      Overdue: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {t(status.toLowerCase())}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methodConfig = {
      "Bank Transfer": {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        text: t("bankTransfer"),
      },
      Check: {
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        text: t("check"),
      },
      Cash: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        text: t("cash"),
      },
    };

    const config = methodConfig[method] || methodConfig["Bank Transfer"];

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const columns = [
    {
      header: t("invoiceId"),
      accessor: "id",
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {item.id}
        </span>
      ),
    },
    {
      header: t("orderId"),
      accessor: "order_id",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.order_id}
        </span>
      ),
    },
    {
      header: t("supplier"),
      accessor: "supplier",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {getSupplierName(item.supplier)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getSupplierEmail(item.supplier)}
          </p>
        </div>
      ),
    },
    {
      header: t("amount"),
      accessor: "total",
      render: (item) => {
        try {
          const itemsTotal =
            item.items?.reduce((sum, item) => {
              return sum + (parseFloat(item.subtotal || item.total) || 0);
            }, 0) || 0;
          const tax = parseFloat(item.tax) || 0;
          const total = itemsTotal + tax;
          return (
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                ${total.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tax: ${tax.toFixed(2)}
              </p>
            </div>
          );
        } catch (error) {
          console.warn("Error calculating item total:", error, item);
          return (
            <div>
              <p className="font-medium text-gray-900 dark:text-white">$0.00</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tax: $0.00
              </p>
            </div>
          );
        }
      },
    },
    {
      header: t("status"),
      accessor: "status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      header: t("payment"),
      accessor: "payment_method",
      render: (item) => getPaymentMethodBadge(item.payment_method),
    },
    {
      header: t("issueDate"),
      accessor: "issue_date",
      render: (item) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            {new Date(item.issue_date).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Due: {new Date(item.due_date).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      header: t("actions"),
      accessor: "actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewInvoice(item)}
            className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title={t("view")}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePrintInvoice(item)}
            className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            title={t("print")}
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSendInvoice(item)}
            className="p-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            title={t("send")}
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditInvoiceForm(item)}
            className="p-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            title={t("edit")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteInvoice(item)}
            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewModal(true);
  };

  const handlePrintInvoice = (invoice) => {
    console.log("Print invoice:", invoice);
    toast.success(t("invoicePrinted"));
  };

  const handleSendInvoice = (invoice) => {
    console.log("Send invoice:", invoice);
    toast.success(t("invoiceSent"));
  };

  const handleDeleteInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedInvoice) return;

    try {
      const updateData = {
        status: editForm.status,
        notes: editForm.notes,
        paymentDate: editForm.paymentDate
          ? `${editForm.paymentDate}T${
              selectedInvoice.paymentDate?.split("T")[1] || "00:00:00"
            }`
          : null,
      };

      await dispatch(
        updateSupplierInvoice({
          id: selectedInvoice.id,
          invoiceData: updateData,
        })
      ).unwrap();

      setEditModal(false);
      setSelectedInvoice(null);
      setEditForm({});
      toast.success(t("invoiceUpdated"));
    } catch (error) {
      toast.error(error || t("updateFailed"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedInvoice) return;

    try {
      await dispatch(deleteSupplierInvoice(selectedInvoice.id)).unwrap();
      setDeleteModal(false);
      setSelectedInvoice(null);
      toast.success(t("invoiceDeleted"));
    } catch (error) {
      toast.error(error || t("deleteFailed"));
    }
  };

  // Form handlers
  const handleAddInvoice = () => {
    setFormMode("add");
    setSelectedInvoiceForForm(null);
    setFormModal(true);
  };

  const handleEditInvoiceForm = (invoice) => {
    setFormMode("edit");
    setSelectedInvoiceForForm(invoice);
    setFormModal(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === "add") {
        await dispatch(createSupplierInvoice(formData)).unwrap();
        toast.success(t("invoiceAddedSuccessfully"));
      } else {
        await dispatch(
          updateSupplierInvoice({
            id: selectedInvoiceForForm.id,
            invoiceData: formData,
          })
        ).unwrap();
        toast.success(t("invoiceUpdatedSuccessfully"));
      }
      setFormModal(false);
    } catch (error) {
      toast.error(error || t("operationFailed"));
    }
  };

  const handleFormClose = () => {
    setFormModal(false);
    setSelectedInvoiceForForm(null);
  };

  const handleExportPDF = () => {
    const pdfContent = `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>${t("supplierInvoicesReport")}</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 20px; 
              direction: rtl;
              text-align: right;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .invoices-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .invoices-table th,
            .invoices-table td {
              border: 1px solid #333;
              padding: 8px;
              text-align: right;
            }
            .invoices-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .stats-section {
              margin-top: 30px;
              padding: 20px;
              border: 2px solid #333;
              border-radius: 8px;
              text-align: center;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${t("supplierInvoicesReport")}</h1>
            <h2>${new Date().toLocaleDateString()}</h2>
          </div>
          
          <table class="invoices-table">
            <thead>
              <tr>
                <th>${t("invoiceId")}</th>
                <th>${t("orderId")}</th>
                <th>${t("supplier")}</th>
                <th>${t("amount")}</th>
                <th>${t("status")}</th>
                <th>${t("issueDate")}</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInvoices
                .map(
                  (invoice) => `
                <tr>
                  <td>#${invoice.id}</td>
                  <td>${invoice.order_id}</td>
                  <td>${getSupplierName(invoice.supplier)}</td>
                  <td>$${(() => {
                    try {
                      const itemsTotal =
                        invoice.items?.reduce((sum, item) => {
                          return (
                            sum + (parseFloat(item.subtotal || item.total) || 0)
                          );
                        }, 0) || 0;
                      const tax = parseFloat(invoice.tax) || 0;
                      return (itemsTotal + tax).toFixed(2);
                    } catch {
                      return "0.00";
                    }
                  })()}</td>
                  <td>${invoice.status}</td>
                  <td>${new Date(invoice.issue_date).toLocaleDateString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="stats-section">
            <h2>${t("totalInvoices")}: ${filteredInvoices.length}</h2>
            <h2>${t("paidInvoices")}: ${stats.paidInvoices}</h2>
            <h2>${t("pendingInvoices")}: ${stats.pendingInvoices}</h2>
            <h2>${t("totalAmount")}: $${stats.totalAmount}</h2>
          </div>
          
          <div class="no-print" style="margin-top: 50px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              ${t("print")}
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
              ${t("close")}
            </button>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(pdfContent);
    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
    toast.success(t("invoicesExportedPDF"));
  };

  const handleExportExcel = () => {
    // Create CSV content
    const csvContent = [
      // Header row
      [
        t("invoiceId"),
        t("orderId"),
        t("supplier"),
        t("amount"),
        t("status"),
        t("paymentMethod"),
        t("issueDate"),
        t("dueDate"),
      ].join(","),
      // Data rows
      ...filteredInvoices.map((invoice) =>
        [
          invoice.id,
          invoice.order_id,
          `"${getSupplierName(invoice.supplier)}"`,
          (() => {
            try {
              const itemsTotal =
                invoice.items?.reduce((sum, item) => {
                  return sum + (parseFloat(item.subtotal || item.total) || 0);
                }, 0) || 0;
              const tax = parseFloat(invoice.tax) || 0;
              return (itemsTotal + tax).toFixed(2);
            } catch {
              return "0.00";
            }
          })(),
          `"${invoice.status}"`,
          `"${invoice.payment_method}"`,
          `"${new Date(invoice.issue_date).toLocaleDateString()}"`,
          `"${new Date(invoice.due_date).toLocaleDateString()}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `supplier_invoices_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t("invoicesExportedExcel"));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSupplierFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // Get statistics
  const getStats = () => {
    const invoiceList = invoices || [];
    const totalInvoices = invoiceList.length;
    const paidInvoices = invoiceList.filter(
      (invoice) => invoice.status === "Paid"
    ).length;
    const pendingInvoices = invoiceList.filter(
      (invoice) => invoice.status === "Pending"
    ).length;

    const totalAmount = invoiceList.reduce((sum, invoice) => {
      try {
        const itemsTotal =
          invoice.items?.reduce((itemSum, item) => {
            return itemSum + (parseFloat(item.subtotal || item.total) || 0);
          }, 0) || 0;
        const tax = parseFloat(invoice.tax) || 0;
        return sum + itemsTotal + tax;
      } catch (error) {
        console.warn("Error calculating invoice total:", error, invoice);
        return sum;
      }
    }, 0);

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalAmount:
        typeof totalAmount === "number" ? totalAmount.toFixed(2) : "0.00",
    };
  };

  const stats = getStats();
  const safeSuppliers = getSafeSuppliers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("supplierInvoicesManagement")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("manageAllSupplierInvoices")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddInvoice}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("addInvoice")}
          </button>

          {/* Export Dropdown */}
          <div className="relative export-dropdown">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <Download className="w-4 h-4" />
              {t("export")}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showExportDropdown && (
              <div
                className={`absolute top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-48 ${
                  isRTL ? "left-0" : "right-0"
                } sm:${
                  isRTL ? "left-0" : "right-0"
                } xs:left-1/2 xs:transform xs:-translate-x-1/2`}
              >
                <button
                  onClick={handleExportPDF}
                  className={`w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors duration-200 ${
                    isRTL ? "text-right flex-row" : "text-left flex-row"
                  } sm:${isRTL ? "text-right" : "text-left"}`}
                >
                  <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="truncate">{t("exportPDF")}</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className={`w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-green-600 dark:text-green-400 transition-colors duration-200 ${
                    isRTL ? "text-right flex-row" : "text-left flex-row"
                  } sm:${isRTL ? "text-right" : "text-left"}`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="truncate">{t("exportExcel")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("totalInvoices")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalInvoices}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("paidInvoices")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.paidInvoices}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("pendingInvoices")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pendingInvoices}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("totalAmount")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.totalAmount}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("filters")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  placeholder={t("searchInvoices")}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("status")}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">{t("allStatuses")}</option>
                <option value="Paid">{t("paid")}</option>
                <option value="Pending">{t("pending")}</option>
                <option value="Overdue">{t("overdue")}</option>
              </select>
            </div>

            {/* Supplier Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("supplier")}
              </label>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">{t("allSuppliers")}</option>
                {safeSuppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.supplier_name || supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("dateRange")}
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t("clearFilters")}
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("showing")} {filteredInvoices.length} {t("of")}{" "}
          {(invoices || []).length} {t("invoices")}
        </p>
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {safeSuppliers.length} {t("activeSuppliers")}
          </span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <DataTable
          data={filteredInvoices}
          columns={columns}
          loading={loading}
          searchable={false}
        />
      </div>

      {/* View Modal */}
      {viewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("invoiceDetails")} - {selectedInvoice.id}
              </h2>
              <button
                onClick={() => setViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("supplierInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("name")}:</strong>{" "}
                    {getSupplierName(selectedInvoice.supplier)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("email")}:</strong>{" "}
                    {getSupplierEmail(selectedInvoice.supplier)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("orderId")}:</strong> {selectedInvoice.order_id}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("invoiceInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("status")}:</strong>{" "}
                    {getStatusBadge(selectedInvoice.status)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("paymentMethod")}:</strong>{" "}
                    {getPaymentMethodBadge(selectedInvoice.payment_method)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("total")}:</strong> $
                    {(() => {
                      try {
                        const itemsTotal =
                          selectedInvoice.items?.reduce((sum, item) => {
                            return (
                              sum +
                              (parseFloat(item.subtotal || item.total) || 0)
                            );
                          }, 0) || 0;
                        const tax = parseFloat(selectedInvoice.tax) || 0;
                        const total = itemsTotal + tax;
                        return total.toFixed(2);
                      } catch (error) {
                        console.warn(
                          "Error calculating total:",
                          error,
                          selectedInvoice
                        );
                        return "0.00";
                      }
                    })()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t("items")}
                </h3>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, index) => {
                    try {
                      const quantity = parseFloat(item.quantity) || 0;
                      const subtotal =
                        parseFloat(item.subtotal || item.total) || 0;
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span className="text-sm text-gray-900 dark:text-white">
                            {quantity}x {item.item_name}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ${subtotal.toFixed(2)}
                          </span>
                        </div>
                      );
                    } catch (error) {
                      console.warn("Error displaying item:", error, item);
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span className="text-sm text-gray-900 dark:text-white">
                            {item.quantity || 0}x{" "}
                            {item.item_name || "Unknown Item"}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            $0.00
                          </span>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("notes")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("editInvoice")} - {selectedInvoice.id}
              </h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("status")}
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Pending">{t("pending")}</option>
                  <option value="Paid">{t("paid")}</option>
                  <option value="Overdue">{t("overdue")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("paymentDate")}
                </label>
                <input
                  type="date"
                  value={editForm.paymentDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, paymentDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("notes")}
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t("saveChanges")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("deleteInvoice")}
              </h2>
              <button
                onClick={() => setDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {t("confirmDeleteInvoice")}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {t("invoiceId")}: {selectedInvoice.id}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("deleteInvoiceWarning")}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <SupplierInvoiceForm
        isOpen={formModal}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        invoice={selectedInvoiceForForm}
        mode={formMode}
        suppliers={safeSuppliers}
      />
    </div>
  );
};

export default SupplierInvoicesManagement;
