import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, ShoppingCart } from "lucide-react";

const ProductSelectionPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const { products } = useSelector((state) => state.inventory);
  const navigate = useNavigate();

  const [selectedProducts, setSelectedProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = [
    { value: "all", label: t("allCategories") },
    { value: "main", label: t("mainCourse") },
    { value: "side", label: t("sideDishes") },
    { value: "beverages", label: t("beverages") },
    { value: "desserts", label: t("desserts") },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleQuantityChange = (productId, change) => {
    setSelectedProducts((prev) => {
      const currentQty = prev[productId]?.quantity || 0;
      const newQty = Math.max(0, currentQty + change);

      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }

      const product = products.find((p) => p.id === productId);
      return {
        ...prev,
        [productId]: {
          quantity: newQty,
          name: product.name,
          nameEn: product.nameEn,
          price: product.price,
        },
      };
    });
  };

  const calculateTotal = () => {
    return Object.entries(selectedProducts).reduce(
      (total, [, product]) => total + product.quantity * product.price,
      0
    );
  };

  const handleProceedToCheckout = () => {
    if (Object.keys(selectedProducts).length === 0) {
      return;
    }

    const orderData = {
      products: Object.entries(selectedProducts).map(([id, product]) => ({
        productId: parseInt(id),
        name: product.name,
        nameEn: product.nameEn,
        quantity: product.quantity,
        price: product.price,
      })),
      total: calculateTotal(),
    };

    navigate("/seller/checkout", { state: { orderData } });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className={`text-2xl font-bold text-gray-900 dark:text-white mb-4 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("selectProducts")}
        </h1>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchProducts")}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-4"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />

            <div
              className={`text-lg font-semibold mb-2 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {isRTL ? product.name : product.nameEn}
            </div>

            <div className="text-blue-600 dark:text-blue-400 font-bold mb-4">
              {product.price} {t("sar")}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(product.id, -1)}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  disabled={!selectedProducts[product.id]}
                >
                  <Minus className="w-5 h-5" />
                </button>

                <span className="w-8 text-center font-medium">
                  {selectedProducts[product.id]?.quantity || 0}
                </span>

                <button
                  onClick={() => handleQuantityChange(product.id, 1)}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  disabled={product.stock === 0}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("inStock")}: {product.stock}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("total")}: {calculateTotal().toFixed(2)} {t("sar")}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Object.keys(selectedProducts).length} {t("itemsSelected")}
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={Object.keys(selectedProducts).length === 0}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {t("proceedToCheckout")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionPage;
