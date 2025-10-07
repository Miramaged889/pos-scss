import React from "react";
import { useSelector } from "react-redux";

const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  options = [], // for select type
  rows = 3, // for textarea
  min,
  max,
  step,
  disabled = false,
  className = "",
  ...props
}) => {
  const { isRTL } = useSelector((state) => state.language);

  const baseInputClasses = `
    block w-full py-2 px-3 border rounded-lg 
    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400
    transition-colors duration-200
    ${
      error
        ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-gray-900 dark:text-red-100"
        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    }
    ${
      disabled
        ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-500 dark:text-gray-400"
        : ""
    }
    ${isRTL ? "text-right" : "text-left"}
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    ${className}
  `;

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={rows}
            disabled={disabled}
            className={baseInputClasses}
            {...props}
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={baseInputClasses}
            {...props}
          />
        );

      default:
        return (
          <input
            type={type}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
            {...props}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && (
            <span className="text-red-500 dark:text-red-400 ml-1">*</span>
          )}
        </label>
      )}

      {renderInput()}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <span className="text-red-500 dark:text-red-400">⚠</span>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

export default FormField;
