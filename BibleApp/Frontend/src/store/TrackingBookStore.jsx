import { create } from 'zustand';
import supabase from "../supabase/supabase";
import { useAuthStore } from './AuthStore';

export const useTrackingBookStore = create((set, get) => ({
  // State
  CompleteLoading: false,
  CompleteError: null,
  CompleteChapter: [],
  bookProgress: [], // ⭐ Nuevo: progreso por libro desde book_progress
  lastFetchTime: null, // ← Añadir para cache

  // Actions
  markAsCompleted: async (book) => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      console.log('⚠️ No user authenticated');
      return;
    }

    try {
      set({ CompleteLoading: true, CompleteError: null });

      // 🔥 SIMPLIFICADO: Solo insertar el capítulo
      // El trigger de Supabase calculará y actualizará book_progress automáticamente
      const { data, error } = await supabase
        .from('books_tracking')
        .insert({
          user_id: user.id,
          book_data: book,
          chapter_id: book.id,
          update_at: new Date().toISOString()
        })
        .select('book_data, chapter_id')
        .single();
      
      if (error) throw error;
      
      console.log('✅ Chapter marked as completed');
      
      // Actualizar estado local
      set((state) => ({
        CompleteLoading: false,
        CompleteChapter: [...state.CompleteChapter, data]
      }));

      // 🔥 Recargar el progreso del libro desde book_progress
      await get().fetchBookProgress(book.bookId, book.translationValue);
      
      return { 
        success: true, 
        data: data
      };
      
    } catch (error) {
      console.error('❌ Error completing chapter:', error);
      set({ CompleteError: error.message, CompleteLoading: false });
      return { success: false, error: error.message };
    }
  },

  unCompleteChapter: async (UncompleteBookId) => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      console.log('⚠️ No user authenticated');
      return;
    }

    try {
      set({ CompleteLoading: true, CompleteError: null });

      // 🔥 Primero obtener los datos del capítulo antes de eliminarlo
      const chapterToDelete = get().CompleteChapter.find(
        item => item.chapter_id === UncompleteBookId
      );

      const { data, error } = await supabase
        .from('books_tracking')
        .delete()
        .eq('user_id', user.id)
        .eq('chapter_id', UncompleteBookId)
        .select();
      
      if (error) throw error;
      
      console.log('✅ Chapter uncompleted successfully');
      
      // Actualizar estado local
      set((state) => ({
        CompleteLoading: false,
        CompleteChapter: state.CompleteChapter.filter(item => item.chapter_id !== UncompleteBookId)
      }));

      // 🔥 Recargar el progreso del libro desde book_progress
      if (chapterToDelete?.book_data) {
        await get().fetchBookProgress(
          chapterToDelete.book_data.bookId, 
          chapterToDelete.book_data.translationValue
        );
      }

      return { success: true, data: data };
    } catch (error) {
      console.error('❌ Error uncompleting chapter:', error);
      set({ CompleteError: error.message, CompleteLoading: false });
      return { success: false, error: error.message };
    }
  },

  getCompleteChapter: async (forceRefresh = false) => {
    const state = get();
    
    // 🔥 PROTECCIÓN CONTRA DUPLICADOS
    if (state.CompleteLoading) {
      console.log('⏳ Already loading, skipping...');
      return;
    }

    // 🔥 CACHE: No recargar si ya se cargó recientemente (5 segundos)
    const now = Date.now();
    if (!forceRefresh && state.lastFetchTime && (now - state.lastFetchTime < 5000) && state.CompleteChapter.length > 0) {
      console.log('♻️ Using cached chapters');
      return { success: true, data: state.CompleteChapter };
    }

    console.log('🔄 STORE: getCompleteChapter called');
    const { user } = useAuthStore.getState();
    
    if (!user) {
      console.log('⚠️ No user authenticated');
      return;
    }

    try {
      set({ CompleteLoading: true, CompleteError: null });

      const { data, error } = await supabase
        .from('books_tracking')
        .select('book_data, chapter_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      console.log('✅ All completed chapters loaded:', data?.length || 0);
      set({ 
        CompleteLoading: false, 
        CompleteChapter: data || [],
        lastFetchTime: now // ← Guardar tiempo de la última carga
      });
      return { success: true, data: data };
    } catch (error) {
      console.error('❌ Error loading completed chapters:', error);
      set({ CompleteError: error.message, CompleteLoading: false });
      return { success: false, error: error.message };
    }
  },

  isChapterCompleted: (chapterId) => {
    const { CompleteChapter } = get();
    return CompleteChapter.some(item => item.chapter_id === chapterId);
  },

  // 🔥 NUEVO: Obtener progreso de un libro desde el estado local
  getBookProgress: (bookId, translationValue) => {
    const { bookProgress } = get();
    
    const progress = bookProgress.find(
      p => p.book_id === bookId && p.translation_value === translationValue
    );
    
    if (!progress) {
      return {
        completedChapters: 0,
        totalChapters: 0,
        percentage: 0,
        status: 'not_started'
      };
    }
    
    return {
      completedChapters: progress.completed_chapters,
      totalChapters: progress.total_chapters,
      percentage: progress.percentage,
      status: progress.status
    };
  },

  // 🔥 NUEVO: Cargar progreso de un libro específico desde Supabase
  fetchBookProgress: async (bookId, translationValue) => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      console.log('⚠️ No user authenticated');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('book_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .eq('translation_value', translationValue)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }
      
      if (data) {
        // Actualizar en el estado local
        set((state) => {
          const existingIndex = state.bookProgress.findIndex(
            p => p.book_id === bookId && p.translation_value === translationValue
          );
          
          if (existingIndex >= 0) {
            // Actualizar existente
            const newProgress = [...state.bookProgress];
            newProgress[existingIndex] = data;
            return { bookProgress: newProgress };
          } else {
            // Agregar nuevo
            return { bookProgress: [...state.bookProgress, data] };
          }
        });
        
        console.log('✅ Book progress loaded:', data);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error fetching book progress:', error);
      return { success: false, error: error.message };
    }
  },

  // 🔥 NUEVO: Cargar todo el progreso del usuario desde Supabase
  fetchAllBookProgress: async () => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      console.log('⚠️ No user authenticated');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('book_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      set({ bookProgress: data || [] });
      console.log('✅ All book progress loaded:', data?.length || 0, 'books');
      
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error fetching all book progress:', error);
      return { success: false, error: error.message };
    }
  }
}));