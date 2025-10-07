import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";

const CartPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const { products } = useSelector((state) => state.inventory);
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState({});

  useEffect(() => {
    if (location.state?.selectedProducts) {
      setCartItems(location.state.selectedProducts);
    }
  }, [location.state]);

  const handleQuantityChange = (productId, change) => {
    setCartItems((prev) => {
      const currentQty = prev[productId]?.quantity || 0;
      const newQty = Math.max(0, currentQty + change);
      const product = products.find((p) => p.id === productId);

      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }

      if (newQty > product?.stock) {
        return prev; // Don't allow quantity greater than stock
      }

      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          quantity: newQty,
        },
      };
    });
  };

  const removeItem = (productId) => {
    setCartItems((prev) => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  };

  const calculateTotal = () => {
    return Object.entries(cartItems).reduce(
      (total, [, item]) => total + item.quantity * item.price,
      0
    );
  };

  const calculateItemsCount = () => {
    return Object.values(cartItems).reduce(
      (total, item) => total + item.quantity,
      0
    );
  };

  const handleProceedToCheckout = () => {
    if (Object.keys(cartItems).length === 0) {
      return;
    }

    const orderData = {
      products: Object.entries(cartItems).map(([id, item]) => ({
        id: parseInt(id), // Changed from productId to id to match orderService expectations
        name: item.name,
        nameEn: item.nameEn,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl,
        unitSize: item.unitSize,
        unitType: item.unitType,
      })),
      total: calculateTotal(),
    };

    navigate("/seller/checkout", { state: { orderData } });
  };

  const handleBackToProducts = () => {
    navigate("/seller", {
      state: { selectedProducts: cartItems },
    });
  };

  if (Object.keys(cartItems).length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("emptyCart")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("addItemsToCart")}
          </p>
          <button
            onClick={() => navigate("/seller/product-selection")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {t("browseProducts")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className={`flex items-center gap-4 ${isRTL ? "flex-row" : ""}`}>
          <button
            onClick={handleBackToProducts}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft
              className={`w-5 h-5 ${isRTL ? "transform rotate-180" : ""}`}
            />
          </button>
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("shoppingCart")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {calculateItemsCount()} {t("itemsInCart")}
            </p>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-8">
        {Object.entries(cartItems).map(([productId, item]) => {
          const product = products.find((p) => p.id === parseInt(productId));
          return (
            <div
              key={productId}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div
                className={`flex items-center gap-4 ${isRTL ? "flex-row" : ""}`}
              >
                {/* Product Image */}
                <div className="flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">
                        {t("noImage")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-medium text-gray-900 dark:text-white ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {isRTL ? item.name : item.nameEn || item.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold">
                    {item.price} {t("currency")}
                  </p>
                  {product && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("available")}: {product.stock}
                    </p>
                  )}
                </div>

                {/* Quantity Controls */}
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row" : ""
                  }`}
                >
                  <button
                    onClick={() =>
                      handleQuantityChange(parseInt(productId), -1)
                    }
                    className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => handleQuantityChange(parseInt(productId), 1)}
                    disabled={product && item.quantity >= product.stock}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => removeItem(parseInt(productId))}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Item Total */}
                <div
                  className={`text-right min-w-0 ${
                    isRTL ? "text-left" : "text-right"
                  }`}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {(item.quantity * item.price).toFixed(2)} {t("currency")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="space-y-4">
          <div
            className={`flex justify-between items-center ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {t("subtotal")}:
            </span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {calculateTotal().toFixed(2)} {t("currency")}
            </span>
          </div>

          <div
            className={`flex justify-between items-center ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("totalItems")}:
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {calculateItemsCount()} {t("items")}
            </span>
          </div>

          <hr className="border-gray-200 dark:border-gray-600" />

          <div
            className={`flex justify-between items-center ${
              isRTL ? "flex-row" : ""
            }`}
          >
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {t("total")}:
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {calculateTotal().toFixed(2)} {t("currency")}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex gap-4 mt-8 ${isRTL ? "flex-row" : ""}`}>
        <button
          onClick={handleBackToProducts}
          className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {t("continueShopping")}
        </button>

        <button
          onClick={handleProceedToCheckout}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          {t("proceedToCheckout")}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
