import { useContext, useEffect, useState } from "react";
import { NotesContext } from "../../context/NotesContext";
import NoteViewer from "./NoteViewer";

function NoteList() {
    const { loadNotes } = useContext(NotesContext);
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const result = await loadNotes();
            if (result.success) {
                setNotes(result.data);
            }
        }
        fetchData();
    }, []);
    
    const updateNote = (note) => {
        const updatedNotes = notes.map(n => n.id === note.id ? note : n);
        setNotes(updatedNotes);
    };
    
    return (
        <div>
            <h1>Lista de Notas</h1>
            <NoteViewer notes={notes} onUpdateNote={updateNote} />
        </div>
    );
}

export default NoteList;