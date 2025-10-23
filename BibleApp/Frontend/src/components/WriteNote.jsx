// React imports
import { useContext, useEffect } from "react";

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

    const VerseUrl = (verse) => {
        const bookId = verse.bookId.toLowerCase();
        return `/books/${bookId}/${verse.chapterNumber}?translation=${verse.translationValue}#${bookId}-${verse.chapterNumber}-${verse.verseNumber}-${verse.translationValue}`;
    }

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
            actions.removeNoteHandler();
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
                    <div>
                        <NewNote
                            key={index}
                            noteVerse={noteVerse}
                            index={index}
                            verseUrl={VerseUrl(noteVerse)}
                        />
                    </div>
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
                    <div>
                        <ExistingNote
                            key={index}
                            verse={note.verse_data}
                            existingNoteContent={note.content_delta}
                            noteId={note.id}
                            verseUrl={VerseUrl(note.verse_data)}
                        />
                    </div>
                ))
            )}
        </>
    );
}

export default WriteNote;