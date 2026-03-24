import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Clock, Eye, Edit, Trash2 } from 'lucide-react';
import { truncateHtml } from '../../utils/sanitizeHtml';
import { formatRelativeTime } from '../../utils/FormatTime';
import NoteModal from './NoteModal';
import styles from '../../styles/WriteNotes.module.css';

function NotePreview({note, handleDeleteNote}) {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
    
    const handleSave = async () => {
        // No es necesario recargar - updateNoteContent ya actualiza el estado
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
                    {formatRelativeTime(note.update_at || note.created_at, t)}
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
