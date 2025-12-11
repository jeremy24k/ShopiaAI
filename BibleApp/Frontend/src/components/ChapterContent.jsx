import styles from "../styles/ChapterContent.module.css";
import { useLocation, Link, useSearchParams } from "react-router-dom";
import {useEffect, useState } from "react";

import Loading from "../components/ui/Loading";
import ChapterNavigation from "./ChapterNavigation";
import FetchError from "./ui/FetchError";
import { SearchX, CirclePlay, CirclePause, AArrowUp, AArrowDown, CircleX, CircleCheckBig, Trophy, Check, AudioLines, ArrowUp, User } from "lucide-react";
import IconButton from "../components/ui/IconButton";
import VerseContent from "../components/Read/VerseContent";
import CustomSelect from "../components/ui/CustomSelect";
import Icon from "../components/ui/Icon";
import getTranslationOptions from "../utils/TranslationOptions";
import scrollToTop from "../utils/ScrollToTop";
import { useBooksStore } from "../store/BooksStore";

// Custom Hooks
import { useChapterData } from "./Hooks/useChapterData";
import { useChapterReading } from "./Hooks/useChapterReading";
import { useChapterTracking } from "./Hooks/useChapterTracking";
import { useFontSize } from "./Hooks/useFontSize";
import { useAuthStore } from "../store/AuthStore";

function ChapterContent() {
    const { user, loading } = useAuthStore();
    const selectedTranslation = useBooksStore(state => state.selectedTranslation);
    const translations = useBooksStore(state => state.translations);
    const setSelectedTranslation = useBooksStore(state => state.setSelectedTranslation);
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Data Fetching Hook
    const { 
        error, 
        chapterData, 
        bookId, 
        chapterNumber, 
        setChapterNumber
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
    });

    // 4. Font Size Hook
    const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();

    // 5. Scroll to Top Logic
    const [showScrollTop, setShowScrollTop] = useState(false);

    const translationOptions = getTranslationOptions(translations);

    const handleTranslationChange = (newTranslation) => {
        setSelectedTranslation(newTranslation);

        // 1) Actualizar la query del capítulo actual
        const params = new URLSearchParams(searchParams);
        if (newTranslation && newTranslation.value) {
            params.set("translation", newTranslation.value);
        } else {
            params.delete("translation");
        }
        setSearchParams(params, { replace: true });

        // 2) Actualizar lastBooksFilters en localStorage
        const saved = localStorage.getItem('lastBooksFilters') || '';
        const savedParams = new URLSearchParams(saved);

        if (newTranslation && newTranslation.value) {
            savedParams.set('translation', newTranslation.value);
        } else {
            savedParams.delete('translation');
        }

        localStorage.setItem('lastBooksFilters', savedParams.toString());
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
        if (location.hash && !loading && chapterData) {
            const timer = setTimeout(() => {
                const element = document.getElementById(location.hash.substring(1));
                if (element) {
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
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
    }, [location.hash, loading, chapterData]);

    if (loading) return <Loading />;
    
    // Para errores generales, seguimos mostrando el componente de error
    if (error && error !== "BOOK_NOT_AVAILABLE_FOR_TRANSLATION") {
        return <FetchError message={error} />;
    }

    // Si no hay datos y no es el caso especial de libro no disponible, mostramos loading
    if (!chapterData || !chapterData.data) {
        if (error === "BOOK_NOT_AVAILABLE_FOR_TRANSLATION") {
            // Permitimos que el render continúe para mostrar un mensaje específico en la zona de versículos
        } else {
            return <Loading />;
        }
    }

    return (
        <div className={styles.chapter_content}>
            <header>
                <div className={styles.ctn_tlt}>
                    <div className={styles.header_title_row}>
                        <h1 className={styles.book_name}>{chapterData.bookName ? chapterData.bookName.toLowerCase() : 'Not Found'} {chapterData.bookName ? chapterNumber : ''}</h1>
                        {isCompleted && (
                            <span className={styles.completed_badge}>
                                Completed
                                <Icon icon={<Check />} size="tiny" color="white" />
                            </span>
                        )}
                    </div>
                    <h2 className={styles.translation_name}>{selectedTranslation.label}</h2>
                </div>

                <div className={styles.ctn_translation_select}>
                    <p>Select other translation</p>
                    <CustomSelect
                        options={translationOptions}
                        value={selectedTranslation}
                        onChange={handleTranslationChange}
                        placeholder="Select a translation"
                        generalPadding="4px 8px"
                    />
                </div>
            </header>

            {error === "BOOK_NOT_AVAILABLE_FOR_TRANSLATION" ? (
                <div className={styles.unavailable_message}>
                    <div className={styles.unavailable_icon}>
                        <Icon 
                            icon={<SearchX />}  
                            size="large"
                        /> 
                    </div>
                    <p>
                        Este libro no está disponible en la traducción seleccionada
                    </p>
                    <p>
                        Prueba con otra traducción
                    </p>    
                    <Link to={`/books?translation=${selectedTranslation.value}`}>o selecciona otro libro</Link>
                </div>
            ) : (
                <>
                    <div className={styles.verse_actions}>
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

                    <VerseContent 
                        chapterData={chapterData}
                        bookId={bookId}
                        chapterNumber={chapterNumber}
                        selectedTranslation={selectedTranslation}
                        currentPlayingIndex={currentPlayingIndex}
                        fontSize={fontSize}
                    />
                    
                    <div className={styles.ctn_progress}>
                        {isCompleted ? (
                            <>
                                <Icon icon={<CircleCheckBig />} size="large" color="green" />
                                <div className={styles.ctn_progress_text}>
                                    <p>Chapter Completed!</p>
                                    <p>You have successfully read this chapter.</p>
                                </div>
                                <button onClick={handleUncompleteChapter} disabled={isTrackingLoading} style={{ backgroundColor: 'var(--success-color)', color: 'white' }}>
                                    {isTrackingLoading ? 'Updating...' : 'Mark as Unread'}
                                </button>
                            </>
                        ) : (
                            <>
                                <Icon icon={<Trophy />} size="large" color="primary" />
                                {user ? (
                                    <>
                                        <div className={styles.ctn_progress_text}>
                                            <p>Finished Reading?</p>
                                            <p>Track your progress by marking this chapter as complete.</p>
                                        </div>
                                        <button onClick={handleCompleteChapter} disabled={isTrackingLoading}>
                                            <Icon icon={<Check />} size="small" color="white" />
                                            {isTrackingLoading ? 'Saving...' : 'Mark as Complete'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className={styles.ctn_progress_text}>
                                            <p>Log in or register to track your progress</p>
                                            <p>Log in or register to mark this chapter as complete.</p>
                                        </div>
                                        <Link to="/login" disabled={loading}>
                                            <Icon icon={<User />} size="small" color="white" />
                                            {loading ? 'Logging in...' : 'Log In'}
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <ChapterNavigation
                        chapterNumber={chapterNumber}
                        setChapterNumber={setChapterNumber}
                        chapterData={chapterData}
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