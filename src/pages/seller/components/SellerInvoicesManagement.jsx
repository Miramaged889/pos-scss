import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
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
  ArrowLeft,
  ArrowRight,
  Printer,
} from "lucide-react";
import { toast } from "react-hot-toast";

import DataTable from "../../../components/Common/DataTable";
import { SellerInvoiceForm } from "../../../components/Forms/SellerForms";

const SellerInvoicesManagement = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [suppliers, setSuppliers] = useState([]);

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

  useEffect(() => {
    loadInvoices();
    loadSuppliers();
  }, []);

  const filterInvoices = useCallback(() => {
    let filtered = [...invoices];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.supplierName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.supplierEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    // Supplier filter
    if (supplierFilter !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.supplierId === supplierFilter
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.issueDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter, supplierFilter, dateRange]);

  useEffect(() => {
    filterInvoices();
  }, [filterInvoices]);

  const loadInvoices = () => {
    setLoading(true);
    // Mock data for supplier invoices
    const mockInvoices = [
      {
        id: "SUP-INV-001",
        supplierId: "SUP-001",
        supplierName: "شركة الأغذية المتحدة",
        supplierEmail: "info@unitedfoods.com",
        orderId: "PO-001",
        issueDate: "2024-01-15T10:30:00",
        dueDate: "2024-02-15T10:30:00",
        status: "paid",
        amount: 5000.0,
        tax: 15.0,
        total: 5750.0,
        paymentDate: "2024-01-20T14:30:00",
        paymentMethod: "bank_transfer",
        notes: "Payment received on time",
        items: [
          {
            name: "Rice",
            quantity: 10,
            unitPrice: 50.0,
            total: 500.0,
          },
          {
            name: "Oil",
            quantity: 5,
            unitPrice: 80.0,
            total: 400.0,
          },
          {
            name: "Sugar",
            quantity: 15,
            unitPrice: 40.0,
            total: 600.0,
          },
        ],
      },
      {
        id: "SUP-INV-002",
        supplierId: "SUP-002",
        supplierName: "مؤسسة البناء الحديث",
        supplierEmail: "contact@modernbuilding.com",
        orderId: "PO-002",
        issueDate: "2024-01-14T15:45:00",
        dueDate: "2024-02-14T15:45:00",
        status: "pending",
        amount: 8000.0,
        tax: 15.0,
        total: 9200.0,
        paymentDate: null,
        paymentMethod: null,
        notes: "Awaiting payment",
        items: [
          {
            name: "Cement",
            quantity: 50,
            unitPrice: 25.0,
            total: 1250.0,
          },
          {
            name: "Steel",
            quantity: 10,
            unitPrice: 300.0,
            total: 3000.0,
          },
          {
            name: "Bricks",
            quantity: 200,
            unitPrice: 5.0,
            total: 1000.0,
          },
        ],
      },
      {
        id: "SUP-INV-003",
        supplierId: "SUP-003",
        supplierName: "شركة الإلكترونيات المتقدمة",
        supplierEmail: "sales@advancedelectronics.com",
        orderId: "PO-003",
        issueDate: "2024-01-13T18:20:00",
        dueDate: "2024-02-13T18:20:00",
        status: "overdue",
        amount: 12000.0,
        tax: 15.0,
        total: 13800.0,
        paymentDate: null,
        paymentMethod: null,
        notes: "Payment overdue - follow up required",
        items: [
          {
            name: "Laptops",
            quantity: 2,
            unitPrice: 2000.0,
            total: 4000.0,
          },
          {
            name: "Monitors",
            quantity: 4,
            unitPrice: 500.0,
            total: 2000.0,
          },
          {
            name: "Printers",
            quantity: 1,
            unitPrice: 1500.0,
            total: 1500.0,
          },
        ],
      },
      {
        id: "SUP-INV-004",
        supplierId: "SUP-004",
        supplierName: "مصنع النسيج الوطني",
        supplierEmail: "info@nationaltextile.com",
        orderId: "PO-004",
        issueDate: "2024-01-12T12:15:00",
        dueDate: "2024-02-12T12:15:00",
        status: "paid",
        amount: 3000.0,
        tax: 15.0,
        total: 3450.0,
        paymentDate: "2024-01-18T11:45:00",
        paymentMethod: "check",
        notes: "Payment received via check",
        items: [
          {
            name: "Cotton Fabric",
            quantity: 15,
            unitPrice: 80.0,
            total: 1200.0,
          },
          {
            name: "Polyester",
            quantity: 10,
            unitPrice: 60.0,
            total: 600.0,
          },
        ],
      },
      {
        id: "SUP-INV-005",
        supplierId: "SUP-005",
        supplierName: "شركة الأدوية العالمية",
        supplierEmail: "orders@globalpharma.com",
        orderId: "PO-005",
        issueDate: "2024-01-11T09:30:00",
        dueDate: "2024-02-11T09:30:00",
        status: "cancelled",
        amount: 6000.0,
        tax: 15.0,
        total: 6900.0,
        paymentDate: null,
        paymentMethod: null,
        notes: "Invoice cancelled due to order cancellation",
        items: [
          {
            name: "Antibiotics",
            quantity: 50,
            unitPrice: 50.0,
            total: 2500.0,
          },
          {
            name: "Painkillers",
            quantity: 100,
            unitPrice: 15.0,
            total: 1500.0,
          },
        ],
      },
    ];

    setTimeout(() => {
      setInvoices(mockInvoices);
      setFilteredInvoices(mockInvoices);
      setLoading(false);
    }, 1000);
  };

  const loadSuppliers = () => {
    const mockSuppliers = [
      {
        id: "SUP-001",
        name: "شركة الأغذية المتحدة",
        email: "info@unitedfoods.com",
      },
      {
        id: "SUP-002",
        name: "مؤسسة البناء الحديث",
        email: "contact@modernbuilding.com",
      },
      {
        id: "SUP-003",
        name: "شركة الإلكترونيات المتقدمة",
        email: "sales@advancedelectronics.com",
      },
      {
        id: "SUP-004",
        name: "مصنع النسيج الوطني",
        email: "info@nationaltextile.com",
      },
      {
        id: "SUP-005",
        name: "شركة الأدوية العالمية",
        email: "orders@globalpharma.com",
      },
    ];
    setSuppliers(mockSuppliers);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle,
      },
      pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock,
      },
      overdue: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: XCircle,
      },
      cancelled: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        icon: XCircle,
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

  const getPaymentMethodBadge = (method) => {
    if (!method) return null;

    const methodConfig = {
      bank_transfer: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        text: t("bankTransfer"),
      },
      check: {
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        text: t("check"),
      },
      cash: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        text: t("cash"),
      },
      credit_card: {
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        text: t("creditCard"),
      },
    };

    const config = methodConfig[method] || methodConfig.bank_transfer;

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
      accessor: "orderId",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.orderId}
        </span>
      ),
    },
    {
      header: t("supplier"),
      accessor: "supplierName",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {item.supplierName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {item.supplierEmail}
          </p>
        </div>
      ),
    },
    {
      header: t("amount"),
      accessor: "total",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            ${item.total.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tax: ${((item.amount * item.tax) / 100).toFixed(2)}
          </p>
        </div>
      ),
    },
    {
      header: t("status"),
      accessor: "status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      header: t("paymentMethod"),
      accessor: "paymentMethod",
      render: (item) => getPaymentMethodBadge(item.paymentMethod),
    },
    {
      header: t("issueDate"),
      accessor: "issueDate",
      render: (item) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            {new Date(item.issueDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Due: {new Date(item.dueDate).toLocaleDateString()}
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
    // Create a new window for printing
    const printWindow = window.open("", "_blank");

    // Generate HTML content for the invoice
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .supplier-info, .invoice-details { flex: 1; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .total-section { text-align: right; margin-top: 20px; }
            .status-badge { 
              display: inline-block; 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 12px; 
              font-weight: bold; 
            }
            .status-paid { background-color: #d4edda; color: #155724; }
            .status-pending { background-color: #fff3cd; color: #856404; }
            .status-overdue { background-color: #f8d7da; color: #721c24; }
            .status-cancelled { background-color: #e2e3e5; color: #383d41; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Supplier Invoice</h1>
            <h2>${invoice.id}</h2>
          </div>
          
          <div class="invoice-info">
            <div class="supplier-info">
              <h3>Supplier Information</h3>
              <p><strong>Name:</strong> ${invoice.supplierName}</p>
              <p><strong>Email:</strong> ${invoice.supplierEmail}</p>
              <p><strong>Order ID:</strong> ${invoice.orderId}</p>
            </div>
            
            <div class="invoice-details">
              <h3>Invoice Details</h3>
              <p><strong>Issue Date:</strong> ${new Date(
                invoice.issueDate
              ).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${new Date(
                invoice.dueDate
              ).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span class="status-badge status-${
                invoice.status
              }">${invoice.status.toUpperCase()}</span></p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="total-section">
            <p><strong>Subtotal:</strong> $${invoice.amount.toFixed(2)}</p>
            <p><strong>Tax (${invoice.tax}%):</strong> $${(
      (invoice.amount * invoice.tax) /
      100
    ).toFixed(2)}</p>
            <p><strong>Total Amount:</strong> $${invoice.total.toFixed(2)}</p>
          </div>
          
          ${
            invoice.paymentDate
              ? `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <h3>Payment Information</h3>
              <p><strong>Payment Date:</strong> ${new Date(
                invoice.paymentDate
              ).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${
                invoice.paymentMethod || "Not specified"
              }</p>
            </div>
          `
              : ""
          }
          
          ${
            invoice.notes
              ? `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <h3>Notes</h3>
              <p>${invoice.notes}</p>
            </div>
          `
              : ""
          }
          
          <div class="no-print" style="margin-top: 50px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Print Invoice
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = function () {
      printWindow.focus();
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };

    toast.success(t("invoicePrinted"));
  };

  const handleDeleteInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setDeleteModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedInvoice) return;

    const updatedInvoices = invoices.map((invoice) =>
      invoice.id === selectedInvoice.id
        ? {
            ...invoice,
            status: editForm.status,
            notes: editForm.notes,
            paymentDate: editForm.paymentDate,
            paymentMethod: editForm.paymentMethod,
          }
        : invoice
    );

    setInvoices(updatedInvoices);
    setEditModal(false);
    setSelectedInvoice(null);
    setEditForm({});
    toast.success(t("invoiceUpdated"));
  };

  const handleConfirmDelete = () => {
    if (!selectedInvoice) return;

    const updatedInvoices = invoices.filter(
      (invoice) => invoice.id !== selectedInvoice.id
    );
    setInvoices(updatedInvoices);
    setDeleteModal(false);
    setSelectedInvoice(null);
    toast.success(t("invoiceDeleted"));
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

  const handleFormSubmit = (formData) => {
    if (formMode === "add") {
      const newInvoice = {
        ...formData,
        id: `SUP-INV-${Date.now()}`,
      };
      setInvoices([newInvoice, ...invoices]);
      toast.success(t("invoiceCreatedSuccessfully"));
    } else {
      const updatedInvoices = invoices.map((invoice) =>
        invoice.id === selectedInvoiceForForm.id ? formData : invoice
      );
      setInvoices(updatedInvoices);
      toast.success(t("invoiceUpdatedSuccessfully"));
    }
    setFormModal(false);
  };

  const handleFormClose = () => {
    setFormModal(false);
    setSelectedInvoiceForForm(null);
  };

  const handleExportInvoices = () => {
    console.log("Export invoices");
    toast.success(t("invoicesExported"));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSupplierFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // Get statistics
  const getStats = () => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(
      (invoice) => invoice.status === "paid"
    ).length;
    const pendingInvoices = invoices.filter(
      (invoice) => invoice.status === "pending"
    ).length;
    const totalAmount = invoices.reduce(
      (sum, invoice) => sum + invoice.total,
      0
    );

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalAmount: totalAmount.toFixed(2),
    };
  };

  const stats = getStats();

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
          <button
            onClick={handleExportInvoices}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t("export")}
          </button>
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
                <option value="paid">{t("paid")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="overdue">{t("overdue")}</option>
                <option value="cancelled">{t("cancelled")}</option>
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
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
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
          {t("showing")} {filteredInvoices.length} {t("of")} {invoices.length}{" "}
          {t("invoices")}
        </p>
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {suppliers.length} {t("activeSuppliers")}
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
                    <strong>{t("name")}:</strong> {selectedInvoice.supplierName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("email")}:</strong>{" "}
                    {selectedInvoice.supplierEmail}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("orderId")}:</strong> {selectedInvoice.orderId}
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
                    <strong>{t("totalAmount")}:</strong> $
                    {selectedInvoice.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("tax")}:</strong> $
                    {(
                      (selectedInvoice.amount * selectedInvoice.tax) /
                      100
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t("invoiceItems")}
                </h3>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div className="flex-1">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.quantity}x {item.name}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${item.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
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

              {selectedInvoice.paymentDate && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("paymentInformation")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("paymentDate")}:</strong>{" "}
                    {new Date(selectedInvoice.paymentDate).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t("paymentMethod")}:</strong>{" "}
                    {getPaymentMethodBadge(selectedInvoice.paymentMethod)}
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
                  <option value="pending">{t("pending")}</option>
                  <option value="paid">{t("paid")}</option>
                  <option value="overdue">{t("overdue")}</option>
                  <option value="cancelled">{t("cancelled")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("paymentMethod")}
                </label>
                <select
                  value={editForm.paymentMethod || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, paymentMethod: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t("selectMethod")}</option>
                  <option value="bank_transfer">{t("bankTransfer")}</option>
                  <option value="check">{t("check")}</option>
                  <option value="cash">{t("cash")}</option>
                  <option value="credit_card">{t("creditCard")}</option>
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
      <SellerInvoiceForm
        isOpen={formModal}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        invoice={selectedInvoiceForForm}
        mode={formMode}
        suppliers={suppliers}
      />
    </div>
  );
};

export default SellerInvoicesManagement;
