/**
 * Format currency values
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency symbol (default: 'ر.س')
 * @param {string} locale - The locale for formatting (default: 'ar-SA')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = "ر.س", locale = "ar-SA") => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `0 ${currency}`;
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${currency}`;
};

/**
 * Format currency values with English numbers
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency symbol (default: 'SAR')
 * @returns {string} - Formatted currency string with English numbers
 */
export const formatCurrencyEnglish = (amount, currency = "SAR") => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `0 ${currency}`;
  }

  // Force English locale for numbers
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${currency}`;
};

/**
 * Format date for display
 * @param {string|Date} date - The date to format
 * @param {string} locale - The locale for formatting (default: 'ar-SA')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, locale = "ar-SA", options = {}) => {
  if (!date) return "";

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options,
  }).format(new Date(date));
};

/**
 * Format time for display
 * @param {string|Date} date - The date to format
 * @param {string} locale - The locale for formatting (default: 'ar-SA')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted time string
 */
export const formatTime = (date, locale = "ar-SA", options = {}) => {
  if (!date) return "";

  const defaultOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options,
  }).format(new Date(date));
};

/**
 * Format date and time for display
 * @param {string|Date} date - The date to format
 * @param {string} locale - The locale for formatting (default: 'ar-SA')
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date, locale = "ar-SA") => {
  if (!date) return "";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

/**
 * Format date and time with English numbers
 * @param {string|Date} date - The date to format
 * @param {string} locale - The locale for formatting (default: 'ar-SA')
 * @returns {string} - Formatted date and time string with English numbers
 */
export const formatDateTimeEnglish = (date, locale = "ar-SA") => {
  if (!date) return "";

  const formatted = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

  // Replace Arabic-Indic digits with English digits
  return formatted.replace(/[\u0660-\u0669]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x0660 + 0x0030);
  });
};

/**
 * Format phone number for display
 * @param {string} phone - The phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Format Saudi phone numbers
  if (cleaned.startsWith("966")) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(
      5,
      8
    )} ${cleaned.slice(8)}`;
  } else if (cleaned.startsWith("05")) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return phone;
};

/**
 * Format order status for display
 * @param {string} status - The order status
 * @param {string} locale - The locale (default: 'ar')
 * @returns {string} - Formatted status string
 */
export const formatOrderStatus = (status, locale = "ar") => {
  const statusTranslations = {
    ar: {
      pending: "في الانتظار",
      confirmed: "مؤكد",
      preparing: "قيد التحضير",
      ready: "جاهز",
      out_for_delivery: "في الطريق",
      delivered: "تم التوصيل",
      completed: "مكتمل",
      cancelled: "ملغي",
      returned: "مُرتجع",
    },
    en: {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready: "Ready",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
      returned: "Returned",
    },
  };

  return statusTranslations[locale]?.[status] || status;
};

/**
 * Format relative time (e.g., "منذ 5 دقائق")
 * @param {string|Date} date - The date to format
 * @param {string} locale - The locale (default: 'ar')
 * @returns {string} - Formatted relative time string
 */
export const formatRelativeTime = (date, locale = "ar") => {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const intervals = {
    ar: {
      year: { single: "سنة", plural: "سنوات", value: 31536000 },
      month: { single: "شهر", plural: "أشهر", value: 2592000 },
      week: { single: "أسبوع", plural: "أسابيع", value: 604800 },
      day: { single: "يوم", plural: "أيام", value: 86400 },
      hour: { single: "ساعة", plural: "ساعات", value: 3600 },
      minute: { single: "دقيقة", plural: "دقائق", value: 60 },
      second: { single: "ثانية", plural: "ثوانٍ", value: 1 },
    },
    en: {
      year: { single: "year", plural: "years", value: 31536000 },
      month: { single: "month", plural: "months", value: 2592000 },
      week: { single: "week", plural: "weeks", value: 604800 },
      day: { single: "day", plural: "days", value: 86400 },
      hour: { single: "hour", plural: "hours", value: 3600 },
      minute: { single: "minute", plural: "minutes", value: 60 },
      second: { single: "second", plural: "seconds", value: 1 },
    },
  };

  const localeIntervals = intervals[locale] || intervals.ar;

  for (const [, interval] of Object.entries(localeIntervals)) {
    const count = Math.floor(diffInSeconds / interval.value);
    if (count >= 1) {
      const unit = count === 1 ? interval.single : interval.plural;
      return locale === "ar" ? `منذ ${count} ${unit}` : `${count} ${unit} ago`;
    }
  }

  return locale === "ar" ? "الآن" : "just now";
};

/**
 * Format file size for display
 * @param {number} bytes - The file size in bytes
 * @param {string} locale - The locale (default: 'ar')
 * @returns {string} - Formatted file size string
 */
export const formatFileSize = (bytes, locale = "ar") => {
  if (bytes === 0) return locale === "ar" ? "0 بايت" : "0 Bytes";

  const k = 1024;
  const sizes =
    locale === "ar"
      ? ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت", "تيرابايت"]
      : ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${size} ${sizes[i]}`;
};

/**
 * Format numbers in English regardless of locale
 * @param {number} number - The number to format
 * @returns {string} - Formatted number string in English
 */
export const formatNumberEnglish = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US").format(number);
};
