import { useNotesStore } from "../../store/NotesStore";
import { useNotificationStore } from "../../store/NotificationStore";
import { useRef, useEffect } from 'react';
import { CreateQuill } from '../../utils';
import { useTranslation } from '../../hooks/useTranslation';
import { Save, Trash2, Plus } from 'lucide-react';
import styles from '../../styles/WriteNotes.module.css';
import 'quill/dist/quill.snow.css';

function NoteEditor({ isActive }) {
    const { t } = useTranslation();
    const editorInstancesRef = useRef({});
    const { showSuccess, showError, showWarning } = useNotificationStore();
    const { 
        NewEditor, 
        setNewEditor, 
        addEditor, 
        removeEditor, 
        updateEditorContent, 
        VerseKey, 
        SaveNotes, 
        noteTitle, 
        setNoteTitle,
        setTabActive 
    } = useNotesStore();

    const filteredEditors = NewEditor.filter(editor => 
        editor.verseKey === VerseKey
    );

    const displayEditors = filteredEditors.length === 0 ? NewEditor : filteredEditors;

    const handleAddEditor = () => {
        addEditor();
    };

    const handleNoteTitleChange = (title, editorId) => {
        setNoteTitle(prev => ({
            ...prev,
            [editorId]: title
        }));
    };

    const initializeEditor = (editorId, editorElement) => {
        if (!isActive) return; // Solo inicializar si el tab está activo

        if (editorElement && !editorInstancesRef.current[editorId]) {
            const quill = CreateQuill(editorElement);

            const savedEditor = NewEditor.find(editor => editor.id === editorId);
            if (savedEditor?.content) {
                quill.root.innerHTML = savedEditor.content;
            }

            // ✅ ESCUCHAR CAMBIOS Y ACTUALIZAR CONTEXTO
            quill.on('text-change', () => {
                const htmlContent = quill.root.innerHTML;
                const textContent = quill.getText();
                
                // Update context with both formats
                updateEditorContent(editorId, {
                    html: htmlContent,
                    text: textContent.trim() // ← Limpiar espacios
                });
            });

            // Guardar la instancia
            editorInstancesRef.current[editorId] = quill;
        }
    };

    const handleSaveNote = async(editor, noteTitle) => {
        
        const quill = editorInstancesRef.current[editor.id];
        
        if (!quill) {
            console.error('❌ No se encontró el editor Quill');
            return;
        }

        // Obtener ambos formatos del contenido
        let htmlContent = quill.root.innerHTML;
        const textContent = quill.getText().trim();

        // ✅ Validar que no esté vacío
        if (!textContent) {
            showWarning(t('note_empty_error'));
            return;
        }

        if (!noteTitle || noteTitle === '' || noteTitle === undefined) {
            showWarning(t('note_title_empty_error'));
            return;
        }

        // ✅ Preparar datos para guardar
        const noteData = {
            content_html: htmlContent,
            content_text: textContent,
            verseKey: editor.verseKey,
            note_title: noteTitle
        };

        const result =  await SaveNotes(noteData);

        if (!result.success) {
            console.error('❌ Error al guardar nota:', result.error);
            showError(result.error);
            return;
        }

        showSuccess(t('note_saved_success'));
        setTabActive('Notes');

        quill.root.innerHTML = '';  

        updateEditorContent(editor.id, {
            html: '',
            text: ''
        });
    };

    useEffect(() => {
        if (VerseKey) {
            // ✅ SOLO CREAR SI NO EXISTE UN EDITOR PARA ESTE VERSE
            setNewEditor(prev => {
                const existingEditor = prev.find(editor => editor.verseKey === VerseKey);
                if (!existingEditor) {
                    const originalID = Date.now();
                    
                    // Initialize title for this editor
                    setNoteTitle(prevTitles => ({
                        ...prevTitles,
                        [originalID]: ''
                    }));
                    
                    return [...prev, { 
                        id: originalID,
                        verseKey: VerseKey,
                        content: ''
                    }];
                }
                return prev; // No cambiar si ya existe
            });
        }
    }, [VerseKey]);

    return (
        <div className={styles.editorSection}>
            {displayEditors.map((editor, idx) => {
                return (
                    <div key={editor.id} className={styles.editorCard}>
                        <div className={styles.editorHeader}>
                            <label htmlFor="title" className={styles.editorLabel}>
                                {t('note_title')}
                            </label>
                            <input 
                                type="text" 
                                name="title"
                                value={noteTitle[editor.id] || ''}
                                onChange={(e) => handleNoteTitleChange(e.target.value, editor.id)}
                                placeholder={t('note_title_placeholder')}
                                className={styles.titleInput}
                            />
                        </div>

                        <div className={styles.editorWrapper} ref={(el) => initializeEditor(editor.id, el)} />

                        <div className={styles.editorActions}>
                            {displayEditors.length > 1 && (
                                <button 
                                    onClick={() => removeEditor(editor.id)}
                                    className={styles.discardButton}
                                >
                                    <Trash2 size={18} />
                                    {t('discard_note')}
                                </button>
                            )}
                            <button 
                                onClick={() => handleSaveNote(editor, noteTitle[editor.id])}
                                className={styles.saveButton}
                            >
                                <Save size={18} />
                                {t('save_note')}
                            </button>
                        </div>
                    </div>
                );
            })}

            <button onClick={handleAddEditor} className={styles.addButton}>
                <Plus size={18} />
                {t('add_new_note')}
            </button>
        </div>
    );
}

export default NoteEditor;