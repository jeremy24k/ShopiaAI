// stores/versesNotesStore.js
import { create } from 'zustand';
import { useAuthStore } from './AuthStore';
import { SaveNotesData, LoadNotesData, DeleteNotesData } from "../utils/notes";
import Logger from "../utils/logger";

const logger = Logger.create('VersesNotesStore');

export const useVersesNotesStore = create((set, get) => ({
  // State
  noteVerse: [],
  loadingVerses: false,
  loadingSpecificVerses: {},
  errorVerses: null,
  initialLoadDone: false,

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
      logger.error('No user authenticated');
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
        await get().loadVerses(true, true);
      }
      
      return result;
    } catch (error) {
      logger.error('Error saving to notes:', error);
      set({ errorVerses: error.message });
      return { success: false, error: error.message, exists: false };
    } finally {
      set({ loadingVerses: false });
    }
  },

  // Load notes Verses for current user
  loadVerses: async (force = false, silent = false) => {
    const { user } = useAuthStore.getState();

    if (!user) {
      logger.error('No user authenticated');
      return;
    }

    // Si ya se cargó antes, no volver a cargar a menos que se fuerce
    if (!force && get().initialLoadDone && get().noteVerse.length >= 0) {
      logger.debug('Notes already loaded, skipping...');
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

      set({ 
        noteVerse: result.data,
        initialLoadDone: true
      });
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
      logger.error('No user authenticated');
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
      await get().loadVerses(true, true);
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