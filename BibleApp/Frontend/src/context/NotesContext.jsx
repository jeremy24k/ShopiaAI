import { createContext, useState, useEffect } from "react";

const NotesContext = createContext();

function NotesContextProvider({ children }) {
    const [VerseKey, setVerseKey] = useState('');
    const [NewEditor, setNewEditor] = useState([]);

    const addEditor = () => {
        const newId = Date.now();
        setNewEditor(prev => [...prev, { 
            id: newId,
            verseKey: VerseKey,
            content: ''
        }]);
    }

    const removeEditor = (editorId) => {
        setNewEditor(prev => prev.filter(editor => editor.id !== editorId));
    }

    const updateEditorContent = (editorId, newContent) => {
        setNewEditor(prev => prev.map(editor => 
            editor.id === editorId 
                ? { ...editor, content: newContent } 
                : editor
        ));
    }

    useEffect(() => {
        if (VerseKey && NewEditor.length === 0) {
            setNewEditor([{
                id: Date.now(),
                verseKey: VerseKey,
                content: ''
            }]);
        }
    }, [VerseKey, NewEditor.length]);

    const value = {
        addEditor,
        removeEditor,
        NewEditor,
        setNewEditor,
        updateEditorContent,
        VerseKey,
        setVerseKey
    };
    
    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    );
}

export { NotesContext, NotesContextProvider };