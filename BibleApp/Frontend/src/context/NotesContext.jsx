import { createContext, useState, useMemo } from "react";
import { useRef } from "react";
import supabase from "../supabase/supabase";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const NotesContext = createContext();

function NotesContextProvider({children}) {
    const { user } = useContext(AuthContext);
    const quillRef = useRef();
    const [noteVerse, setNoteVerse] = useState([]);
    const [existingNotes, setExistingNotes] = useState([]);

    const SaveNote = async (specificVerse = null) => {
        try {
            if (quillRef.current && user) {
                const deltaContent = quillRef.current.getContents();
                const plainText = quillRef.current.getText();
                
                // ✅ Usar el verso específico o el primero del array
                const verseToSave = specificVerse || (noteVerse.length > 0 ? noteVerse[0] : null);
                
                if (!verseToSave) {
                    console.error('❌ No hay verso para guardar');
                    return;
                }
                
                console.log('💾 Guardando nota para verso:', verseToSave);
            
                const { data, error } = await supabase
                .from('notes')
                .insert({
                    user_id: user.id,
                    verse_data: verseToSave, // ✅ Solo el verso específico
                    content_delta: deltaContent,
                    content_text: plainText
                });

                if (error) {
                    throw error;
                }

                if (data) {
                    console.log('✅ Nota guardada exitosamente:', data);
                    // ✅ Recargar las notas después de guardar
                    loadNotes();
                }
            }
        } catch (error) {
            console.error('❌ Error guardando nota:', error);
            throw error;
        }
    };

    const loadNotes = async () => {
        if (!user) {
            return;
        }

        try {
            if (user) {
                const { data, error } = await supabase
                .from('notes')
                .select('content_delta, verse_data')
                .eq('user_id', user.id)

                if (error) {
                    throw error;
                }

                if (data) {
                    setExistingNotes(data);
                }
            }
        } catch (error) {
            throw error;
        }
      
    };

    const value = useMemo(() => ({
        noteVerse,
        setNoteVerse,
        SaveNote,
        existingNotes,
        quillRef,
        loadNotes
    }), [noteVerse, SaveNote, existingNotes, quillRef, loadNotes]);

    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    )
}

export { NotesContext, NotesContextProvider };
