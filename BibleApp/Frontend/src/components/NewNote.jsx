// React imports
import { useEffect, memo, useContext, useState } from "react";

// Context imports
import { NotesContext } from "../context/NotesContext";

// Component imports
import QuillEditor from "./QuillEditor";
import { Link } from "react-router-dom";

const NewNote = memo(function NewNote({ noteVerse, index, verseUrl }) {
    // Context destructuring
    const { data, actions } = useContext(NotesContext);
    
    // Local state for readOnly
    const [readOnly, setReadOnly] = useState(false);
    
    // ===== UTILITY FUNCTIONS =====
    
    // Check if note already exists for this verse
    function isExistingNote() {
        const found = data.existingNotes.find(note => 
            note.verse_data.verseKey === noteVerse.verseKey
        );
        return Boolean(found);
    }

    // ===== EFFECTS =====
    
    // Log existing note status when notes change
    useEffect(() => {
        if (data.existingNotes.length > 0) {
            const exists = isExistingNote();
            console.log('Note exists for this verse:', exists);
        }
    }, [data.existingNotes]);

    return (
        <div>
            {/* Existing note warning */}
            {isExistingNote() && (
                <div>
                    <h1>Existing Note</h1>
                    <p>If you save this note, the existing note will be overwritten</p>
                </div>
            )}
            
            {/* Verse information */}
            <div>
                <h1>Verse:</h1>
                <div>
                    <p>{noteVerse.content}</p>
                    <div>
                        <p>{noteVerse.bookName}</p>
                        <p>{noteVerse.chapterNumber}:{noteVerse.verseNumber}</p>
                        <p>{noteVerse.translation}</p>
                    </div>
                    <Link to={verseUrl}>View Verse</Link>
                </div>
            </div>
            
            {/* Note editor */}
            <QuillEditor 
                noteVerse={noteVerse}
                removeNoteHandler={() => actions.removeNoteHandler(index)}
                readOnly={readOnly}
                setReadOnly={setReadOnly}
            />
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function
    // Return true if props are equal (skip re-render)
    return (
        prevProps.noteVerse.verseKey === nextProps.noteVerse.verseKey &&
        prevProps.index === nextProps.index
    );
});

export default NewNote;
