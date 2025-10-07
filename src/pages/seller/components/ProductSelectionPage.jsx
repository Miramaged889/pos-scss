import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Search, Filter } from "lucide-react";
import { productService } from "../../../services";

const ProductSelectionPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getProducts();
        setProducts(response);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Load selected products from cart if coming back from cart page
  useEffect(() => {
    if (location.state?.selectedProducts) {
      setSelectedProducts(location.state.selectedProducts);
    }
  }, [location.state]);

  const categories = [
    { value: "all", label: t("allCategories") },
    { value: "main", label: t("mainCourse") },
    { value: "side", label: t("sideDish") },
    { value: "beverages", label: t("beverages") },
    { value: "desserts", label: t("desserts") },
  ];

  const subcategories = {
    main: [
      { value: "all", label: t("allSubcategories") },
      { value: "grilled", label: t("grilled") },
      { value: "fried", label: t("fried") },
      { value: "pasta", label: t("pasta") },
      { value: "rice", label: t("rice") },
      { value: "seafood", label: t("seafood") },
    ],
    side: [
      { value: "all", label: t("allSubcategories") },
      { value: "salads", label: t("salads") },
      { value: "appetizers", label: t("appetizers") },
      { value: "bread", label: t("bread") },
      { value: "soup", label: t("soup") },
    ],
    beverages: [
      { value: "all", label: t("allSubcategories") },
      { value: "hot", label: t("hotDrinks") },
      { value: "cold", label: t("coldDrinks") },
      { value: "juices", label: t("juices") },
      { value: "soft", label: t("softDrinks") },
    ],
    desserts: [
      { value: "all", label: t("allSubcategories") },
      { value: "cakes", label: t("cakes") },
      { value: "ice_cream", label: t("iceCream") },
      { value: "traditional", label: t("traditional") },
      { value: "chocolate", label: t("chocolate") },
    ],
    all: [{ value: "all", label: t("allSubcategories") }],
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nameEn?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    const matchesSubcategory =
      subcategoryFilter === "all" || product.subcategory === subcategoryFilter;
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  const handleAddToCart = (productId) => {
    setSelectedProducts((prev) => {
      const currentQty = prev[productId]?.quantity || 0;
      const product = products.find((p) => p.id === productId);

      if (!product || product.stock === 0) {
        return prev;
      }

      return {
        ...prev,
        [productId]: {
          quantity: currentQty + 1,
          name: product.name,
          nameEn: product.nameEn,
          price: product.price,
          imageUrl: product.imageUrl,
          unitSize: product.unitSize,
          unitType: product.unitType,
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

  const handleViewCart = () => {
    if (Object.keys(selectedProducts).length === 0) {
      return;
    }

    navigate("/seller/cart", { state: { selectedProducts } });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              {t("loadingProducts")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search Input */}
          <div className="relative">
            <Search
              className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 ${
                isRTL ? "right-3" : "left-3"
              }`}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("searchProducts")}
              className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 ${
                isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter
              className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 ${
                isRTL ? "right-3" : "left-3"
              }`}
            />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setSubcategoryFilter("all");
              }}
              className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none ${
                isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div className="relative">
            <Filter
              className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 ${
                isRTL ? "right-3" : "left-3"
              }`}
            />
            <select
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none ${
                isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              {subcategories[categoryFilter]?.map((subcategory) => (
                <option key={subcategory.value} value={subcategory.value}>
                  {subcategory.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => handleAddToCart(product.id)}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 ${
              product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
            } ${
              selectedProducts[product.id]
                ? "ring-2 ring-blue-500 dark:ring-blue-400"
                : ""
            }`}
          >
            {/* Product Image */}
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-24 sm:h-32 object-cover rounded-md mb-2"
              />
            ) : (
              <div className="w-full h-24 sm:h-32 bg-gray-200 dark:bg-gray-700 rounded-md mb-2 flex items-center justify-center">
                <span className="text-gray-400 text-xs">{t("noImage")}</span>
              </div>
            )}

            {/* Product Name */}
            <div
              className={`text-sm font-medium mb-1 dark:text-white line-clamp-2 ${
                isRTL ? "text-right" : "text-left"
              }`}
              title={isRTL ? product.name : product.nameEn || product.name}
            >
              {isRTL ? product.name : product.nameEn || product.name}
            </div>

            {/* Price */}
            <div className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-2">
              {product.price} {t("currency")}
            </div>

            {/* Add to Cart Indicator */}
            {selectedProducts[product.id] && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold">
                  {selectedProducts[product.id].quantity}
                </div>
              </div>
            )}

            {/* Out of Stock Indicator */}
            {product.stock === 0 && (
              <div className="text-center">
                <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                  {t("outOfStock")}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cart Bar */}
      {Object.keys(selectedProducts).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className={isRTL ? "text-right" : "text-left"}>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("total")}: {calculateTotal().toFixed(2)} {t("currency")}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {Object.keys(selectedProducts).length} {t("itemsSelected")}
              </div>
            </div>

            <button
              onClick={handleViewCart}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {t("viewCart")}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Padding for Fixed Cart Bar */}
      <div className="h-24"></div>
    </div>
  );
};

export default ProductSelectionPage;
