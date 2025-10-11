import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { BooksContext } from "../context/BooksContext";
import { NotesContext } from "../context/NotesContext";
import Loading from "../components/ui/Loading";
import ChapterNavigation from "./ChapterNavigation";
import FetchError from "./ui/FetchError";


function ChapterContent() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chapterData, setChapterData] = useState([]);
    let { bookId, chapterNumber } = useParams();
    const { noteVerse, setNoteVerse } = useContext(NotesContext);
    const { selectedTranslation, getChapter } = useContext(BooksContext);
    const [currentChapter, setCurrentChapter] = useState(chapterNumber);
    const navigate = useNavigate();

    bookId = bookId.toUpperCase();

    function setNoteVerseHandler(item) {
        setNoteVerse({
            bookName: chapterData.bookName,
            bookId: bookId,
            chapterNumber: currentChapter,
            verseNumber: item.number,
            translation: selectedTranslation.label,
            translationValue: selectedTranslation.value,
            content: item.content
        });
    }

    useEffect(() => {
        const fetchChapter = async () => {
            try {
                const chapter = await getChapter(bookId, currentChapter, setLoading, setError, selectedTranslation.value);
                const chapterData = {
                    data: chapter.data.chapter.content,
                    numberOfChapters: chapter.data.book.numberOfChapters,
                    bookName: chapter.data.book.commonName
                };

                setChapterData(chapterData);
            } catch (error) {
                console.error(error);
                setError(error.message || "An error occurred while fetching chapter");
                setLoading(false);
            }
        };
        fetchChapter();
        if (currentChapter !== chapterNumber) {
            navigate(`/books/${bookId}/${currentChapter}?translation=${selectedTranslation.value}`, { replace: true });
        }
    }, [bookId, currentChapter, selectedTranslation.value]);

    useEffect(() => {
        console.log(noteVerse);
    }, [noteVerse]);

    return (
        <div>
            <div>
                <h1>{chapterData.bookName}</h1>
                <h1>Capitulo: {currentChapter}</h1>
            </div>

            <h2>{selectedTranslation.label}</h2>
            {loading ? (
                <Loading />
            ) : error ? (
                <FetchError />
            ) : (
                chapterData.data.map((item, idx) => {
                    if (item.type === "line_break") {
                        return <br key={`linebreak-${idx}`} />;
                    }
                    if (item.type === "verse") {
                        return (
                            <p key={`verse-${item.number}-${idx}`}>
                                <span className="verse-number">{item.number} </span>
                                <span className="verse-content">
                                {Array.isArray(item.content) && item.content.length > 0
                                    ? item.content.map((subItem, index) => {
                                        if (typeof subItem === 'string') {
                                            return <span key={`verse-${item.number}-${index}`}>{subItem}</span>;
                                        } else if (subItem && typeof subItem === 'object') {
                                            if ('text' in subItem && !('poem' in subItem) && !('noteId' in subItem)) {
                                                return (
                                                    <span
                                                        key={`text-${item.number}-${index}`}
                                                        style={subItem.wordsOfJesus ? { color: 'blue' } : {}}
                                                    >
                                                        {subItem.text}
                                                    </span>
                                                );
                                            }
                                            if ('text' in subItem && 'poem' in subItem) {
                                                return <span key={`poem-${item.number}-${index}`}>{subItem.text} </span>;
                                            }
                                            if (subItem.noteId !== undefined) {
                                                return <sup key={`note-${item.number}-${subItem.noteId}-${index}`} className="note-ref">[{subItem.noteId}]</sup>;
                                            }
                                        }
                                        return null;
                                    })
                                    : <span key={`empty-${item.number}`}>{`no content`}</span>
                                }
                                </span>

                                <button onClick={
                                  () => {
                                    navigate(`/notes`)
                                    setNoteVerseHandler(item);
                                  }
                                } >Write Note</button>
                            </p>
                        );
                    }
                    if (item.type === "heading") {
                        return (
                            <h3 key={`heading-${idx}`}>
                                {Array.isArray(item.content) ? item.content.join(" ") : item.content}
                            </h3>
                        );
                    }
                    return null;
                })
            )}
            <ChapterNavigation
                chapterNumber={currentChapter}
                setChapterNumber={setCurrentChapter}
                chapterData={chapterData}
            />
        </div>
    );
}
export default ChapterContent;