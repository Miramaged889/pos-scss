// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";
export const API_TIMEOUT = 30000; // 30 seconds

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  LANGUAGE: "app_language",
  THEME: "app_theme",
  CART_ITEMS: "cart_items",
  SETTINGS: "app_settings",
};

// Order Status Constants
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RETURNED: "returned",
};

// Order Status Colors
export const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: "yellow",
  [ORDER_STATUS.CONFIRMED]: "blue",
  [ORDER_STATUS.PREPARING]: "blue",
  [ORDER_STATUS.READY]: "green",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "purple",
  [ORDER_STATUS.DELIVERED]: "green",
  [ORDER_STATUS.COMPLETED]: "gray",
  [ORDER_STATUS.CANCELLED]: "red",
  [ORDER_STATUS.RETURNED]: "orange",
};

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  SELLER: "seller",
  KITCHEN: "kitchen",
  DELIVERY: "delivery",
  CUSTOMER: "customer",
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  DIGITAL: "digital",
  BANK_TRANSFER: "bank_transfer",
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGE_BUTTONS: 5,
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  BURGERS: "burgers",
  SANDWICHES: "sandwiches",
  SALADS: "salads",
  SIDES: "sides",
  BEVERAGES: "beverages",
  DESSERTS: "desserts",
};

// Default Values
export const DEFAULTS = {
  CURRENCY: "ر.س",
  LOCALE: "ar-SA",
  TIMEZONE: "Asia/Riyadh",
  LANGUAGE: "ar",
  DELIVERY_FEE: 15,
  MIN_ORDER_AMOUNT: 30,
  VAT_RATE: 0.15, // 15% VAT
};

// Form Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_INPUT_LENGTH: 255,
  MAX_TEXTAREA_LENGTH: 1000,
  PHONE_REGEX: /^((\+966)|0)?5\d{8}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "d MMMM yyyy",
  SHORT: "dd/MM/yyyy",
  TIME: "HH:mm",
  DATETIME: "dd/MM/yyyy HH:mm",
  ISO: "yyyy-MM-dd",
};

// Auto-refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  ORDERS: 20000, // 20 seconds
  INVENTORY: 300000, // 5 minutes
  REPORTS: 600000, // 10 minutes
  NOTIFICATIONS: 30000, // 30 seconds
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".gif", ".pdf"],
};

// Demo Account Emails
export const DEMO_ACCOUNTS = {
  SELLER: "seller@company.com",
  KITCHEN: "kitchen@company.com",
  DELIVERY: "delivery@company.com",
  ADMIN: "admin@company.com",
};

// Route Paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SELLER: "/seller",
  KITCHEN: "/kitchen",
  DELIVERY: "/delivery",
  ADMIN: "/admin",
  NOT_FOUND: "/404",
};
