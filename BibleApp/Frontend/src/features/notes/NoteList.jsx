import { use, useEffect, useState } from "react";
import { useNotesStore } from "../../store/NotesStore";
import NoteViewer from "./NoteViewer";
import Loading from "../../components/ui/Loading";

function NoteList({ isActive }) {
    const { loadingNotes, errorNotes } = useNotesStore();
    
    return (
        <div>
            <h1>Lista de Notas</h1>
            {loadingNotes ? (
                <div className="loading-notes">
                    <Loading />
                    <p>Cargando notas...</p>
                </div>
            ) : errorNotes ? (
                <p>Error al cargar notas: {errorNotes}</p>
            ) : (
                <NoteViewer isActive={isActive} />
            )}
        </div>
    );
}

export default NoteList;