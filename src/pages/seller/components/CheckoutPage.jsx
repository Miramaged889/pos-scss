import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  Receipt,
  Truck,
  Store,
  CreditCard,
  Wallet,
  Banknote,
  Calendar,
  CheckCircle,
  ChevronRight,
  Plus,
  Package,
} from "lucide-react";
import FormField from "../../../components/Forms/FormField";
import api from "../../../services/api";

// Phase 1: Choose Delivery & Payment
const PhaseOne = ({
  deliveryType,
  setDeliveryType,
  paymentMethod,
  setPaymentMethod,
  onNext,
  isRTL,
  t,
}) => {
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

  const canProceed = deliveryType && paymentMethod;
  const requiresPhase2 =
    deliveryType === "delivery" || paymentMethod === "credit";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Store className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("phase")} 1: {t("deliveryAndPayment")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("selectDeliveryAndPaymentMethod")}
          </p>
        </div>
      </div>

      {/* Delivery Type Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("deliveryOption")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setDeliveryType("pickup")}
            className={`p-4 rounded-xl border-2 transition-all duration-300 w-full ${
              deliveryType === "pickup"
                ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <Store
                className={`w-6 h-6 ${
                  deliveryType === "pickup"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              />
              <div className="flex flex-col items-start">
                <p
                  className={`font-medium ${
                    deliveryType === "pickup"
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {t("pickup")}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("pickupDescription")}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setDeliveryType("delivery")}
            className={`p-4 rounded-xl border-2 transition-all duration-300 w-full ${
              deliveryType === "delivery"
                ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <Truck
                className={`w-6 h-6 ${
                  deliveryType === "delivery"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              />
              <div className="flex flex-col items-start">
                <p
                  className={`font-medium ${
                    deliveryType === "delivery"
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {t("delivery")}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("deliveryDescription")}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("paymentMethod")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 w-full ${
                paymentMethod === method.id
                  ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500"
              }`}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <method.icon
                  className={`w-6 h-6 ${
                    paymentMethod === method.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
                <p
                  className={`font-medium text-sm ${
                    paymentMethod === method.id
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {method.label}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Alert */}
      {requiresPhase2 && canProceed && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            ℹ️ {t("customerInformationRequired")}
          </p>
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`w-full px-6 py-3 font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
          canProceed
            ? "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
            : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        }`}
      >
        {t("continue")}
        {isRTL ? (
          <ArrowLeft className="w-5 h-5" />
        ) : (
          <ArrowRight className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

// Phase 2: Customer Information
const PhaseTwo = ({
  deliveryType,
  paymentMethod,
  customerMode,
  setCustomerMode,
  selectedCustomerId,
  setSelectedCustomerId,
  customerInfo,
  setCustomerInfo,
  onNext,
  onBack,
  onSkip,
  isRTL,
  t,
}) => {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [errors, setErrors] = useState({});

  // Check if customer info is optional (not required)
  const isOptional = deliveryType !== "delivery" && paymentMethod !== "credit";

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await api.get("/customer/customers/");

      // Handle different response formats
      const customersList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setCustomers(customersList);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error(t("errorLoadingCustomers"));
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Load customers when component mounts
  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateNewCustomer = () => {
    const newErrors = {};

    const phoneValue = (
      customerInfo?.phone !== undefined && customerInfo?.phone !== null
        ? customerInfo.phone.toString()
        : ""
    ).trim();

    if (!phoneValue) {
      newErrors.phone = t("phoneRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCustomer = async () => {
    if (!validateNewCustomer()) {
      return;
    }

    try {
      setIsCreatingCustomer(true);
      const rawPhone = String(customerInfo.phone ?? "").trim();
      const numericPhone = rawPhone.replace(/\D/g, "");

      if (!numericPhone) {
        throw new Error("Invalid phone number");
      }

      const fallbackName =
        customerInfo.name?.trim() && customerInfo.name.trim().length > 0
          ? customerInfo.name.trim()
          : numericPhone;
      const fallbackAddress =
        customerInfo.address?.trim() && customerInfo.address.trim().length > 0
          ? customerInfo.address.trim()
          : "N/A";
      const fallbackEmail =
        customerInfo.email?.trim() && customerInfo.email.trim().length > 0
          ? customerInfo.email.trim()
          : `${numericPhone}@customer.local`;

      const newCustomer = {
        customer_name: fallbackName,
        customer_phone: numericPhone,
        customer_address: fallbackAddress,
        customer_email: fallbackEmail,
        notes: "Created from checkout",
      };

      const response = await api.post("/customer/customers/", newCustomer);

      // Handle different response formats
      let customerData = null;
      if (response.data) {
        customerData = response.data;
      } else if (response.id) {
        // API returns data directly in response object
        customerData = response;
      }

      if (customerData && customerData.id) {
        toast.success(t("customerCreatedSuccessfully"));
        const customerId = customerData.id;
        setSelectedCustomerId(customerId);

        // Update customer info with the created customer data
        setCustomerInfo({
          name: customerData.customer_name || customerInfo.name,
          phone:
            customerData.customer_phone != null
              ? String(customerData.customer_phone)
              : customerInfo.phone,
          address: customerData.customer_address || customerInfo.address,
          email: customerData.customer_email || customerInfo.email,
        });

        // Reload customers list
        await loadCustomers();
        // Move to next phase with the new customer ID
        onNext(customerId);
      } else {
        console.error("Unexpected response format:", response);
        throw new Error("Invalid response from customer creation API");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // More specific error handling
      let errorMessage = t("errorCreatingCustomer");

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data) {
        // Handle field-specific errors
        const fieldErrors = Object.values(error.response.data).flat();
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join(", ");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find((c) => c.id === parseInt(customerId));
    if (customer) {
      setCustomerInfo({
        name: customer.customer_name || "",
        phone:
          customer.customer_phone != null
            ? String(customer.customer_phone)
            : "",
        address: customer.customer_address || "",
        email: customer.customer_email || "",
      });
    }
  };

  const handleContinue = () => {
    if (customerMode === "existing") {
      if (!selectedCustomerId) {
        // If optional and no customer selected, allow continue without customer
        if (isOptional) {
          onNext(null);
        } else {
          toast.error(t("pleaseSelectCustomer"));
        }
        return;
      }
      onNext(selectedCustomerId);
    } else {
      handleCreateCustomer();
    }
  };

  const phoneValueRaw = customerInfo.phone ?? "";
  const phoneString = String(phoneValueRaw);
  const phoneTrimmed = phoneString.trim();

  const canProceed =
    (customerMode === "existing" && (selectedCustomerId || isOptional)) ||
    (customerMode === "new" && phoneTrimmed.length > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <User className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("phase")} 2: {t("customerInformation")}
            {isOptional && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({t("optional")})
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isOptional
              ? t("optionalCustomerInfoDescription")
              : t("selectOrCreateCustomer")}
          </p>
        </div>
      </div>

      {/* Info Alert for Optional */}
      {isOptional && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            ℹ️ {t("customerInfoOptionalMessage")}
          </p>
        </div>
      )}

      {/* Customer Mode Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setCustomerMode("existing")}
          className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 flex-1 flex items-center justify-center gap-2 ${
            customerMode === "existing"
              ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-500"
          }`}
        >
          <User className="w-4 h-4" />
          {t("existingCustomer")}
        </button>
        <button
          type="button"
          onClick={() => {
            setCustomerMode("new");
            setSelectedCustomerId("");
            setCustomerInfo({ name: "", phone: "", address: "", email: "" });
          }}
          className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 flex-1 flex items-center justify-center gap-2 ${
            customerMode === "new"
              ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-500"
          }`}
        >
          <Plus className="w-4 h-4" />
          {t("newCustomer")}
        </button>
      </div>

      {/* Existing Customer Selection */}
      {customerMode === "existing" && (
        <div className="space-y-4">
          {/* Debug Info - Can be removed after testing */}
          {!loadingCustomers && customers.length === 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ {t("noCustomersFound")} - {t("loading")}...
            </div>
          )}

          <FormField
            label={t("selectCustomer")}
            type="select"
            value={selectedCustomerId}
            onChange={(e) => handleSelectCustomer(e.target.value)}
            options={[
              {
                value: "",
                label: loadingCustomers
                  ? t("loading")
                  : customers.length === 0
                  ? t("noCustomersAvailable")
                  : t("selectCustomer"),
              },
              ...(customers || []).map((customer) => {
                // Add null checks and default values
                const name =
                  customer?.customer_name || customer?.name || "Unknown";
                const phone = customer?.customer_phone || customer?.phone || "";
                return {
                  value: customer.id,
                  label: phone ? `${name} - ${phone}` : name,
                };
              }),
            ]}
            disabled={loadingCustomers}
            icon={<User className="w-4 h-4" />}
          />

          {selectedCustomerId && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t("selectedCustomerInfo")}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t("name")}:</strong> {customerInfo.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t("phone")}:</strong> {customerInfo.phone}
              </p>
              {customerInfo.email && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{t("email")}:</strong> {customerInfo.email}
                </p>
              )}
              {customerInfo.address && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{t("address")}:</strong> {customerInfo.address}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* New Customer Form */}
      {customerMode === "new" && (
        <div className="space-y-4">
          <FormField
            label={t("phoneNumber")}
            value={phoneString}
            onChange={(e) =>
              setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))
            }
            error={errors.phone}
            required
            icon={<Phone className="w-4 h-4" />}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          {isRTL ? (
            <ArrowRight className="w-5 h-5" />
          ) : (
            <ArrowLeft className="w-5 h-5" />
          )}
          {t("back")}
        </button>

        {/* Skip Button - Only show when optional */}
        {isOptional && onSkip && (
          <button
            onClick={onSkip}
            className="px-6 py-3 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-2 border-orange-200 dark:border-orange-800 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {t("skipThisStep")}
            {isRTL ? (
              <ArrowLeft className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        )}

        <button
          onClick={handleContinue}
          disabled={!canProceed || isCreatingCustomer}
          className={`flex-1 px-6 py-3 font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            canProceed && !isCreatingCustomer
              ? "bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          {isCreatingCustomer ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {t("creating")}
            </>
          ) : (
            <>
              {t("continue")}
              {isRTL ? (
                <ArrowLeft className="w-5 h-5" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Phase 3: Confirm & Submit Order
const PhaseThree = ({
  deliveryType,
  paymentMethod,
  customerInfo,
  orderData,
  discount,
  setDiscount,
  onSubmit,
  onBack,
  isSubmitting,
  isRTL,
  t,
}) => {
  const subtotal = orderData?.total || 0;
  const totalAmount = subtotal - discount;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
          <Receipt className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("phase")} 3: {t("confirmOrder")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("reviewAndSubmitOrder")}
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-6">
        {/* Customer Info - Only show if exists */}
        {(customerInfo.name || customerInfo.phone) && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              {t("customerInformation")}
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t("name")}:</strong> {customerInfo.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t("phone")}:</strong> {customerInfo.phone}
              </p>
              {customerInfo.email && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{t("email")}:</strong> {customerInfo.email}
                </p>
              )}
              {customerInfo.address && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{t("address")}:</strong> {customerInfo.address}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Delivery & Payment Info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            {t("deliveryAndPayment")}
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{t("deliveryOption")}:</strong> {t(deliveryType)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{t("paymentMethod")}:</strong> {t(paymentMethod)}
            </p>
          </div>
        </div>

        {/* Products List */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            {t("orderItems")}
          </h3>
          <div className="space-y-3">
            {orderData?.products?.map((product, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {isRTL ? product.name : product.nameEn || product.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("quantity")}: {product.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {(product.price * product.quantity).toFixed(2)} {t("sar")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount Field */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            {t("discount")} ({t("optional")})
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              step="0.01"
              max={subtotal}
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("sar")}
            </span>
          </div>
          {discount > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              {t("discountApplied")}: -{discount.toFixed(2)} {t("sar")}
            </p>
          )}
        </div>

        {/* Total */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("subtotal")}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {subtotal.toFixed(2)} {t("sar")}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600 dark:text-red-400">
                  {t("discount")}
                </span>
                <span className="text-sm text-red-600 dark:text-red-400">
                  -{discount.toFixed(2)} {t("sar")}
                </span>
              </div>
            )}
            <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("total")}
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalAmount.toFixed(2)} {t("sar")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          {isRTL ? (
            <ArrowRight className="w-5 h-5" />
          ) : (
            <ArrowLeft className="w-5 h-5" />
          )}
          {t("back")}
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`flex-1 px-6 py-3 font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            isSubmitting
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-white"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {t("processing")}
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              {t("placeOrder")}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Main Checkout Component
const CheckoutPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const orderData = location.state?.orderData;

  // Phase management
  const [currentPhase, setCurrentPhase] = useState(1);

  // Phase 1 state
  const [deliveryType, setDeliveryType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Phase 2 state
  const [customerMode, setCustomerMode] = useState("existing"); // "existing" or "new"
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  });

  // Phase 3 state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (!orderData) {
      navigate("/seller/products");
      toast.error(t("noOrderDataFound"));
    }
  }, [orderData, navigate, t]);

  if (!orderData) {
    return null;
  }

  const handlePhaseOneNext = () => {
    // Always go to Phase 2 (customer info is optional when pickup + cash/card/knet)
    setCurrentPhase(2);
  };

  const handlePhaseTwoNext = (customerId) => {
    setSelectedCustomerId(customerId);
    setCurrentPhase(3);
  };

  const handlePhaseTwoSkip = () => {
    // Skip customer info and go directly to Phase 3
    setSelectedCustomerId("");
    setCustomerInfo({ name: "", phone: "", address: "", email: "" });
    setCurrentPhase(3);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);

    try {
      // Get the real seller ID from tenantusers API based on email
      let sellerId = null;
      if (user?.email) {
        try {
          const usersResponse = await api.get("/tenuser/tenantusers/");
          const users = Array.isArray(usersResponse.data)
            ? usersResponse.data
            : usersResponse;
          const currentUser = users.find((u) => u.email === user.email);
          if (currentUser) {
            sellerId = currentUser.id;
          }
        } catch (error) {
          console.error("Error fetching tenantusers:", error);
        }
      }

      // Calculate totals
      const subtotal = orderData?.total || 0;
      const totalAmount = subtotal - discount;

      // Build the order payload according to API schema
      const orderPayload = {
        status: "pending",
        payment_type: paymentMethod,
        delivery_option: deliveryType, // Add delivery option
        items:
          orderData?.products?.map((product) => ({
            product_id: product.id,
            quantity: product.quantity,
          })) || [],
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };

      // Add customer only if selected (convert to integer)
      if (selectedCustomerId) {
        orderPayload.customer = parseInt(selectedCustomerId);
      }

      // Add seller only if we found the ID
      if (sellerId) {
        orderPayload.seller = sellerId;
      }

      const response = await api.post("/seller/orders/", orderPayload);

      // Handle different response formats
      let createdOrder = null;
      if (response.data) {
        createdOrder = response.data;
      } else if (response.id) {
        // API returns data directly in response object
        createdOrder = response;
      }

      if (createdOrder) {
        toast.success(t("orderCreatedSuccessfully"));
        setIsSubmitting(false); // Reset loading state
        navigate("/seller/orders", {
          state: {
            newOrder: createdOrder,
            showSuccessMessage: true,
          },
        });
      } else {
        throw new Error("Invalid response from order creation API");
      }
    } catch (error) {
      console.error("=== ERROR DETAILS ===");
      console.error("Full Error:", error);
      console.error("Error Response:", error.response);
      console.error("Error Data:", error.response?.data);
      console.error("Error Status:", error.response?.status);
      console.error("====================");

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        (error.response?.data?.seller && error.response.data.seller[0]) ||
        JSON.stringify(error.response?.data) ||
        error.message ||
        t("errorCreatingOrder");
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleBackToProducts = () => {
    navigate("/seller/product-selection", { state: { orderData } });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("checkout")}
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  currentPhase >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                }`}
              >
                1
              </div>
              <span
                className={`text-sm font-medium ${
                  currentPhase >= 1
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500"
                }`}
              >
                {t("deliveryAndPayment")}
              </span>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400" />

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  currentPhase >= 2
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                }`}
              >
                2
              </div>
              <span
                className={`text-sm font-medium ${
                  currentPhase >= 2
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500"
                }`}
              >
                {t("customerInfo")}
              </span>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400" />

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  currentPhase >= 3
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                }`}
              >
                3
              </div>
              <span
                className={`text-sm font-medium ${
                  currentPhase >= 3
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500"
                }`}
              >
                {t("confirm")}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t("orderSummary")}
              </h2>

              {/* Products List */}
              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
                {orderData.products?.map((product, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {isRTL ? product.name : product.nameEn || product.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t("qty")}: {product.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {(product.price * product.quantity).toFixed(2)}{" "}
                        {t("sar")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("subtotal")}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {orderData.total?.toFixed(2)} {t("sar")}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {t("discount")}
                    </span>
                    <span className="text-sm text-red-600 dark:text-red-400">
                      -{discount.toFixed(2)} {t("sar")}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("total")}
                    </span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {(orderData.total - discount).toFixed(2)} {t("sar")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase Content */}
          <div className="lg:col-span-2">
            {currentPhase === 1 && (
              <PhaseOne
                deliveryType={deliveryType}
                setDeliveryType={setDeliveryType}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onNext={handlePhaseOneNext}
                isRTL={isRTL}
                t={t}
              />
            )}

            {currentPhase === 2 && (
              <PhaseTwo
                deliveryType={deliveryType}
                paymentMethod={paymentMethod}
                customerMode={customerMode}
                setCustomerMode={setCustomerMode}
                selectedCustomerId={selectedCustomerId}
                setSelectedCustomerId={setSelectedCustomerId}
                customerInfo={customerInfo}
                setCustomerInfo={setCustomerInfo}
                onNext={handlePhaseTwoNext}
                onBack={() => setCurrentPhase(1)}
                onSkip={handlePhaseTwoSkip}
                isRTL={isRTL}
                t={t}
              />
            )}

            {currentPhase === 3 && (
              <PhaseThree
                deliveryType={deliveryType}
                paymentMethod={paymentMethod}
                customerId={selectedCustomerId}
                customerInfo={customerInfo}
                orderData={orderData}
                discount={discount}
                setDiscount={setDiscount}
                onSubmit={handleSubmitOrder}
                onBack={() => {
                  // Go back to Phase 2 if it was required, otherwise Phase 1
                  const requiresPhase2 =
                    deliveryType === "delivery" || paymentMethod === "credit";
                  setCurrentPhase(requiresPhase2 ? 2 : 1);
                }}
                isSubmitting={isSubmitting}
                isRTL={isRTL}
                t={t}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
