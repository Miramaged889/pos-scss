import { createSlice } from "@reduxjs/toolkit";

// Get initial theme from localStorage or default to light
const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

// Apply theme to document
const applyTheme = (theme) => {
  if (typeof window !== "undefined") {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }
};

const initialState = {
  currentLanguage: "ar",
  isRTL: true,
  theme: getInitialTheme(),
};

// Apply initial theme
applyTheme(initialState.theme);

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    toggleLanguage: (state) => {
      state.currentLanguage = state.currentLanguage === "ar" ? "en" : "ar";
      state.isRTL = state.currentLanguage === "ar";
    },
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
      state.isRTL = action.payload === "ar";
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      applyTheme(state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      applyTheme(state.theme);
    },
  },
});

export const { toggleLanguage, setLanguage, toggleTheme, setTheme } =
  languageSlice.actions;
export default languageSlice.reducer;
