import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  MapPin,
  Receipt,
  Truck,
  Store,
  CreditCard,
  Wallet,
  Banknote,
} from "lucide-react";
import FormField from "../../../components/Forms/FormField";
import { addOrder } from "../../../store/slices/ordersSlice";
import { addPayment, generateUniqueOrderId } from "../../../utils/localStorage";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const orderData = location.state?.orderData;

  const [deliveryType, setDeliveryType] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!orderData) {
      navigate("/seller/products");
      toast.error(t("noOrderDataFound"));
    }
  }, [orderData, navigate, t]);

  if (!orderData) {
    return null;
  }

  const validateForm = () => {
    const newErrors = {};

    if (deliveryType === "delivery") {
      if (!customerInfo.name.trim()) {
        newErrors.name = t("customerNameRequired");
      }
      if (!customerInfo.phone.trim()) {
        newErrors.phone = t("phoneRequired");
      }
      if (!customerInfo.address.trim()) {
        newErrors.address = t("addressRequired");
      }
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = t("paymentMethodRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Generate unique order ID first
    const orderId = generateUniqueOrderId();

    const finalOrderData = {
      ...orderData,
      id: orderId,
      deliveryType,
      paymentMethod,
      customer: customerInfo.name,
      phone: customerInfo.phone,
      deliveryAddress: customerInfo.address,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Add order to Redux store
    dispatch(addOrder(finalOrderData));

    // Create payment record with the generated order ID
    const paymentData = {
      orderId: orderId,
      amount: orderData.total,
      method: paymentMethod,
      customer: customerInfo.name,
      customerPhone: customerInfo.phone,
      status: "completed",
      description: `Order payment - ${orderData.products.length} items`,
    };

    // Add payment to localStorage
    addPayment(paymentData);

    navigate("/seller/orders", {
      state: {
        newOrder: finalOrderData,
        showSuccessMessage: true,
      },
    });

    toast.success(t("orderCreatedSuccessfully"));
  };

  const handleBackToProducts = () => {
    navigate("/seller/product-selection", { state: { orderData } });
  };

  const paymentMethods = [
    {
      id: "cash",
      label: t("cash"),
      icon: Banknote,
      description: t("payWithCash"),
    },
    {
      id: "card",
      label: t("card"),
      icon: CreditCard,
      description: t("payWithCard"),
    },
    {
      id: "knet",
      label: t("knet"),
      icon: Wallet,
      description: t("payWithKNET"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToProducts}
            className={`inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 ${
              isRTL ? "flex-row" : ""
            }`}
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
            {t("backToProducts")}
          </button>

          <h1
            className={`text-2xl font-bold text-gray-900 dark:text-white mb-2`}
          >
            {t("checkout")}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
              <h2
                className={`text-xl font-semibold text-gray-900 dark:text-white mb-4`}
              >
                {t("orderSummary")}
              </h2>

              {/* Products List */}
              <div className="space-y-4 mb-6">
                {orderData.products.map((product, index) => (
                  <div
                    key={index}
                    className={`flex justify-between ${
                      isRTL ? "flex-row" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {isRTL ? product.name : product.nameEn}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("quantity")}: {product.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {(product.price * product.quantity).toFixed(2)}{" "}
                        {t("sar")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div
                  className={`flex justify-between items-center ${
                      isRTL ? "flex-row" : ""
                  }`}
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("total")}
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {orderData.total.toFixed(2)} {t("sar")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Options and Customer Info */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
              {/* Delivery Type Selection */}
              <div className="mb-8">
                <h3
                  className={`text-lg font-semibold text-gray-900 dark:text-white mb-4`}
                >
                  {t("deliveryOption")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setDeliveryType("pickup")}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      deliveryType === "pickup"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-6 h-6" />
                      <div className="flex flex-col items-start">
                        <p className="font-medium">{t("pickup")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("pickupDescription")}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setDeliveryType("delivery")}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      deliveryType === "delivery"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-6 h-6" />
                      <div className="flex flex-col items-start">
                        <p className="font-medium">{t("delivery")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("deliveryDescription")}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <h3
                  className={`text-lg font-semibold text-gray-900 dark:text-white mb-4`}
                >
                  {t("paymentMethod")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        paymentMethod === method.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <method.icon className="w-6 h-6" />
                        <div>
                          <p className="font-medium">{method.label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.paymentMethod && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.paymentMethod}
                  </p>
                )}
              </div>

              {/* Customer Information Form */}
              {deliveryType === "delivery" && (
                <div className="space-y-6">
                  <h3
                      className={`text-lg font-semibold text-gray-900 dark:text-white mb-4`}
                  >
                    {t("customerInformation")}
                  </h3>

                  <FormField
                    label={t("customerName")}
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    error={errors.name}
                    icon={<User className="w-4 h-4" />}
                  />

                  <FormField
                    label={t("phoneNumber")}
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    error={errors.phone}
                    icon={<Phone className="w-4 h-4" />}
                  />

                  <FormField
                    label={t("deliveryAddress")}
                    value={customerInfo.address}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    error={errors.address}
                    icon={<MapPin className="w-4 h-4" />}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Receipt className="w-5 h-5" />
                {t("placeOrder")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
