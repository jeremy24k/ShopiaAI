import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNotesStore } from '../../store/NotesStore';
import { Clock, Eye, Edit, Trash2 } from 'lucide-react';
import { truncateHtml } from '../../utils/sanitizeHtml';
import NoteModal from './NoteModal';
import styles from '../../pages/WriteNotes.module.css';

function NotePreview({note, formatDate, formatTime, handleDeleteNote}) {
    const { t } = useTranslation();
    const { loadNotes } = useNotesStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
    
    const handleSave = async () => {
        // Recargar las notas después de guardar
        console.log('🔄 Recargando notas después de guardar...');
        await loadNotes(note.verse_key);
    };

    return (
        <div>
            <h3 className={styles.notePreviewTitle}>
                {note.note_title}
            </h3>

            <div 
                className={styles.notePreviewText}
                dangerouslySetInnerHTML={{ 
                    __html: truncateHtml(note.note_content || note.note_text, 3) 
                }}
            />

            <div className={styles.noteMeta}>
                <Clock size={14} />
                <span>
                    {formatDate(note.update_at || note.created_at)} · {formatTime(note.update_at || note.created_at)}
                </span>
            </div>

            <div className={styles.notePreviewActions}>
                <button 
                    className={styles.viewButton}
                    onClick={() => {
                        setModalMode('view');
                        setIsModalOpen(true);
                    }}
                >
                    <Eye size={16} />
                    {t('view_note')}
                </button>
                <button 
                    className={styles.editButton}
                    onClick={() => {
                        setModalMode('edit');
                        setIsModalOpen(true);
                    }}
                >
                    <Edit size={16} />
                    {t('edit_note')}
                </button>
                <button
                    onClick={() => handleDeleteNote(note.id)}
                    className={styles.deleteButton}
                    disabled={note.isTemp}
                >
                    <Trash2 size={16} />
                    {t('delete_note')}
                </button>
            </div>

            <NoteModal 
                note={note}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                mode={modalMode}
            />
        </div>
    );
}

export default NotePreview;
