/**
 * Validate email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Saudi phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidSaudiPhone = (phone) => {
  const phoneRegex = /^((\+966)|0)?5\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Validate international phone number (general validation)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidPhone = (phone) => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // Check for international format (+XXX...) or local format
  const internationalRegex = /^\+\d{10,15}$/; // International format
  const localRegex = /^\d{10,15}$/; // Local format
  const saudiRegex = /^((\+966)|0)?5\d{8}$/; // Saudi specific

  return (
    internationalRegex.test(cleaned) ||
    localRegex.test(cleaned) ||
    saudiRegex.test(phone.replace(/\s/g, ""))
  );
};

/**
 * Validate required field
 * @param {*} value - The value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Validate minimum length
 * @param {string} value - The value to validate
 * @param {number} minLength - The minimum length required
 * @returns {boolean} - True if valid, false otherwise
 */
export const hasMinLength = (value, minLength) => {
  if (!value) return false;
  return value.toString().length >= minLength;
};

/**
 * Validate maximum length
 * @param {string} value - The value to validate
 * @param {number} maxLength - The maximum length allowed
 * @returns {boolean} - True if valid, false otherwise
 */
export const hasMaxLength = (value, maxLength) => {
  if (!value) return true;
  return value.toString().length <= maxLength;
};

/**
 * Validate numeric value
 * @param {*} value - The value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isNumeric = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

/**
 * Validate positive number
 * @param {*} value - The value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isPositiveNumber = (value) => {
  return isNumeric(value) && parseFloat(value) > 0;
};

/**
 * Validate minimum value
 * @param {*} value - The value to validate
 * @param {number} min - The minimum value
 * @returns {boolean} - True if valid, false otherwise
 */
export const hasMinValue = (value, min) => {
  return isNumeric(value) && parseFloat(value) >= min;
};

/**
 * Validate maximum value
 * @param {*} value - The value to validate
 * @param {number} max - The maximum value
 * @returns {boolean} - True if valid, false otherwise
 */
export const hasMaxValue = (value, max) => {
  return isNumeric(value) && parseFloat(value) <= max;
};

/**
 * Validate Arabic text
 * @param {string} text - The text to validate
 * @returns {boolean} - True if contains Arabic characters, false otherwise
 */
export const containsArabic = (text) => {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

/**
 * Validate English text
 * @param {string} text - The text to validate
 * @returns {boolean} - True if contains English characters, false otherwise
 */
export const containsEnglish = (text) => {
  const englishRegex = /[a-zA-Z]/;
  return englishRegex.test(text);
};

/**
 * Validate credit card number (basic validation)
 * @param {string} cardNumber - The card number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidCreditCard = (cardNumber) => {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, "");

  // Check if it contains only digits and has valid length
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Comprehensive form validation
 * @param {object} data - The form data to validate
 * @param {object} rules - The validation rules
 * @returns {object} - Validation result with errors
 */
export const validateForm = (data, rules) => {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    const fieldErrors = [];

    // Required validation
    if (fieldRules.required && !isRequired(value)) {
      fieldErrors.push(
        fieldRules.required === true ? "هذا الحقل مطلوب" : fieldRules.required
      );
    }

    // Skip other validations if field is not required and empty
    if (!fieldRules.required && !isRequired(value)) {
      continue;
    }

    // Email validation
    if (fieldRules.email && !isValidEmail(value)) {
      fieldErrors.push(
        fieldRules.email === true
          ? "البريد الإلكتروني غير صحيح"
          : fieldRules.email
      );
    }

    // Phone validation
    if (fieldRules.phone && !isValidSaudiPhone(value)) {
      fieldErrors.push(
        fieldRules.phone === true ? "رقم الهاتف غير صحيح" : fieldRules.phone
      );
    }

    // Min length validation
    if (fieldRules.minLength && !hasMinLength(value, fieldRules.minLength)) {
      fieldErrors.push(`الحد الأدنى ${fieldRules.minLength} أحرف`);
    }

    // Max length validation
    if (fieldRules.maxLength && !hasMaxLength(value, fieldRules.maxLength)) {
      fieldErrors.push(`الحد الأقصى ${fieldRules.maxLength} حرف`);
    }

    // Numeric validation
    if (fieldRules.numeric && !isNumeric(value)) {
      fieldErrors.push(
        fieldRules.numeric === true ? "يجب أن يكون رقم" : fieldRules.numeric
      );
    }

    // Positive number validation
    if (fieldRules.positive && !isPositiveNumber(value)) {
      fieldErrors.push(
        fieldRules.positive === true
          ? "يجب أن يكون رقم موجب"
          : fieldRules.positive
      );
    }

    // Min value validation
    if (
      fieldRules.minValue !== undefined &&
      !hasMinValue(value, fieldRules.minValue)
    ) {
      fieldErrors.push(`الحد الأدنى ${fieldRules.minValue}`);
    }

    // Max value validation
    if (
      fieldRules.maxValue !== undefined &&
      !hasMaxValue(value, fieldRules.maxValue)
    ) {
      fieldErrors.push(`الحد الأقصى ${fieldRules.maxValue}`);
    }

    // Custom validation
    if (fieldRules.custom && typeof fieldRules.custom === "function") {
      const customResult = fieldRules.custom(value, data);
      if (customResult !== true) {
        fieldErrors.push(customResult);
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0]; // Return first error only
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
