import { useContext, useState, useEffect } from "react";
import { NotesContext } from "../context/NotesContext";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import ExistingNote from "./ExistingNote";
import NewNote from "./NewNote";

function WriteNote() {
    const { data, actions, ui, setters } = useContext(NotesContext);
    const { user, loading } = useContext(AuthContext);

    function removeNoteHandler(index) {
        const updatedNote = [...data.noteVerse];
        updatedNote.splice(index, 1);
        setters.setNoteVerse(updatedNote);
    }

    useEffect(() => {
        if (!loading && user) {
            actions.loadNotes();
        }
    }, [user, loading]);

    return (
        <>
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
            <Link to="/books">select a verse</Link>


            <h1>Saved Notes</h1>
            {data.existingNotes.length === 0 ? (
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
            {ui.loadingSave && <p>Loading...</p>}
        </>
    );
}

export default WriteNote;