import { useContext, useEffect, useState } from "react";
import { NotesContext } from "../../context/NotesContext";
import NoteViewer from "./NoteViewer";
import Loading from "../ui/Loading";

function NoteList({ isActive }) {
    const { loadNotes, loadingNotes, errorNotes, notes, VerseKey, currentVerseKey } = useContext(NotesContext);
    
    useEffect(() => {
        if (VerseKey) {
            loadNotes();
        }
    }, [VerseKey]);

    useEffect(() => {
        if (notes.length === 0 && !loadingNotes) {
            loadNotes();
        }
    }, []);

    useEffect(() => {
        console.log(currentVerseKey);
    }, [currentVerseKey]);

    return (
        <div>
            <h1>Lista de Notas</h1>
            {loadingNotes ? (
                <Loading />
            ) : errorNotes ? (
                <p>Error al cargar notas: {errorNotes}</p>
            ) : (
                <NoteViewer isActive={isActive} />
            )}
        </div>
    );
}

export default NoteList;