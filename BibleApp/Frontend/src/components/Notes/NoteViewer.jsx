import { useRef, useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

function NoteViewer({ notes, onUpdateNote }) {
    const editorInstancesRef = useRef({});

    const initializeEditor = (noteId, editorElement, initialContent) => {
        if (editorElement && !editorInstancesRef.current[noteId]) {
            const quill = new Quill(editorElement, {
                theme: 'snow',
                modules: { toolbar: true },
                readOnly: false, // Permitir edición
            });

            // Cargar contenido existente
            quill.root.innerHTML = initialContent;

            editorInstancesRef.current[noteId] = quill;
        }
    };

    const handleUpdateNote = (note) => {
        const quill = editorInstancesRef.current[note.id];
        if (!quill) return;

        const htmlContent = quill.root.innerHTML;
        const textContent = quill.getText().trim();

        if (!textContent) {
            alert('La nota no puede estar vacía');
            return;
        }

        onUpdateNote({
            id: note.id,
            content_html: htmlContent,
            content_text: textContent,
            verse_key: note.verse_key,
        });
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


    if (!notes || notes.length === 0) {
        return <p>No hay notas guardadas para este versículo</p>;
    }

    return (
        <div>
            <h2>Notas Guardadas</h2>
            {notes.map(note => (
                <div key={note.id} className="note-card">
                    <h4>Nota - {formatDate(note.updated_at || note.created_at)}</h4>
                    
                    <div 
                        style={{ height: '150px' }} 
                        ref={(el) => initializeEditor(note.id, el, note.content_html || note.note_content)} 
                    />
                    
                    <button 
                        onClick={() => handleUpdateNote(note)}
                        className="update-btn"
                    >
                        💾 Actualizar
                    </button>
                    
                    <div className="note-meta">
                        <span>
                            <p>
                                Last updated: {formatDate(note.updated_at || note.created_at)}
                            </p>
                            <p>
                                at {formatTime(note.updated_at || note.created_at)}
                            </p>
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default NoteViewer;