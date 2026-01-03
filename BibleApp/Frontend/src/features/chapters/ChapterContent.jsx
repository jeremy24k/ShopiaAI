import styles from "../../styles/ChapterContent.module.css";
import { useLocation, Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import ChapterNavigation from "../chapters/ChapterNavigation";
import FetchError from "../../components/ui/FetchError";
import VerseContent from "../books/VerseContent";
import NoResults from "../../components/ui/NoResults"
import { useBooksStore } from "../../store/BooksStore";
import getTranslationOptions from "../../utils/TranslationOptions";
import { getVerseData } from "../../utils/getVerseData";

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
    const { t } = useTranslation();
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

    function explainSelectedVerses() {
        if (selectedVerses.length === 0) return;

        const selectedVerseData = selectedVerses.map(verseNum => {
            const verse = chapterData.content.find(item => 
                item.type === 'verse' && item.number === verseNum
            );
            return verse ? getVerseData(verse, chapterData) : null;
        }).filter(Boolean);

        // Navegar a IA con todos los versículos seleccionados
        navigate(`/ai`, { 
            state: { 
                selectedVerses: selectedVerseData,
                selectionInfo: {
                    mode: selectionMode,
                    bookId,
                    chapterNumber,
                    count: selectedVerses.length
                }
            }
        });
    }

    const translationOptions = getTranslationOptions(translations);

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
                const element = document.getElementById(location.hash.substring(1));
                if (element) {
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                    element.style.backgroundColor = '#ffeb3b';
                    element.style.transition = 'background-color 0.3s ease';
                    setTimeout(() => {
                        element.style.backgroundColor = '';
                    }, 2000);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [location.hash, authLoading, chapterData]);

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
                isActionsExpanded={isActionsExpanded}
                setIsActionsExpanded={setIsActionsExpanded}
                selectionMode={selectionMode}
                setSelectionMode={setSelectionMode}
                clearSelection={clearSelection}
                isBookUnavailable={isBookUnavailable}
                // Audio controls
                isSpeaking={isSpeaking}
                startSpeaking={startSpeaking}
                pauseSpeaking={pauseSpeaking}
                stopSpeaking={stopSpeaking}
                currentPlayingIndex={currentPlayingIndex}
                availableVoices={availableVoices}
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                // Font controls
                fontSize={fontSize}
                increaseFontSize={increaseFontSize}
                decreaseFontSize={decreaseFontSize}
                // Translation
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

                    {/* Pasar los datos correctos a VerseContent */}
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
                    
                    {/* Pasar numberOfChapters a ChapterNavigation */}
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