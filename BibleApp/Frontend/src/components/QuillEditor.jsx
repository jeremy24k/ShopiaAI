import React, { useRef, useState } from 'react';
import Editor from './Editor';
import Quill from 'quill';
import supabase from "../supabase/supabase";
const Delta = Quill.import('delta');

const QuillEditor = ({removeNoteHandler, noteVerse}) => {
  const [noteContent, setNoteContent] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const quillRef = useRef();

  const handleSave = async () => {
    if (quillRef.current) {
      const deltaContent = quillRef.current.getContents(); // Objeto Delta
      const plainText = quillRef.current.getText(); // Texto plano
      
      // Serializar Delta a JSON
      const deltaJSON = JSON.stringify(deltaContent);
      
      console.log('Delta serializado:', deltaJSON);

      const { data: userData } = await supabase.auth.getUser();
      console.log('User:', userData);
      
      // Guardar en Supabase
      const { data, error } = await supabase
        .from('notes')
        .insert({
          userId: userData.user.id,
          verse_data: noteVerse,
          content_delta: deltaContent, // Supabase maneja la conversión a JSONB
          content_text: plainText
      });

      console.log('Nota guardada:', data);
      console.log('Error:', error);
    }
  };

  const handleTextChange = (delta, oldDelta, source) => {
    if (source === 'user') {
      setNoteContent(quillRef.current?.getText() || '');
    }
  };

  const handleClear = () => {
    if (quillRef.current) {
      quillRef.current.setText('');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
      <Editor
        ref={quillRef}
        readOnly={readOnly}
        defaultValue={new Delta().insert('Escribe tu nota aquí...\n')}
        onTextChange={handleTextChange}
      />
      <div className="controls">
        <label>
          Read Only:{' '}
          <input
            type="checkbox"
            checked={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
          />
        </label>
        <button
          type="button"
          onClick={handleSave}

        >
          Guardar Nota
        </button>

        <button
          type="button"
          onClick={handleClear}
        >
          Limpiar Nota
        </button>

        <button
          type="button"
          onClick={removeNoteHandler}
        >
          Eliminar Nota
        </button>
      </div>
    </div>
  );
};

export default QuillEditor;