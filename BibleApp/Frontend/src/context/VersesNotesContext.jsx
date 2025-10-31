// React imports
import { createContext, useState, useMemo, useRef, useContext } from "react";

// External imports
import supabase from "../supabase/supabase";

// Context imports
import { AuthContext } from "./AuthContext";

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
    const SaveVerses = async (verseToSave) => {
        try {
            setLoadingVerses(true);

            if (!user) {
                console.error('❌ No user authenticated');
                return;
            }

            const { data: existingNotesVerse, error: checkError } = await supabase
                .from('notes')
                .select('id')
                .eq('user_id', user.id)
                .eq('verse_key', verseToSave.verseKey.toLowerCase());
            
            if (checkError) throw checkError;

            if (existingNotesVerse && existingNotesVerse.length > 0) {
                console.log('⚠️ Verse already exists');
                setLoadingVerses(false);
                return { 
                    success: true, 
                    data: existingNotesVerse[0], 
                    exists: true,
                    message: 'Este versículo ya está en tus notas' 
                }; 
            }

            const { data: newNoteVerse, error: insertError } = await supabase
                .from('notes')
                .insert({
                    user_id: user.id,
                    verse_data: verseToSave,
                    verse_key: verseToSave.verseKey.toLowerCase()
                })
                .select()
                .single();

            if (insertError) {
                setErrorVerses(insertError.message);
                return { success: false, error: insertError.message };
            }

            loadVerses();
            setLoadingVerses(false);
            return { success: true, data: newNoteVerse, verseToSave };
            
        } catch (insertError) {
            console.error('❌ Error saving note:', insertError);
            setLoadingVerses(false);
            setErrorVerses(insertError.message);
            return { success: false, error: insertError.message };
        }
    };

    // Load notes Verses for current user
    const loadVerses = async (silent = false) => {
        if (!user) {
            console.log('⚠️ No user authenticated, loading demo notes or skipping...');
            return;
        }

        try {
            if (!silent) setLoadingVerses(true);
            const { data, error } = await supabase
                .from('notes')
                .select('id, verse_data, verse_key')
                .eq('user_id', user.id)
                .order('id', { ascending: false });

            if (error) {
                setErrorVerses(error.message);
                return { success: false, error: error.message };
            }

            if (!silent) setLoadingVerses(false);
            setNoteVerse(data);
            console.log("se cargaron las notas");
            console.log(loadingVerses);
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error loading notes:', error);
            if (!silent) setLoadingVerses(false);
            setErrorVerses(error.message);
            return { success: false, error: error.message };
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
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('user_id', user.id)
                .eq('id', noteId);

            if (error) {
                setErrorVerses(error.message);
                return { success: false, error: error.message };
            }

            console.log('✅ Note deleted successfully');
            setLoadingSpecificVersesHandler(noteId, false);
            loadVerses(true); // Reload notes after deletion
            return { success: true };
            
        } catch (error) {
            console.error('❌ Error deleting note:', error);
            setLoadingSpecificVersesHandler(noteId, false);
            setErrorVerses(error.message);
            return { success: false, error: error.message };
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
