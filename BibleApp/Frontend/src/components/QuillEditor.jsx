import React, { useRef, useState } from 'react';
import Editor from './Editor';
import Quill from 'quill';

const Delta = Quill.import('delta');

const QuillEditor = ({removeNoteHandler}) => {
  const [noteContent, setNoteContent] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const quillRef = useRef();

  const handleSave = () => {
    if (quillRef.current) {
      const content = quillRef.current.getContents();
      const text = quillRef.current.getText();
      
      console.log('Note content (Delta):', content);
      console.log('Note content (Text):', text);
      
      // Aquí puedes implementar la lógica para guardar la nota
      alert('Nota guardada!');
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