import { create } from 'zustand';
const BASE_URL = import.meta.env.VITE_API_URL;

export const useBooksStore = create((set, get) => ({
  filteredBooks: [],
  books: [],
  booksLimit: 0,
  translation_data: {},
  translations: [],
  loading: true,
  error: null,
  
  // Nuevo estado para capítulos
  chapterData: null,
  chapterLoading: false,
  chapterError: null,

  // Actions
  setFilteredBooks: (books) => set({ filteredBooks: books }),
  setTranslationData: (translation_data) => set({ translation_data: translation_data }),
  setBooksLimit: (booksLimit) => set({ booksLimit: booksLimit }),

  // Fetch translations
  getTranslation: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`${BASE_URL}/translations`);
      if (!response.ok) {
        set({ error: "Failed to fetch translations", loading: false });
        // Intentar recuperar de localStorage si falla
        const cached = localStorage.getItem('__cached_translations');
        if (cached) {
            console.log("Using cached translations fallback");
            set({ translations: JSON.parse(cached), loading: false });
        }
        return;
      }
      const data = await response.json();
      const translations = data.data.translations;
      const filteredTranslations = translations.filter((translation) => 
        translation.language === "spa" || translation.language === "eng"
      );
      
      // Cachear respuesta exitosa
      localStorage.setItem('__cached_translations', JSON.stringify(filteredTranslations));
      
      set({ translations: filteredTranslations, loading: false });
    } catch (error) {
      console.error(error);
      const cached = localStorage.getItem('__cached_translations');
      if (cached) {
        set({ translations: JSON.parse(cached), loading: false });
      } else {
        set({ error: error.message, loading: false });
      }
    }
  },

  // Fetch books
  getBooks: async (translation) => {
    try {
      if (!translation) return;

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
      
      // Inicializar filteredBooks con todos los libros
      set({ filteredBooks: books });
      set({ books, translation_data, booksLimit, loading: false });
    } catch (error) {
      console.error(error);
      set({ error: error.message || "An error occurred while fetching books", loading: false });
    }
  },

  // Nueva acción unificada para fetch de capítulo
  fetchChapter: async (bookId, chapterNumber, translation) => {
    try {
      // Validaciones básicas
      if (!bookId || !chapterNumber || !translation) {
        set({ 
          chapterError: "Book ID, chapter number and translation are required",
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
        `${BASE_URL}/chapter/${translation}/${bookId.toUpperCase()}/${chapterNumber}`
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
        translation: translation,
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
  navigateToChapter: (bookId, chapterNumber, translation) => {
    const state = get();
    // Limpiar estado anterior
    set({ chapterData: null });
    // Navegar y cargar nuevo capítulo
    return state.fetchChapter(bookId, chapterNumber, translation);
  },

  // Limpiar datos del capítulo
  clearChapterData: () => set({ 
    chapterData: null, 
    chapterError: null 
  })
}));

// Inicialización de traducciones (Solo una vez)
if (typeof window !== 'undefined') {
  const state = useBooksStore.getState();
  // Solo cargamos traducciones, los libros los carga Read.jsx cuando sea necesario
  state.getTranslation();
}