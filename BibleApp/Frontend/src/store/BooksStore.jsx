import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useLanguageStore } from './LanguageStore';

const BASE_URL = import.meta.env.VITE_API_URL;

const getDefaultTranslation = () => {
  if (typeof window !== 'undefined') {
      try {
          const langStore = JSON.parse(localStorage.getItem('language-storage'));
          const lang = langStore?.state?.language;
          // Si el idioma es inglés (detectado por el navegador o user choice)
          if (lang === 'en' || navigator.language.startsWith('en')) {
              return {
                  value: "eng_web",
                  label: "World English Bible Classic",
                  shortName: "WEBC"
              };
          }
      } catch (e) {
          console.error("Error reading language from localStorage", e);
      }
  }
  return {
      value: "spa_r09",
      label: "Santa Biblia — Reina Valera 1909",
      shortName: "R09"
  };
};

export const useBooksStore = create(
  persist(
    (set, get) => ({
  // Estado existente...
  selectedTranslation: getDefaultTranslation(),
  selectedCategory: { value: "all", label: "All" },
  filteredBooks: [],
  selectedTestament: "all",
  selectedComplete: typeof window !== 'undefined' ? (() => {
    const params = new URLSearchParams(window.location.search);
    const urlComplete = params.get('complete');
    if (urlComplete) {
      return urlComplete;
    }
    return "all";
  })() : "all",
  books: [],
  translations: [],
  searchQuery: "",
  searchQueryToFilter: "",
  loading: true,
  error: null,
  
  // Nuevo estado para capítulos
  chapterData: null,
  chapterLoading: false,
  chapterError: null,

  // Actions existentes...
  setSelectedTranslation: (translation) => set({ selectedTranslation: translation }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setFilteredBooks: (books) => set({ filteredBooks: books }),
  setSelectedTestament: (testament) => set({ selectedTestament: testament }),
  setSelectedComplete: (complete) => set({ selectedComplete: complete }),
  setSearchQuery: (searchQuery) => set({ searchQuery: searchQuery }),
  setSearchQueryToFilter: (searchQueryToFilter) => set({ searchQueryToFilter: searchQueryToFilter }),

  // Fetch translations (sin cambios)
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
      const filteredTranslations = translations.filter((translation) => 
        translation.language === "spa" || translation.language === "eng"
      );

      set({ translations: filteredTranslations, loading: false });
    } catch (error) {
      console.error(error);
      set({ error: error.message, loading: false });
    }
  },

  // Fetch books (sin cambios)
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
      set({ filteredBooks: books });
      set({ books, loading: false });
    } catch (error) {
      console.error(error);
      set({ error: error.message || "An error occurred while fetching books", loading: false });
    }
  },

  // Nueva acción unificada para fetch de capítulo
  fetchChapter: async (bookId, chapterNumber, translation = null) => {
    try {
      // Determinar qué traducción usar
      const state = get();
      const translationToUse = translation || state.selectedTranslation.value;
      
      // Validaciones básicas
      if (!bookId || !chapterNumber) {
        set({ 
          chapterError: "Book ID and chapter number are required",
          chapterLoading: false 
        });
        return null;
      }

      // Iniciar loading
      set({ 
        chapterLoading: true, 
        chapterError: null,
        chapterData: null 
      });

      const response = await fetch(
        `${BASE_URL}/chapter/${translationToUse}/${bookId.toUpperCase()}/${chapterNumber}`
      );


      // Manejar errores HTTP
      if (!response.ok) {
        let errorMessage = "Failed to fetch chapter";
        let errorType = "FETCH_ERROR";
        
        if (response.status === 404) {
          errorMessage = "Chapter not found";
          errorType = "CHAPTER_NOT_FOUND";
        } else if (response.status >= 500) {
          errorMessage = "Server error";
          errorType = "SERVER_ERROR";
        }
        
        set({ 
          chapterError: errorMessage,
          chapterErrorType: errorType,
          chapterLoading: false 
        });
        return null;
      }

      const data = await response.json();
      console.log(data);


      // Detectar respuesta HTML (caso especial de la API)
      if (data && typeof data.data === "string" && data.data.includes("<!doctype html")) {
        set({ 
          chapterError: "Book not available for this translation",
          chapterErrorType: "BOOK_NOT_AVAILABLE_FOR_TRANSLATION",
          chapterLoading: false 
        });
        return null;
      }

      // Validar estructura de datos
      if (!data?.data?.chapter?.content || !data?.data?.book) {
        set({ 
          chapterError: "Invalid chapter data structure",
          chapterLoading: false 
        });
        return null;
      }

      // Obtener el label de la traducción desde selectedTranslation o translations
      const translationObj = state.translations.find(t => t.value === translationToUse) || state.selectedTranslation;
      const translationLabel = translationObj?.label || translationToUse;

      // Formatear datos del capítulo
      const chapterData = {
        content: data.data.chapter.content,
        book: {
          id: bookId.toUpperCase(),
          name: data.data.book.commonName,
          numberOfChapters: data.data.book.numberOfChapters
        },
        chapterNumber: parseInt(chapterNumber),
        translation: translationToUse, // Mantener por compatibilidad
        translationValue: translationToUse, // Código de traducción
        translationLabel: translationLabel, // Nombre completo de traducción
        shortName: data.data.translation.shortName,
        metadata: {
          fetchedAt: new Date().toISOString()
        }
      };

      // Actualizar estado
      set({ 
        chapterData,
        chapterLoading: false,
        chapterError: null 
      });

      return chapterData;
      
    } catch (error) {
      console.error('❌ Error in fetchChapter:', error);
      set({ 
        chapterError: error.message || "An error occurred while fetching chapter",
        chapterLoading: false 
      });
      return null;
    }
  },

  // Helper para navegar entre capítulos
  navigateToChapter: (bookId, chapterNumber, translation = null) => {
    const state = get();
    const translationToUse = translation || state.selectedTranslation.value;
    
    // Limpiar estado anterior
    set({ chapterData: null });
    
    // Navegar y cargar nuevo capítulo
    return state.fetchChapter(bookId, chapterNumber, translationToUse);
  },

  // Obtener traducción actual
  getCurrentTranslation: () => get().selectedTranslation,

  // Limpiar datos del capítulo
  clearChapterData: () => set({ 
    chapterData: null, 
    chapterError: null 
  }),

  // Update label (sin cambios)
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
  }
}),
    {
      name: 'books-filters-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedTranslation: state.selectedTranslation,
        selectedCategory: state.selectedCategory,
        selectedTestament: state.selectedTestament,
        selectedComplete: state.selectedComplete,
        searchQuery: state.searchQuery,
        searchQueryToFilter: state.searchQueryToFilter,
      }),
    }
  )
);

