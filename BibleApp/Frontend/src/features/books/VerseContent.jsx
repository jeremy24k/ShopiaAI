import styles from "../../styles/VerseContent.module.css";
import { useState, useEffect, useRef, useMemo } from "react";
import { getVerseData } from "../../utils/getVerseData";
import { EllipsisVertical, X, NotebookPen, Star, Brain } from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import Icon from "../../components/ui/Icon";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import SelectionHeader from "./SelectionHeader";
import useVerseActions from "../../hooks/useVerseActions";
import { useFavoritesStore } from "../../store/FavoritesStore";
import { useVersesNotesStore } from "../../store/VersesNotesStore";
import { useAiStore } from "../../store/AiStore";

function VerseContent({ chapterData, bookId, chapterNumber, selectedTranslation, currentPlayingIndex, fontSize, chapterLoading, selectedVerses, selectionMode, toggleVerseSelection, selectAllVerses, clearSelection, explainSelectedVerses, cancelSelection, t }) {
    const [openAction, setOpenAction] = useState({ verse_number: 0, open: false });
    const menuRef = useRef(null);
    const LoadFavoritesVerses = useFavoritesStore(state => state.LoadFavoritesVerses);
    const noteVerse = useVersesNotesStore(state => state.noteVerse);
    const verseToExplain = useAiStore(state => state.verseToExplain);
    
    // Optimizar búsqueda de favoritos y notas - USAR lowercase verse_key directamente
    const favoriteKeys = useMemo(
      () =>
        new Set(
          LoadFavoritesVerses.map((fav) => (fav.verse_key || "").toLowerCase()),
        ),
      [LoadFavoritesVerses],
    );

    const noteKeys = useMemo(
      () =>
        new Set(noteVerse.map((note) => (note.verse_key || "").toLowerCase())),
      [noteVerse],
    );
    
    const aiContextKeys = useMemo(
      () =>
        new Set(
          verseToExplain.map((v) =>
            `${v.bookId}-${v.chapterNumber}-${v.verseNumber}-${v.translationValue}`.toLowerCase(),
          ),
        ),
      [verseToExplain],
    );
    
    const isSelectionFullyInContext = useMemo(() => {
        if (selectedVerses.length === 0) return false;
        return selectedVerses.every(num => 
            aiContextKeys.has(`${bookId}-${chapterNumber}-${num}-${selectedTranslation.value}`.toLowerCase())
        );
    }, [selectedVerses, aiContextKeys, bookId, chapterNumber, selectedTranslation.value]);
    
    // Usar el hook personalizado para las acciones de versículos
    const {
        handleSaveFavorite,
        handleCreateNote,
        handleExplainVerse,
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
            return <span key={`empty-${verseNumber}`}>{t('no_content')}</span>;
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
        closeMenu();
    }

    async function handleCreateNoteWrapper(item) {
        const verseData = getVerseData(item, chapterData);
        await handleCreateNote(verseData);
        closeMenu();
    }

    function handleExplainVerseWrapper(item) {
        if (selectionMode === 'single') {
            const verseData = getVerseData(item, chapterData);
            handleExplainVerse(verseData);
            closeMenu();
        }
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
                    const verseKey = `${bookId.toLowerCase()}-${chapterNumber}-${item.number}-${selectedTranslation.value}`;
                    const isFavorite = favoriteKeys.has(verseKey);
                    const hasNote = noteKeys.has(verseKey);
                    const isInAIContext = aiContextKeys.has(`${bookId}-${chapterNumber}-${item.number}-${selectedTranslation.value}`.toLowerCase());
                    
                    const showMenu = openAction.verse_number === item.number && openAction.open;
                    const isSelected = selectedVerses.includes(item.number);
                    
                    return (
                        <p 
                            key={`verse-${item.number}-${idx}`} 
                            id={`${bookId.toLowerCase()}-${item.number}-${selectedTranslation.value}`}
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
                             
                             <span className={styles.verse_number_ctn}>
                                 <span className={styles.verse_number}>{item.number}</span>
                             </span>
                            <label htmlFor={`verse-${item.number}`}>
                                <span className={styles.verse_content} style={{ fontSize: `${fontSize}px` }}>
                                    {renderVerseContent(item.content, item.number)}
                                </span>
                            </label>

                            <span className={styles.verse_button}>
                                {/* Indicadores visuales */}
                                <span className={styles.verse_indicators}>
                                    {favoriteKeys.has(verseKey) && (
                                        <span className={styles.verse_indicator}>
                                            <Icon 
                                                icon={<Star/>} 
                                                size="tiny" 
                                                color="primary"
                                                title={t('verse_indicators_favorite')}
                                            />
                                        </span>
                                    )}
                                    {noteKeys.has(verseKey) && (
                                        <span className={styles.verse_indicator}>
                                            <Icon 
                                                icon={<NotebookPen/>}
                                                size="tiny"
                                                color="primary"
                                                title={t('verse_indicators_note')}
                                            />
                                        </span>
                                    )}
                                    {isInAIContext && (
                                        <span className={styles.verse_indicator}>
                                            <Icon 
                                                icon={<Brain/>}
                                                size="tiny"
                                                color="primary"
                                                title={t('verse_indicators_ai_context')}
                                            />
                                        </span>
                                    )}
                                </span>

                                <span className={styles.dots_menu_ctn}>
                                    {openAction.open && openAction.verse_number === item.number ? (
                                        <IconButton
                                            icon={X}
                                            onClick={closeMenu}
                                            circle = {true}
                                            variant="ghost"
                                            size="small"
                                            iconSize="small"
                                            title={t('verse_indicators_close_menu')}
                                        />
                                    ) : (
                                        <IconButton
                                            icon={EllipsisVertical}
                                            onClick={(e) => openMenu(item, e)}
                                            circle = {true}
                                            variant="ghost"
                                            size="small"
                                            iconSize="small"
                                            title={t('verse_indicators_open_menu')}
                                        />
                                    )}

                                     {showMenu && 
                                        <span className={styles.action_menu} ref={menuRef}>
                                            <button 
                                                onClick={() => handleCreateNoteWrapper(item)}
                                                disabled={hasNote}
                                                className={hasNote ? styles.disabled_btn : ''}
                                            >
                                                <Icon icon={<NotebookPen />} size="small" color={hasNote ? 'grey' : 'primary'}/>
                                                {hasNote ? t('already_has_note') : t('write_note')}
                                            </button>

                                            <button 
                                                onClick={() => handleSaveFavoriteWrapper(item)}
                                                disabled={isFavorite}
                                                className={isFavorite ? styles.disabled_btn : ''}
                                            >
                                                <Icon icon={<Star />} size="small" color={isFavorite ? 'grey' : 'primary'}/>
                                                {isFavorite ? t('already_in_favorites') : t('add_to_favorites')}
                                                {!isAuthenticated && !isFavorite && <span> ({t('login_to_save')})</span>}
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleExplainVerseWrapper(item)}
                                                disabled={isInAIContext}
                                                className={isInAIContext ? styles.disabled_btn : ''}
                                            >
                                                <Icon icon={<Brain />} size="small" color={isInAIContext ? 'grey' : 'primary'}/>
                                                {isInAIContext ? t('already_in_ai_context') : t('explain_verse')}
                                            </button>
                                        </span>
                                    }
                                </span>
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
                isSelectionAlreadyInContext={isSelectionFullyInContext}
                onCancel={cancelSelection}
                t={t}
            />
        </div>
    );
}

export default VerseContent;
