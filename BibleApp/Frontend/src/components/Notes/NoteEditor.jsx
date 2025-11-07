import { NotesContext } from "../../context/NotesContext";
import Notification from "../ui/Notification";
import { useContext, useRef, useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

function NoteEditor({ isActive }) {
    const editorInstancesRef = useRef({});
    const { NewEditor, setNewEditor, addEditor, removeEditor, updateEditorContent, VerseKey, SaveNotes, setNotificationMessage, notificationMessage } = useContext(NotesContext);

    const filteredEditors = NewEditor.filter(editor => 
        editor.verseKey === VerseKey
    );

    const displayEditors = filteredEditors.length === 0 ? NewEditor : filteredEditors;

    const handleAddEditor = () => {
        addEditor();
    };

    const initializeEditor = (editorId, editorElement) => {
        if (!isActive) return; // Solo inicializar si el tab está activo
        if (editorElement && !editorInstancesRef.current[editorId]) {
            const quill = new Quill(editorElement, {
                theme: 'snow',
                modules: { toolbar: true },
                placeholder: 'Escribe tu nota aquí...',
            });

            const savedEditor = NewEditor.find(editor => editor.id === editorId);
            if (savedEditor?.content) {
                quill.root.innerHTML = savedEditor.content;
            }

            // ✅ ESCUCHAR CAMBIOS Y ACTUALIZAR CONTEXTO
            quill.on('text-change', () => {
                const htmlContent = quill.root.innerHTML;
                const textContent = quill.getText(); // ← Obtener texto plano
                console.log(`Editor ${editorId} cambió:`, { htmlContent, textContent });
                
                // ✅ ACTUALIZAR EN EL CONTEXTO con ambos formatos
                updateEditorContent(editorId, {
                    html: htmlContent,
                    text: textContent.trim() // ← Limpiar espacios
                });
            });

            // Guardar la instancia
            editorInstancesRef.current[editorId] = quill;
        }
    };

    const handleSaveNote = async(editor) => {
        const quill = editorInstancesRef.current[editor.id];
        
        if (!quill) {
            console.error('❌ No se encontró el editor Quill');
            return;
        }

        // Obtener ambos formatos del contenido
        let htmlContent = quill.root.innerHTML;
        const textContent = quill.getText().trim();

        // htmlContent = htmlContent
        //     .replace(/<p><br><\/p>/g, '')
        //     .replace(/<p>\s*<br>\s*<\/p>/g, '')
        //     .replace(/<p><br\/><\/p>/g, '')
        //     .replace(/<p>\s*<\/p>/g, '');

        // ✅ Validar que no esté vacío
        if (!textContent) {
            alert('La nota está vacía');
            return;
        }

        // ✅ Preparar datos para guardar
        const noteData = {
            content_html: htmlContent,
            content_text: textContent,
            verseKey: editor.verseKey,
        };

        const result =  await SaveNotes(noteData);

        if (!result.success) {
            console.error('❌ Error al guardar nota:', result.error);
            setNotificationMessage({message: result.error, isError: true});
            return;
        }

        setNotificationMessage({message: 'Nota guardada exitosamente', isError: false});

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
        <div>
            {displayEditors.map((editor, idx) => {
                return (
                    <div key={editor.id}>
                        <p>{editor.id}</p>
                        <h1>Editor {idx + 1}</h1>
                        <p>{editor.verseKey}</p>
                        <div style={{ height: '150px' }} ref={(el) => initializeEditor(editor.id, el)} />
                        {/* <p>{editor.content}</p> */}
                        {displayEditors.length > 1 && (
                            <button onClick={() => removeEditor(editor.id)}>Descartar</button>
                        )}
                        <button onClick={() => handleSaveNote(editor)}>Guardar Nota</button>
                    </div>
                );
            })}

            <button onClick={handleAddEditor}>Agregar una nueva nota</button>

            {notificationMessage.message && (
                <Notification message={notificationMessage.message} isError={notificationMessage.isError} />
            )}
        </div>
    );
}

export default NoteEditor;