import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, FileText } from "lucide-react";

import { OrderForm } from "../../../components/Forms";
import { addOrder } from "../../../store/slices/ordersSlice";
import { updateStock } from "../../../store/slices/inventorySlice";

const NewSalesOrder = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOrderSubmit = (orderData) => {
    try {
      // Add order to store
      dispatch(addOrder(orderData));

      // Update inventory stock
      orderData.products.forEach((product) => {
        dispatch(
          updateStock({
            productId: product.productId,
            quantity: product.quantity,
            operation: "subtract",
          })
        );
      });

      // Show success message
      toast.success(t("orderCreatedSuccessfully"));

      // Navigate to orders list
      navigate("/seller/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(t("errorCreatingOrder"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <div
          className={`flex items-center gap-4 mb-4 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 group-hover:scale-110 transition-all duration-300">
            <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h1
              className={`text-2xl font-bold text-gray-900 dark:text-white mb-2 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("createNewOrder")}
            </h1>
            <p
              className={`text-gray-600 dark:text-gray-400 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("fillOrderDetailsToCreateNewSale")}
            </p>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <OrderForm onSubmit={handleOrderSubmit} submitLabel={t("createOrder")} />
    </div>
  );
};

export default NewSalesOrder;
