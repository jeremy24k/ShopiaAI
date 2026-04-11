import { create } from "zustand";
import { useAuthStore } from "./AuthStore";
    import { SaveNotesData, LoadNotesData, DeleteNotesData, UpdateNotesData } from "../utils/notes";

export const useNotesStore = create((set, get) => ({
  // State
  tabActive: "Editor",
  VerseKey: "",
  NewEditor: [],
  loadingNotes: false,
  loadingIndividualNotes: {},
  errorNotes: null,
  notes: [],
  notificationMessage: { message: "", isError: false },
  noteTitle: {}, // Object to store titles by editor ID

  // Actions
  setTabActive: (tab) => set({ tabActive: tab }),
  setVerseKey: (key) => set({ VerseKey: key }),
  setNoteTitle: (titleUpdater) => set({ 
    noteTitle: typeof titleUpdater === 'function' 
      ? titleUpdater(get().noteTitle) 
      : titleUpdater 
  }),
  setNotificationMessage: (message) => set({ notificationMessage: message }),
  setNewEditor: (editors) => set({
    NewEditor: typeof editors === "function" 
    ? editors(get().NewEditor) 
    : editors,
  }),

  addEditor: () => {
    const newId = Date.now();
    const { VerseKey } = get();
    set((state) => ({
      NewEditor: [
        ...state.NewEditor,
        {
          id: newId,
          verseKey: VerseKey,
          content: "",
        },
      ],
      noteTitle: {
        ...state.noteTitle,
        [newId]: "" // Initialize empty title for new editor
      }
    }));
  },

  removeEditor: (editorId) => {
    set((state) => ({
      NewEditor: state.NewEditor.filter((editor) => editor.id !== editorId),
    }));
  },

  updateEditorContent: (editorId, newContent) => {
    set((state) => ({
      NewEditor: state.NewEditor.map((editor) =>
        editor.id === editorId
          ? { ...editor, content: newContent.html }
          : editor
      ),
    }));
  },

  setLoadingNotesHandler: (NoteId, isLoading) => {
    set((state) => ({
      loadingIndividualNotes: {
        ...state.loadingIndividualNotes,
        [NoteId]: isLoading,
      },
    }));
  },

  // Optimistic save - Create new note
  SaveNotes: async (noteToSave) => {
    const user = useAuthStore.getState().user;

    if (!user) {
      // debug:("⚠️ No user authenticated");
      return;
    }

    try {
      set({ loadingNotes: true });

      // Create note visually (with temp ID)
      const tempId = `temp-${Date.now()}`;
      const newNote = {
        id: tempId,
        note_content: noteToSave.content_html,
        note_text: noteToSave.content_text,
        update_at: new Date().toISOString(),
        verse_key: noteToSave.verseKey,
        note_title: noteToSave.note_title,
        isTemp: true,
      };

      set((state) => ({ notes: [newNote, ...state.notes] }));

      const user_verse_key = `${user.id}-${noteToSave.verseKey}`;

      const result = await SaveNotesData(
        {
          note_content: noteToSave.content_html,
          note_text: noteToSave.content_text,
          update_at: new Date().toISOString(),
          verse_key: noteToSave.verseKey,
          user_verse_key: user_verse_key,
          note_title: noteToSave.note_title,
        },
        {
          user,
          table: "notes",
          existsMessage: "Este versículo ya está en tus notas",
        }
      );

      // Replace temp note with real one
      if (result.success && result.data) {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === tempId ? { ...result.data, isTemp: false } : note
          ),
          notificationMessage: {
            message: "Nota guardada correctamente",
            isError: false,
          },
        }));
      } else {
        // If error, remove temp note
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== tempId),
          errorNotes: result.error,
          notificationMessage: {
            message: result.error || "Error al guardar la nota",
            isError: true,
          },
        }));
      }

      set({ loadingNotes: false });
      return result;
    } catch (error) {
      // error:("❌ Error saving to notes:", error);
      set((state) => ({
        errorNotes: error.message,
        notes: state.notes.filter((note) => !note.isTemp),
        notificationMessage: {
          message: "Error al guardar la nota",
          isError: true,
        },
        loadingNotes: false,
      }));
      return { success: false, error: error.message, exists: false };
    }
  },

  // Optimistic delete - Delete note
  DeleteNotes: async (NoteId, verseKey) => {
    const user = useAuthStore.getState().user;

    if (!user) {
      // debug:("⚠️ No user authenticated");
      return;
    }

    try {
      get().setLoadingNotesHandler(NoteId, true);

      // Save copy for possible revert
      const { notes } = get();
      const noteToDelete = notes.find((note) => note.id === NoteId);

      // Immediate visual deletion
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== NoteId),
      }));

      const result = await DeleteNotesData(NoteId, {
        user,
        table: "notes",
        type: "notes",
      });

      // If error, revert change
      if (!result.success) {
        set((state) => ({
          notes: [...state.notes, noteToDelete],
          errorNotes: result.error,
          notificationMessage: {
            message: "Error al eliminar la nota",
            isError: true,
          },
        }));
      } else {
        set({
          notificationMessage: {
            message: "Nota eliminada correctamente",
            isError: false,
          },
        });
      }

      get().setLoadingNotesHandler(NoteId, false);
      return result;
    } catch (error) {
      // error:("❌ Error deleting from notes:", error);

      const { notes } = get();
      const noteToDelete = notes.find((note) => note.id === NoteId);

      set((state) => ({
        errorNotes: error.message,
        notes: [...state.notes, noteToDelete],
        notificationMessage: {
          message: "Error al eliminar la nota",
          isError: true,
        },
      }));

      get().setLoadingNotesHandler(NoteId, false);
      return { success: false, error: error.message };
    }
  },

  loadNotes: async (currentVersekey, uvk = false) => {
    const user = useAuthStore.getState().user;

    if (!user) {
      // debug:("⚠️ No user authenticated");
      return;
    }

    try {
      get().setLoadingNotesHandler(currentVersekey, true);
      set({ loadingNotes: true });

      let user_verse_key;
      uvk
        ? (user_verse_key = currentVersekey)
        : (user_verse_key = `${user.id}-${currentVersekey}`);

      const result = await LoadNotesData({
        table: "notes",
        user: user,
        verseKey: currentVersekey,
        user_verse_key: user_verse_key,
        select: "id, note_content, note_text, update_at, verse_key, note_title",
        orderBy: { column: "id", ascending: false },
      });

      if (!result.success) {
        set({ errorNotes: result.error });
        return result;
      }

      set({ notes: result.data, loadingNotes: false });
      return result;
    } catch (error) {
      set({ errorNotes: error.message });
      return { success: false, error: error.message };
    } finally {
      get().setLoadingNotesHandler(currentVersekey, false);
      set({ loadingNotes: false });
    }
  },

  // Optimistic update - Update note
  updateNoteContent: async (noteId, noteData = {}) => {
    const user = useAuthStore.getState().user;

    if (!user) {
      // debug:("⚠️ No user authenticated");
      return;
    }

    try {
      get().setLoadingNotesHandler(noteId, true);

      // Save original copy for possible revert
      const { notes } = get();
      const originalNote = notes.find((note) => note.id === noteId);

      // Immediate visual update
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                note_content: noteData.content_html,
                note_text: noteData.content_text,
                note_title: noteData.note_title,
                update_at: new Date().toISOString(),
              }
            : note
        ),
      }));

      const user_verse_key = `${user.id}-${noteData.verseKey}`;

      const result = await UpdateNotesData(noteId, noteData, {
        user,
        table: "notes",
        type: "notes",
      });

      // If error, revert changes
      if (!result.success) {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId ? originalNote : note
          ),
          errorNotes: result.error,
          notificationMessage: {
            message: "Error al actualizar la nota",
            isError: true,
          },
        }));
      } else {
        set({
          notificationMessage: {
            message: "Nota actualizada correctamente",
            isError: false,
          },
        });
      }

      get().setLoadingNotesHandler(noteId, false);
      return result;
    } catch (error) {
      // error:("❌ Error updating note:", error);

      const { notes } = get();
      const originalNote = notes.find((note) => note.id === noteId);

      set((state) => ({
        errorNotes: error.message,
        notes: state.notes.map((note) =>
          note.id === noteId ? originalNote : note
        ),
        notificationMessage: {
          message: "Error al actualizar la nota",
          isError: true,
        },
      }));

      get().setLoadingNotesHandler(noteId, false);
      return { success: false, error: error.message };
    }
  },
}));
