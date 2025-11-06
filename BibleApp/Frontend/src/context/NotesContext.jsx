import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

// Utils imports
import SaveNotesData from "../utils/SaveNotesData";
import LoadNotesData from "../utils/LoadNotesData";
import DeleteNotesData from "../utils/DeleteNotesData";

const NotesContext = createContext();

function NotesContextProvider({ children }) {
    const { user } = useContext(AuthContext);
    const [VerseKey, setVerseKey] = useState('');
    const [NewEditor, setNewEditor] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [errorNotes, setErrorNotes] = useState(null);
    const [notes, setNotes] = useState([]);
    const [notificationMessage, setNotificationMessage] = useState({message: '', isError: false});

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

    // API Requests funtions
    const SaveNotes = async (noteToSave) => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setLoadingNotes(true);

            const result = await SaveNotesData(
                {
                    note_content: noteToSave.content_html,
                    note_text: noteToSave.content_text,
                    update_at: new Date().toISOString(),
                    verse_key: noteToSave.verseKey,
                },
                {
                    user,
                    table: 'notes',
                    existsMessage: 'Este versículo ya está en tus notas'
                }
            );

            setLoadingNotes(false);
            loadNotes();
            return result;

        } catch (error) {
            console.error('❌ Error saving to notes:', error);
            setErrorNotes(error.message);
            return { success: false, error: error.message, exists: false };
        } finally {
            setLoadingNotes(false);
        }
    };

    const DeleteNotes = async (NoteId) => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setLoadingNotes(true);

            const result = await DeleteNotesData(
                NoteId,
                {
                    user,
                    table: 'notes',
                    type: 'notes'
                }
            );

            setLoadingNotes(false);
            loadNotes();
            return result;

        } catch (error) {
            console.error('❌ Error deleting from notes:', error);
            setErrorNotes(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoadingNotes(false);
        }
    };

    const loadNotes = async (currentVersekey) => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setLoadingNotes(true);

            const result = await LoadNotesData({
                table: 'notes',
                user: user,
                verseKey: currentVersekey,
                select: 'id, note_content, note_text, update_at, verse_key',
                orderBy: { column: 'id', ascending: false }
            });

            if (!result.success) {
                setErrorNotes(result.error);
                return result;
            }

            setNotes(result.data);
            console.log("Notes loaded:", result.data);
            return result;
            
        } catch (error) {
            setErrorNotes(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoadingNotes(false);
        }
    }

    useEffect(() => {
        if (VerseKey) {
            // ✅ SOLO CREAR SI NO EXISTE UN EDITOR PARA ESTE VERSE
            setNewEditor(prev => {
                const existingEditor = prev.find(editor => editor.verseKey === VerseKey);
                if (!existingEditor) {
                    const originalID = Date.now();
                    return [...prev, { 
                        id: originalID,
                        verseKey: VerseKey,
                        content: ''
                    }];
                }
                return prev; // No cambiar si ya existe
            });
        }
    }, [VerseKey]);

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
        SaveNotes,
        DeleteNotes,
        loadNotes,
        loadingNotes,
        errorNotes
    };
    
    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    );
}

export { NotesContext, NotesContextProvider };