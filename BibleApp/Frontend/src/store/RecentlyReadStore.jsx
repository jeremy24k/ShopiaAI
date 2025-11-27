import { create } from 'zustand';
import supabase from "../supabase/supabase";
import { useAuthStore } from './AuthStore';

export const useRecentlyReadStore = create((set, get) => ({
  // State
  recentlyRead: [],
  loading: false,
  error: null,

  // Actions
  loadRecentlyRead: async () => {
    const { user } = useAuthStore.getState();
    
    if (!user) return;

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('recently_read')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      
      set({ recentlyRead: data || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('❌ Error loading recently read:', error);
    }
  },

  addRecentlyRead: async (book) => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      console.log('⚠️ No user authenticated');
      return;
    }

    try {
      // 1. Get current books
      const { data: existing, error: fetchError } = await supabase
        .from('recently_read')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: true });

      if (fetchError) throw fetchError;

      // 2. Check if book already exists
      const bookExists = existing?.find(
        item => item.book_data.bookId === book.bookId
      );

      if (bookExists) {
        // Update timestamp
        const { error: updateError } = await supabase
          .from('recently_read')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', bookExists.id);
        
        if (updateError) throw updateError;
        console.log('✅ Book timestamp updated');
      } else {
        // 3. If 6 or more, delete oldest
        if (existing && existing.length >= 6) {
          const oldestBook = existing[0];
          await supabase
            .from('recently_read')
            .delete()
            .eq('id', oldestBook.id);
          console.log('🗑️ Oldest book removed');
        }

        // 4. Insert new book
        const { error: insertError } = await supabase
          .from('recently_read')
          .insert({
            user_id: user.id,
            book_data: book,
            updated_at: new Date().toISOString()
          });
        
        if (insertError) throw insertError;
        console.log('✅ New book added');
      }

      // 5. Reload list
      await get().loadRecentlyRead();
      return { success: true };
      
    } catch (error) {
      set({ error: error.message });
      console.error('❌ Error adding recently read:', error);
      return { success: false, error: error.message };
    }
  }
}));
