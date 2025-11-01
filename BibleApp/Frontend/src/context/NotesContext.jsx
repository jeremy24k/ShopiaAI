import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

// Utils imports
import SaveNotesData from "../utils/SaveNotesData";

const NotesContext = createContext();

function NotesContextProvider({ children }) {
    const { user } = useContext(AuthContext);
    const [VerseKey, setVerseKey] = useState('');
    const [NewEditor, setNewEditor] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [errorNotes, setErrorNotes] = useState(null);

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
                    content_text: noteToSave.content_text
                },
                {
                    uniqueCheck: { verse_key: noteToSave.verseKey },
                    user,
                    existsMessage: 'Este versículo ya está en tus notas'
                }
            );

            setLoadingNotes(false);
            // loadNotes();
            return result;

        } catch (error) {
            console.error('❌ Error saving to notes:', error);
            setErrorNotes(error.message);
            return { success: false, error: error.message, exists: false };
        } finally {
            setLoadingNotes(false);
        }
    };

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
        SaveNotes,
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