import { create } from 'zustand';
import supabase from "../supabase/supabase";
import { useAuthStore } from './AuthStore';

export const useTrackingBookStore = create((set, get) => ({
  // State
  CompleteLoading: false,
  CompleteError: null,
  CompleteChapter: [],
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
      
      console.log('✅ Book completed successfully');
      set((state) => ({
        CompleteLoading: false,
        CompleteChapter: [...state.CompleteChapter, data]
      }));
      return { success: true, data: data };
    } catch (error) {
      console.error('❌ Error completing book:', error);
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

      const { data, error } = await supabase
        .from('books_tracking')
        .delete()
        .eq('user_id', user.id)
        .eq('chapter_id', UncompleteBookId)
        .select();
      
      if (error) throw error;
      
      console.log('✅ Book uncompleted successfully');
      set((state) => ({
        CompleteLoading: false,
        CompleteChapter: state.CompleteChapter.filter(item => item.chapter_id !== UncompleteBookId)
      }));
      return { success: true, data: data };
    } catch (error) {
      console.error('❌ Error uncompleting book:', error);
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
  }
}));