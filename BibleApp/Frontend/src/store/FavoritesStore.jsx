import { create } from 'zustand';
import supabase from "../supabase/supabase";
import { useAuthStore } from './AuthStore';

export const useFavoritesStore = create((set, get) => ({
  // State
  LoadFavoritesVerses: [],
  error: null,
  loading: false,
  loadingFavorites: {},
  initialLoadDone: false,

  // Actions
  setLoadingFavoritesHandler: (verseKey, isLoading) => {
    set((state) => ({
      loadingFavorites: {
        ...state.loadingFavorites,
        [verseKey]: isLoading
      }
    }));
  },

  SaveFavorite: async (verseToSave = null) => {
    const user = useAuthStore.getState().user;
    
    try {
      set({ loading: true });

      if (!user) {
        // error:('❌ No user authenticated');
        return { success: false, error: 'No user authenticated' };
      }

      // 1. Check if exists
      const { data: existingFavorites, error: checkError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('verse_key', verseToSave.verseKey.toLowerCase());
      
      if (checkError) throw checkError;
      
      // If already exists, return without saving
      if (existingFavorites && existingFavorites.length > 0) {
        set({ loading: false });
        return { 
          success: true, 
          data: existingFavorites[0], 
          exists: true,
          message: 'Este versículo ya está en tus favoritos' 
        }; 
      }
      
      // 2. Create new favorite
      const { data: newFavorite, error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          verse_content: verseToSave,
          verse_key: verseToSave.verseKey.toLowerCase()
        })
        .select()
        .single();
      
      if (insertError) {
        set({ error: insertError.message });
        return { success: false, error: insertError.message };
      }

      set({ loading: false });
      get().LoadFavorites(); // Reload list
      
      return { 
        success: true, 
        data: newFavorite, 
        exists: false,
        message: 'Versículo agregado a favoritos' 
      }; 
      
    } catch (error) {
      // error:('❌ Error saving favorite:', error);
      set({ error: error.message, loading: false });
      return { 
        success: false, 
        error: error.message,
        message: 'Error al guardar el favorito' 
      };
    }
  },

  LoadFavorites: async (silent = false) => {
    const user = useAuthStore.getState().user;
    
    if (!user) {
      // error:('❌ No user authenticated');
      return;
    }

    // Si ya se cargó antes, no volver a cargar
    if (get().initialLoadDone && get().LoadFavoritesVerses.length >= 0) {
      // log:('⏭️ Favorites already loaded, skipping...');
      return;
    }

    try {
      if (!silent) set({ loading: true });
      
      const { data, error } = await supabase
        .from('favorites')
        .select('id, verse_content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        set({ error: error.message || 'Error loading favorites' });
        throw error;
      }

      set({ 
        LoadFavoritesVerses: data || [],
        initialLoadDone: true
      });
      // log:('✅ Favorites loaded successfully:', data || 'no data returned');
      if (!silent) set({ loading: false });
      
    } catch (error) {
      // error:('❌ Error loading favorites:', error);
      set({ error: error.message || 'Error loading favorites', loading: false });
      throw error;
    }
  },

  RemoveFavorite: async (id = null) => {
    const user = useAuthStore.getState().user;
    
    if (!user) {
      // error:('❌ No user authenticated');
      return;
    }

    try {
      get().setLoadingFavoritesHandler(id, true);

      const { error: errorRemoveFavorite } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('id', id);

      if (errorRemoveFavorite) {
        set({ error: errorRemoveFavorite.message || 'Error removing favorite' });
        throw errorRemoveFavorite;
      }

      get().setLoadingFavoritesHandler(id, false);
      get().LoadFavorites(true);
      return { success: true };
    } catch (error) {
      // error:('❌ Error removing favorite:', error);
      set({ error: error.message || 'Error removing favorite' });
      get().setLoadingFavoritesHandler(id, false);
      return { success: false, error: error.message };
    }
  }
}));
