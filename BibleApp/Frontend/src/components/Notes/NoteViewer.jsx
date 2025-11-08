import { useRef, useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useContext } from 'react';
import { NotesContext } from '../../context/NotesContext';
import NotePreview from './NotePreview';
import NoteContent from './NoteContent';
import { UIcontext } from '../../context/UIcontext';

function NoteViewer({ isActive }) {
    const editorInstancesRef = useRef({});
    const { DeleteNotes, notes, updateNoteContent } = useContext(NotesContext);
    const { handleOpenModal } = useContext(UIcontext);
    const [hasChanges, setHasChanges] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [editorContents, setEditorContents] = useState({});

    const handleDeleteNote = (noteId, verseKey) => {
        handleOpenModal(() => {
            DeleteNotes(noteId, verseKey);
        });
    };

    const handleContentChange = (noteId, content) => {
        // ✅ Guardar el contenido del editor por nota
        setEditorContents(prev => ({
            ...prev,
            [noteId]: content
        }));
        setHasChanges(true);
    };

    const handleUpdateNote = (noteId, verseKey) => {
        // ✅ Obtener el contenido desde el estado
        const content = editorContents[noteId];
        
        if (!content || !content.text.trim()) {
            alert('La nota no puede estar vacía');
            return;
        }

        const noteData = {
            content_html: content.html,
            content_text: content.text,
            verseKey: verseKey
        };

        updateNoteContent(noteId, noteData);
        setHasChanges(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const showNoteContent = (note) => {
        const noteContent = document.querySelector(`.NoteContent[data-note-id="${note.id}"]`);
        const notePreview = document.querySelector(`.NotePreview[data-note-id="${note.id}"]`);
        noteContent.style.display = 'block';
        notePreview.style.display = 'none';

        setShowEditor(true);
    };

    const hideNoteContent = (note) => {
        const noteContent = document.querySelector(`.NoteContent[data-note-id="${note.id}"]`);
        const notePreview = document.querySelector(`.NotePreview[data-note-id="${note.id}"]`);
        noteContent.style.display = 'none';
        notePreview.style.display = 'block';
    };

    if (!notes || notes.length === 0) {
        return <p>No hay notas guardadas para este versículo</p>;
    }

    return (
        <div>
            {/* <h2>Notas Guardadas</h2> */}
            {notes.map(note => (
                <div key={note.id} className="note-card">
                    
                    <div 
                        className="NotePreview" 
                        data-note-id={note.id}
                    >
                        <NotePreview 
                            note={note} 
                            formatDate={formatDate} 
                            formatTime={formatTime} 
                            showNoteContent={showNoteContent}
                        />
                    </div>

                    <div 
                        className="NoteContent"
                        data-note-id={note.id}
                        style={{ display: 'none' }}
                    >   
                        <NoteContent 
                            note={note} 
                            isActive={isActive}
                            showEditor={showEditor}
                            setHasChanges={setHasChanges}
                            formatDate={formatDate} 
                            formatTime={formatTime} 
                            hideNoteContent={hideNoteContent}
                            onContentChange={(content) => handleContentChange(note.id, content)}
                        />
                    </div>

                    <button
                        onClick={() => handleDeleteNote(note.id, note.verse_key)}
                        className="delete-btn"
                    >
                        🗑️ Eliminar
                    </button>

                    {hasChanges && (
                        <button
                            onClick={() => handleUpdateNote(note.id, note.verse_key)}
                            className="update-btn"
                        >
                            📝 Guardar Cambios
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default NoteViewer;