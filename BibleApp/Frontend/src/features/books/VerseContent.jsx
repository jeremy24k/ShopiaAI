import styles from "../../styles/VerseContent.module.css";
import { useState, useEffect, useRef } from "react";
import { getVerseData } from "../../utils/getVerseData";
import { EllipsisVertical, X, NotebookPen, Star, Brain } from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import Icon from "../../components/ui/Icon";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import SelectionHeader from "./SelectionHeader";
import useVerseActions from "../../hooks/useVerseActions";

function VerseContent({ chapterData, bookId, chapterNumber, selectedTranslation, currentPlayingIndex, fontSize, chapterLoading, chapterError, selectedVerses, selectionMode, toggleVerseSelection, selectAllVerses, clearSelection, explainSelectedVerses, cancelSelection, t }) {
    const [openAction, setOpenAction] = useState({ verse_number: 0, open: false });
    const menuRef = useRef(null);
    
    // Usar el hook personalizado para las acciones de versículos
    const {
        handleSaveFavorite,
        handleCreateNote,
        handleExplainVerse,
        shouldShowAlert,
        isAuthenticated
    } = useVerseActions({ bookId, chapterNumber });

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

    // Wrappers para las funciones del hook
    async function handleSaveFavoriteWrapper(item) {
        const verseData = getVerseData(item, chapterData);
        await handleSaveFavorite(verseData);
    }

    async function handleCreateNoteWrapper(item) {
        const verseData = getVerseData(item, chapterData);
        await handleCreateNote(verseData);
    }

    function handleExplainVerseWrapper(item) {
        if (selectionMode === 'single') {
            const verseData = getVerseData(item, chapterData);
            handleExplainVerse(verseData);
            closeMenu();
        }
    }

    function shouldShowAlertWrapper(item, type) {
        const verseData = getVerseData(item, chapterData);
        return shouldShowAlert(verseData, type);
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
        <div className={`${styles.ctn_verses} fadeIn`}>
            {chapterData.content.map((item, idx) => {
                if (item.type === "line_break") {
                    return <br key={`linebreak-${idx}`} />;
                }
                if (item.type === "verse") {
                    const showMenu = openAction.verse_number === item.number && openAction.open;
                    const isSelected = selectedVerses.includes(item.number);
                    
                    return (
                        <p 
                            key={`verse-${item.number}-${idx}`} 
                            id={`${bookId.toLowerCase()}-${chapterNumber}-${item.number}-${selectedTranslation.value}`}
                            className={`${styles.verse} ${currentPlayingIndex === idx ? styles.playing : ''} ${isSelected ? styles.selected : ''}`}
                        >
                            {/* Checkbox en modo múltiple */}
                            {selectionMode === 'multiple' && (
                                <input 
                                    type="checkbox"
                                    className={styles.verse_checkbox}
                                    checked={isSelected}
                                    onChange={() => toggleVerseSelection(item.number)}
                                    id={`verse-${item.number}`} 
                                    name={`verse-${item.number}`}
                                />
                            )}
                            
                            <span className={styles.verse_number}>{item.number}</span>
                            <label htmlFor={`verse-${item.number}`}>
                                <span className={styles.verse_content} style={{ fontSize: `${fontSize}px` }}>
                                    {renderVerseContent(item.content, item.number)}
                                </span>
                            </label>

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
                                        <button onClick={() => handleCreateNoteWrapper(item)}>
                                            <Icon icon={<NotebookPen />} size="small" color="primary"/>
                                            {shouldShowAlertWrapper(item, 'note') ? <span className="alert">This note verse is already exist</span> : 'Write Note'}
                                        </button>

                                        <button onClick={() => handleSaveFavoriteWrapper(item)}>
                                            <Icon icon={<Star />} size="small" color="primary"/>
                                            {shouldShowAlertWrapper(item, 'favorite') ? <span className="alert">This favorite verse is already exist</span> : 'Add to Favorites'}
                                            {!isAuthenticated && <span> (Login to save)</span>}
                                        </button>
                                        
                                        <button onClick={() => handleExplainVerseWrapper(item)}>
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

            {/* Header con tabs y controles */}
            <SelectionHeader 
                selectionMode={selectionMode}
                selectedVerses={selectedVerses}
                totalVerses={chapterData.content.filter(item => item.type === 'verse').length}
                selectAllVerses={selectAllVerses}
                clearSelection={clearSelection}
                explainSelectedVerses={explainSelectedVerses}
                onCancel={cancelSelection}
                t={t}
            />
        </div>
    );
}

export default VerseContent;
