import { useEffect } from "react";
import QuillEditor from "./QuillEditor";

function NewNote({noteVerse, removeNoteHandler, note, existingNotes, HandleNoteChange}) {

    function isExistingNote() {
        const found = existingNotes.find(note => note.verse_data.verseKey === noteVerse.verseKey);
        if (found) {
            return true;
        } else {
            return false;
        }
       
    }

    useEffect(() => {
        if (existingNotes.length > 0) {
            isExistingNote();
        }
    }, [existingNotes]);

    return (
        <div>
            {isExistingNote() && (
                <div>
                    <h1>Existing Note</h1>
                    <p>if you save this note, the existing note will be overwritten</p>
                </div>
            )}
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
            <QuillEditor 
                noteVerse={noteVerse}
                removeNoteHandler={removeNoteHandler}
                note={note}
                HandleNoteChange={HandleNoteChange}
            />
    </div>
    );
}

export default NewNote;
