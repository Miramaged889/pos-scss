import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  X,
  Building,
  Package,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  Truck,
} from "lucide-react";
import FormField from "../FormField";
import { supplierService } from "../../../services/supplierService";

const PurchaseOrderForm = ({ isOpen, onClose, onSubmit, editData = null }) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const { products } = useSelector((state) => state.inventory);
  const [formData, setFormData] = useState({
    supplier: "",
    items: [{ item_name: "", customName: "", quantity: 1, unit_price: 0 }],
    expected_delivery: "",
    notes: "",
    status: "Pending",
  });
  const [errors, setErrors] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [supplierItems, setSupplierItems] = useState([]);
  const [loadingSupplierItems, setLoadingSupplierItems] = useState(false);

  // Load suppliers from API
  const loadSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const response = await supplierService.getSuppliers();
      const suppliersList = response.results || response || [];
      setSuppliers(suppliersList);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Load items for selected supplier
  const loadSupplierItems = async (supplierId) => {
    if (!supplierId) {
      setSupplierItems([]);
      return;
    }

    setLoadingSupplierItems(true);
    try {
      const items = await supplierService.getSupplierItems(supplierId);
      setSupplierItems(items);
    } catch (error) {
      console.error("Error loading supplier items:", error);
      setSupplierItems([]);
    } finally {
      setLoadingSupplierItems(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSuppliers();
    }
  }, [isOpen]);

  // Load supplier items when supplier changes
  useEffect(() => {
    if (formData.supplier) {
      loadSupplierItems(formData.supplier);
    } else {
      setSupplierItems([]);
    }
  }, [formData.supplier]);

  useEffect(() => {
    if (editData) {
      setFormData({
        supplier: editData.supplier || "",
        expected_delivery: editData.expected_delivery
          ? new Date(editData.expected_delivery).toISOString().slice(0, 16)
          : "",
        status: editData.status || "Pending",
        notes: editData.notes || "",
        // Ensure items have correct field names and preserve IDs for updates
        items: editData.items?.map((item) => ({
          id: item.id, // Preserve item ID for updates
          item_name: item.item_name || item.name || "",
          customName: item.customName || "",
          quantity: item.quantity || 1,
          unit_price: item.unit_price || item.price || 0,
        })) || [{ item_name: "", customName: "", quantity: 1, unit_price: 0 }],
      });
    }
  }, [editData]);

  const statusOptions = [
    { value: "Pending", label: t("pending") },
    { value: "Confirmed", label: t("confirmed") },
    { value: "Delivered", label: t("delivered") },
    { value: "Cancelled", label: t("cancelled") },
  ];

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { item_name: "", customName: "", quantity: 1, unit_price: 0 },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const updateItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (total, item) => total + (item.quantity || 0) * (item.unit_price || 0),
      0
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.expected_delivery) {
      newErrors.expected_delivery = t("expectedDeliveryRequired");
    }

    formData.items.forEach((item, index) => {
      // Check if item name is provided (either from dropdown or custom)
      const itemName =
        item.item_name === "other" ? item.customName : item.item_name;
      if (!itemName || !itemName.trim()) {
        newErrors[`item_${index}_name`] = t("itemNameRequired");
      }
      if (!item.quantity || item.quantity < 1) {
        newErrors[`item_${index}_quantity`] = t("validQuantityRequired");
      }
      if (!item.unit_price || item.unit_price < 0) {
        newErrors[`item_${index}_price`] = t("validPriceRequired");
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const purchaseOrderData = {
        supplier: parseInt(formData.supplier) || null,
        expected_delivery: formData.expected_delivery
          ? new Date(formData.expected_delivery).toISOString()
          : null,
        status: formData.status,
        notes: formData.notes,
        items: formData.items.map((item) => {
          const unitPrice = parseFloat(item.unit_price);
          const quantity = parseInt(item.quantity);
          const subtotal = unitPrice * quantity;

          const itemData = {
            item_name:
              item.item_name === "other" ? item.customName : item.item_name,
            quantity: quantity,
            unit_price: unitPrice.toFixed(2), // Format as string with 2 decimal places
            subtotal: subtotal.toFixed(2), // Add subtotal field
          };

          // Include item ID if it exists (for updates)
          if (item.id) {
            itemData.id = item.id;
          }

          return itemData;
        }),
      };


      onSubmit(purchaseOrderData, editData?.id);
      handleClose();
    }
  };

  const handleSelectItem = (index, selectedName) => {
    // Ignore divider selection
    if (selectedName === "divider") {
      return;
    }

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      item_name: selectedName,
      customName:
        selectedName === "other" ? updatedItems[index].customName : "",
    };

    // Auto-fill price if it's an existing item
    if (selectedName && selectedName !== "other") {
      // First try to find in supplier items (previous purchases)
      const supplierItem = supplierItems.find(
        (item) => item.name === selectedName
      );
      if (supplierItem) {
        updatedItems[index].unit_price = supplierItem.lastPrice || 0;
        updatedItems[index].quantity = supplierItem.lastQuantity || 1;
      } else {
        // Fallback to inventory items
        const selectedProduct = (products || []).find(
          (p) => p.name === selectedName
        );
        if (selectedProduct) {
          updatedItems[index].unit_price = selectedProduct.price || 0;
        }
      }
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleClose = () => {
    setFormData({
      supplier: "",
      items: [{ item_name: "", customName: "", quantity: 1, unit_price: 0 }],
      expected_delivery: "",
      notes: "",
      status: "Pending",
    });
    setErrors({});
    setSupplierItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editData ? t("editPurchaseOrder") : t("createPurchaseOrder")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("managePurchaseOrderDetails")}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Supplier and Delivery Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField
              label={`${t("supplier")} (${t("optional")})`}
              name="supplier"
              type="select"
              value={formData.supplier}
              onChange={(e) => {
                const newSupplierId = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  supplier: newSupplierId,
                  // Clear items when supplier changes to avoid confusion
                  items:
                    newSupplierId !== prev.supplier
                      ? [
                          {
                            item_name: "",
                            customName: "",
                            quantity: 1,
                            unit_price: 0,
                          },
                        ]
                      : prev.items,
                }));
              }}
              error={errors.supplier}
              icon={<Building className="w-4 h-4" />}
              disabled={loadingSuppliers}
              options={[
                {
                  value: "",
                  label: loadingSuppliers ? t("loading") : t("selectSupplier"),
                },
                ...suppliers.map((supplier) => ({
                  value: supplier.id,
                  label: supplier.supplier_name || supplier.name,
                })),
              ]}
            />

            <FormField
              label={t("expectedDelivery")}
              name="expected_delivery"
              type="datetime-local"
              value={formData.expected_delivery}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expected_delivery: e.target.value,
                }))
              }
              error={errors.expected_delivery}
              required
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div
              className={`flex items-center justify-between ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("orderItems")}
              </h3>
              <button
                type="button"
                onClick={addItem}
                className={`flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 ${
                  isRTL ? "flex-row" : ""
                }`}
              >
                <Plus className="w-4 h-4" />
                {t("addItem")}
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4"
                >
                  <div
                    className={`flex items-center justify-between ${
                      isRTL ? "flex-row" : ""
                    }`}
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {t("item")} {index + 1}
                    </h4>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <FormField
                        label={t("itemName")}
                        name={`item_${index}_name`}
                        type="select"
                        value={item.item_name}
                        onChange={(e) =>
                          handleSelectItem(index, e.target.value)
                        }
                        error={errors[`item_${index}_name`]}
                        required
                        icon={<Package className="w-4 h-4" />}
                        options={[
                          {
                            value: "",
                            label: loadingSupplierItems
                              ? t("loading")
                              : t("selectItem"),
                          },
                          // Show supplier-specific items first if supplier is selected
                          ...(formData.supplier && supplierItems.length > 0
                            ? [
                                // Supplier items section
                                ...supplierItems.map((item) => ({
                                  value: item.name,
                                  label: item.name,
                                })),
                                // Divider
                                {
                                  value: "divider",
                                  label: "──────────",
                                  disabled: true,
                                },
                              ]
                            : []),
                          // General inventory items
                          ...(products || []).map((product) => ({
                            value: product.name,
                            label: product.name,
                          })),
                          { value: "other", label: t("other") },
                        ]}
                      />

                      {item.item_name === "other" && (
                        <FormField
                          label={t("customItemName")}
                          name={`item_${index}_customName`}
                          type="text"
                          value={item.customName}
                          onChange={(e) =>
                            updateItem(index, "customName", e.target.value)
                          }
                          error={errors[`item_${index}_name`]}
                          required
                          placeholder={t("enterCustomItemName")}
                          icon={<Package className="w-4 h-4" />}
                        />
                      )}
                    </div>

                    <FormField
                      label={t("quantity")}
                      name={`item_${index}_quantity`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      error={errors[`item_${index}_quantity`]}
                      required
                      min="1"
                      icon={<Package className="w-4 h-4" />}
                    />

                    <FormField
                      label={t("unitPrice")}
                      name={`item_${index}_price`}
                      type="number"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "unit_price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      error={errors[`item_${index}_price`]}
                      required
                      min="0"
                      step="0.01"
                      icon={<DollarSign className="w-4 h-4" />}
                    />
                  </div>

                  <div
                    className={`text-sm text-gray-600 dark:text-gray-400 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {t("subtotal")}:{" "}
                    {((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}{" "}
                    {t("sar")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status and Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField
              label={t("status")}
              name="status"
              type="select"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              icon={<FileText className="w-4 h-4" />}
              options={statusOptions}
            />

            <FormField
              label={t("notes")}
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder={t("additionalNotes")}
              rows={3}
            />
          </div>

          {/* Total Amount */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div
              className={`flex items-center gap-2 mb-2 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <label className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {t("totalAmount")}
              </label>
            </div>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              {calculateTotal().toFixed(2)} {t("sar")}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {t("calculatedAutomatically")}
            </p>
          </div>

          {/* Form Actions */}
          <div
            className={`flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              <Truck className="w-4 h-4" />
              {editData ? t("updatePurchaseOrder") : t("createPurchaseOrder")}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
