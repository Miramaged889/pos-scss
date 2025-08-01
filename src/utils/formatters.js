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
    calendar: "gregory", // Force Gregorian calendar
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
    calendar: "gregory", // Force Gregorian calendar
  }).format(new Date(date));
};

/**
 * Format date with English numbers and Gregorian calendar
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string with English numbers and Gregorian calendar
 */
export const formatDateEnglish = (date) => {
  if (!date) return "";

  // Force Gregorian calendar with English locale
  const formatted = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    calendar: "gregory", // Explicitly force Gregorian calendar
  }).format(new Date(date));

  return formatted;
};

/**
 * Format time with English numbers
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted time string with English numbers
 */
export const formatTimeEnglish = (date) => {
  if (!date) return "";

  // Force English locale for time
  const formatted = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));

  return formatted;
};

/**
 * Format date and time with English numbers and Gregorian calendar
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date and time string with English numbers and Gregorian calendar
 */
export const formatDateTimeEnglish = (date) => {
  if (!date) return "";

  // Force Gregorian calendar with English locale
  const formatted = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    calendar: "gregory", // Explicitly force Gregorian calendar
  }).format(new Date(date));

  return formatted;
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

/**
 * Convert number to Arabic words for currency amounts
 * @param {number} amount - The amount to convert
 * @returns {string} - Amount in Arabic words
 */
export const numberToWords = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "صفر ريال";
  }

  const ones = [
    "", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
    "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر",
    "سبعة عشر", "ثمانية عشر", "تسعة عشر"
  ];

  const tens = [
    "", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"
  ];

  const hundreds = [
    "", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"
  ];

  const thousands = [
    "", "ألف", "ألفان", "ثلاثة آلاف", "أربعة آلاف", "خمسة آلاف", "ستة آلاف", "سبعة آلاف", "ثمانية آلاف", "تسعة آلاف"
  ];

  const convertLessThanOneThousand = (num) => {
    if (num === 0) return "";

    let result = "";

    if (num >= 100) {
      result += hundreds[Math.floor(num / 100)] + " ";
      num %= 100;
    }

    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }

    if (num > 0) {
      result += ones[num] + " ";
    }

    return result.trim();
  };

  const convert = (num) => {
    if (num === 0) return "صفر";

    let result = "";

    if (num >= 1000000000) {
      const billions = Math.floor(num / 1000000000);
      result += convertLessThanOneThousand(billions) + " مليار ";
      num %= 1000000000;
    }

    if (num >= 1000000) {
      const millions = Math.floor(num / 1000000);
      result += convertLessThanOneThousand(millions) + " مليون ";
      num %= 1000000;
    }

    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      if (thousands === 1) {
        result += "ألف ";
      } else if (thousands === 2) {
        result += "ألفان ";
      } else if (thousands >= 3 && thousands <= 10) {
        result += convertLessThanOneThousand(thousands) + " آلاف ";
      } else {
        result += convertLessThanOneThousand(thousands) + " ألف ";
      }
      num %= 1000;
    }

    if (num > 0) {
      result += convertLessThanOneThousand(num);
    }

    return result.trim();
  };

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  let result = convert(integerPart) + " ريال";

  if (decimalPart > 0) {
    result += " و " + convert(decimalPart) + " هللة";
  }

  return result;
};
