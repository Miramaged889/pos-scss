/**
 * Product Service - Handles all product-related API calls
 */

import { apiService, API_ENDPOINTS, replaceUrlParams } from "./api";

// Get the base URL for the API
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  let subdomain = null;

  if (hostname.includes(".detalls-sa.com")) {
    subdomain = hostname.split(".")[0];
  } else if (hostname.includes(".localhost")) {
    subdomain = hostname.split(".")[0];
  }

  const SAAS_BASE_URL = "https://detalls-sa.com";
  return subdomain ? `https://${subdomain}.detalls-sa.com` : SAAS_BASE_URL;
};

// Helper function to convert relative image URL to absolute URL
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl.trim() === "") {
    return null;
  }

  // If it's already a full URL (http/https) or base64, return as is
  if (imageUrl.startsWith("http") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  // If it's a relative URL, prepend the base URL
  const baseUrl = getBaseUrl();
  const cleanImageUrl = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

  return `${baseUrl}${cleanImageUrl}`;
};

// Helper function to map database schema to frontend format
const mapDbToFrontend = (dbProduct) => {
  return {
    id: dbProduct.id,
    name: dbProduct.arabic_name,
    nameEn: dbProduct.english_name,
    description: dbProduct.description,
    category: dbProduct.category, // Keep as object or ID from API
    subcategory: dbProduct.subcategory, // Keep as object or ID from API
    price: parseFloat(dbProduct.price),
    imageUrl: getFullImageUrl(dbProduct.image),
    sku: dbProduct.product_no,
    barcode: dbProduct.barcode,
    stock: dbProduct.current_stock,
    minStock: dbProduct.min_stock,
    unitSize: dbProduct.unit_size ? parseFloat(dbProduct.unit_size) : null,
    unitType: dbProduct.unit_type, // Keep as object or ID from API
    status: dbProduct.status,
    suspended: dbProduct.suspended,
    supplierId: dbProduct.supplier_detail?.id || dbProduct.Supplier || dbProduct.supplier,
    supplier: dbProduct.supplier_detail?.id || dbProduct.Supplier || dbProduct.supplier,
    supplier_detail: dbProduct.supplier_detail, // Keep full supplier object
    Suspended: dbProduct.Suspended,
    // Keep original API fields for compatibility
    arabic_name: dbProduct.arabic_name,
    english_name: dbProduct.english_name,
    current_stock: dbProduct.current_stock,
    min_stock: dbProduct.min_stock,
    product_no: dbProduct.product_no,
    unit_size: dbProduct.unit_size,
    unit_type: dbProduct.unit_type,
  };
};

// Helper function to map frontend format to database schema
const mapFrontendToDb = (frontendProduct) => {
  // Ensure required fields are present and not empty
  const arabicName = (frontendProduct.name || "").trim();
  const englishName = (frontendProduct.nameEn || "").trim();
  
  if (!arabicName || !englishName) {
    throw new Error("arabic_name and english_name are required fields");
  }

  const dbData = {
    arabic_name: arabicName,
    english_name: englishName,
    description: frontendProduct.description?.trim() || "",
    price: frontendProduct.price?.toString() || "0",
    current_stock: parseInt(frontendProduct.stock) || 0,
    min_stock: parseInt(frontendProduct.minStock) || 0,
  };

  // Handle category - can be ID (string/number) or null
  if (frontendProduct.category) {
    // If it's an object with id, use the id; otherwise use the value directly
    dbData.category = frontendProduct.category.id?.toString() || frontendProduct.category.toString();
  } else {
    dbData.category = null;
  }

  // Handle subcategory - can be ID (string/number) or null
  if (frontendProduct.subcategory) {
    dbData.subcategory = frontendProduct.subcategory.id?.toString() || frontendProduct.subcategory.toString();
  } else {
    dbData.subcategory = null;
  }

  // Handle unit_type - can be ID (string/number) or null
  if (frontendProduct.unitType) {
    dbData.unit_type = frontendProduct.unitType.id?.toString() || frontendProduct.unitType.toString();
  } else {
    dbData.unit_type = null;
  }

  // Handle unit_size - default to "1.00" if not provided (required by API)
  if (frontendProduct.unitSize && frontendProduct.unitSize.toString().trim() !== "") {
    const unitSizeValue = parseFloat(frontendProduct.unitSize);
    dbData.unit_size = isNaN(unitSizeValue) ? "1.00" : unitSizeValue.toFixed(2);
  } else {
    dbData.unit_size = "1.00";
  }

  // Handle supplier - can be ID (string/number) or null
  if (frontendProduct.supplier) {
    dbData.supplier = frontendProduct.supplier.id?.toString() || frontendProduct.supplier.toString();
  } else {
    dbData.supplier = null;
  }

  // Optional fields
  if (frontendProduct.sku?.trim()) {
    dbData.product_no = frontendProduct.sku.trim();
  } else {
    dbData.product_no = null;
  }

  if (frontendProduct.barcode?.toString() && frontendProduct.barcode.toString().trim() !== "") {
    dbData.barcode = frontendProduct.barcode.toString().trim();
  } else {
    dbData.barcode = null;
  }

  // Add image only if it exists and is not null
  if (frontendProduct.imageUrl && frontendProduct.imageUrl.trim() !== "") {
    dbData.image = frontendProduct.imageUrl;
  } else {
    dbData.image = null;
  }

  // Handle suspended status
  if (frontendProduct?.Suspended !== undefined) {
    dbData.Suspended = frontendProduct.Suspended;
  } else if (frontendProduct?.suspended !== undefined) {
    dbData.Suspended = frontendProduct.suspended;
  }

  return dbData;
};

