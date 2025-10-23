// React imports
import { useContext, useEffect, useCallback } from "react";

// Context imports
import { NotesContext } from "../context/NotesContext";
import { AuthContext } from "../context/AuthContext";

// Router imports
import { Link } from "react-router-dom";

// Component imports
import ExistingNote from "./ExistingNote";
import NewNote from "./NewNote";
import LoadingNotes from "./ui/LoadingNotes";

function WriteNote() {
    // Context destructuring
    const { data, actions, ui, setters } = useContext(NotesContext);
    const { user, loading } = useContext(AuthContext);

    // ===== HANDLERS =====
    
    // Remove note from selected verses array (memoized for stable reference)
    const removeNoteHandler = useCallback((index) => {
        const updatedNote = [...data.noteVerse];
        updatedNote.splice(index, 1);
        setters.setNoteVerse(updatedNote);
    }, [data.noteVerse, setters.setNoteVerse]);

    // ===== EFFECTS =====
    
    // Load notes when user is authenticated and no notes are loaded
    useEffect(() => {
        if (!loading && user && data.existingNotes.length === 0) {
            actions.loadNotes();
        }
    }, [user, loading, data.existingNotes.length]);

    // Handle successful note save
    useEffect(() => {
        if (ui.saveSuccess?.success) {
            removeNoteHandler();
            console.log('✅ Note saved successfully in WriteNote');
        }
    }, [ui.saveSuccess]);

    return (
        <>
            {/* New Notes Section */}
            <h1>New Notes</h1>
            {data.noteVerse.length === 0 ? (
                <p>No verse selected</p>
            ) : (
                data.noteVerse.map((noteVerse, index) => (
                    <NewNote
                        key={index}
                        noteVerse={noteVerse}
                        removeNoteHandler={removeNoteHandler}
                        existingNotes={data.existingNotes}
                    />
                ))
            )}
            
            {/* Navigation link */}
            <Link to="/books">Select a verse</Link>

            {/* Saved Notes Section */}
            <h1>Saved Notes</h1>
            {ui.loadingInitial ? (
                <LoadingNotes />
            ) : data.existingNotes.length === 0 ? (
                <p>No notes found</p>
            ) : (
                data.existingNotes.map((note, index) => (
                    <ExistingNote
                        key={index}
                        verse={note.verse_data}
                        existingNoteContent={note.content_delta}
                        noteId={note.id}
                    />
                ))
            )}
        </>
    );
}

export default WriteNote;