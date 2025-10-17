import QuillEditor from "./QuillEditor";

function NewNote({noteVerse, removeNoteHandler, note, HandleNoteChange}) {
    return (
        <div>
            <div>
                <h1>Verse:</h1>
                <div>
                    <p>{noteVerse.content}</p>
                    <div>
                    <p>{noteVerse.bookName}</p>
                    <p>{noteVerse.chapterNumber}:{noteVerse.verseNumber}</p>
                    <p>{noteVerse.translation}</p>
                    </div>
                </div>
            </div>
            <QuillEditor 
                noteVerse={noteVerse}
                removeNoteHandler={removeNoteHandler}
                note={note}
                HandleNoteChange={HandleNoteChange}
            />
    </div>
    );
}

export default NewNote;
