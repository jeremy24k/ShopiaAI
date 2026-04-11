import styles from "../../styles/ChapterContent.module.css";
import { useLocation, Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import ChapterNavigation from "../chapters/ChapterNavigation";
import FetchError from "../../components/ui/FetchError";
import VerseContent from "../books/VerseContent";
import NoResults from "../../components/ui/NoResults"
import { useBooksStore } from "../../store/BooksStore";
import { useAiStore } from "../../store/AiStore";
import { useNotificationStore } from "../../store/NotificationStore";
import { TranslationOptions as getTranslationOptions, getVerseData } from "../../utils";

// Custom Hooks
import { useChapterData } from "../../hooks/useChapterData";
import { useChapterReading } from "../../hooks/useChapterReading";
import { useChapterTracking } from "../../hooks/useChapterTracking";
import { useFontSize } from "../../hooks/useFontSize";
import { useAuthStore } from "../../store/AuthStore";
import { useTranslation } from "../../hooks/useTranslation";

// Components
import ChapterHeader from "./ChapterHeader";
import ReadingControls from "./ReadingControls";
import ChapterProgress from "./ChapterProgress";
import ScrollToTopButton from "./ScrollToTopButton";

function ChapterContent() {
    const { t, language } = useTranslation();
    const { user, loading: authLoading } = useAuthStore();
    
    // Get state from store
    const selectedTranslation = useBooksStore(state => state.selectedTranslation);
    const setSelectedTranslation = useBooksStore(state => state.setSelectedTranslation);
    const translations = useBooksStore(state => state.translations);
    const chapterData = useBooksStore(state => state.chapterData);
    const chapterLoading = useBooksStore(state => state.chapterLoading);
    const chapterError = useBooksStore(state => state.chapterError);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Selection State
    const [selectedVerses, setSelectedVerses] = useState([]);
    const [selectionMode, setSelectionMode] = useState('single'); // 'single' or 'multiple'

    // 1. Data Fetching Hook (actualizado)
    const { 
        bookId, 
        chapterNumber, 
        setChapterNumber,
        numberOfChapters,
        bookName
    } = useChapterData();

    // 2. Text-to-Speech Hook
    const { 
        isSpeaking, 
        stopSpeaking, 
        startSpeaking, 
        pauseSpeaking, 
        currentPlayingIndex,
        availableVoices,
        selectedVoice,
        setSelectedVoice
    } = useChapterReading(chapterData);

    // 3. Tracking & Analytics Hook
    const { 
        handleCompleteChapter, 
        handleUncompleteChapter, 
        isCompleted, 
        isLoading: isTrackingLoading 
    } = useChapterTracking({ 
        bookId, 
        chapterNumber, 
        selectedTranslation,
        chapterData,
        chapterError
    });

    // 4. Font Size Hook
    const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();

    // 5. Scroll to Top Logic
    const [showScrollTop, setShowScrollTop] = useState(false);
    
    // 6. Collapsible Actions (for mobile)
    const [isActionsExpanded, setIsActionsExpanded] = useState(false);
    const [isReadingExpanded, setIsReadingExpanded] = useState(false);

    // Selection Handlers
    function toggleVerseSelection(verseNumber) {
        setSelectedVerses(prev => {
            if (prev.includes(verseNumber)) {
                return prev.filter(v => v !== verseNumber);
            } else {
                return [...prev, verseNumber].sort((a, b) => a - b);
            }
        });
    }

    function selectAllVerses() {
        if (!chapterData?.content) return;
        const allVerseNumbers = chapterData.content
            .filter(item => item.type === 'verse')
            .map(item => item.number);
        setSelectedVerses(allVerseNumbers);
    }

    function clearSelection() {
        setSelectedVerses([]);
    }

    function cancelSelection() {
        setSelectedVerses([]);
        setSelectionMode('single');
    }

    function explainSelectedVerses() {
        if (selectedVerses.length === 0) return;

        const selectedVerseData = selectedVerses.map(verseNum => {
            const verse = chapterData.content.find(item => 
                item.type === 'verse' && item.number === verseNum
            );
            return verse ? getVerseData(verse, chapterData) : null;
        }).filter(Boolean);

        const { showWithAction, showWarning } = useNotificationStore.getState();
        const { currentConversationId, setVerseToExplain, verseToExplain } = useAiStore.getState();

        // Filtrar versículos que ya están en el contexto (incluyendo traducción)
        const newVerses = selectedVerseData.filter(v =>
            !verseToExplain.some(existing =>
                existing.bookName === v.bookName &&
                existing.chapterNumber === v.chapterNumber &&
                existing.verseNumber === v.verseNumber &&
                existing.translationValue === v.translationValue
            )
        );
        const duplicateCount = selectedVerseData.length - newVerses.length;

        // Si todos son duplicados, solo mostrar advertencia
        if (newVerses.length === 0) {
            const desc = duplicateCount === 1 
                ? t('verses_already_in_context_desc_singular')
                : `${t('verses_already_in_context_desc_plural_pre')} ${duplicateCount} ${t('verses_already_in_context_desc_plural_post')}`;

            showWarning(t('verses_already_in_context_title'), {
                description: desc
            });
            return;
        }

        // Agregar solo los nuevos al contexto de IA
        const updatedVerses = [...verseToExplain, ...newVerses];
        setVerseToExplain(updatedVerses);
        
        // Determinar la ruta de navegación e idioma
        const targetRoute = currentConversationId ? `/ai/${currentConversationId}` : '/ai';
        const actionText = currentConversationId ? t('go_to_conversation') : t('go_to_ai');

        // Mensaje dinámico según si hubo duplicados ignorados
        let title = '';
        if (duplicateCount > 0) {
            const suffix = newVerses.length === 1 ? t('verses_added_suffix_singular') : t('verses_added_suffix_plural');
            title = `${t('verses_added_partial_pre')} ${newVerses.length} ${suffix} (${duplicateCount} ${t('verses_added_partial_mid')})`;
        } else {
            const word = newVerses.length === 1 ? t('verse_word_singular') : t('verse_word_plural');
            const suffix = newVerses.length === 1 ? t('verses_added_suffix_singular') : t('verses_added_suffix_plural');
            title = `${t('verses_count_prefix')} ${newVerses.length} ${word} ${suffix}`;
        }
        
        // Mostrar notificación con botón de acción
        showWithAction(
            title,
            actionText,
            () => {
                navigate(targetRoute, { 
                    state: { 
                        selectedVerses: newVerses,
                        selectionInfo: {
                            mode: selectionMode,
                            bookId,
                            chapterNumber,
                            count: newVerses.length
                        }
                    }
                });
                setSelectionMode('single');
            },
            {
                duration: 6000,
            }
        );
        
        // Limpiar selección después de agregar
        clearSelection();
    }

    const translationOptions = getTranslationOptions(translations, language);

    const handleTranslationChange = (newTranslation) => {
        // Solo actualizar URL - el useEffect se encargará de sincronizar el store
        const params = new URLSearchParams(searchParams);
        params.set('translation', newTranslation.value);
        setSearchParams(params, { replace: true });
    };

    useEffect(() => {
        const mainContainer = document.querySelector('main');
        if (!mainContainer) return;

        const handleScroll = () => {
            const isNearBottom = mainContainer.scrollHeight - mainContainer.scrollTop - mainContainer.clientHeight < 400;
            setShowScrollTop(isNearBottom);
        };

        mainContainer.addEventListener('scroll', handleScroll);
        return () => mainContainer.removeEventListener('scroll', handleScroll);
    }, []);

    // Effect para scroll automático al versículo específico (UI Logic)
    const location = useLocation();
    useEffect(() => {
        if (location.hash && !authLoading && chapterData) {
            const timer = setTimeout(() => {
                const hash = location.hash.substring(1);
                // Formato del hash (sin capítulo, ya está en la URL):
                //   Versículo:  bookId-verse-translation       (ej: php-6-spa_bes)
                //   Rango:      bookId-start-end-translation   (ej: php-4-6-spa_bes)
                const parts = hash.split('-');
                
                if (parts.length === 3) {
                    // Versículo individual: bookId-verse-translation
                    const elementId = `${parts[0]}-${parts[1]}-${parts[2]}`;
                    const element = document.getElementById(elementId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        element.style.backgroundColor = 'var(--highlight-color)';
                        element.style.transition = 'var(--transition-normal)';
                        setTimeout(() => { element.style.backgroundColor = ''; }, 3000);
                    }
                } else if (parts.length === 4) {
                    // Rango: bookId-startVerse-endVerse-translation
                    const bookIdFromHash = parts[0];
                    const startVerse = parseInt(parts[1]);
                    const endVerse = parseInt(parts[2]);
                    const trans = parts[3];
                    const elementsToHighlight = [];
                    
                    for (let i = startVerse; i <= endVerse; i++) {
                        const verseId = `${bookIdFromHash}-${i}-${trans}`;
                        const element = document.getElementById(verseId);
                        if (element) elementsToHighlight.push(element);
                    }
                    
                    if (elementsToHighlight.length > 0) {
                        elementsToHighlight[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
                        elementsToHighlight.forEach(el => {
                            el.style.backgroundColor = 'var(--highlight-color)';
                            el.style.transition = 'var(--transition-normal)';
                        });
                        setTimeout(() => {
                            elementsToHighlight.forEach(el => { el.style.backgroundColor = ''; });
                        }, 3000);
                    }
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [location.hash, authLoading, chapterData, selectedTranslation.value]);

    // Handle specific errors
    const isBookUnavailable = chapterError?.includes("BOOK_NOT_AVAILABLE_FOR_TRANSLATION") || 
                              chapterError?.includes("Book not available for this translation");

    useEffect(() => {
        const urlTranslation = searchParams.get('translation');
        
    if (urlTranslation && translations.length > 0) {
        const fullTranslation = translations.find(t => t.id === urlTranslation);
        
        if (fullTranslation && fullTranslation.id !== selectedTranslation.value) {
            setSelectedTranslation({
                value: fullTranslation.id,
                label: fullTranslation.name,
                shortName: fullTranslation.shortName
            });
        }
    }
}, [searchParams, translations, setSelectedTranslation, selectedTranslation.value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isActionsExpanded && !event.target.closest(`.${styles.verse_actions}`)) {
                setIsActionsExpanded(false);
            }
        };

        if (isActionsExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isActionsExpanded]);


    // Para errores generales
    if (chapterError && !isBookUnavailable) {
        return <FetchError message={chapterError} />;
    }

    return (
        <div className={styles.chapter_content}>
            <ChapterHeader
                chapterLoading={chapterLoading}
                chapterData={chapterData}
                chapterError={chapterError}
                bookName={bookName}
                chapterNumber={chapterNumber}
                isCompleted={isCompleted}
                isBookUnavailable={isBookUnavailable}
                selectedTranslation={selectedTranslation}
                translations={translations}
                onTranslationChange={handleTranslationChange}
                t={t}
            />

            <ReadingControls
                selectionMode={selectionMode}
                setSelectionMode={setSelectionMode}
                clearSelection={clearSelection}
                isBookUnavailable={isBookUnavailable}
                isSpeaking={isSpeaking}
                startSpeaking={startSpeaking}
                pauseSpeaking={pauseSpeaking}
                stopSpeaking={stopSpeaking}
                currentPlayingIndex={currentPlayingIndex}
                availableVoices={availableVoices}
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                fontSize={fontSize}
                increaseFontSize={increaseFontSize}
                decreaseFontSize={decreaseFontSize}
                translationOptions={translationOptions}
                selectedTranslation={selectedTranslation}
                onTranslationChange={handleTranslationChange}
                t={t}
            />

            {isBookUnavailable ? (
                <NoResults 
                    text={t('sorry_book_not_found')}
                    subText={t('try_another_translation')}
                    link={true}
                    linkText={t('or_select_another_book')}
                    linkURL={`/books`}
                />
            ) : (
                <>
                    <VerseContent 
                        chapterData={chapterData}
                        bookId={bookId}
                        chapterNumber={chapterNumber}
                        selectedTranslation={selectedTranslation}
                        currentPlayingIndex={currentPlayingIndex}
                        fontSize={fontSize}
                        chapterLoading={chapterLoading || (!chapterData && !chapterError)}
                        chapterError={chapterError}
                        selectedVerses={selectedVerses}
                        selectionMode={selectionMode}
                        toggleVerseSelection={toggleVerseSelection}
                        selectAllVerses={selectAllVerses}
                        clearSelection={clearSelection}
                        explainSelectedVerses={explainSelectedVerses}
                        cancelSelection={cancelSelection}
                        t={t}
                    />
                    
                    <ChapterProgress
                        isCompleted={isCompleted}
                        isTrackingLoading={isTrackingLoading}
                        user={user}
                        authLoading={authLoading}
                        onCompleteChapter={handleCompleteChapter}
                        onUncompleteChapter={handleUncompleteChapter}
                        t={t}
                    />
                    
                    <ChapterNavigation
                        chapterNumber={chapterNumber}
                        setChapterNumber={setChapterNumber}
                        numberOfChapters={numberOfChapters || chapterData?.book?.numberOfChapters}
                    />

                    <ScrollToTopButton showScrollTop={showScrollTop} />
                </>
            )}
        </div>
    );
}

export default ChapterContent;