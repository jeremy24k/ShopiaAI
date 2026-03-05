import { useEffect, useRef, useState } from 'react';
import { Save } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNotesStore } from '../../store/NotesStore';
import { useNotificationStore } from '../../store/NotificationStore';
import { CreateQuill } from '../../utils/CreateQuill';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import Modal from '../../components/ui/Modal';
import styles from './NoteModal.module.css';
import 'quill/dist/quill.snow.css';

function NoteModal({ note, isOpen, onClose, onSave, mode = 'view' }) {
    const { t } = useTranslation();
    const editorRef = useRef(null);
    const quillInstanceRef = useRef(null);
    const [hasChanges, setHasChanges] = useState(false);
    const { updateNoteContent } = useNotesStore();
    const { showSuccess, showError } = useNotificationStore();

    useEffect(() => {
        if (isOpen && mode === 'edit' && editorRef.current && !quillInstanceRef.current) {
            // Inicializar Quill solo en modo edición
            quillInstanceRef.current = CreateQuill(editorRef.current);
            
            // Establecer contenido inicial
            const initialContent = note.note_content || '';
            console.log('📝 Cargando contenido en editor:', initialContent ? 'Contenido encontrado' : 'Sin contenido');
            if (initialContent) {
                quillInstanceRef.current.root.innerHTML = initialContent;
            }
            
            // Resetear hasChanges al abrir
            setHasChanges(false);
            
            // Detectar cambios DESPUÉS de la inicialización
            // Usar setTimeout para evitar que el setContents inicial dispare el evento
            setTimeout(() => {
                if (quillInstanceRef.current) {
                    quillInstanceRef.current.on('text-change', () => {
                        setHasChanges(true);
                    });
                }
            }, 100);
        }

        // Cleanup cuando se cierra el modal
        if (!isOpen && quillInstanceRef.current) {
            quillInstanceRef.current = null;
            setHasChanges(false);
        }

        return () => {
            if (!isOpen && quillInstanceRef.current) {
                quillInstanceRef.current = null;
            }
        };
    }, [isOpen, mode, note.note_content]);

    const handleSave = async () => {
        if (!quillInstanceRef.current || !hasChanges) return;

        const content = quillInstanceRef.current.root.innerHTML;
        const text = quillInstanceRef.current.getText();

        if (!text.trim()) {
            showError(t('note_cannot_be_empty'));
            return;
        }

        const noteData = {
            content_html: content,
            content_text: text,
            verseKey: note.verse_key
        };

        console.log('💾 Guardando nota:', { noteId: note.id, noteData });

        const result = await updateNoteContent(note.id, noteData);

        if (result.success) {
            showSuccess(t('note_updated_success'));
            setHasChanges(false);
            
            // Notificar al componente padre que se guardó exitosamente
            if (onSave) {
                onSave();
            }
            
            onClose();
        } else {
            showError(result.error || t('note_update_error'));
        }
    };

    const handleClose = () => {
        if (hasChanges) {
            const confirm = window.confirm(t('unsaved_changes_warning'));
            if (!confirm) return;
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={note.note_title}
            size="large"
            closeOnOverlayClick={!hasChanges}
            contentClassName={styles.noteModalContent}
        >
            {/* Subtitle */}
            <p className={styles.modalSubtitle}>
                {mode === 'view' ? t('viewing_note') : t('editing_note')}
            </p>

            {/* Content */}
            <div className={styles.modalBody}>
                {mode === 'view' ? (
                    <div 
                        className={styles.noteContentView}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(note.note_content || note.note_text) }}
                    />
                ) : (
                    <div ref={editorRef} className={styles.noteEditor} />
                )}
            </div>

            {/* Footer */}
            {mode === 'edit' && (
                <div className={styles.modalFooter}>
                    <button 
                        className={styles.cancelButton}
                        onClick={handleClose}
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={!hasChanges}
                    >
                        <Save size={18} />
                        {t('save_changes')}
                    </button>
                </div>
            )}
        </Modal>
    );
}

export default NoteModal;
