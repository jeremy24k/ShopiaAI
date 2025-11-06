// React imports
import { createContext, useState, useMemo, useRef, useContext } from "react";

// Context imports
import { AuthContext } from "./AuthContext";

// Utils imports
import SaveNotesData from "../utils/SaveNotesData";
import LoadNotesData from "../utils/LoadNotesData";
import DeleteNotesData from "../utils/DeleteNotesData";

// Create Notes Context
const VersesNotesContext = createContext();

function VersesNotesContextProvider({ children }) {
    // Auth context
    const { user } = useContext(AuthContext);

    const [noteVerse, setNoteVerse] = useState([]);
    const [loadingVerses, setLoadingVerses] = useState(false);  
    const [loadingSpecificVerses, setLoadingSpecificVerses] = useState([]);
    const [errorVerses, setErrorVerses] = useState(null);

    const setLoadingSpecificVersesHandler = (noteId, isLoading) => {
        setLoadingSpecificVerses(prev => ({
            ...prev,
            [noteId]: isLoading
        }));
    };

    // ===== MAIN ACTIONS =====
    
    // Save note Verse to database
    const SaveVerses = async (verse) => {
        
        if (!user) {
            console.error('❌ No user authenticated');
            return;
        }

        try {
            setLoadingVerses(true);

            const result = await SaveNotesData(
                {
                    verse_data: verse,
                    verse_key: verse.verseKey.toLowerCase()
                },
                {
                    uniqueCheck: { verse_key: verse.verseKey.toLowerCase() },
                    user,
                    table: 'notes_verses',
                    existsMessage: 'Este versículo ya está en tus notas'
                }
            );
            
            setLoadingVerses(false);
            loadVerses();
            return result;
        } catch (error) {
            console.error('❌ Error saving to notes:', error);
            setErrorVerses(error.message);
            return { success: false, error: error.message, exists: false };
        } finally {
            setLoadingVerses(false);
        }
    };

    // Load notes Verses for current user
    const loadVerses = async (silent = false) => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            if (!silent) setLoadingVerses(true);

            const result = await LoadNotesData({
                table: 'notes_verses',
                user: user,
                select: 'id, verse_data, verse_key',
                orderBy: { column: 'id', ascending: false }
            });

            if (!result.success) {
                setErrorVerses(result.error);
                return result;
            }

            setNoteVerse(result.data);
            return result;
            
        } catch (error) {
            setErrorVerses(error.message);
            return { success: false, error: error.message };
        } finally {
            if (!silent) setLoadingVerses(false);
        }
    };
    
    // Delete specific note Verse
    const deleteVerse = async (noteId) => {
        if (!user) {
            console.error('❌ No user authenticated');
            return;
        }
        
        try {
            setLoadingSpecificVersesHandler(noteId, true);

            const result = await DeleteNotesData(noteId, {
                user: user,
                table: 'notes_verses',
                type: 'notes_verses'
            });

            if (!result.success) {
                setErrorVerses(result.error);
                return result;
            }

            // Recargar después de eliminar
            await loadVerses(true);
            return result;
            
        } catch (error) {
            setErrorVerses(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoadingSpecificVersesHandler(noteId, false);
        }
    };

    // ===== CONTEXT VALUE =====
    const value = {
        SaveVerses,
        loadVerses,
        deleteVerse,
        noteVerse,
        setNoteVerse,
        loadingVerses,
        loadingSpecificVerses,
        errorVerses
    };

    return (
        <VersesNotesContext.Provider value={value}>
            {children}
        </VersesNotesContext.Provider>
    );
}

// Export context and provider
export { VersesNotesContext, VersesNotesContextProvider };
