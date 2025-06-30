import { createSlice } from "@reduxjs/toolkit";

const generateMockInventory = () => [
  // Main Course Items
  {
    id: 1,
    name: "برجر لحم",
    nameEn: "Beef Burger",
    category: "main",
    stock: 25,
    minStock: 10,
    price: 25,
    supplier: "مؤسسة اللحوم الطازجة",
    sku: "BF001",
    description: "برجر لحم طازج مع الخضار",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 2,
    name: "دجاج مشوي",
    nameEn: "Grilled Chicken",
    category: "main",
    stock: 15,
    minStock: 8,
    price: 35,
    supplier: "مزرعة الدواجن الذهبية",
    sku: "GC002",
    description: "دجاج مشوي مع التوابل الخاصة",
    imageUrl:
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 3,
    name: "بيتزا مارجريتا",
    nameEn: "Margherita Pizza",
    category: "main",
    stock: 12,
    minStock: 5,
    price: 45,
    supplier: "مطعم الإيطالي",
    sku: "PZ003",
    description: "بيتزا بالجبن والطماطم والريحان",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 4,
    name: "معكرونة كاربونارا",
    nameEn: "Pasta Carbonara",
    category: "main",
    stock: 8,
    minStock: 10,
    price: 40,
    supplier: "مطعم الإيطالي",
    sku: "PA004",
    description: "معكرونة بالكريمة واللحم المقدد",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 5,
    name: "سمك سلمون مشوي",
    nameEn: "Grilled Salmon",
    category: "main",
    stock: 6,
    minStock: 8,
    price: 65,
    supplier: "شركة المأكولات البحرية",
    sku: "FS005",
    description: "سمك سلمون طازج مشوي مع الليمون",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },

  // Side Dishes
  {
    id: 6,
    name: "بطاطس مقلية",
    nameEn: "French Fries",
    category: "side",
    stock: 30,
    minStock: 15,
    price: 15,
    supplier: "مستودع الخضار",
    sku: "FF006",
    description: "بطاطس مقلية ذهبية مقرمشة",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 7,
    name: "سلطة خضراء",
    nameEn: "Green Salad",
    category: "side",
    stock: 5,
    minStock: 10,
    price: 20,
    supplier: "مستودع الخضار",
    sku: "GS007",
    description: "سلطة خضار طازجة مشكلة",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 8,
    name: "أرز بالزعفران",
    nameEn: "Saffron Rice",
    category: "side",
    stock: 18,
    minStock: 12,
    price: 25,
    supplier: "مطبخ التوابل",
    sku: "SR008",
    description: "أرز أبيض بالزعفران الفاخر",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 9,
    name: "خبز ثوم",
    nameEn: "Garlic Bread",
    category: "side",
    stock: 22,
    minStock: 15,
    price: 12,
    supplier: "مخبز الأصالة",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    sku: "GB009",
    description: "خبز محمص بالثوم والأعشاب",
    lastUpdated: new Date().toISOString(),
  },

  // Beverages
  {
    id: 10,
    name: "عصير برتقال طازج",
    nameEn: "Fresh Orange Juice",
    category: "beverages",
    stock: 20,
    minStock: 15,
    price: 18,
    supplier: "مصنع العصائر الطبيعية",
    sku: "OJ010",
    description: "عصير برتقال طبيعي 100%",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 11,
    name: "قهوة عربية",
    nameEn: "Arabic Coffee",
    category: "beverages",
    stock: 35,
    minStock: 20,
    price: 15,
    supplier: "محمصة القهوة الذهبية",
    sku: "AC011",
    description: "قهوة عربية أصيلة بالهيل",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 12,
    name: "عصير مانجو",
    nameEn: "Mango Juice",
    category: "beverages",
    stock: 14,
    minStock: 10,
    price: 22,
    supplier: "مصنع العصائر الطبيعية",
    sku: "MJ012",
    description: "عصير مانجو طبيعي بدون إضافات",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 13,
    name: "شاي أخضر",
    nameEn: "Green Tea",
    category: "beverages",
    stock: 2,
    minStock: 15,
    price: 12,
    supplier: "شركة الشاي الفاخر",
    sku: "GT013",
    description: "شاي أخضر عضوي عالي الجودة",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 14,
    name: "مياه معدنية",
    nameEn: "Mineral Water",
    category: "beverages",
    stock: 50,
    minStock: 30,
    price: 5,
    supplier: "شركة المياه الصافية",
    sku: "MW014",
    description: "مياه معدنية طبيعية",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },

  // Desserts
  {
    id: 15,
    name: "تيراميسو",
    nameEn: "Tiramisu",
    category: "desserts",
    stock: 8,
    minStock: 6,
    price: 35,
    supplier: "مطعم الإيطالي",
    sku: "TR015",
    description: "حلوى تيراميسو إيطالية أصيلة",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 16,
    name: "كنافة نابلسية",
    nameEn: "Nablus Kunafa",
    category: "desserts",
    stock: 0,
    minStock: 8,
    price: 28,
    supplier: "حلويات الشام",
    sku: "NK016",
    description: "كنافة نابلسية بالجبن الأبيض",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
      lastUpdated: new Date().toISOString(),
  },
  {
    id: 17,
    name: "آيس كريم فانيليا",
    nameEn: "Vanilla Ice Cream",
    category: "desserts",
    stock: 12,
    minStock: 10,
    price: 20,
    supplier: "مصنع الآيس كريم",
    sku: "VI017",
    description: "آيس كريم فانيليا كريمي",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 18,
    name: "كيك شوكولاتة",
    nameEn: "Chocolate Cake",
    category: "desserts",
    stock: 3,
    minStock: 6,
    price: 42,
    supplier: "مخبز الحلويات الفاخرة",
    sku: "CC018",
    description: "كيك شوكولاتة غني وطري",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 19,
    name: "بقلاوة",
    nameEn: "Baklava",
    category: "desserts",
    stock: 15,
    minStock: 12,
    price: 25,
    supplier: "حلويات الشام",
    sku: "BK019",
    description: "بقلاوة شرقية بالفستق والعسل",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 20,
    name: "مهلبية",
    nameEn: "Muhallabia",
    category: "desserts",
    stock: 18,
    minStock: 10,
    price: 18,
    supplier: "حلويات الشام",
    sku: "MH020",
    description: "مهلبية تقليدية بالورد والفستق",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
      lastUpdated: new Date().toISOString(),
  },
];

const initialState = {
  products: generateMockInventory(),
  loading: false,
  error: null,
  lowStockAlert: true,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    updateStock: (state, action) => {
      const { productId, quantity, operation } = action.payload;
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        if (operation === "add") {
          product.stock += quantity;
        } else if (operation === "subtract") {
          product.stock = Math.max(0, product.stock - quantity);
        } else {
          product.stock = quantity;
        }
        product.lastUpdated = new Date().toISOString();
      }
    },
    addProduct: (state, action) => {
      const newProduct = {
        id: Date.now(),
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
      state.products.push(newProduct);
    },
    updateProduct: (state, action) => {
      const { productId, updates } = action.payload;
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        Object.assign(product, updates);
        product.lastUpdated = new Date().toISOString();
      }
    },
    deleteProduct: (state, action) => {
      const productId = action.payload;
      state.products = state.products.filter((p) => p.id !== productId);
    },
    toggleLowStockAlert: (state) => {
      state.lowStockAlert = !state.lowStockAlert;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  updateStock,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleLowStockAlert,
  setLoading,
  setError,
  clearError,
} = inventorySlice.actions;

export default inventorySlice.reducer;
