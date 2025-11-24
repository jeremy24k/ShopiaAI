import { useRef, useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useContext } from 'react';
import { NotesContext } from '../../context/NotesContext';
import NotePreview from './NotePreview';
import NoteContent from './NoteContent';
import { UIcontext } from '../../context/UIcontext';
import Loading from '../../components/ui/Loading';
import { formatDate, formatTime } from '../../utils/FormatTime';

function NoteViewer({ isActive }) {
    const editorInstancesRef = useRef({});
    const { DeleteNotes, notes, updateNoteContent, loadingIndividualNotes, loadingNotes } = useContext(NotesContext);
    const [hasChanges, setHasChanges] = useState({});
    const { handleOpenModal } = useContext(UIcontext);
    const [showEditor, setShowEditor] = useState({});
    const [editorContents, setEditorContents] = useState({});

    const handleDeleteNote = async (noteId) => {
        await handleOpenModal(() => {
            DeleteNotes(noteId);
        });
    };

    const handleContentChange = (noteId, content) => {
        // ✅ update editorContents
        setEditorContents(prev => ({
            ...prev,
            [noteId]: content
        }));

        // ✅ update hasChanges
        setHasChanges(prev => ({
            ...prev,
            [noteId]: content.hasChanges
        }));
    };

    const handleUpdateNote = (noteId, verseKey) => {
        // ✅ update note content
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
        
        // ✅ LIMPIAR ESTADO DE CAMBIOS INMEDIATAMENTE (Optimistic UI)
        setHasChanges(prev => ({
            ...prev,
            [noteId]: false
        }));

        setShowEditor(prev => ({
            ...prev,
            [noteId]: false
        }));
    };

    const showNoteContent = (note) => {
        const noteContent = document.querySelector(`.NoteContent[data-note-id="${note.id}"]`);
        const notePreview = document.querySelector(`.NotePreview[data-note-id="${note.id}"]`);
        noteContent.style.display = 'block';
        notePreview.style.display = 'none';

        setShowEditor(prev => ({
            ...prev,
            [note.id]: true
        }));
    };

    const hideNoteContent = (note) => {
        const noteContent = document.querySelector(`.NoteContent[data-note-id="${note.id}"]`);
        const notePreview = document.querySelector(`.NotePreview[data-note-id="${note.id}"]`);
        noteContent.style.display = 'none';
        notePreview.style.display = 'block';
    };

    // ✅ FILTRAR NOTAS TEMPORALES QUE ESTÁN CARGANDO
    const visibleNotes = notes.filter(note => 
        !note.isTemp || loadingIndividualNotes[note.id]
    );

    if (!visibleNotes || visibleNotes.length === 0) {
        return <p>No hay notas guardadas para este versículo</p>;
    }

    return (
        <div>
            {visibleNotes.map(note => (
                <div key={note.id}>
                    {/* ✅ MOSTRAR LOADING PARA NOTAS TEMPORALES O EN PROCESO */}
                    {loadingIndividualNotes[note.id] ? (
                        <div className={`loading-note ${note.isTemp ? 'creating' : 'updating'}`}>
                            <Loading/>
                            <span className="loading-text">
                                {note.isTemp ? 'Creando nota...' : 'Guardando cambios...'}
                            </span>
                        </div>
                    ) : (
                        <div className={`note-card ${note.isTemp ? 'temp-note' : ''}`}>
                            {/* ✅ INDICADOR VISUAL PARA NOTAS TEMPORALES */}
                            {note.isTemp && (
                                <div className="temp-indicator">🕓 Guardando...</div>
                            )}
                            
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
                                    showEditor={showEditor[note.id]}
                                    formatDate={formatDate} 
                                    formatTime={formatTime} 
                                    hideNoteContent={hideNoteContent}
                                    onContentChange={(content) => handleContentChange(note.id, content)}
                                />
                            </div>

                            <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="delete-btn"
                                disabled={note.isTemp} // ✅ DESHABILITAR ELIMINAR MIENTRAS ES TEMPORAL
                            >
                                🗑️ Eliminar
                            </button>

                            {hasChanges[note.id] && (
                                <button
                                    onClick={() => handleUpdateNote(note.id, note.verse_key)}
                                    className="update-btn"
                                >
                                    📝 Guardar Cambios
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default NoteViewer;