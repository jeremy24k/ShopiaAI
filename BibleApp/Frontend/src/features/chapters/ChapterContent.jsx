import styles from "../../styles/ChapterContent.module.css";
import { useLocation, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Loading from "../../components/ui/Loading";
import ChapterNavigation from "../chapters/ChapterNavigation";
import FetchError from "../../components/ui/FetchError";
import { CirclePlay, CirclePause, AArrowUp, AArrowDown, CircleX, CircleCheckBig, Trophy, Check, AudioLines, ArrowUp, User, ChevronDown, ChevronUp, Settings } from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import VerseContent from "../books/VerseContent";
import CustomSelect from "../../components/ui/CustomSelect";
import Icon from "../../components/ui/Icon";
import NoResults from "../../components/ui/NoResults"
import getTranslationOptions from "../../utils/TranslationOptions";
import scrollToTop from "../../utils/ScrollToTop";
import { useBooksStore } from "../../store/BooksStore";
import SkeletonLoader from "../../components/ui/SkeletonLoader"

// Custom Hooks
import { useChapterData } from "../../hooks/useChapterData";
import { useChapterReading } from "../../hooks/useChapterReading";
import { useChapterTracking } from "../../hooks/useChapterTracking";
import { useFontSize } from "../../hooks/useFontSize";
import { useAuthStore } from "../../store/AuthStore";
import { useTranslation } from "../../hooks/useTranslation";

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

    useEffect(() => {
        console.log(selectedTranslation);
    }, [selectedTranslation])

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


    if (authLoading) return <Loading />;
    
    // Para errores generales
    if (chapterError && !isBookUnavailable) {
        return <FetchError message={chapterError} />;
    }

    return (
        <div className={styles.chapter_content}>
            <header>
                <div className={styles.ctn_tlt}>
                    <div className={styles.header_title_row}>
                        <h1 className={styles.book_name}>
                            {chapterLoading ? (
                                <>
                                    <SkeletonLoader
                                        variant="rectangular"
                                        width="150px"
                                        height="30px"
                                    />
                                </>
                            ) : chapterError ? (
                                t('book_not_found')
                            ) : (
                                <>
                                    {bookName ? 
                                        bookName.toLowerCase() : 

                                        chapterData?.book?.name?.toLowerCase() || 

                                        <SkeletonLoader
                                            variant="rectangular"
                                            width="150px"
                                            height="32px"
                                        />
                                    }
                                    {bookName || chapterData?.book?.name ? ` ${chapterNumber}` : ''}
                                </>
                            )}
                        </h1>

                        {isTrackingLoading ? (
                            <SkeletonLoader
                                variant="rectangular"
                                width="120px"
                                height="26px"
                            />
                        ) : (isCompleted && !isBookUnavailable) ? (
                            <div className={styles.completed_badge}>
                                <span>
                                    {t('completed')}
                                </span>
                                <Icon icon={<Check />} size="tiny" color="white" />
                            </div>
                        ) : null}
                    </div>
                    <h2 className={styles.translation_name}>{selectedTranslation.label}</h2>
                </div>

                <div className={styles.ctn_translation_select}>
                    <p>{t('select_other_translation')}</p>
                    <CustomSelect
                        options={translationOptions}
                        value={selectedTranslation}
                        onChange={handleTranslationChange}
                        placeholder="Select a translation"
                        generalPadding="4px 8px"
                        fixedMenuWidth={true}
                    />
                </div>
            </header>

            {/* Dropdown menu - always visible for translation switching */}
            <div className={styles.verse_actions}>
                <button 
                    className={styles.actions_menu_btn}
                    onClick={() => setIsActionsExpanded(!isActionsExpanded)}
                    aria-label={t('reading_options')}
                >
                    <Icon icon={<Settings />} size="small" color="primary" />
                    <span>{t('reading_options')}</span>
                    <Icon 
                        icon={isActionsExpanded ? <ChevronUp /> : <ChevronDown />} 
                        size="tiny" 
                        color="primary" 
                    />
                </button>

                {isActionsExpanded && (
                    <div className={styles.actions_dropdown_menu}>
                        {/* Translation Selector - always visible */}
                        <div className={styles.menu_section}>
                            <p className={styles.menu_section_title}>{t('select_other_translation')}</p>
                            <CustomSelect
                                options={translationOptions}
                                value={selectedTranslation}
                                onChange={handleTranslationChange}
                                placeholder="Select a translation"
                                generalPadding="4px 8px"
                                fixedMenuWidth={true}
                            />
                        </div>

                        {/* Audio and Font controls - only when book is available */}
                        {!isBookUnavailable && (
                            <>
                                {/* Audio Controls */}
                                <div className={styles.menu_section}>
                                    <p className={styles.menu_section_title}>{t('audio_controls')}</p>
                                    <div className={styles.voice_reader}>
                                        <div className={styles.voice_reader_actions}>
                                            {currentPlayingIndex !== null ? (
                                                <>
                                                    {isSpeaking ? (
                                                        <IconButton 
                                                            onClick={pauseSpeaking}
                                                            icon={CirclePause}
                                                            variant="ghost"
                                                            size="medium"
                                                            iconSize="medium"
                                                        />
                                                    ) : (
                                                        <IconButton 
                                                            onClick={startSpeaking}
                                                            icon={CirclePlay}
                                                            variant="ghost"
                                                            size="medium"
                                                            iconSize="medium"
                                                        />
                                                    )}

                                                    <IconButton 
                                                        onClick={stopSpeaking}
                                                        icon={CircleX}
                                                        variant="ghost"
                                                        size="medium"
                                                        iconSize="medium"
                                                    />
                                                </>
                                            ) : (
                                                <IconButton 
                                                    onClick={startSpeaking}
                                                    icon={CirclePlay}
                                                    variant="ghost"
                                                    size="medium"
                                                    iconSize="medium"
                                                />
                                            )}
                                        </div>

                                        {availableVoices.length > 0 && (
                                            <CustomSelect 
                                                options={availableVoices}
                                                value={selectedVoice}
                                                onChange={setSelectedVoice}
                                                placeholder="Voz"
                                                aria-label="Seleccionar voz de lectura"
                                                generalPadding="4px 8px"
                                                fixedMenuWidth={true}
                                                width="210px"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Font Size Controls */}
                                <div className={styles.menu_section}>
                                    <p className={styles.menu_section_title}>{t('font_size')}</p>
                                    <div className={styles.font_size_actions}>
                                        <IconButton 
                                            onClick={decreaseFontSize}
                                            icon={AArrowDown}
                                            variant="ghost"
                                            size="medium"
                                            iconSize="medium"
                                            disabled={fontSize <= 12}
                                        />
                                        
                                        <div className={styles.font_size_value}>
                                            <p>{fontSize}</p>
                                        </div>

                                        <IconButton 
                                            onClick={increaseFontSize}
                                            icon={AArrowUp}
                                            variant="ghost"
                                            size="medium"
                                            iconSize="medium"
                                            disabled={fontSize >= 48}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Desktop view - keep original layout, only when book is available */}
                {!isBookUnavailable && (
                    <div className={styles.desktop_controls}>
                        <div className={styles.voice_reader}>
                            <div className={styles.voice_reader_actions}>
                                {currentPlayingIndex !== null ? (
                                    <>
                                        {isSpeaking ? (
                                            <IconButton 
                                                onClick={pauseSpeaking}
                                                icon={CirclePause}
                                                variant="ghost"
                                                size="medium"
                                                iconSize="medium"
                                            />
                                        ) : (
                                            <IconButton 
                                                onClick={startSpeaking}
                                                icon={CirclePlay}
                                                variant="ghost"
                                                size="medium"
                                                iconSize="medium"
                                            />
                                        )}

                                        <IconButton 
                                            onClick={stopSpeaking}
                                            icon={CircleX}
                                            variant="ghost"
                                            size="medium"
                                            iconSize="medium"
                                        />
                                    </>
                                ) : (
                                    <IconButton 
                                        onClick={startSpeaking}
                                        icon={CirclePlay}
                                        variant="ghost"
                                        size="medium"
                                        iconSize="medium"
                                    />
                                )}
                            </div>

                            {availableVoices.length > 0 && (
                                <CustomSelect 
                                    options={availableVoices}
                                    value={selectedVoice}
                                    onChange={setSelectedVoice}
                                    placeholder="Voz"
                                    aria-label="Seleccionar voz de lectura"
                                    generalPadding="4px 8px"
                                    width="180px"
                                    prefixIcon={<AudioLines />}
                                    variant="ghost"
                                />
                            )}
                        </div>

                        <div className={styles.font_size_actions}>
                            <div className={styles.font_size_up}>
                                <IconButton 
                                    onClick={increaseFontSize}
                                    icon={AArrowUp}
                                    variant="ghost"
                                    size="medium"
                                    iconSize="medium"
                                    disabled={fontSize >= 48}
                                />
                            </div>

                            <div className={styles.font_size_value}>
                                <p>{fontSize}</p>
                            </div>

                            <div className={styles.font_size_down}>
                                <IconButton 
                                    onClick={decreaseFontSize}
                                    icon={AArrowDown}
                                    variant="ghost"
                                    size="medium"
                                    iconSize="medium"
                                    disabled={fontSize <= 12}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
                    />
                    
                    <div className={styles.ctn_progress}>
                        {isCompleted ? (
                            <>
                                <Icon icon={<CircleCheckBig />} size="large" color="green" />
                                <div className={styles.ctn_progress_text}>
                                    <p>{t('chapter_completed')}</p>
                                    <p>{t('chapter_completed_success')}</p>
                                </div>
                                <button onClick={handleUncompleteChapter} disabled={isTrackingLoading} style={{ backgroundColor: 'var(--success-color)', color: 'white' }}>
                                    {isTrackingLoading ? t('updating') : t('mark_as_unread')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Icon icon={<Trophy />} size="large" color="primary" />
                                {user ? (
                                    <>
                                        <div className={styles.ctn_progress_text}>
                                            <p>{t('finished_reading')}</p>
                                            <p>{t('track_progress')}</p>
                                        </div>
                                        <button onClick={handleCompleteChapter} disabled={isTrackingLoading}>
                                            <Icon icon={<Check />} size="small" color="white" />
                                            {isTrackingLoading ? t('saving') : t('mark_as_complete')}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className={styles.ctn_progress_text}>
                                            <p>{t('login_register_progress')}</p>
                                            <p>{t('login_register_complete')}</p>
                                        </div>
                                        <Link to="/login" disabled={authLoading}>
                                            <Icon icon={<User />} size="small" color="white" />
                                            {authLoading && t('logging_in') || t('login')}
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* Pasar numberOfChapters a ChapterNavigation */}
                    <ChapterNavigation
                        chapterNumber={chapterNumber}
                        setChapterNumber={setChapterNumber}
                        numberOfChapters={numberOfChapters || chapterData?.book?.numberOfChapters}
                    />

                    <button 
                        className={`${styles.scroll_top_btn} ${showScrollTop ? styles.visible : ''}`} 
                        onClick={scrollToTop}
                        aria-label="Scroll to top"
                    >
                        <Icon icon={<ArrowUp />} size="small" color="white" />
                    </button>
                </>
            )}
        </div>
    );
}

export default ChapterContent;