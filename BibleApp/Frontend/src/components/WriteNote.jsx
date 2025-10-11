
import { useContext, useState } from "react";
import { NotesContext } from "../context/NotesContext";
import QuillEditor from "./QuillEditor";
import { Link } from "react-router-dom";

function WriteNote() {
    const { noteVerse, setNoteVerse } = useContext(NotesContext);

    function removeNoteHandler(index) {
        const updatedNote = [...noteVerse];
        updatedNote.splice(index, 1);
        setNoteVerse(updatedNote);
    }

    console.log(noteVerse);

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
                        />
                    </div>
                ))
            )}
            <Link to="/books">select a verse</Link>
        </>
    );
}

export default WriteNote;