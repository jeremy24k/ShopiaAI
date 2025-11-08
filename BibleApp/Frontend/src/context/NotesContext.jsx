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
    const [errorNotes, setErrorNotes] = useState(null);
    const [notes, setNotes] = useState([]);
    const [notificationMessage, setNotificationMessage] = useState({message: '', isError: false});
    const [noteTitle, setNoteTitle] = useState(null);

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

            setLoadingNotes(false);
            loadNotes(user_verse_key, true);
            return result;

        } catch (error) {
            console.error('❌ Error saving to notes:', error);
            setErrorNotes(error.message);
            return { success: false, error: error.message, exists: false };
        } finally {
            setLoadingNotes(false);
        }
    };

    const DeleteNotes = async (NoteId, verseKey) => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setLoadingNotes(true);

            const user_verse_key = `${user.id}-${verseKey}`;

            const result = await DeleteNotesData(
                NoteId,
                {
                    user,
                    table: 'notes',
                    type: 'notes'
                }
            );

            setLoadingNotes(false);
            loadNotes(user_verse_key, true);
            return result;

        } catch (error) {
            console.error('❌ Error deleting from notes:', error);
            setErrorNotes(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoadingNotes(false);
        }
    };

    const loadNotes = async (currentVersekey, uvk = false) => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
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
            console.log("Notes loaded:", result.data);
            return result;
            
        } catch (error) {
            setErrorNotes(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoadingNotes(false);
        }
    };

    const updateNoteContent = async (noteId, noteData = {}) => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setLoadingNotes(true);
            console.log(noteData);

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

            setLoadingNotes(false);
            loadNotes(user_verse_key, true);
            return result;
        } catch (error) {
            console.error('❌ Error updating note:', error);
            setErrorNotes(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoadingNotes(false);
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
        errorNotes
    };
    
    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    );
}

export { NotesContext, NotesContextProvider };