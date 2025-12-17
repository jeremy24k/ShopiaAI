function NotePreview({note, formatDate, formatTime, showNoteContent}) {
    return (
        <div className="note-preview">
            <h3 className="note-title">
                {note.note_title}
            </h3>

            <p className='note-preview-text'>
                {note.note_text}
            </p>

            <span>
                <p>
                    Last updated: {formatDate(note.update_at || note.created_at)}
                </p>
                <p>
                    at {formatTime(note.update_at || note.created_at)}
                </p>
            </span>

            <button onClick={() => showNoteContent(note)}>Open Note</button>
        </div>
    );
}

export default NotePreview;
