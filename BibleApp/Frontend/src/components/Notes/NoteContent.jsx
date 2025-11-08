import { useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

function NoteContent({ note, 
    formatDate, 
    formatTime, 
    hideNoteContent, 
    isActive, 
    showEditor, 
    setHasChanges, 
    onContentChange 
}) {
    const editorRef = useRef(null);
    const quillInstanceRef = useRef(null);

    useEffect(() => {
        if (!isActive) return;
        
        // ✅ Solo inicializar Quill una vez
        if (editorRef.current && !quillInstanceRef.current && showEditor) {
            const quill = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                   toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],        // Formato básico
                        ['blockquote', 'code-block'],                     // Bloques
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],     // Listas
                        [{ 'color': [] }, { 'background': [] }],          // ← COLORES Y RESALTADO
                        ['link'],                                         // Enlaces
                        ['clean']                                         // Limpiar formato
                    ]
                },
                readOnly: false,
            });

            // Cargar contenido inicial
            quill.root.innerHTML = note.note_content || '';
            
            quillInstanceRef.current = quill;

            // Event listener para cambios
            quill.on('text-change', () => {
                if (onContentChange) {
                    onContentChange({
                        html: quill.root.innerHTML,
                        text: quill.getText().trim()
                    });
                }
                setHasChanges(true);
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