// React imports
import { createContext, useState, useMemo, useRef, useContext } from "react";

// External imports
import supabase from "../supabase/supabase";

// Context imports
import { AuthContext } from "./AuthContext";

// Create Notes Context
const NotesContext = createContext();

function NotesContextProvider({ children }) {
    // Auth context
    const { user } = useContext(AuthContext);
    
    // Refs
    const quillRef = useRef();
    
    // State management
    const [noteVerse, setNoteVerse] = useState([]);
    const [existingNotes, setExistingNotes] = useState([]);
    const [loadingSave, setLoadingSave] = useState(false); // Loading for save operations
    const [loadingInitial, setLoadingInitial] = useState(false); // Loading for initial notes load
    const [error, setError] = useState(null);
    const [loadingNotes, setLoadingNotes] = useState({}); // Individual loading per note
    const [noteContent, setNoteContent] = useState(null); // Initialize as null instead of empty string
    const [saveSuccess, setSaveSuccess] = useState(null); // Save success state

    // ===== UTILITY FUNCTIONS =====
    
    // Handle individual note loading states
    const setNoteLoading = (noteId, isLoading) => {
        setLoadingNotes(prev => ({
            ...prev,
            [noteId]: isLoading
        }));
    };

    // Check if specific note is loading
    const isNoteLoading = (noteId) => {
        return loadingNotes[noteId] || false;
    };

    // Handle note content changes
    const HandleNoteChange = (note) => {
        setNoteContent(note);
        console.log(note);
    };

    // ===== MAIN ACTIONS =====
    
    // Save note to database
    const SaveNote = async (
        specificVerse = null, 
        currentDelta = null, 
        currentText = null, 
        noteId = null, 
        verseKey = null
    ) => {
        console.log('📥 Received parameters:', { specificVerse, currentDelta, currentText, noteId, verseKey });
        
        try {
            if (!user) {
                console.error('❌ No user authenticated');
                return;
            }

            // Determine content to save
            let finalDeltaContent, finalPlainText;
            
            if (currentDelta && currentText) {
                // Prioritize passed parameters
                finalDeltaContent = currentDelta;
                finalPlainText = currentText;
                console.log('✅ Using content passed as parameter');
            } else if (quillRef.current) {
                // Fallback to ref only if no parameters
                finalDeltaContent = quillRef.current.getContents();
                finalPlainText = quillRef.current.getText();
                console.log('⚠️ Using quillRef fallback (not recommended)');
            } else {
                console.error('❌ No content to save');
                return;
            }
            
            // Determine verse to save
            const verseToSave = specificVerse || (noteVerse.length > 0 ? noteVerse[0] : null);
            
            if (!verseToSave) {
                console.error('❌ No verse to save');
                return;
            }
            
            console.log('💾 Saving note for verse:', verseToSave);
            
            // Create unique operation ID
            const operationId = noteId || `${verseToSave.bookId}-${verseToSave.chapterNumber}-${verseToSave.verseNumber}`;
            setNoteLoading(operationId, true);
        
            // Strategy: Delete existing note and create new one (simpler approach)
            // First delete any existing note for this verse
            await supabase
                .from('notes')
                .delete()
                .eq('user_id', user.id)
                .eq('verse_data->>bookId', verseToSave.bookId)
                .eq('verse_data->>chapterNumber', verseToSave.chapterNumber)
                .eq('verse_data->>verseNumber', verseToSave.verseNumber.toString());
            
            // Then insert the new note
            const { data, error } = await supabase
                .from('notes')
                .insert({
                    user_id: user.id,
                    verse_data: verseToSave,
                    content_delta: finalDeltaContent,
                    content_text: finalPlainText,
                    verse_key: verseKey
                });

            if (error) {
                setError(error.message || 'Error saving note');
                setNoteLoading(operationId, false);
                throw error;
            }

            // Handle successful save
            console.log('✅ Note saved successfully:', data || 'no data returned');
            loadNotes(); // Reload notes after saving
            setNoteLoading(operationId, false);
            
            // Notify success to Notes component
            setSaveSuccess({ success: true, verseToSave, timestamp: Date.now() });
            return { success: true, data, verseToSave };
            
        } catch (error) {
            console.error('❌ Error saving note:', error);
            setError(error.message || 'Error saving note');
            
            // End loading for this specific note
            if (noteId) setNoteLoading(noteId, false);
            return { success: false, error: error.message };
        }
    };

    // Load all notes for current user
    const loadNotes = async () => {
        if (!user) {
            console.log('⚠️ No user authenticated, skipping note loading');
            return;
        }

        try {
            // Only show loading if we don't have notes yet (initial load)
            const isInitialLoad = existingNotes.length === 0;
            if (isInitialLoad) {
                setLoadingInitial(true);
            }
            
            const { data, error } = await supabase
                .from('notes')
                .select('content_delta, verse_data, id')
                .eq('user_id', user.id)
                .order('id', { ascending: false });

            if (error) {
                setError(error.message || 'Error loading notes');
                if (isInitialLoad) setLoadingInitial(false);
                throw error;
            }

            // Update notes state
            setExistingNotes(data || []);
            if (isInitialLoad) {
                setLoadingInitial(false);
            }
            
        } catch (error) {
            console.error('❌ Error loading notes:', error);
            setError(error.message || 'Error loading notes');
            setLoadingInitial(false);
            throw error;
        }
    };

    // Delete specific note
    const deleteNote = async (noteId) => {
        if (!user) {
            console.error('❌ No user authenticated');
            return;
        }
        
        try {
            setNoteLoading(noteId, true);
            console.log('🗑️ Deleting note with ID:', noteId);
            
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('user_id', user.id)
                .eq('id', noteId);

            if (error) {
                setError(error.message || 'Error deleting note');
                setNoteLoading(noteId, false);
                throw error;
            }

            console.log('✅ Note deleted successfully');
            loadNotes(); // Reload notes after deletion
            setNoteLoading(noteId, false);
            
        } catch (error) {
            console.error('❌ Error deleting note:', error);
            setError(error.message || 'Error deleting note');
            setNoteLoading(noteId, false);
            throw error;
        }
    };

    // ===== CONTEXT VALUE =====
    
    // Memoized context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        // 📊 Data state
        data: {
            noteVerse,
            existingNotes,
            noteContent
        },
        
        // ⚡ Main actions
        actions: {
            SaveNote,
            loadNotes,
            deleteNote,
            HandleNoteChange
        },
        
        // 🎨 UI states and feedback
        ui: {
            error,
            loadingSave,
            loadingInitial,
            saveSuccess,
            isNoteLoading
        },
        
        // 🔧 Required setters
        setters: {
            setNoteVerse,
            setNoteContent,
            setSaveSuccess
        }
    }), [
        // Grouped dependencies
        noteVerse, existingNotes, noteContent,
        SaveNote, loadNotes, deleteNote, HandleNoteChange,
        error, loadingSave, loadingInitial, saveSuccess, loadingNotes,
        setNoteVerse, setNoteContent, setSaveSuccess
    ]);

    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    );
}

// Export context and provider
export { NotesContext, NotesContextProvider };
