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
  // Map category from database to frontend format
  const categoryMapping = {
    "main course": "main",
    "side dish": "side",
    beverages: "beverages",
    desserts: "desserts",
  };

  return {
    id: dbProduct.id,
    name: dbProduct.arabic_name,
    nameEn: dbProduct.english_name,
    description: dbProduct.description,
    category: categoryMapping[dbProduct.category] || dbProduct.category,
    price: parseFloat(dbProduct.price),
    imageUrl: getFullImageUrl(dbProduct.image),
    sku: dbProduct.product_no,
    barcode: dbProduct.barcode,
    stock: dbProduct.current_stock,
    minStock: dbProduct.min_stock,
    unitSize: dbProduct.unit_size ? parseFloat(dbProduct.unit_size) : null,
    unitType: dbProduct.unit_type,
    status: dbProduct.status,
    suspended: dbProduct.suspended,
    supplierId: dbProduct.Supplier,
    supplier: dbProduct.Supplier,
    Suspended: dbProduct.Suspended,
  };
};

// Helper function to map frontend format to database schema
const mapFrontendToDb = (frontendProduct) => {
  // Map category from frontend to database format
  const categoryMapping = {
    main: "main course",
    side: "side dish",
    beverages: "beverages",
    desserts: "desserts",
  };

  const dbData = {
    arabic_name: frontendProduct.name?.trim() || "",
    english_name: frontendProduct.nameEn?.trim() || "",
    description: frontendProduct.description?.trim() || "", // Ensure description is not null
    category:
      categoryMapping[frontendProduct.category] || frontendProduct.category,
    price: frontendProduct.price?.toString() || "0",
    current_stock: parseInt(frontendProduct.stock) || 0,
    min_stock: parseInt(frontendProduct.minStock) || 0,
  };

  // Only add optional fields if they have values
  if (frontendProduct.sku?.trim()) {
    dbData.product_no = frontendProduct.sku.trim();
  }
  if (frontendProduct.barcode?.toString()) {
    dbData.barcode = frontendProduct.barcode.toString();
  }
  if (frontendProduct.unitSize?.toString()) {
    dbData.unit_size = frontendProduct.unitSize.toString();
  }
  if (frontendProduct.unitType) {
    dbData.unit_type = frontendProduct.unitType;
  }
  if (frontendProduct.supplier) {
    dbData.Supplier = frontendProduct.supplier;
  }

  // Add image only if it exists and is not null
  if (frontendProduct.imageUrl && frontendProduct.imageUrl.trim() !== "") {
    dbData.image = frontendProduct.imageUrl;
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
