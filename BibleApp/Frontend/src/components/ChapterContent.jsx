import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { BooksContext } from "../context/BooksContext";
import { NotesContext } from "../context/NotesContext";
import { FavoritesContext } from "../context/FavoritesContext";
import Loading from "../components/ui/Loading";
import ChapterNavigation from "./ChapterNavigation";
import FetchError from "./ui/FetchError";

function ChapterContent() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chapterData, setChapterData] = useState([]);
    let { bookId, chapterNumber } = useParams();
    const { data, setters } = useContext(NotesContext);
    const { SaveFavorite } = useContext(FavoritesContext);
    const { selectedTranslation, getChapter } = useContext(BooksContext);
    const [currentChapter, setCurrentChapter] = useState(chapterNumber);
    const navigate = useNavigate();

    bookId = bookId.toUpperCase();

    // Function to clean verse content for storage (favorites/notes)
    function cleanVerseContent(content) {
        if (Array.isArray(content)) {
            return content.map(subItem => {
                if (typeof subItem === 'string') {
                    return subItem;
                } else if (subItem && typeof subItem === 'object') {
                    if ('text' in subItem) {
                        return subItem.text;
                    }
                }
                return '';
            }).filter(text => text.trim() !== '').join(' ');
        }
        return content;
    }

    // Function to render verse content with styles preserved
    function renderVerseContent(content, verseNumber) {
        if (!Array.isArray(content) || content.length === 0) {
            return <span key={`empty-${verseNumber}`}>no content</span>;
        }

        return content.map((subItem, index) => {
            if (typeof subItem === 'string') {
                return <span key={`verse-${verseNumber}-${index}`}>{subItem}</span>;
            } else if (subItem && typeof subItem === 'object') {
                // Handle text with special formatting (words of Jesus)
                if ('text' in subItem && !('poem' in subItem) && !('noteId' in subItem)) {
                    return (
                        <span
                            key={`text-${verseNumber}-${index}`}
                            style={subItem.wordsOfJesus ? { color: 'blue' } : {}}
                        >
                            {subItem.text}
                        </span>
                    );
                }
                // Handle poems
                if ('text' in subItem && 'poem' in subItem) {
                    return <span key={`poem-${verseNumber}-${index}`}>{subItem.text} </span>;
                }
                // Handle note references
                if (subItem.noteId !== undefined) {
                    return <sup key={`note-${verseNumber}-${subItem.noteId}-${index}`} className="note-ref">[{subItem.noteId}]</sup>;
                }
            }
            return null;
        });
    }

    function getVerseData(item) {
        const cleanContent = cleanVerseContent(item.content);
        return {
            bookName: chapterData.bookName,
            bookId: bookId,
            chapterNumber: currentChapter,
            verseNumber: item.number,
            translation: selectedTranslation.label,
            translationValue: selectedTranslation.value,
            content: cleanContent,
            verseKey: `${bookId}-${chapterNumber}-${item.number}-${selectedTranslation.value}`
        };
    }

    function setNoteVerseHandler(item) {
        setters.setNoteVerse([
            getVerseData(item),
            ...data.noteVerse
        ]);
    }

    function setFavoritesHandler(item) {
        SaveFavorite(getVerseData(item));
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
                                    {renderVerseContent(item.content, item.number)}
                                </span>

                                <button onClick={
                                  () => {
                                    navigate(`/notes`)
                                    setNoteVerseHandler(item);
                                  }
                                } >Write Note</button>

                                <button onClick={
                                    () => {
                                        navigate(`/favorites`)
                                        setFavoritesHandler(item);
                                    }
                                } >Add to Favorites</button>
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