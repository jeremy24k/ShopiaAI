import { useEffect, useRef, useState } from 'react';
import { Save, Pencil, Check, X, BookOpen } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNotesStore } from '../../store/NotesStore';
import { useNotificationStore } from '../../store/NotificationStore';
import { CreateQuill, sanitizeHtml } from '../../utils';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import styles from '../../styles/NoteModal.module.css';
import 'quill/dist/quill.snow.css';

function NoteModal({ note, isOpen, onClose, onSave, mode = 'view' }) {
    const { t } = useTranslation();
    const editorRef = useRef(null);
    const quillInstanceRef = useRef(null);
    const initialContentRef = useRef('');
    const initialTitleRef = useRef('');
    const [hasChanges, setHasChanges] = useState(false);
    const [editableTitle, setEditableTitle] = useState(note.note_title || '');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const titleInputRef = useRef(null);
    const { updateNoteContent } = useNotesStore();
    const { showSuccess, showError } = useNotificationStore();

    useEffect(() => {
        if (isOpen && mode === 'edit' && editorRef.current && !quillInstanceRef.current) {
            // Inicializar Quill solo en modo edición
            quillInstanceRef.current = CreateQuill(editorRef.current);
            
            // Establecer contenido inicial
            const initialContent = note.note_content || '';
            if (initialContent) {
                quillInstanceRef.current.root.innerHTML = initialContent;
            }
            
            // Guardar contenido y título inicial para comparación
            setTimeout(() => {
                if (quillInstanceRef.current) {
                    initialContentRef.current = quillInstanceRef.current.root.innerHTML;
                    initialTitleRef.current = note.note_title || '';
                }
            }, 50);
            
            // Resetear hasChanges, título y modo edición al abrir
            setHasChanges(false);
            setEditableTitle(note.note_title || '');
            setIsEditingTitle(false);
            
            // Detectar cambios comparando con el contenido inicial
            setTimeout(() => {
                if (quillInstanceRef.current) {
                    quillInstanceRef.current.on('text-change', () => {
                        checkForChanges();
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
            note_title: editableTitle.trim() || 'Sin título',
            content_html: content,
            content_text: text,
            verseKey: note.verse_key
        };

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
            setShowConfirmClose(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowConfirmClose(false);
        onClose();
    };

    const handleCancelClose = () => {
        setShowConfirmClose(false);
    };

    const checkForChanges = () => {
        if (!quillInstanceRef.current) return;
        
        const currentContent = quillInstanceRef.current.root.innerHTML;
        const currentTitle = editableTitle;
        
        const contentChanged = currentContent !== initialContentRef.current;
        const titleChanged = currentTitle !== initialTitleRef.current;
        
        setHasChanges(contentChanged || titleChanged);
    };

    const handleTitleChange = (e) => {
        setEditableTitle(e.target.value);
        // Verificar cambios después de actualizar el título
        setTimeout(() => checkForChanges(), 0);
    };

    const handleEditTitle = () => {
        setIsEditingTitle(true);
        // Focus en el input después de que se renderice
        setTimeout(() => {
            if (titleInputRef.current) {
                titleInputRef.current.focus();
                titleInputRef.current.select();
            }
        }, 0);
    };

    const handleSaveTitle = () => {
        setIsEditingTitle(false);
    };

    const handleCancelTitle = () => {
        setEditableTitle(note.note_title || '');
        setIsEditingTitle(false);
        // Verificar cambios después de restaurar el título
        setTimeout(() => checkForChanges(), 0);
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSaveTitle();
        } else if (e.key === 'Escape') {
            handleCancelTitle();
        }
    };

    // Renderizar título personalizado para el header
    const customTitle = mode === 'edit' ? (
        <div className={styles.titleContainer}>
            {isEditingTitle ? (
                <>
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={editableTitle}
                        onChange={handleTitleChange}
                        onKeyDown={handleTitleKeyDown}
                        placeholder={t('note_title_placeholder') || 'Título de la nota'}
                        className={styles.titleInputHeader}
                    />
                    <button onClick={handleSaveTitle} className={styles.titleIconButton} title="Guardar">
                        <Check size={18} />
                    </button>
                    <button onClick={handleCancelTitle} className={styles.titleIconButton} title="Cancelar">
                        <X size={18} />
                    </button>
                </>
            ) : (
                <>
                    <span className={styles.titleText}>{editableTitle || 'Sin título'}</span>
                    <button onClick={handleEditTitle} className={styles.titleEditButton} title="Editar título">
                        <Pencil size={16} />
                    </button>
                </>
            )}
        </div>
    ) : note.note_title;

    return (
        <>
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={customTitle}
            size="large"
            closeOnOverlayClick={!hasChanges}
            contentClassName={styles.noteModalContent}
        >
            {/* Verse Context */}
            {note.notes_verses?.verse_data && (
                <div className={styles.verseContext}>
                    <div className={styles.verseContextHeader}>
                        <BookOpen size={16} className={styles.verseIcon} />
                        <span className={styles.verseReference}>
                            {note.notes_verses.verse_data.bookName} {note.notes_verses.verse_data.chapterNumber}:{note.notes_verses.verse_data.verseNumber}
                        </span>
                        <span className={styles.verseTranslation}>{note.notes_verses.verse_data.translation}</span>
                    </div>
                    {note.notes_verses.verse_data.content && (
                        <p className={styles.verseText}>
                            {note.notes_verses.verse_data.content}
                        </p>
                    )}
                </div>
            )}

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

        {/* Confirmation Modal para cerrar sin guardar */}
        <ConfirmationModal
            isOpen={showConfirmClose}
            onClose={handleCancelClose}
            onConfirm={handleConfirmClose}
            title={t('unsaved_changes_title') || 'Cambios sin guardar'}
            message={t('unsaved_changes_warning') || '¿Estás seguro de que quieres cerrar sin guardar los cambios?'}
            confirmText={t('discard_changes') || 'Descartar cambios'}
            cancelText={t('cancel') || 'Cancelar'}
            variant="warning"
        />
    </>
    );
}

export default NoteModal;
