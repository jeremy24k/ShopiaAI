// React imports
import { useEffect, memo } from "react";

// Component imports
import QuillEditor from "./QuillEditor";

const NewNote = memo(function NewNote({ noteVerse, removeNoteHandler, existingNotes }) {
    
    // ===== UTILITY FUNCTIONS =====
    
    // Check if note already exists for this verse
    function isExistingNote() {
        const found = existingNotes.find(note => 
            note.verse_data.verseKey === noteVerse.verseKey
        );
        return Boolean(found);
    }

    // ===== EFFECTS =====
    
    // Log existing note status when notes change
    useEffect(() => {
        if (existingNotes.length > 0) {
            const exists = isExistingNote();
            console.log('Note exists for this verse:', exists);
        }
    }, [existingNotes]);

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
                </div>
            </div>
            
            {/* Note editor */}
            <QuillEditor 
                noteVerse={noteVerse}
                removeNoteHandler={removeNoteHandler}
            />
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function
    // Return true if props are equal (skip re-render)
    return (
        prevProps.noteVerse.verseKey === nextProps.noteVerse.verseKey &&
        prevProps.existingNotes.length === nextProps.existingNotes.length
    );
});

export default NewNote;
