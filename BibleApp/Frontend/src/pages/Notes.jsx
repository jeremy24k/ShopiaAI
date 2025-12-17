import { Routes, Route } from "react-router-dom";
import NoteVerses from "../features/notes/NoteVerses";
import WriteNotes from "../features/notes/WriteNotes"
import ModalConfirmacion from "../components/ui/ModalConfirmacion";

function Notes() {
    return (
        <div>
            <h1>Notes</h1>
            <Routes>
                <Route index element={<NoteVerses />} />
                <Route path=":verseId" element={<WriteNotes />} />
            </Routes>
            <ModalConfirmacion />
        </div>
    );
}

export default Notes;