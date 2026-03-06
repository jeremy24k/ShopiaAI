import { useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';
import { useNotesStore } from '../../store/NotesStore';
import { useNotificationStore } from '../../store/NotificationStore';
import { useTranslation } from '../../hooks/useTranslation';
import NotePreview from './NotePreview';
import NoteContent from './NoteContent';
import { useUIStore } from '../../store/UIStore';
import Loading from '../../components/ui/Loading';
import { Trash2, Save } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/FormatTime';
import styles from '../../pages/WriteNotes.module.css';

function NoteViewer({ isActive }) {
    const { t } = useTranslation();
    const editorInstancesRef = useRef({});
    const { showWarning } = useNotificationStore();
    const { DeleteNotes, notes, updateNoteContent, loadingIndividualNotes, loadingNotes } = useNotesStore();
    const [hasChanges, setHasChanges] = useState({});
    const { handleOpenModal } = useUIStore();
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
            showWarning(t('note_cannot_be_empty'));
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
        return (
            <div className={styles.emptyState}>
                <p className={styles.emptyStateText}>{t('no_saved_notes')}</p>
            </div>
        );
    }

    return (
        <>
            {visibleNotes.map(note => (
                <div key={note.id}>
                    {/* ✅ MOSTRAR LOADING PARA NOTAS TEMPORALES O EN PROCESO */}
                    {loadingIndividualNotes[note.id] ? (
                        <div className={styles.loadingNote}>
                            <Loading/>
                            <span className={styles.loadingText}>
                                {note.isTemp ? t('creating_note') : t('saving_changes')}
                            </span>
                        </div>
                    ) : (
                        <div className={`${styles.noteCard} ${note.isTemp ? styles.tempNote : ''} fadeIn`}>
                            {/* ✅ INDICADOR VISUAL PARA NOTAS TEMPORALES */}
                            {note.isTemp && (
                                <div className={styles.tempIndicator}>{t('saving_changes')}</div>
                            )}
                            
                            <div 
                                className="NotePreview" 
                                data-note-id={note.id}
                            >
                                <NotePreview 
                                    note={note} 
                                    formatDate={formatDate} 
                                    formatTime={formatTime} 
                                    handleDeleteNote={handleDeleteNote}
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

                            {hasChanges[note.id] && (
                                <div className={styles.noteActions}>
                                    <button
                                        onClick={() => handleUpdateNote(note.id, note.verse_key)}
                                        className={styles.updateButton}
                                    >
                                        <Save size={18} />
                                        {t('save_changes')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </>
    );
}

export default NoteViewer;