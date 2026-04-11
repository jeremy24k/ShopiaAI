import { useRef, useEffect } from 'react';
import 'quill/dist/quill.snow.css';
import { CreateQuill, formatRelativeTime } from '../../utils';
import { useTranslation } from '../../hooks/useTranslation';
import { Clock, X } from 'lucide-react';
import styles from '../../styles/WriteNotes.module.css';

function NoteContent({ note, 
    hideNoteContent, 
    isActive, 
    showEditor, 
    onContentChange 
}) {
    const { t } = useTranslation();
    const editorRef = useRef(null);
    const quillInstanceRef = useRef(null);

    useEffect(() => {
        if (!isActive) return;
        
        // ✅ Solo inicializar Quill una vez
        if (editorRef.current && !quillInstanceRef.current && showEditor) {

            const quill = CreateQuill(editorRef.current);

            // Cargar contenido inicial
            const initialContent = note.note_content || '';
            quill.root.innerHTML = initialContent;
            
            quillInstanceRef.current = quill;

            // Event listener para cambios
            quill.on('text-change', () => {

                const htmlContent = quill.root.innerHTML;
                const textContent = quill.getText().trim();
                let hasChanges;
                
                htmlContent !== initialContent ? hasChanges = true : hasChanges = false;

                onContentChange({
                    html: htmlContent,
                    text: textContent,
                    hasChanges: hasChanges
                });
            });
        }

        // ✅ Cleanup al desmontar
        return () => {
            if (quillInstanceRef.current) {
                quillInstanceRef.current = null;
            }
        };
    }, [showEditor]); // ← Array de dependencias VACÍO = solo se ejecuta una vez

    return (
        <div className={styles.noteContentWrapper}>
            {showEditor && (
                <div 
                    className={styles.noteEditorWrapper}
                    ref={editorRef}
                />
            )}
            <div className={styles.noteContentMeta}>
                <div className={styles.noteMeta}>
                    <Clock size={14} />
                    <span>
                        {formatRelativeTime(note.update_at || note.created_at, t)}
                    </span>
                </div>
                <button 
                    className={styles.closeButton}
                    onClick={() => hideNoteContent(note)}
                >
                    <X size={16} />
                    {t('hide_note')}
                </button>
            </div>
        </div>
    );
}

export default NoteContent;