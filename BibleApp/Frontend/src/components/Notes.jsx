import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { NotesContext } from '../context/NotesContext';
import WriteNote from "./WriteNote";
import { useContext } from 'react';

function Notes() {
    const [isDirty, setIsDirty] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [ChangesNotes, setChangesNotes] = useState([]);
    const { data, ui, setters } = useContext(NotesContext);
    const blocker = useBlocker(isDirty);

    const handleConfirm = () => {
        setShowModal(false);
        setChangesNotes([]);
        setIsDirty(false);
        blocker.proceed();
    };

    const handleCancel = () => {
        setShowModal(false);
        blocker.reset();
    };

    const handleSave = () => {
        setters.setNoteContent(false);
        setChangesNotes([]);
        setIsDirty(false);
    };

    useEffect(() => {
        if (blocker.state === 'blocked') {
            setShowModal(true);
        }
    }, [blocker]);

    useEffect(() => {
        if (data.noteContent && data.noteContent.noteId) {
            setChangesNotes(prevChanges => {
                const currentNoteId = data.noteContent.noteId;
                
                const existingIndex = prevChanges.findIndex(note => note.noteId === currentNoteId);
                if (existingIndex !== -1) {
                    const updatedChanges = [...prevChanges];
                    updatedChanges[existingIndex] = data.noteContent;
                    console.log('🔄 Nota reemplazada:', currentNoteId, updatedChanges);
                    return updatedChanges;
                } else {
                    const newChanges = [...prevChanges, data.noteContent];
                    console.log('➕ Nueva nota agregada:', currentNoteId, newChanges);
                    return newChanges;
                }
            });
        }
    }, [data.noteContent]);

    useEffect(() => {
        const hasUnsavedChanges = ChangesNotes.some(note => note.hasContent === true);
        setIsDirty(hasUnsavedChanges);
    }, [ChangesNotes]);

    // ✅ Escuchar cuando se guarda una nota exitosamente
    useEffect(() => {
        if (ui.saveSuccess?.success) {
            console.log('🎉 Nota guardada exitosamente en Notes:', ui.saveSuccess.verseToSave);
            
            // Limpiar estados de cambios pendientes
            setChangesNotes([]);
            setIsDirty(false);
            setters.setNoteContent(null);
            
            // Opcional: mostrar notificación
            // alert('Nota guardada exitosamente');
            
            // Limpiar el estado de éxito después de procesarlo
            setTimeout(() => setters.setSaveSuccess(null), 100);
        }
    }, [ui.saveSuccess, setters]);

    useEffect(() => {
        return () => {
            setters.setNoteContent(null);
        };
    }, [setters]);

    return (
        <div>
            <h1>Notes</h1>
            <WriteNote/>
            {showModal && (
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, backgroundColor: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Are you sure you want to leave?</p>
                    <button onClick={handleCancel}>No</button>
                    <button onClick={handleConfirm}>Yes</button>
                </div>
            )}
        </div>
    );
}

export default Notes;
