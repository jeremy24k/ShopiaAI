import { NotesContext } from "../../context/NotesContext";
import { useContext, useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

function Editor() {
    const editorRef = useRef(null);
    const quillInstanceRef = useRef(null);
    const [editorContent, setEditorContent] = useState('');
    const editorInstancesRef = useRef({});
    const { NewEditor, addEditor, removeEditor, setNewEditor, updateEditorContent } = useContext(NotesContext);
    const { verseId } = useParams();

    const filteredEditors = NewEditor.filter(editor => 
        editor.verseKey === verseId
    );

    const handleAddEditor = () => {
        addEditor();
    };

    const initializeEditor = (editorId, editorElement) => {
        if (editorElement && !editorInstancesRef.current[editorId]) {
            const quill = new Quill(editorElement, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        ['link', 'blockquote'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }]
                    ]
                },
                placeholder: 'Escribe tu nota aquí...',
            });

            const savedEditor = NewEditor.find(editor => editor.id === editorId);
            if (savedEditor?.content) {
                quill.root.innerHTML = savedEditor.content;
            }

            // ✅ ESCUCHAR CAMBIOS Y ACTUALIZAR CONTEXTO
            quill.on('text-change', () => {
                const htmlContent = quill.root.innerHTML;
                console.log(`Editor ${editorId} cambió:`, htmlContent);
                
                // ✅ ACTUALIZAR EN EL CONTEXTO
                updateEditorContent(editorId, htmlContent);
            });

            // Guardar la instancia
            editorInstancesRef.current[editorId] = quill;
            
        }
    };

    return (
        <div>
            {filteredEditors.map((editor, idx) => {
                return (
                    <div key={editor.id}>
                        <h1>Editor {idx + 1}</h1>
                        <p>{editor.verseKey}</p>
                        <div style={{ height: '150px' }} ref={(el) => initializeEditor(editor.id, el)} />
                        <p>{editor.content}</p>
                        {filteredEditors.length > 1 && (
                            <button onClick={() => removeEditor(editor.id)}>Descartar</button>
                        )}
                    </div>
                );
            })}
           
            <button onClick={handleAddEditor}>Agregar una nueva nota</button>
        </div>
    );
}

export default Editor;