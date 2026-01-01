import styles from "../../styles/VerseContent.module.css";
import { useState, useEffect, useRef } from "react";
import { useAiStore } from "../../store/AiStore";
import { useFavoritesStore } from "../../store/FavoritesStore";
import useProtectedAction from "../../hooks/useProtectedAction";
import { useVersesNotesStore } from "../../store/VersesNotesStore";
import { useNavigate } from "react-router-dom";
import { getVerseData } from "../../utils/getVerseData";
import { EllipsisVertical, X, NotebookPen, Star, Brain } from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import Icon from "../../components/ui/Icon";
import SkeletonLoader from "../../components/ui/SkeletonLoader"

function VerseContent({ chapterData, bookId, chapterNumber, selectedTranslation, currentPlayingIndex, fontSize, chapterLoading, chapterError }) {
    const [alertVerseId, setAlertVerseId] = useState({verseId: null, type: null});
    const { SaveFavorite } = useFavoritesStore();
    const { setVerseToExplain, verseToExplain } = useAiStore();
    const { protectedAction, isAuthenticated } = useProtectedAction();
    const navigate = useNavigate();
    const { SaveVerses } = useVersesNotesStore();
    const [openAction, setOpenAction] = useState({ verse_number: 0, open: false });
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (openAction.open && menuRef.current && !menuRef.current.contains(event.target)) {
                closeMenu();
            }
        }

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [openAction.open]);

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
                            className={subItem.wordsOfJesus ? styles.words_of_jesus : ''}
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
                    return null;
                }
            }
            return null;
        });
    }

    // Función para verificar si mostrar alert en un verso específico
    function shouldShowAlert(item, type) {
        const verseId = `${bookId}-${chapterNumber}-${item.number}`;
        return alertVerseId.verseId === verseId && alertVerseId.type === type;
    }

    async function handleSaveFavorite(item) {
        protectedAction(async () => {
            const verseData = getVerseData(item, chapterData);
            const result = await SaveFavorite(verseData);
            
            // Handle duplicate favorite error
            if (result.success && result.exists) {
                const verseId = `${bookId}-${chapterNumber}-${item.number}`;
                setAlertVerseId({verseId, type: 'favorite'});
                setTimeout(() => {
                    setAlertVerseId({verseId: null, type: null});
                }, 3000);
            } else {
                navigate(`/favorites`)
            }
        }, 'Guardar Un Favorito')();
    }

    async function setNoteVerseHandler(verse) {
        // Usamos el estado chapterData que ahora contiene toda la info necesaria
        const result = await SaveVerses(getVerseData(verse, chapterData));
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

    function explainVerseHandler(item) {
        // Usamos el estado chapterData que ahora contiene toda la info necesaria
        console.log(chapterData);
        const verseData = getVerseData(item, chapterData);
        setVerseToExplain([
            verseData,
            ...verseToExplain
        ]);
        navigate(`/ai`)
    }

    function openMenu(item, e) {
        if (e) e.stopPropagation();
        setOpenAction({
            verse_number: item.number,
            open: true
        });
    }

    function closeMenu(e) {
        if (e) e.stopPropagation();
        setOpenAction({
            verse_number: 0,
            open: false
        });
    }

    const skeletonArray = Array.from({ length: 15 }, (_, index) => index);

    if (chapterLoading) {
        return (
            <div className={styles.ctn_verses_skeleton}>
                    {skeletonArray.map((_, index) => (
                        <div key={index}>
                            <SkeletonLoader
                                variant="rectangular"
                                width="100%"
                                height="40px"
                            />
                        </div>
                    ))}
            </div>
        )
    }

    return (
        <div className={styles.ctn_verses}>
            {chapterData.content.map((item, idx) => {
                if (item.type === "line_break") {
                    return <br key={`linebreak-${idx}`} />;
                }
                if (item.type === "verse") {
                    const showMenu = openAction.verse_number === item.number && openAction.open;
                    return (
                        <p 
                            key={`verse-${item.number}-${idx}`} 
                            id={`${bookId.toLowerCase()}-${chapterNumber}-${item.number}-${selectedTranslation.value}`}
                            className={`${styles.verse} ${currentPlayingIndex === idx ? styles.playing : ''}`}
                        >
                            <span className={styles.verse_number}>{item.number}</span>
                            <span className={styles.verse_content} style={{ fontSize: `${fontSize}px` }}>
                                {renderVerseContent(item.content, item.number)}
                            </span>

                            <span className={styles.verse_button}>

                                {openAction.open && openAction.verse_number === item.number ? (
                                    <IconButton
                                        icon={X}
                                        onClick={closeMenu}
                                        circle = {true}
                                        variant="ghost"
                                        size="small"
                                        iconSize="small"
                                    />
                                ) : (
                                    <IconButton
                                        icon={EllipsisVertical}
                                        onClick={(e) => openMenu(item, e)}
                                        circle = {true}
                                        variant="ghost"
                                        size="small"
                                        iconSize="small"
                                    />
                                )}

                                {showMenu && 
                                    <span className={styles.action_menu} ref={menuRef}>
                                        <button onClick={() => setNoteVerseHandler(item)}>
                                            <Icon icon={<NotebookPen />} size="small" color="primary"/>
                                            {shouldShowAlert(item, 'note') ? <span className="alert">This note verse is already exist</span> : 'Write Note'}
                                        </button>

                                        <button onClick={() => handleSaveFavorite(item)}>
                                            <Icon icon={<Star />} size="small" color="primary"/>
                                            {shouldShowAlert(item, 'favorite') ? <span className="alert">This favorite verse is already exist</span> : 'Add to Favorites'}
                                            {!isAuthenticated && <span> (Login to save)</span>}
                                        </button>
                                        
                                        <button onClick={() => explainVerseHandler(item)}>
                                            <Icon icon={<Brain />} size="small" color="primary"/>
                                            Explain Verse
                                        </button>
                                    </span>
                                }
                            </span>

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
            })}
        </div>
    );
}

export default VerseContent;
