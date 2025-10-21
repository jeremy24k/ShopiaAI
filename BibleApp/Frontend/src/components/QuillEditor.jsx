import { useEffect, useRef, useState } from 'react';
import Editor from './Editor';
import Quill from 'quill';
import { useContext } from 'react';
import { NotesContext } from '../context/NotesContext';
const Delta = Quill.import('delta');

const QuillEditor = ({ removeNoteHandler, noteVerse, existingNoteContent, noteId}) => {
  const [readOnly, setReadOnly] = useState(false);
  const { actions, ui, setters } = useContext(NotesContext);
  const localQuillRef = useRef(); // Referencia local para este editor específico

  const handleTextChange = (delta, oldDelta, source) => {
    if (source === 'user' && localQuillRef.current) {
      const textContent = localQuillRef.current.getText();
      
      const trimmedContent = textContent.trim();
      const placeholderText = 'Escribe tu nota aquí...';
      let existingNoteContentText = '';

      if (existingNoteContent) {
        existingNoteContent.ops.forEach(op => {
          if (typeof op.insert === 'string') {
            existingNoteContentText += op.insert;
          }
        });
      }

      const existingNoteContentTextTrimmed = existingNoteContentText.trim();

      let hasContent = true;

      if (trimmedContent.length === 0 || trimmedContent === placeholderText) {
        hasContent = false;
      } else if (existingNoteContentTextTrimmed.length > 0 && existingNoteContentTextTrimmed === trimmedContent) {
        hasContent = false;
      } else {
        hasContent = true;
      }

      const consistentId = noteVerse 
        ? `${noteVerse.bookId}-${noteVerse.chapterNumber}-${noteVerse.verseNumber}`
        : `note-${Date.now()}`;
      
      setters.setNoteContent({
        hasContent,
        noteId: consistentId
      });
    }
  };

  const handleSave = () => {
    const currentDelta = localQuillRef.current?.getContents();
    const currentText = localQuillRef.current?.getText();
    actions.SaveNote(noteVerse, currentDelta, currentText, noteId, noteVerse.verseKey);
  };

  const handleClear = () => {
    if (localQuillRef.current) {
      localQuillRef.current.setText('');
    }
  };

  const handleDeleteNote = () => {
    if (noteId) {
      actions.deleteNote(noteId);
    } else {
      console.error('No se proporcionó un ID de nota');
      removeNoteHandler();
    }
  };

  useEffect(() => {
    if (localQuillRef.current && existingNoteContent) {
      if (existingNoteContent.ops) {
        localQuillRef.current.setContents(existingNoteContent);
      } 
      else if (typeof existingNoteContent === 'string') {
        localQuillRef.current.setText(existingNoteContent);
      }
    }
  }, [existingNoteContent]);

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
      <Editor
        ref={localQuillRef}
        readOnly={readOnly}
        defaultValue={existingNoteContent || new Delta().insert('Escribe tu nota aquí...\n')}
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
          {ui.isNoteLoading(noteId) ? 'Guardando...' : noteId ? 'Guardar Cambios' : 'Guardar Nota'}
        </button>

        <button
          type="button"
          onClick={handleClear}
        >
          Limpiar Nota
        </button>

        <button
          type="button"
          onClick={handleDeleteNote}
        >
          {ui.isNoteLoading(noteId) ? 'Eliminando...' : noteId ? 'Eliminar Nota' : 'Descartar Nota'}
        </button>
      </div>
    </div>
  );
};

export default QuillEditor;