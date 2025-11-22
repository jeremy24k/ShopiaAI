import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { BooksContext } from "../context/BooksContext";
import { VersesNotesContext } from "../context/VersesNotesContext";
import { AiContext } from "../context/AiContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { TrackingContext } from "../context/TrackingContext";
import { TrackingBookContext } from "../context/TrackingBookContext";
import Loading from "../components/ui/Loading";
import ChapterNavigation from "./ChapterNavigation";
import FetchError from "./ui/FetchError";
import useProtectedAction from "./Hooks/useProtectedAction.jsx";

function ChapterContent() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chapterData, setChapterData] = useState([]);
    let { bookId, chapterNumber } = useParams();
    const { SaveVerses } = useContext(VersesNotesContext);
    const { SaveFavorite } = useContext(FavoritesContext);
    const { setVerseToExplain, verseToExplain } = useContext(AiContext);
    const { selectedTranslation, getChapter, translations, setSelectedTranslation } = useContext(BooksContext);
    const [currentChapter, setCurrentChapter] = useState(chapterNumber);
    const [alertVerseId, setAlertVerseId] = useState({verseId: null, type: null});
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { protectedAction, isAuthenticated } = useProtectedAction();
    const { InitTracking, UpdateMinutes, Minutes, setMinutes } = useContext(TrackingContext);
    const { markAsCompleted, unCompleteChapter, CompleteLoading, CompleteError, isChapterCompleted } = useContext(TrackingBookContext);
    bookId = bookId.toUpperCase();
    const [chapterID, setChapterID] = useState(`${bookId}-${chapterNumber}-${selectedTranslation.value}`);

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

    async function setNoteVerseHandler(verse) {
        const result = await SaveVerses(getVerseData(verse));
        // Handle duplicate note error
        if (result.success && result.exists) {
            // Crear ID específico del verso en la función
            const verseId = `${bookId}-${chapterNumber}-${verse.number}`;
            setAlertVerseId({verseId, type: 'note'});
            setTimeout(() => {
                setAlertVerseId({verseId: null, type: null});
            }, 3000);
        } else {
            navigate(`/notes`)
        }
    }

    async function setFavoritesHandler(item) {
        // ✅ protectedAction RETORNA una función que debes EJECUTAR
        const protectedFn = protectedAction(
            async () => {
                await saveFavoriteHandler(item);
            }, 
            'Guardar Un Favorito'
        );
        
        // ✅ EJECUTAR la función retornada
        protectedFn();
    }

    async function saveFavoriteHandler(item) {
        const result = await SaveFavorite(getVerseData(item));
        
        // Handle duplicate favorite error
        if (result.success && result.exists) {
            // Crear ID específico del verso en la función
            const verseId = `${bookId}-${chapterNumber}-${item.number}`;
            setAlertVerseId({verseId, type: 'favorite'});
            setTimeout(() => {
                setAlertVerseId({verseId: null, type: null});
            }, 3000);
        } else {
            navigate(`/favorites`)
        }
    }

    // Función para verificar si mostrar alert en un verso específico
    function shouldShowAlert(item, type) {
        const verseId = `${bookId}-${chapterNumber}-${item.number}`;
        return alertVerseId.verseId === verseId && alertVerseId.type === type;
    }

    function explainVerseHandler(item) {
        const verseData = getVerseData(item);
        setVerseToExplain([
            verseData,
            ...verseToExplain
        ]);
        navigate(`/ai`)
    }

    function completeChapterHandler() {
        const currentChapterData = {
            bookId: bookId,
            chapterNumber: currentChapter,
            translationValue: selectedTranslation.value,
            id: `${bookId}-${chapterNumber}-${selectedTranslation.value}`
        };
        markAsCompleted(currentChapterData);
    }

    function unCompleteChapterHandler() {
        const currentChapterId = `${bookId}-${chapterNumber}-${selectedTranslation.value}`;
        unCompleteChapter(currentChapterId);
    }

    // Effect ÚNICO para manejar traducción y capítulo
    useEffect(() => {
        const fetchChapter = async (translationToUse) => {
            try {
                console.log('📖 Fetching chapter with translation:', translationToUse);
                console.log('📖 Book:', bookId, 'Chapter:', currentChapter);
                
                const chapter = await getChapter(bookId, currentChapter, setLoading, setError, translationToUse);
                
                const newChapterData = {
                    data: chapter.data.chapter.content,
                    numberOfChapters: chapter.data.book.numberOfChapters,
                    bookName: chapter.data.book.commonName,
                };

                console.log('✅ Chapter loaded:', newChapterData.bookName, 'with', newChapterData.data.length, 'verses');
                setChapterData(newChapterData);
                
            } catch (error) {
                console.error('❌ Error fetching chapter:', error);
                setError(error.message || "An error occurred while fetching chapter");
                setLoading(false);
            }
        };

        // Detectar traducción desde URL
        const urlTranslation = searchParams.get('translation');
        
        if (urlTranslation && translations.length > 0) {
            const newTranslation = translations.find(t => t.id === urlTranslation);
            if (newTranslation) {
                // Si la traducción de URL es diferente, actualizarla
                if (urlTranslation !== selectedTranslation.value) {
                    console.log('🔄 Updating translation from URL:', urlTranslation);
                    setSelectedTranslation({
                        value: newTranslation.id,
                        label: newTranslation.name
                    });
                }
                // Usar la traducción de URL para el fetch
                fetchChapter(urlTranslation);
            }
        } else if (selectedTranslation.value) {
            // Si no hay traducción en URL, usar la seleccionada
            fetchChapter(selectedTranslation.value);
        }
        
        if (currentChapter !== chapterNumber) {
            navigate(`/books/${bookId}/${currentChapter}?translation=${selectedTranslation.value}`, { replace: true });
        }
    }, [bookId, currentChapter, searchParams, translations]);

    // Effect para scroll automático al versículo específico
    const location = useLocation();
    useEffect(() => {
        if (location.hash && !loading) {
            // Pequeño delay para asegurar que el DOM esté renderizado
            const timer = setTimeout(() => {
                const element = document.getElementById(location.hash.substring(1));
                if (element) {
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    // Opcional: agregar highlight temporal
                    element.style.backgroundColor = '#ffeb3b';
                    element.style.transition = 'background-color 0.3s ease';
                    setTimeout(() => {
                        element.style.backgroundColor = '';
                    }, 2000);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [location.hash, loading, chapterData]);

    useEffect(() => {
        InitTracking();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMinutes(prev => {
                const newMinutes = prev + 1;
                console.log("Minutes updated: ", newMinutes);
                return newMinutes;
            });
        }, 60000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (Minutes > 0) {
            UpdateMinutes();
        }
    }, [Minutes]);

    useEffect(() => {
        setChapterID(`${bookId}-${chapterNumber}-${selectedTranslation.value}`);
    }, [bookId, chapterNumber, selectedTranslation.value]);

    return (
        <div>
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
                            <p 
                                key={`verse-${item.number}-${idx}`} 
                                id={`${bookId.toLowerCase()}-${chapterNumber}-${item.number}-${selectedTranslation.value}`}
                            >
                                <span className="verse-number">{item.number} </span>
                                <span className="verse-content">
                                    {renderVerseContent(item.content, item.number)}
                                </span>

                                <button onClick={
                                  () => {
                                    setNoteVerseHandler(item);
                                  }
                                }>
                                    {shouldShowAlert(item, 'note') ? <span className="alert">This note verse is already exist</span> : 'Write Note'}
                                </button>

                                <button onClick={
                                    () => {
                                        setFavoritesHandler(item);
                                    }
                                }>
                                    {shouldShowAlert(item, 'favorite') ? <span className="alert">This favorite verse is already exist</span> : 'Add to Favorites'}
                                    {!isAuthenticated && <span> (Login to save)</span>}
                                </button>
                                

                                <button onClick={() => explainVerseHandler(item)}>Explain Verse</button>
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
            <div>
                {isChapterCompleted(chapterID) ? (
                    <button onClick={unCompleteChapterHandler} disabled={CompleteLoading}>{CompleteLoading ? 'Loading...' : 'Unmark as Complete'}</button>
                ) : (
                    <button onClick={completeChapterHandler} disabled={CompleteLoading}>{CompleteLoading ? 'Loading...' : 'Mark as Complete'}</button>
                )}
            </div>
            <ChapterNavigation
                chapterNumber={currentChapter}
                setChapterNumber={setCurrentChapter}
                chapterData={chapterData}
            />
        </div>
    );
}
export default ChapterContent;