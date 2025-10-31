import { Routes, Route } from "react-router-dom";
import NoteVerses from "./Notes/NoteVerses";
import WriteNotes from "./Notes/WriteNotes"

function Notes() {
    return (
        <div>
            <h1>Notes</h1>
            <Routes>
                <Route path="/" element={
                    <NoteVerses />
                } />
                <Route path="/:verseId" element={<WriteNotes />} />
            </Routes>
        </div>
    );
}

export default Notes;