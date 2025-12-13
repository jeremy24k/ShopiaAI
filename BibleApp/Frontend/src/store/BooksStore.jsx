import { create } from 'zustand';

const BASE_URL = "http://localhost:5000/api";

export const useBooksStore = create((set, get) => ({
  // Estado existente...
  selectedTranslation: typeof window !== 'undefined' 
  ? (() => {
      const params = new URLSearchParams(window.location.search);
      const urlTranslation = params.get('translation');
      // Si hay traducción en URL, usar esa, sino usar default
      if (urlTranslation) {
        return {
          value: urlTranslation,
          label: "Loading...", // Se actualizará cuando carguen las traducciones
          shortName: ""
        };
      }
      return {
        value: "spa_r09",
        label: "Santa Biblia — Reina Valera 1909",
        shortName: "R09"
      };
    })()
  : {
      value: "spa_r09",
      label: "Santa Biblia — Reina Valera 1909",
      shortName: "R09"
    },
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
  booksLimit: 0,
  translation_data: {},
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
  setTranslationData: (translation_data) => set({ translation_data: translation_data }),
  setBooksLimit: (booksLimit) => set({ booksLimit: booksLimit }),
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
      const translation_data = data.data.translation;
      const booksLimit = translation_data.numberOfBooks;
      set({ filteredBooks: books });
      set({ books, translation_data, booksLimit, loading: false });
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

      // Formatear datos del capítulo
      const chapterData = {
        content: data.data.chapter.content,
        book: {
          id: bookId.toUpperCase(),
          name: data.data.book.commonName,
          numberOfChapters: data.data.book.numberOfChapters
        },
        chapterNumber: parseInt(chapterNumber),
        translation: translationToUse,
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
}));

// Inicialización (sin cambios)
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
}