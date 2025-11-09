import { useRef, useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { CreateQuill } from '../../utils/CreateQuill';

function NoteContent({ note, 
    formatDate, 
    formatTime, 
    hideNoteContent, 
    isActive, 
    showEditor, 
    onContentChange 
}) {
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
        <div className="note-content">
            {showEditor && (
                <div 
                    style={{ height: '150px' }} 
                    ref={editorRef}
                />
            )}
            <div className="note-meta">
                <span>
                    <p>Last updated: {formatDate(note.update_at || note.created_at)}</p>
                    <p>at {formatTime(note.update_at || note.created_at)}</p>
                </span>
            </div>
            <button onClick={() => hideNoteContent(note)}>Close Note</button>
        </div>
    );
}

export default NoteContent;