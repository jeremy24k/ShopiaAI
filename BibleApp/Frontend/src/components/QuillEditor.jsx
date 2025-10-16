import { useEffect, useRef, useState } from 'react';
import Editor from './Editor';
import Quill from 'quill';
import { useContext } from 'react';
import { NotesContext } from '../context/NotesContext';
const Delta = Quill.import('delta');

const QuillEditor = ({removeNoteHandler, noteVerse}) => {
  const [noteContent, setNoteContent] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const { SaveNote, quillRef } = useContext(NotesContext);

  const handleTextChange = (delta, oldDelta, source) => {
    if (source === 'user') {
      setNoteContent(quillRef.current?.getText() || '');
    }

    console.log(noteContent);
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
          onClick={() => SaveNote(noteVerse)}
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