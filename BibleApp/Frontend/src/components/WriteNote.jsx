
import { useContext } from "react";
import { NotesContext } from "../context/NotesContext";
import QuillEditor from "./QuillEditor";
import { Link } from "react-router-dom";

function WriteNote() {
    const { noteVerse } = useContext(NotesContext);


    return (
        <>
            {noteVerse ? (
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
                    <QuillEditor />
                </div>
            ) : (
                <div>
                    <p>no one verse selected</p>
                    <Link to="/books">select a verse</Link>
                </div>
            )}
        </>
    );
}

export default WriteNote;