export const productService = {
  // Get all products
  getProducts: async (params = {}) => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCTS.LIST, params);

    // Map the response data if it's an array
    if (Array.isArray(response)) {
      return response.map(mapDbToFrontend);
    }

    // If response has a data property, map that
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(mapDbToFrontend);
    }

    return response;
  },

  // Get product by ID
  getProduct: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.PRODUCTS.GET, { id });
    const response = await apiService.get(endpoint);
    return mapDbToFrontend(response);
  },

  // Create new product
  createProduct: async (productData) => {
    const dbData = mapFrontendToDb(productData);


    try {
      // Handle image upload separately if it's a base64 string
      if (dbData.image && dbData.image.startsWith("data:")) {
        // Convert base64 to file for upload
        const imageResponse = await fetch(dbData.image);
        const blob = await imageResponse.blob();
        const file = new File([blob], "product-image.jpg", {
          type: "image/jpeg",
        });

        // Create FormData for file upload
        const formData = new FormData();
        Object.keys(dbData).forEach((key) => {
          if (key === "image") {
            formData.append(key, file);
          } else {
            formData.append(key, dbData[key]);
          }
        });



        const response = await apiService.upload(
          API_ENDPOINTS.PRODUCTS.CREATE,
          formData
        );
        return mapDbToFrontend(response);
      } else {
        const response = await apiService.post(
          API_ENDPOINTS.PRODUCTS.CREATE,
          dbData
        );
        return mapDbToFrontend(response);
      }
    } catch (error) {
      console.error("❌ Error creating product:", error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.PRODUCTS.UPDATE, { id });
    const dbData = mapFrontendToDb(productData);

    // Handle image upload separately if it's a base64 string
    if (dbData.image && dbData.image.startsWith("data:")) {
      // Convert base64 to file for upload
      const imageResponse = await fetch(dbData.image);
      const blob = await imageResponse.blob();
      const file = new File([blob], "product-image.jpg", {
        type: "image/jpeg",
      });

      // Create FormData for file upload
      const formData = new FormData();
      Object.keys(dbData).forEach((key) => {
        if (key === "image") {
          formData.append(key, file);
        } else {
          formData.append(key, dbData[key]);
        }
      });

      const response = await apiService.upload(endpoint, formData, "PATCH");
      return mapDbToFrontend(response);
    } else {
      const response = await apiService.patch(endpoint, dbData);
      return mapDbToFrontend(response);
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    const endpoint = replaceUrlParams(API_ENDPOINTS.PRODUCTS.DELETE, { id });
    return await apiService.delete(endpoint);
  },
};

export default productService;
