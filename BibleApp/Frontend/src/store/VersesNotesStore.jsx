// stores/versesNotesStore.js
import { create } from 'zustand';
import { useAuthStore } from './AuthStore';
import SaveNotesData from "../utils/SaveNotesData";
import LoadNotesData from "../utils/LoadNotesData";
import DeleteNotesData from "../utils/DeleteNotesData";

export const useVersesNotesStore = create((set, get) => ({
  // State
  noteVerse: [],
  loadingVerses: false,
  loadingSpecificVerses: {},
  errorVerses: null,

  // Actions
  setLoadingSpecificVerses: (noteId, isLoading) => {
    set(state => ({
      loadingSpecificVerses: {
        ...state.loadingSpecificVerses,
        [noteId]: isLoading
      }
    }));
  },

  // ===== MAIN ACTIONS =====
  SaveVerses: async (verse) => {
    const { user } = useAuthStore.getState();

    if (!user) {
      console.error('❌ No user authenticated');
      return { success: false, error: 'No user authenticated' };
    }

    try {
      set({ loadingVerses: true });

      const result = await SaveNotesData(
        {
          verse_data: verse,
          verse_key: verse.verseKey.toLowerCase(),
          user_verse_key: `${user.id}-${verse.verseKey.toLowerCase()}`
        },
        {
          uniqueCheck: { verse_key: verse.verseKey.toLowerCase() },
          user,
          table: 'notes_verses',
          existsMessage: 'Este versículo ya está en tus notas'
        }
      );
      
      // Recargar después de guardar
      if (result.success) {
        await get().loadVerses(user, true);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error saving to notes:', error);
      set({ errorVerses: error.message });
      return { success: false, error: error.message, exists: false };
    } finally {
      set({ loadingVerses: false });
    }
  },

  // Load notes Verses for current user
  loadVerses: async (silent = false) => {
    const { user } = useAuthStore.getState();

    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }

    try {
      if (!silent) set({ loadingVerses: true });

      const result = await LoadNotesData({
        table: 'notes_verses',
        user: user,
        select: 'id, verse_data, verse_key',
        orderBy: { column: 'id', ascending: false }
      });

      if (!result.success) {
        set({ errorVerses: result.error });
        return result;
      }

      set({ noteVerse: result.data });
      return result;
      
    } catch (error) {
      set({ errorVerses: error.message });
      return { success: false, error: error.message };
    } finally {
      if (!silent) set({ loadingVerses: false });
    }
  },
  
  // Delete specific note Verse
  deleteVerse: async (noteId) => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }
    
    try {
      get().setLoadingSpecificVerses(noteId, true);

      const user_verse_key = `${user.id}-${noteId}`;

      const result = await DeleteNotesData(user_verse_key, {
        user: user,
        table: 'notes_verses',
        type: 'notes_verses'
      });

      if (!result.success) {
        set({ errorVerses: result.error });
        return result;
      }

      // Recargar después de eliminar
      await get().loadVerses(user, true);
      return result;
      
    } catch (error) {
      set({ errorVerses: error.message });
      return { success: false, error: error.message };
    } finally {
      get().setLoadingSpecificVerses(noteId, false);
    }
  },

  // Clear errors
  clearError: () => set({ errorVerses: null })
}));