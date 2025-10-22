// React imports
import { useState, useEffect, useContext } from 'react';

// Router imports
import { useBlocker } from 'react-router-dom';

// Context imports
import { NotesContext } from '../context/NotesContext';

// Component imports
import WriteNote from "./WriteNote";

function Notes() {
    // ===== STATE MANAGEMENT =====
    const [isDirty, setIsDirty] = useState(false); // Track if there are unsaved changes
    const [showModal, setShowModal] = useState(false); // Control navigation confirmation modal
    const [ChangesNotes, setChangesNotes] = useState([]); // Track changes per note
    
    // Context and router
    const { data, ui, setters } = useContext(NotesContext);
    const blocker = useBlocker(isDirty); // Block navigation when there are unsaved changes

    // ===== HANDLERS =====
    
    // Confirm navigation and discard changes
    const handleConfirm = () => {
        setShowModal(false);
        setChangesNotes([]);
        setIsDirty(false);
        blocker.proceed();
    };

    // Cancel navigation and stay on page
    const handleCancel = () => {
        setShowModal(false);
        blocker.reset();
    };

    // ===== EFFECTS =====
    
    // Show modal when navigation is blocked
    useEffect(() => {
        if (blocker.state === 'blocked') {
            setShowModal(true);
        }
    }, [blocker]);

    // Track note content changes
    useEffect(() => {
        if (data.noteContent && data.noteContent.noteId) {
            setChangesNotes(prevChanges => {
                const currentNoteId = data.noteContent.noteId;
                
                // Update existing note or add new one
                const existingIndex = prevChanges.findIndex(note => note.noteId === currentNoteId);
                if (existingIndex !== -1) {
                    const updatedChanges = [...prevChanges];
                    updatedChanges[existingIndex] = data.noteContent;
                    console.log('🔄 Note updated:', currentNoteId, updatedChanges);
                    return updatedChanges;
                } else {
                    const newChanges = [...prevChanges, data.noteContent];
                    console.log('➕ New note added:', currentNoteId, newChanges);
                    return newChanges;
                }
            });
        }
    }, [data.noteContent]);

    // Update dirty state based on changes
    useEffect(() => {
        const hasUnsavedChanges = ChangesNotes.some(note => note.hasContent === true);
        setIsDirty(hasUnsavedChanges);
    }, [ChangesNotes]);

    // Handle successful note save
    useEffect(() => {
        if (ui.saveSuccess?.success) {
            console.log('🎉 Note saved successfully in Notes:', ui.saveSuccess.verseToSave);
            
            // Clear pending changes states
            setChangesNotes([]);
            setIsDirty(false);
            setters.setNoteContent(null);
            
            // Optional: show notification
            // alert('Note saved successfully');
            
            // Clear success state after processing
            setTimeout(() => setters.setSaveSuccess(null), 100);
        }
    }, [ui.saveSuccess, setters]);

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            setters.setNoteContent(null);
        };
    }, [setters]);

    return (
        <div>
            <h1>Notes</h1>
            
            {/* Main notes component */}
            <WriteNote />
            
            {/* Navigation confirmation modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        Are you sure you want to leave?
                    </p>
                    <button onClick={handleCancel}>No</button>
                    <button onClick={handleConfirm}>Yes</button>
                </div>
            )}
        </div>
    );
}

export default Notes;
