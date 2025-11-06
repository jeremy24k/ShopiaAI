import { use, useContext, useEffect, useState } from "react";
import { NotesContext } from "../../context/NotesContext";
import NoteViewer from "./NoteViewer";
import Loading from "../ui/Loading";

function NoteList({ isActive }) {
    const { loadingNotes, errorNotes } = useContext(NotesContext);
    
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