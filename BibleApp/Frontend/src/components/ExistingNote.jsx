import QuillEditor from "./QuillEditor";

function ExistingNote({verse, removeNoteHandler, noteId, HandleNoteChange, existingNoteContent}) {

    return (
        <div>
            <div>
                <h1>Verse:</h1>
                <div>
                    <p>{verse.content}</p>
                    <div>
                    <p>{verse.bookName}</p>
                    <p>{verse.chapterNumber}:{verse.verseNumber}</p>
                    <p>{verse.translation}</p>
                    </div>
                </div>
            </div>
            <QuillEditor 
                noteVerse={verse}
                existingNoteContent={existingNoteContent} 
                removeNoteHandler={removeNoteHandler}
                noteId={noteId}
                HandleNoteChange={HandleNoteChange}
            />
        </div>
    );
}

export default ExistingNote;
