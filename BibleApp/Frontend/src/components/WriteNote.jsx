import { useContext, useState, useEffect } from "react";
import { NotesContext } from "../context/NotesContext";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import ExistingNote from "./ExistingNote";
import NewNote from "./NewNote";

function WriteNote() {
    const { noteVerse, setNoteVerse, existingNotes, loadNotes, loadingSave } = useContext(NotesContext);
    const { user, loading } = useContext(AuthContext);

    function removeNoteHandler(index) {
        const updatedNote = [...noteVerse];
        updatedNote.splice(index, 1);
        setNoteVerse(updatedNote);
    }

    useEffect(() => {
        if (!loading && user) {
            loadNotes();
        }
    }, [user, loading]);

    return (
        <>
            <h1>New Notes</h1>
            {noteVerse.length === 0 ? (
                <p>No verse selected</p>
            ) : (
                noteVerse.map((noteVerse, index) => (
                    <NewNote 
                        key={index} 
                        noteVerse={noteVerse}
                        removeNoteHandler={removeNoteHandler} 
                        existingNotes={existingNotes}
                    />
                ))
            )}
            <Link to="/books">select a verse</Link>


            <h1>Saved Notes</h1>
            {existingNotes.length === 0 ? (
                <p>No notes found</p>
            ) : (
                existingNotes.map((note, index) => (
                    <ExistingNote 
                        key={index} 
                        verse={note.verse_data}
                        existingNoteContent={note.content_delta}
                        noteId={note.id}
                   />
                ))
            )}
            {loadingSave && <p>Loading...</p>}
        </>
    );
}

export default WriteNote;