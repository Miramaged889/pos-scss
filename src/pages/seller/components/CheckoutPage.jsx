import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  CreditCard,
  Banknote,
  Wallet,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  MapPin,
  Receipt,
  Lock,
  Hash,
} from "lucide-react";
import { addPayment } from "../../../utils/localStorage";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const navigate = useNavigate();
  const location = useLocation();

  // Get order data from navigation state
  const orderData = location.state?.orderData;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    kentAccountNumber: "",
    kentPin: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if no order data
  useEffect(() => {
    if (!orderData) {
      navigate("/seller/new-order");
      toast.error(t("noOrderDataFound"));
    }
  }, [orderData, navigate, t]);

  if (!orderData) {
    return null;
  }

  const paymentMethods = [
    {
      id: "cash",
      name: t("cash"),
      icon: Banknote,
      description: t("payWithCash"),
      color: "green",
    },
    {
      id: "card",
      name: t("card"),
      icon: CreditCard,
      description: t("payWithCard"),
      color: "blue",
    },
    {
      id: "kent",
      name: t("kent"),
      icon: Wallet,
      description: t("payWithKent"),
      color: "purple",
    },
  ];

  const handleInputChange = (field, value) => {
    setPaymentDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validatePayment = () => {
    const newErrors = {};

    if (selectedPaymentMethod === "card") {
      if (!paymentDetails.cardNumber.trim()) {
        newErrors.cardNumber = t("cardNumberRequired");
      } else if (paymentDetails.cardNumber.replace(/\s/g, "").length !== 16) {
        newErrors.cardNumber = t("invalidCardNumber");
      }

      if (!paymentDetails.expiryDate.trim()) {
        newErrors.expiryDate = t("expiryDateRequired");
      } else if (!/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) {
        newErrors.expiryDate = t("invalidExpiryDate");
      }

      if (!paymentDetails.cvv.trim()) {
        newErrors.cvv = t("cvvRequired");
      } else if (paymentDetails.cvv.length !== 3) {
        newErrors.cvv = t("invalidCvv");
      }

      if (!paymentDetails.cardholderName.trim()) {
        newErrors.cardholderName = t("cardholderNameRequired");
      }
    } else if (selectedPaymentMethod === "kent") {
      if (!paymentDetails.kentAccountNumber.trim()) {
        newErrors.kentAccountNumber = t("kentAccountRequired");
      }

      if (!paymentDetails.kentPin.trim()) {
        newErrors.kentPin = t("kentPinRequired");
      } else if (paymentDetails.kentPin.length !== 4) {
        newErrors.kentPin = t("invalidKentPin");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value) => {
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiryDate = (value) => {
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length >= 2) {
      return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}`;
    }
    return digitsOnly;
  };

  const handlePayment = async () => {
    if (!validatePayment()) {
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Calculate fees based on payment method
      let fees = 0;
      if (selectedPaymentMethod === "card") {
        fees = orderData.total * 0.03; // 3% fee for card payments
      } else if (selectedPaymentMethod === "kent") {
        fees = orderData.total * 0.025; // 2.5% fee for kent payments
      }
      // Cash payments have no fees

      const paymentRecord = {
        orderId: orderData.id,
        amount: orderData.total,
        fees: fees,
        method: selectedPaymentMethod,
        status: "completed",
        customer: orderData.customer || t("unknownCustomer"),
        customerPhone: orderData.phone || "",
        description: orderData.products
          ? `${orderData.products.map((p) => p.name).join(", ")} (${
              orderData.products.length
            } ${t("items")})`
          : t("orderPayment"),
        details:
          selectedPaymentMethod === "card"
            ? {
                cardNumber: `****-****-****-${paymentDetails.cardNumber.slice(
                  -4
                )}`,
                cardholderName: paymentDetails.cardholderName,
              }
            : selectedPaymentMethod === "kent"
            ? {
                accountNumber: `****${paymentDetails.kentAccountNumber.slice(
                  -4
                )}`,
              }
            : {},
      };

      // Use the new addPayment function which generates unique transaction ID
      const savedPayment = addPayment(paymentRecord);

      const updatedOrderData = {
        ...orderData,
        status: "confirmed",
        paymentStatus: "paid",
        paymentMethod: selectedPaymentMethod,
        paymentId: savedPayment.id,
        transactionId: savedPayment.transactionId,
      };

      toast.success(t("paymentSuccessful"));

      navigate("/seller/orders", {
        state: {
          newOrder: updatedOrderData,
          showSuccessMessage: true,
        },
      });
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(t("paymentFailed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToOrder = () => {
    navigate("/seller/new-order", { state: { orderData } });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToOrder}
            className={`inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
            {t("backToOrder")}
          </button>

          <div
            className={`flex items-center gap-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1
                className={`text-3xl font-bold text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("checkout")}
              </h1>
              <p
                className={`text-gray-600 dark:text-gray-400 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("completeYourPayment")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h2
                className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("orderSummary")}
              </h2>

              {/* Order ID */}
              {orderData.id && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {t("orderId")}
                      </span>
                      <p className="font-mono text-sm font-bold text-blue-800 dark:text-blue-300">
                        {orderData.id}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="space-y-3 mb-6">
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {orderData.customer || t("noCustomerName")}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {orderData.phone || t("noPhoneNumber")}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {orderData.deliveryAddress || t("noDeliveryAddress")}
                  </span>
                </div>
              </div>

              {/* Products */}
              <div className="space-y-3 mb-6">
                <h3
                  className={`font-medium text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("products")}
                </h3>
                {(orderData.products || []).map((product, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center py-2 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name || t("unknownProduct")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("quantity")}: {product.quantity || 0}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {((product.price || 0) * (product.quantity || 0)).toFixed(
                        2
                      )}{" "}
                      {t("sar")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div
                  className={`flex justify-between items-center ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("total")}
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {(orderData.total || 0).toFixed(2)} {t("sar")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6">
              <h2
                className={`text-xl font-semibold text-gray-900 dark:text-white mb-6 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("selectPaymentMethod")}
              </h2>

              {/* Payment Method Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPaymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Icon
                          className={`w-8 h-8 ${
                            isSelected
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        />
                        <div>
                          <p
                            className={`font-medium ${
                              isSelected
                                ? "text-blue-900 dark:text-blue-100"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {method.name}
                          </p>
                          <p
                            className={`text-xs ${
                              isSelected
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Payment Details Forms */}
              {selectedPaymentMethod === "card" && (
                <div className="space-y-6">
                  <h3
                    className={`text-lg font-medium text-gray-900 dark:text-white ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {t("cardDetails")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label
                        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {t("cardNumber")}
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.cardNumber}
                        onChange={(e) =>
                          handleInputChange(
                            "cardNumber",
                            formatCardNumber(e.target.value)
                          )
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          isRTL ? "text-right" : "text-left"
                        } ${errors.cardNumber ? "border-red-500" : ""}`}
                      />
                      {errors.cardNumber && (
                        <p
                          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {t("expiryDate")}
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.expiryDate}
                        onChange={(e) =>
                          handleInputChange(
                            "expiryDate",
                            formatExpiryDate(e.target.value)
                          )
                        }
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          isRTL ? "text-right" : "text-left"
                        } ${errors.expiryDate ? "border-red-500" : ""}`}
                      />
                      {errors.expiryDate && (
                        <p
                          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          {errors.expiryDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {t("cvv")}
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.cvv}
                        onChange={(e) =>
                          handleInputChange(
                            "cvv",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="123"
                        maxLength={3}
                        className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          isRTL ? "text-right" : "text-left"
                        } ${errors.cvv ? "border-red-500" : ""}`}
                      />
                      {errors.cvv && (
                        <p
                          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          {errors.cvv}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label
                        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {t("cardholderName")}
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.cardholderName}
                        onChange={(e) =>
                          handleInputChange("cardholderName", e.target.value)
                        }
                        placeholder={t("enterCardholderName")}
                        className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          isRTL ? "text-right" : "text-left"
                        } ${errors.cardholderName ? "border-red-500" : ""}`}
                      />
                      {errors.cardholderName && (
                        <p
                          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          {errors.cardholderName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === "kent" && (
                <div className="space-y-6">
                  <h3
                    className={`text-lg font-medium text-gray-900 dark:text-white ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {t("kentDetails")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {t("kentAccountNumber")}
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.kentAccountNumber}
                        onChange={(e) =>
                          handleInputChange("kentAccountNumber", e.target.value)
                        }
                        placeholder={t("enterKentAccountNumber")}
                        className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          isRTL ? "text-right" : "text-left"
                        } ${errors.kentAccountNumber ? "border-red-500" : ""}`}
                      />
                      {errors.kentAccountNumber && (
                        <p
                          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          {errors.kentAccountNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {t("kentPin")}
                      </label>
                      <input
                        type="password"
                        value={paymentDetails.kentPin}
                        onChange={(e) =>
                          handleInputChange(
                            "kentPin",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="****"
                        maxLength={4}
                        className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          isRTL ? "text-right" : "text-left"
                        } ${errors.kentPin ? "border-red-500" : ""}`}
                      />
                      {errors.kentPin && (
                        <p
                          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          {errors.kentPin}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === "cash" && (
                <div className="text-center py-8">
                  <Banknote className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t("cashPayment")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("cashPaymentDescription")}
                  </p>
                </div>
              )}

              {/* Security Notice */}
              <div
                className={`flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mt-6 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Lock className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <p
                  className={`text-sm text-gray-600 dark:text-gray-400 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("securePaymentNotice")}
                </p>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full mt-8 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {t("processing")}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t("completePayment")} - {(orderData.total || 0).toFixed(2)}{" "}
                    {t("sar")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
