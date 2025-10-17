import { useContext, useState, useEffect } from "react";
import { NotesContext } from "../context/NotesContext";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import ExistingNote from "./ExistingNote";
import NewNote from "./NewNote";

function WriteNote() {
    const { noteVerse, setNoteVerse, existingNotes, loadNotes, loadingSave } = useContext(NotesContext);
    const { user, loading } = useContext(AuthContext);
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
            console.log(existingNotes);
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
                        note={note} 
                        HandleNoteChange={HandleNoteChange} 
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
                        HandleNoteChange={HandleNoteChange} 
                   />
                ))
            )}
            {loadingSave && <p>Loading...</p>}
        </>
    );
}

export default WriteNote;