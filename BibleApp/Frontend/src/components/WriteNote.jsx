import { useContext, useState, useEffect } from "react";
import { NotesContext } from "../context/NotesContext";
import { AuthContext } from "../context/AuthContext";
import QuillEditor from "./QuillEditor";
import { Link } from "react-router-dom";

function WriteNote() {
    const { noteVerse, setNoteVerse, existingNotes, loadNotes } = useContext(NotesContext);
    const { user, loading } = useContext(AuthContext);
    const [existingNotesVerse, setExistingNotesVerse] = useState([]);
    const [note, setNote] = useState("");

    function removeNoteHandler(index) {
        const updatedNote = [...noteVerse];
        updatedNote.splice(index, 1);
        setNoteVerse(updatedNote);
    }

    const HandleNoteChange = (note) => {
        setNote(note);
    }

    useEffect(() => {
        if (!loading && user) {
            loadNotes();
        }
    }, [user, loading]);

    useEffect(() => {
        if (existingNotes.length > 0) {
            setExistingNotesVerse(existingNotes.map(verse => verse.verse_data));
        }
    }, [existingNotes.length]);

    return (
        <>
            {noteVerse.length === 0 ? (
                <p>No verse selected</p>
            ) : (
                noteVerse.map((noteVerse, index) => (
                    <div key={index}>
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
                ))
            )}

            {existingNotesVerse.length === 0 ? (
                <p>No notes found</p>
            ) : (
                existingNotesVerse.map((existingNote, index) => (
                    <div key={index}>
                        <div>
                            <h1>Verse:</h1>
                            <div>
                                <p>{existingNote.content}</p>
                                <div>
                                <p>{existingNote.bookName}</p>
                                <p>{existingNote.chapterNumber}:{existingNote.verseNumber}</p>
                                <p>{existingNote.translation}</p>
                                </div>
                            </div>
                        </div>
                        <QuillEditor 
                            noteVerse={existingNote} 
                            removeNoteHandler={removeNoteHandler}
                            note={note}
                            HandleNoteChange={HandleNoteChange}
                        />
                    </div>
                ))
            )}
            <Link to="/books">select a verse</Link>
        </>
    );
}

export default WriteNote;