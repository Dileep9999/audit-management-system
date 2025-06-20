import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FAQState, FAQItem, FAQCategory } from "@src/dtos/apps/faq";

const initialState: FAQState = {
  items: [],
  categories: [],
  isLoading: false,
  error: null,
};

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFAQItems: (state, action: PayloadAction<FAQItem[]>) => {
      state.items = action.payload;
    },
    setFAQCategories: (state, action: PayloadAction<FAQCategory[]>) => {
      state.categories = action.payload;
    },
    addFAQItem: (state, action: PayloadAction<FAQItem>) => {
      state.items.push(action.payload);
    },
    updateFAQItem: (state, action: PayloadAction<FAQItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteFAQItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    addFAQCategory: (state, action: PayloadAction<FAQCategory>) => {
      state.categories.push(action.payload);
    },
    updateFAQCategory: (state, action: PayloadAction<FAQCategory>) => {
      const index = state.categories.findIndex(cat => cat.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    deleteFAQCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(cat => cat.id !== action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  setFAQItems,
  setFAQCategories,
  addFAQItem,
  updateFAQItem,
  deleteFAQItem,
  addFAQCategory,
  updateFAQCategory,
  deleteFAQCategory,
} = faqSlice.actions;

export default faqSlice.reducer; 