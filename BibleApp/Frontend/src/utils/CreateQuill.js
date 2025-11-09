
import Quill from 'quill';

export const CreateQuill = (editorRef) => {
    return new Quill(editorRef, {
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
}