// React imports
import { useEffect, useRef, useState, useContext } from 'react';

// Component imports
import Editor from './Editor';

// External library imports
import Quill from 'quill';
const Delta = Quill.import('delta');

// Context imports
import { NotesContext } from '../context/NotesContext';

const QuillEditor = ({ 
  removeNoteHandler, 
  noteVerse, 
  existingNoteContent, 
  noteId, 
  readOnly, 
  setReadOnly 
}) => {
  // Context destructuring
  const { actions, ui, setters } = useContext(NotesContext);
  
  // Local refs and state
  const localQuillRef = useRef(); // Local reference for this specific editor
  const [isEmpty, setIsEmpty] = useState(true); // Track if content is empty
  const [isModified, setIsModified] = useState(false); // Track if content has been modified

  // Handle text changes in the editor
  const handleTextChange = (delta, oldDelta, source) => {
    // Only process user-initiated changes
    if (source === 'user' && localQuillRef.current) {
      const textContent = localQuillRef.current.getText();
      const trimmedContent = textContent.trim();
      const placeholderText = 'Escribe tu nota aquí...';
      
      // Check if content contains only whitespace characters
      const onlyWhitespace = /^\s*$/.test(textContent);
      
      // Extract text from existing note content (Delta format)
      let existingNoteContentText = '';
      if (existingNoteContent) {
        existingNoteContent.ops.forEach(op => {
          if (typeof op.insert === 'string') {
            existingNoteContentText += op.insert;
          }
        });
      }
      const existingNoteContentTextTrimmed = existingNoteContentText.trim();

      // Determine if content is valid
      let hasContent = true;
      
      if (trimmedContent.length === 0 || trimmedContent === placeholderText || onlyWhitespace) {
        // Content is empty, placeholder, or only whitespace
        hasContent = false;
        setIsModified(false);
      } else if (existingNoteContentTextTrimmed.length > 0 && existingNoteContentTextTrimmed === trimmedContent) {
        // Content matches existing note (no changes)
        hasContent = false;
        setIsModified(false);
      } else {
        // Content has real changes
        hasContent = true;
        setIsModified(true);
      }

      // Generate consistent ID for the note
      const consistentId = noteVerse 
        ? `${noteVerse.bookId}-${noteVerse.chapterNumber}-${noteVerse.verseNumber}`
        : `note-${Date.now()}`;
      
      // Update local state for button disabling
      setIsEmpty(!hasContent);
      
      // Update global context
      setters.setNoteContent({
        hasContent,
        noteId: consistentId
      });
    }
  };

  // Save current note content
  const handleSave = () => {
    const currentDelta = localQuillRef.current?.getContents();
    const currentText = localQuillRef.current?.getText();
    actions.SaveNote(noteVerse, currentDelta, currentText, noteId, noteVerse.verseKey);
  };

  // Clear editor content
  const handleClear = () => {
    if (localQuillRef.current) {
      localQuillRef.current.setText('');
      setIsEmpty(true);
      setIsModified(false);
    }
  };

  // Delete existing note or discard new note
  const handleDeleteNote = () => {
    if (noteId) {
      actions.deleteNote(noteId);
    } else {
      console.error('No note ID provided');
      removeNoteHandler();
    }
  };

  // Load existing note content when component mounts or content changes
  useEffect(() => {
    if (localQuillRef.current && existingNoteContent) {
      // Load content based on format (Delta or string)
      if (existingNoteContent.ops) {
        localQuillRef.current.setContents(existingNoteContent);
      } else if (typeof existingNoteContent === 'string') {
        localQuillRef.current.setText(existingNoteContent);
      }
      
      // Existing content requires modification to save
      setIsEmpty(true);
      setIsModified(false);
    } else {
      // No existing content - ready for new input
      setIsEmpty(false);
      setIsModified(false);
    }
  }, [existingNoteContent]);

  // Check initial content after component mount
  useEffect(() => {
    if (localQuillRef.current) {
      const textContent = localQuillRef.current.getText();
      const trimmedContent = textContent.trim();
      const placeholderText = 'Escribe tu nota aquí...';
      const onlyWhitespace = /^\s*$/.test(textContent);
      
      // Mark as empty if content is placeholder, empty, or whitespace only
      if (trimmedContent.length === 0 || trimmedContent === placeholderText || onlyWhitespace) {
        setIsEmpty(true);
        setIsModified(false);
      }
    }
  }, []);

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
      {/* Quill Editor Component */}
      <Editor
        ref={localQuillRef}
        readOnly={readOnly}
        defaultValue={existingNoteContent || new Delta().insert('Escribe tu nota aquí...\n')}
        onTextChange={handleTextChange}
      />
      
      {/* Editor Controls */}
      <div className="controls">
        {/* Read-only toggle */}
        <label>
          Read Only:{' '}
          <input
            type="checkbox"
            checked={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
          />
        </label>
        
        {/* Unsaved changes indicator */}
        {isModified && (
          <p style={{ color: 'white', fontSize: '12px', margin: '5px 0 0 0' }}>
            Tienes cambios sin guardar
          </p>
        )}
        
        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isEmpty || ui.isNoteLoading(noteId)}
          style={{
            opacity: isEmpty ? 0.5 : 1,
            cursor: isEmpty ? 'not-allowed' : 'pointer'
          }}
        >
          {ui.isNoteLoading(noteId) 
            ? 'Guardando...' 
            : noteId 
              ? 'Guardar Cambios' 
              : 'Guardar Nota'
          }
        </button>
        
        {/* Empty content warning */}
        {isEmpty && (
          <p style={{ color: 'white', fontSize: '12px', margin: '5px 0 0 0' }}>
            No se pueden guardar notas vacías o sin cambios
          </p>
        )}

        {/* Clear button */}
        <button
          type="button"
          onClick={handleClear}
        >
          Limpiar Nota
        </button>

        {/* Delete/Discard button */}
        <button
          type="button"
          onClick={handleDeleteNote}
        >
          {ui.isNoteLoading(noteId) 
            ? 'Eliminando...' 
            : noteId 
              ? 'Eliminar Nota' 
              : 'Descartar Nota'
          }
        </button>
      </div>
    </div>
  );
};

export default QuillEditor;