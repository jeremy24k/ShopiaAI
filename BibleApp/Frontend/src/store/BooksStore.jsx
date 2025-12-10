import { create } from 'zustand';
import { getChapter } from "../utils/GetData";

const BASE_URL = "http://localhost:5000/api";

export const useBooksStore = create((set, get) => ({
  // State
  selectedTranslation: {
    value: "spa_r09",
    label: "Santa Biblia — Reina Valera 1909",
    shortName: "R09"
  },
  selectedCategory: { value: "all", label: "All" },
  filteredBooks: [],
  selectedTestament: "all",
  selectedComplete: "all", // Cambiar de "completed" a "all"
  books: [],
  booksLimit: 0,
  translation_data: {},
  translations: [],
  searchQuery: "", // Input del usuario
  searchQueryToFilter: "", // Query que se usa para filtrar
  loading: true,
  error: null,

  // Actions
  setSelectedTranslation: (translation) => set({ selectedTranslation: translation }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setFilteredBooks: (books) => set({ filteredBooks: books }),
  setSelectedTestament: (testament) => set({ selectedTestament: testament }),
  setTranslationData: (translation_data) => set({ translation_data: translation_data }),
  setBooksLimit: (booksLimit) => set({ booksLimit: booksLimit }),
  setSelectedComplete: (complete) => set({ selectedComplete: complete }),
  setSearchQuery: (searchQuery) => set({ searchQuery: searchQuery }),
  setSearchQueryToFilter: (searchQueryToFilter) => set({ searchQueryToFilter: searchQueryToFilter }),

  // Fetch available translations from API
  getTranslation: async () => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`${BASE_URL}/translations`);
      if (!response.ok) {
        set({ error: "Failed to fetch translations", loading: false });
        return;
      }

      const data = await response.json();
      const translations = data.data.translations;
      
      // Filter to only Spanish and English translations
      const filteredTranslations = translations.filter((translation) => 
        translation.language === "spa" ||
        translation.language === "eng"
      );
      
      set({ translations: filteredTranslations, loading: false });
    } catch (error) {
      console.error(error);
      set({ error: error.message, loading: false });
    }
  },

  // Fetch books for a specific translation
  getBooks: async (translation) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`${BASE_URL}/books/${translation}`);
      if (!response.ok) {
        set({ error: "Failed to fetch books", loading: false });
        return;
      }

      const data = await response.json();
      
      const books = data.data.books;
      const translation_data = data.data.translation;
      const booksLimit = translation_data.numberOfBooks;

      set({ filteredBooks: books });
      set({ books, translation_data, booksLimit, loading: false });
    } catch (error) {
      console.error(error);
      set({ error: error.message || "An error occurred while fetching books", loading: false });
    }
  },

  // Update label when translations are loaded
  updateTranslationLabel: () => {
    const { translations, selectedTranslation } = get();
    if (translations.length > 0 && selectedTranslation.label === "Loading...") {
      const currentTranslation = translations.find(t => t.id === selectedTranslation.value);
      if (currentTranslation) {
        set({
          selectedTranslation: {
            value: currentTranslation.id,
            label: currentTranslation.name,
            shortName: currentTranslation.shortName
          }
        });
      }
    }
  },

  // Expose getChapter utility
  getChapter
}));

// Initialize translations on store creation
if (typeof window !== 'undefined') {
  const state = useBooksStore.getState();
  state.getTranslation();
  state.getBooks(state.selectedTranslation.value);
  
  // Subscribe to translation changes to load books
  useBooksStore.subscribe((state, prevState) => {
    if (state.selectedTranslation.value !== prevState.selectedTranslation.value) {
      state.getBooks(state.selectedTranslation.value);
    }
    
    // Update translation label when translations are loaded
    if (state.translations.length > 0 && prevState.translations.length === 0) {
      state.updateTranslationLabel();
    }
  });
}