// Inicialización
if (typeof window !== 'undefined') {
  const state = useBooksStore.getState();
  state.getTranslation();
  state.getBooks(state.selectedTranslation.value);
  
  useBooksStore.subscribe((state, prevState) => {
    if (state.selectedTranslation.value !== prevState.selectedTranslation.value) {
      state.getBooks(state.selectedTranslation.value);
    }
    
    if (state.translations.length > 0 && prevState.translations.length === 0) {
      state.updateTranslationLabel();
    }
  });

  // Escuchar cambios de idioma para actualizar la traducción (si no coincide con el nuevo idioma)
  useLanguageStore.subscribe((langState, prevLangState) => {
    if (langState.language !== prevLangState.language) {
      const currentTranslationValue = useBooksStore.getState().selectedTranslation.value;
      const isEnglish = langState.language === 'en';
      
      // Si cambia a inglés y tiene una biblia en español
      if (isEnglish && currentTranslationValue.startsWith('spa_')) {
          useBooksStore.getState().setSelectedTranslation({
              value: "eng_web",
              label: "World English Bible Classic",
              shortName: "WEBC"
          });
      }
      // Si cambia a español y tiene una biblia en inglés
      else if (!isEnglish && currentTranslationValue.startsWith('eng_')) {
          useBooksStore.getState().setSelectedTranslation({
              value: "spa_r09",
              label: "Santa Biblia — Reina Valera 1909",
              shortName: "R09"
          });
      }
    }
  });
}