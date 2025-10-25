import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { BooksContext } from "../context/BooksContext";
import { NotesContext } from "../context/NotesContext";
import { AiContext } from "../context/AiContext";
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
    const { setVerseToExplain } = useContext(AiContext);
    const { selectedTranslation, getChapter, translations, setSelectedTranslation } = useContext(BooksContext);
    const [currentChapter, setCurrentChapter] = useState(chapterNumber);
    const [alertVerseId, setAlertVerseId] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

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

    // Función para verificar si mostrar alert en un verso específico
    function shouldShowAlert(item) {
        const verseId = `${bookId}-${chapterNumber}-${item.number}`;
        return alertVerseId === verseId;
    }

    async function setFavoritesHandler(item) {
        const result = await SaveFavorite(getVerseData(item));
        
        // Handle duplicate favorite error
        if (!result.success && result.isDuplicate) {
            // Crear ID específico del verso en la función
            const verseId = `${bookId}-${chapterNumber}-${item.number}`;
            setAlertVerseId(verseId);
            setTimeout(() => {
                setAlertVerseId(null);
            }, 3000);
        } else {
            navigate(`/favorites`)
        }
    }

    function explainVerseHandler(item) {
        const verseData = getVerseData(item);
        setVerseToExplain(verseData);
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
                    bookName: chapter.data.book.commonName
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
                                    navigate(`/notes`)
                                    setNoteVerseHandler(item);
                                  }
                                } >Write Note</button>

                                <button onClick={
                                    () => {
                                        setFavoritesHandler(item);
                                    }
                                }>Add to Favorites</button>
                                {shouldShowAlert(item) && <span className="alert">This favorite verse is already exist</span>}

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
            <ChapterNavigation
                chapterNumber={currentChapter}
                setChapterNumber={setCurrentChapter}
                chapterData={chapterData}
            />
        </div>
    );
}
export default ChapterContent;