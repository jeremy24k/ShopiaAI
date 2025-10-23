// React imports
import { useEffect, useState, memo, useContext } from "react";

// Context imports
import { NotesContext } from '../context/NotesContext';

// Component imports
import QuillEditor from "./QuillEditor";
import LoadingNotes from "./ui/LoadingNotes";

const ExistingNote = memo(function ExistingNote({ verse, removeNoteHandler, noteId, existingNoteContent }) {
    // Context for individual loading state
    const { ui } = useContext(NotesContext);
    
    // Local state
    const [readOnly, setReadOnly] = useState(false);

    // Set read-only mode on mount
    useEffect(() => {
        setReadOnly(true);
    }, []);

    // Show individual loading state for this specific note
    if (ui.isNoteLoading(noteId)) {
        return (
            <LoadingNotes numberOfNotes={1} />
        );
    }

    return (
        <div>
            {/* Verse information */}
            <div>
                <h1>Verse:</h1>
                <div>
                    <p>{verse.content}</p>
                    <div>
                        <p>{verse.bookName}</p>
                        <p>{verse.chapterNumber}:{verse.verseNumber}</p>
                        <p>{verse.translation}</p>
                    </div>
                </div>
            </div>
            
            {/* Note editor */}
            <QuillEditor 
                noteVerse={verse}
                existingNoteContent={existingNoteContent} 
                removeNoteHandler={removeNoteHandler}
                noteId={noteId}
                readOnly={readOnly}
                setReadOnly={setReadOnly}
            />
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function
    // Return true if props are equal (skip re-render)
    // Note: We don't compare loading state here because it's handled by useContext
    return (
        prevProps.noteId === nextProps.noteId &&
        prevProps.verse.verseKey === nextProps.verse.verseKey &&
        JSON.stringify(prevProps.existingNoteContent) === JSON.stringify(nextProps.existingNoteContent)
    );
});

export default ExistingNote;
