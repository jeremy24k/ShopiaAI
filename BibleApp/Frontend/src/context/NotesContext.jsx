import { createContext, useState, useMemo } from "react";

const NotesContext = createContext();

function NotesContextProvider({children}) {

    const [noteVerse, setNoteVerse] = useState(null);

    const value = useMemo(() => ({
        noteVerse,
        setNoteVerse
    }), [noteVerse]);

    
    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    )
}

export { NotesContext, NotesContextProvider };
