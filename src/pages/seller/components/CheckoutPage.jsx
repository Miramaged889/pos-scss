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
  Calendar,
  Printer,
  RotateCcw,
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
    navigate("/seller", { state: { orderData } });
  };

  const handlePrintOrder = () => {
    const printContent = `
=================================
          طلب / ORDER
=================================

رقم الطلب / Order ID: ${generateUniqueOrderId()}
التاريخ / Date: ${new Date().toLocaleDateString()}
الوقت / Time: ${new Date().toLocaleTimeString()}

---------------------------------
تفاصيل الطلب / Order Details:
${orderData.products
  .map(
    (product, index) => `
${index + 1}. ${isRTL ? product.name : product.nameEn}
   الكمية / Quantity: ${product.quantity}
   السعر / Price: ${product.price} ${t("sar")}
   الإجمالي / Subtotal: ${(product.price * product.quantity).toFixed(2)} ${t(
      "sar"
    )}
`
  )
  .join("")}

---------------------------------
طريقة التوصيل / Delivery Type: ${t(deliveryType)}
طريقة الدفع / Payment Method: ${t(paymentMethod)}

${
  deliveryType === "delivery"
    ? `
معلومات العميل / Customer Information:
الاسم / Name: ${customerInfo.name}
الهاتف / Phone: ${customerInfo.phone}
العنوان / Address: ${customerInfo.address}
`
    : ""
}

---------------------------------
الإجمالي الكلي / Total: ${orderData.total.toFixed(2)} ${t("sar")}

=================================
شكراً لك / Thank You!
=================================
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${t("order")} - ${new Date().toLocaleDateString()}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              font-weight: bold;
              font-size: 18px;
            }
            .section { 
              margin: 15px 0; 
            }
            .total { 
              font-weight: bold; 
              font-size: 18px; 
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <pre style="font-family: 'Courier New', monospace; white-space: pre-wrap;">${printContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleResetForm = () => {
    setDeliveryType("pickup");
    setPaymentMethod("cash");
    setCustomerInfo({
      name: "",
      phone: "",
      address: "",
    });
    setErrors({});
    toast.success(t("formResetSuccessfully"));
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
    {
      id: "credit",
      label: t("credit"),
      icon: Calendar,
      description: t("payWithCredit"),
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("orderSummary")}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintOrder}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                    title={t("printOrder")}
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetForm}
                    className="p-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-light dark:hover:bg-surface-dark rounded-lg transition-all duration-200"
                    title={t("resetForm")}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Products List */}
              <div className="space-y-4 mb-6">
                {orderData.products.map((product, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg ${
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
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {orderData.total.toFixed(2)} {t("sar")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Options and Customer Info */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 p-6">
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
                        ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Store className={`w-6 h-6 ${
                        deliveryType === "pickup" 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-gray-600 dark:text-gray-400"
                      }`} />
                      <div className="flex flex-col items-start">
                        <p className={`font-medium ${
                          deliveryType === "pickup"
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-900 dark:text-white"
                        }`}>
                          {t("pickup")}
                        </p>
                        <p className={`text-sm ${
                          deliveryType === "pickup"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}>
                          {t("pickupDescription")}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setDeliveryType("delivery")}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      deliveryType === "delivery"
                        ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className={`w-6 h-6 ${
                        deliveryType === "delivery"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`} />
                      <div className="flex flex-col items-start">
                        <p className={`font-medium ${
                          deliveryType === "delivery"
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-900 dark:text-white"
                        }`}>
                          {t("delivery")}
                        </p>
                        <p className={`text-sm ${
                          deliveryType === "delivery"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        paymentMethod === method.id
                          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:shadow-md"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <method.icon className={`w-6 h-6 ${
                          paymentMethod === method.id
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`} />
                        <div>
                          <p className={`font-medium ${
                            paymentMethod === method.id
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-gray-900 dark:text-white"
                          }`}>{method.label}</p>
                          <p className={`text-sm ${
                            paymentMethod === method.id
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}>
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
                className="w-full mt-8 px-6 py-3 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
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
