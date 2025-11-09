import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

// Utils imports
import SaveNotesData from "../utils/SaveNotesData";
import LoadNotesData from "../utils/LoadNotesData";
import DeleteNotesData from "../utils/DeleteNotesData";
import UpdateNotesData from "../utils/UpdateNotesData";

const NotesContext = createContext();

function NotesContextProvider({ children }) {
    const { user } = useContext(AuthContext);
    const [tabActive, setTabActive] = useState('Editor');
    const [VerseKey, setVerseKey] = useState('');
    const [NewEditor, setNewEditor] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [loadingIndividualNotes, setLoadingIndividualNotes] = useState({});
    const [errorNotes, setErrorNotes] = useState(null);
    const [notes, setNotes] = useState([]);
    const [notificationMessage, setNotificationMessage] = useState({message: '', isError: false});
    const [noteTitle, setNoteTitle] = useState('');

    const addEditor = () => {
        const newId = Date.now();
        setNewEditor(prev => [...prev, { 
            id: newId,
            verseKey: VerseKey,
            content: ''
        }]);
        console.log(NewEditor);
    }

    const removeEditor = (editorId) => {
        setNewEditor(prev => prev.filter(editor => editor.id !== editorId));
    }

    const updateEditorContent = (editorId, newContent) => {
        setNewEditor(prev => prev.map(editor => 
            editor.id === editorId 
                ? { ...editor, content: newContent.html } 
                : editor
        ));
    }

    const setLoadingNotesHandler = (NoteId, isLoading) => {
        setLoadingIndividualNotes(prev => ({
            ...prev,
            [NoteId]: isLoading
        }));
    };

    // ✅ OPTIMISTIC SAVE - Crear nueva nota
    const SaveNotes = async (noteToSave) => {
        
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setLoadingNotes(true);

            // ✅ CREAR NOTA VISUALMENTE (con ID temporal)
            const tempId = `temp-${Date.now()}`;
            const newNote = {
                id: tempId,
                note_content: noteToSave.content_html,
                note_text: noteToSave.content_text,
                update_at: new Date().toISOString(),
                verse_key: noteToSave.verseKey,
                note_title: noteToSave.note_title,
                isTemp: true // ✅ Marcar como temporal
            };

            setNotes(prev => [newNote, ...prev]);

            const user_verse_key = `${user.id}-${noteToSave.verseKey}`;

            const result = await SaveNotesData(
                {
                    note_content: noteToSave.content_html,
                    note_text: noteToSave.content_text,
                    update_at: new Date().toISOString(),
                    verse_key: noteToSave.verseKey,
                    user_verse_key: user_verse_key,
                    note_title: noteToSave.note_title
                },
                {
                    user,
                    table: 'notes',
                    existsMessage: 'Este versículo ya está en tus notas'
                }
            );

            // ✅ Reemplazar nota temporal con la real
            if (result.success && result.data) {
                setNotes(prev => 
                    prev.map(note => 
                        note.id === tempId 
                            ? { ...result.data, isTemp: false } 
                            : note
                    )
                );
                setNotificationMessage({ 
                    message: 'Nota guardada correctamente', 
                    isError: false 
                });
            } else {
                // ✅ Si hay error, eliminar la temporal
                setNotes(prev => prev.filter(note => note.id !== tempId));
                setErrorNotes(result.error);
                setNotificationMessage({ 
                    message: result.error || 'Error al guardar la nota', 
                    isError: true 
                });
            }

            setLoadingNotes(false);
            return result;

        } catch (error) {
            console.error('❌ Error saving to notes:', error);
            setErrorNotes(error.message);
            // ✅ Revertir en caso de error
            setNotes(prev => prev.filter(note => note.isTemp));
            setNotificationMessage({ 
                message: 'Error al guardar la nota', 
                isError: true 
            });
            return { success: false, error: error.message, exists: false };
        } finally {
            setLoadingNotes(false);
        }
    };

    // ✅ OPTIMISTIC DELETE - Eliminar nota
    const DeleteNotes = async (NoteId, verseKey) => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setLoadingNotesHandler(NoteId, true);
            
            // ✅ GUARDAR COPIA PARA POSIBLE REVERSIÓN
            const noteToDelete = notes.find(note => note.id === NoteId);
            
            // ✅ ELIMINACIÓN VISUAL INMEDIATA
            setNotes(prevNotes => prevNotes.filter(note => note.id !== NoteId));

            const result = await DeleteNotesData(
                NoteId,
                {
                    user,
                    table: 'notes',
                    type: 'notes'
                }
            );

            // ✅ Si hay error, revertir el cambio
            if (!result.success) {
                setNotes(prevNotes => [...prevNotes, noteToDelete]);
                setErrorNotes(result.error);
                setNotificationMessage({ 
                    message: 'Error al eliminar la nota', 
                    isError: true 
                });
            } else {
                setNotificationMessage({ 
                    message: 'Nota eliminada correctamente', 
                    isError: false 
                });
            }

            setLoadingNotesHandler(NoteId, false);
            return result;

        } catch (error) {
            console.error('❌ Error deleting from notes:', error);
            setErrorNotes(error.message);
            
            // ✅ Revertir en caso de error
            const noteToDelete = notes.find(note => note.id === NoteId);
            setNotes(prevNotes => [...prevNotes, noteToDelete]);
            
            setNotificationMessage({ 
                message: 'Error al eliminar la nota', 
                isError: true 
            });
            
            return { success: false, error: error.message };
        } finally {
            setLoadingNotesHandler(NoteId, false);
        }
    };

    const loadNotes = async (currentVersekey, uvk = false) => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setLoadingNotesHandler(currentVersekey, true);
            setLoadingNotes(true);

            let user_verse_key;
            uvk ? user_verse_key = currentVersekey : user_verse_key = `${user.id}-${currentVersekey}`;

            console.log(user_verse_key);
            
            const result = await LoadNotesData({
                table: 'notes',
                user: user,
                verseKey: currentVersekey,
                user_verse_key: user_verse_key,
                select: 'id, note_content, note_text, update_at, verse_key, note_title',
                orderBy: { column: 'id', ascending: false }
            });

            if (!result.success) {
                setErrorNotes(result.error);
                return result;
            }

            setNotes(result.data);
            setLoadingNotes(false);
            console.log("Notes loaded:", result.data);
            return result;
            
        } catch (error) {
            setErrorNotes(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoadingNotesHandler(currentVersekey, false);
            setLoadingNotes(false);
        }
    };

    // ✅ OPTIMISTIC UPDATE - Actualizar nota
    const updateNoteContent = async (noteId, noteData = {}) => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setLoadingNotesHandler(noteId, true);
            
            // ✅ GUARDAR COPIA ORIGINAL PARA POSIBLE REVERSIÓN
            const originalNote = notes.find(note => note.id === noteId);
            
            // ✅ ACTUALIZACIÓN VISUAL INMEDIATA
            setNotes(prevNotes => 
                prevNotes.map(note => 
                    note.id === noteId 
                        ? { 
                            ...note, 
                            note_content: noteData.content_html,
                            note_text: noteData.content_text,
                            update_at: new Date().toISOString() // ✅ Actualizar fecha localmente
                        } 
                        : note
                )
            );

            const user_verse_key = `${user.id}-${noteData.verseKey}`;

            const result = await UpdateNotesData(
                noteId,
                noteData,
                {
                    user,
                    table: 'notes',
                    type: 'notes'
                }
            );

            // ✅ Si hay error, revertir los cambios
            if (!result.success) {
                setNotes(prevNotes => 
                    prevNotes.map(note => 
                        note.id === noteId ? originalNote : note
                    )
                );
                setErrorNotes(result.error);
                setNotificationMessage({ 
                    message: 'Error al actualizar la nota', 
                    isError: true 
                });
            } else {
                setNotificationMessage({ 
                    message: 'Nota actualizada correctamente', 
                    isError: false 
                });
            }

            setLoadingNotesHandler(noteId, false);
            return result;
        } catch (error) {
            console.error('❌ Error updating note:', error);
            setErrorNotes(error.message);
            
            // ✅ Revertir en caso de error
            setNotes(prevNotes => 
                prevNotes.map(note => 
                    note.id === noteId ? originalNote : note
                )
            );
            
            setNotificationMessage({ 
                message: 'Error al actualizar la nota', 
                isError: true 
            });
            
            return { success: false, error: error.message };
        } finally {
            setLoadingNotesHandler(noteId, false);
        }
    };

    const value = {
        addEditor,
        removeEditor,
        NewEditor,
        setNewEditor,
        updateEditorContent,
        VerseKey,
        setVerseKey,
        notes,
        notificationMessage,
        setNotificationMessage,
        noteTitle,
        setNoteTitle,
        tabActive,
        setTabActive,
        SaveNotes,
        DeleteNotes,
        loadNotes,
        updateNoteContent,
        loadingNotes,
        loadingIndividualNotes,
        errorNotes
    };
    
    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    );
}

export { NotesContext, NotesContextProvider };