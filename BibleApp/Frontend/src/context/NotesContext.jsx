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
    const [loadingSave, setLoadingSave] = useState(false);
    const [error, setError] = useState(null);
    const [loadingNotes, setLoadingNotes] = useState({}); // Loading individual por nota
    const [noteContent, setNoteContent] = useState(null); // Inicializar como null en vez de string vacío

    // Funciones para manejar loading individual
    const setNoteLoading = (noteId, isLoading) => {
        setLoadingNotes(prev => ({
            ...prev,
            [noteId]: isLoading
        }));
    };

    const isNoteLoading = (noteId) => {
        return loadingNotes[noteId] || false;
    };

    // funtion to handle note change
    const HandleNoteChange = (note) => {
        setNoteContent(note);
        console.log(note);
    }

    const SaveNote = async (specificVerse = null, currentDelta = null, currentText = null, noteId = null, verseKey = null) => {
        console.log('📥 Parámetros recibidos:', { specificVerse, currentDelta, currentText, noteId, verseKey });
        try {
            console.log('📥 Parámetros recibidos:', { specificVerse, currentDelta, currentText });

            if (user) {
                let finalDeltaContent, finalPlainText;
                
                // Priorizar los parámetros pasados
                if (currentDelta && currentText) {
                    finalDeltaContent = currentDelta;
                    finalPlainText = currentText;
                    console.log('✅ Usando contenido pasado como parámetro');
                } else if (quillRef.current) {
                    // Fallback solo si no hay parámetros
                    finalDeltaContent = quillRef.current.getContents();
                    finalPlainText = quillRef.current.getText();
                    console.log('⚠️ Usando fallback de quillRef (no recomendado)');
                } else {
                    console.error('❌ No hay contenido para guardar');
                    return;
                }
                
                // ✅ Usar el verso específico o el primero del array
                const verseToSave = specificVerse || (noteVerse.length > 0 ? noteVerse[0] : null);
                
                if (!verseToSave) {
                    console.error('❌ No hay verso para guardar');
                    return;
                }
                
                console.log('💾 Guardando nota para verso:', verseToSave);
                
                // ✅ Crear ID único para esta operación si no se proporciona
                const operationId = noteId || `${verseToSave.bookId}-${verseToSave.chapterNumber}-${verseToSave.verseNumber}`;
                setNoteLoading(operationId, true);
            
                // ✅ Estrategia: Eliminar nota existente y crear nueva (más simple)
                // Primero eliminar cualquier nota existente para este versículo
                await supabase
                    .from('notes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('verse_data->>bookId', verseToSave.bookId)
                    .eq('verse_data->>chapterNumber', verseToSave.chapterNumber)
                    .eq('verse_data->>verseNumber', verseToSave.verseNumber.toString());
                
                // Luego insertar la nueva nota
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
                    setError(error.message || 'Error al guardar la nota');
                    setNoteLoading(operationId, false);
                    throw error;
                }

                if (data) {
                    console.log('✅ Nota guardada exitosamente:', data);
                    // ✅ Recargar las notas después de guardar
                    loadNotes();
                } else {
                    console.log('✅ Nota guardada exitosamente (sin datos devueltos)');
                    loadNotes();
                }
                setNoteLoading(operationId, false);
            }
        } catch (error) {
            console.error('❌ Error guardando nota:', error);
            setError(error.message || 'Error al guardar la nota');
            // ✅ Terminar loading para esta nota específica
            if (noteId) setNoteLoading(noteId, false);
            throw error;
        }
    };

    const loadNotes = async () => {
        if (!user) {
            return;
        }

        try {
            setLoadingSave(true);
            if (user) {
                const { data, error } = await supabase
                .from('notes')
                .select('content_delta, verse_data, id')
                .eq('user_id', user.id)
                .order('id', { ascending: false });

                if (error) {
                    setError(error.message || 'Error al cargar las notas');
                    setLoadingSave(false);
                    throw error;
                }

                if (data) {
                    setExistingNotes(data);
                } else {
                    setExistingNotes([]);
                }
                setLoadingSave(false);
            }
        } catch (error) {
            setError(error.message || 'Error al cargar las notas');
            setLoadingSave(false);
            throw error;
        }
      
    };

    const deleteNote = async (noteId) => {
        try {
            setNoteLoading(noteId, true);
            if (user) {
                console.log('🗑️ Eliminando nota con ID:', noteId);
                
                const { error } = await supabase
                .from('notes')
                .delete()
                .eq('user_id', user.id)
                .eq('id', noteId)

                if (error) {
                    setError(error.message || 'Error al eliminar la nota');
                    setNoteLoading(noteId, false);
                    throw error;
                }

                console.log('✅ Nota eliminada exitosamente');
                loadNotes();
                setNoteLoading(noteId, false);
            }
        } catch (error) {
            setError(error.message || 'Error al eliminar la nota');
            setNoteLoading(noteId, false);
            throw error;
        }
    };

    const value = useMemo(() => ({
        noteVerse,
        setNoteVerse,
        SaveNote,
        existingNotes,
        loadNotes,
        deleteNote,
        isNoteLoading,
        HandleNoteChange,
        noteContent,
        setNoteContent,
        error,
        loadingSave
    }), [
        noteVerse, 
        SaveNote, 
        existingNotes, 
        loadNotes, 
        deleteNote, 
        loadingNotes, 
        error, 
        loadingSave, 
        HandleNoteChange, 
        noteContent, 
        setNoteContent
    ]);

    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    )
}

export { NotesContext, NotesContextProvider };
