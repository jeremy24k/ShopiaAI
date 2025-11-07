import { useContext, useEffect } from "react";
import { VersesNotesContext } from "../../context/VersesNotesContext";
import { AuthContext } from "../../context/AuthContext";
import { VerseUrl } from "../../utils/VerseUrl";
import { Link } from "react-router-dom";
import LoadingNotes from "../ui/LoadingNotes";
import FetchError from "../ui/FetchError";
import  ModalConfirmacion  from "../ui/ModalConfirmacion";
import { UIcontext } from "../../context/UIcontext";

function NoteVerses() {
    const { noteVerse, loadVerses, loadingVerses, errorVerses, deleteVerse, loadingSpecificVerses } = useContext(VersesNotesContext);
    const { handleOpenModal } = useContext(UIcontext);
    const { user, loading } = useContext(AuthContext);

    const getVerseKey = (verse) => {
        const verseKey = verse.verse_data.verseKey.toLowerCase();
        return verseKey;
    };

  const handleDeleteVerse = (verseKey) => {
        handleOpenModal(() => {
            const result = deleteVerse(verseKey);
            if (!result.success) {
                console.error('❌ Error deleting verse:', result.error);
                return;
            }
            console.log('✅ Verse deleted successfully');
        });
    };

    useEffect(() => {
        if (!loading && user && noteVerse.length === 0) {
            loadVerses();
        }
    }, [loading, user, noteVerse.length]); // Añadir noteVerse.length como dependencia

    if (loadingVerses) {
        return (
            <LoadingNotes numberOfNotes={5}/>
        );
    }

    return (
        <div>
            <h1>Notes Verses</h1>

            <ModalConfirmacion 
                
            />

            {errorVerses ? (
                <FetchError />
            ) : noteVerse.length > 0 ? ( 
                <div>
                    {noteVerse.map((verse, idx) => { 
                        const verseKey = getVerseKey(verse); 
                        return (
                            loadingSpecificVerses[verse.id] ? (
                                <LoadingNotes numberOfNotes={1} key={verse.id} /> 
                            ) : (
                                <div key={verse.id || idx}> 
                                    <h2>{verse.verse_data.bookName} {verse.verse_data.chapterNumber} {verse.verse_data.verseNumber}</h2>
                                    <h3>{verse.verse_data.translation}</h3>
                                    <p>{verse.verse_data.content}</p>
                                    <Link to={VerseUrl(verse.verse_data)}>View Verse</Link>
                                    <Link 
                                        to={`/notes/${verseKey}`} 
                                        >
                                        Edit Notes
                                    </Link>
                                    <button 
                                        onClick={() => (handleDeleteVerse(verseKey))}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )
                        );
                    })}
                </div>
            ) : (
                <p>No verses found</p>
            )}
        </div>
    );
}
export default NoteVerses;
