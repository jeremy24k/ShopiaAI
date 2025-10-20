import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { NotesContext } from '../context/NotesContext';
import WriteNote from "./WriteNote";
import { useContext } from 'react';

function Notes() {
    const [isDirty, setIsDirty] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [ChangesNotes, setChangesNotes] = useState([]);
    const { noteContent, setNoteContent } = useContext(NotesContext);
    const blocker = useBlocker(isDirty);

    useEffect(() => {
        noteContent ? setIsDirty(true) : setIsDirty(false);
        
        // Usar función updater para acceder al estado actual
        if (noteContent !== null) {
            setChangesNotes(prevChanges => {
                const newChanges = [...prevChanges, noteContent];
                console.log('ChangesNotes acumulados:', newChanges);
                return newChanges;
            });
        }
    }, [noteContent]);

    const handleConfirm = () => {
        setShowModal(false);
        blocker.proceed();
    };

    const handleCancel = () => {
        setShowModal(false);
        blocker.reset();
    };

    const handleSave = () => {
        setNoteContent(false);
        alert('Datos guardados.');
    };

    useEffect(() => {
        if (blocker.state === 'blocked') {
        setShowModal(true);
        }
    }, [blocker]);

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
