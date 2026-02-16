import { X, Trash2, BookOpen, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import ConfirmationModal from "../ui/ConfirmationModal";
import { useTranslation } from "../../hooks/useTranslation";
import { useState, useRef, useEffect } from "react";
import styles from './ContextModal.module.css';

function ContextModal({ isOpen, onClose, verses, onRemoveVerse, onRemoveBook, onClearAll, getVerseRange }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(null);
    const tabsContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    
    // Estado para modal de confirmación
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState(null);
    const [confirmationData, setConfirmationData] = useState(null);

    // Agrupar versículos por libro y capítulo
    const groupVersesByBook = () => {
        const grouped = {};
        verses.forEach(verse => {
            const bookKey = verse.bookName;
            if (!grouped[bookKey]) {
                grouped[bookKey] = {};
            }
            const chapterKey = verse.chapterNumber;
            if (!grouped[bookKey][chapterKey]) {
                grouped[bookKey][chapterKey] = [];
            }
            grouped[bookKey][chapterKey].push(verse);
        });
        return grouped;
    };

    const groupedVerses = groupVersesByBook();
    const bookNames = Object.keys(groupedVerses);

    // Funciones para manejar scroll de tabs
    const checkOverflow = () => {
        const container = tabsContainerRef.current;
        if (!container) return;

        const hasOverflow = container.scrollWidth > container.clientWidth;
        const canScrollLeft = container.scrollLeft > 5; // Pequeño margen para detectar que no está al inicio
        const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 5; // Pequeño margen para detectar que no está al final
        
        console.log('🔍 Debug scroll:', {
            scrollWidth: container.scrollWidth,
            clientWidth: container.clientWidth,
            scrollLeft: container.scrollLeft,
            hasOverflow,
            canScrollLeft,
            canScrollRight
        });
        
        setShowLeftArrow(hasOverflow && canScrollLeft);
        setShowRightArrow(hasOverflow && canScrollRight);
    };

    const scrollTabsLeft = () => {
        const container = tabsContainerRef.current;
        if (container) {
            container.style.scrollBehavior = 'smooth';
            const newScrollLeft = Math.max(0, container.scrollLeft - 200);
            container.scrollLeft = newScrollLeft;
            
            // Forzar actualización después del scroll
            setTimeout(() => {
                checkOverflow();
            }, 100);
        }
    };

    const scrollTabsRight = () => {
        const container = tabsContainerRef.current;
        if (container) {
            container.style.scrollBehavior = 'smooth';
            const maxScroll = container.scrollWidth - container.clientWidth;
            const newScrollLeft = Math.min(maxScroll, container.scrollLeft + 200);
            container.scrollLeft = newScrollLeft;
            
            // Forzar actualización después del scroll
            setTimeout(() => {
                checkOverflow();
            }, 100);
        }
    };

    // Efecto para verificar overflow cuando cambia el contenido
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                checkOverflow();
                
                // Forzar un pequeño scroll inicial para activar el sistema
                const container = tabsContainerRef.current;
                if (container && container.scrollWidth > container.clientWidth) {
                    container.scrollLeft = 1;
                    setTimeout(() => {
                        container.scrollLeft = 0;
                        checkOverflow();
                    }, 50);
                }
            }, 200);
        }
    }, [isOpen, verses]);

    // Efecto para verificar overflow en scroll
    useEffect(() => {
        const container = tabsContainerRef.current;
        if (!container) return;

        const handleScroll = () => checkOverflow();
        container.addEventListener('scroll', handleScroll);
        
        return () => container.removeEventListener('scroll', handleScroll);
    }, [verses]);
    
    // Funciones para manejar confirmaciones
    const handleConfirmAction = (action, data, title, message) => {
        setConfirmationAction(() => action);
        setConfirmationData({ title, message, data });
        setShowConfirmation(true);
    };

    const executeConfirmedAction = () => {
        if (confirmationAction && confirmationData) {
            confirmationAction(confirmationData.data);
        }
        setShowConfirmation(false);
        setConfirmationAction(null);
        setConfirmationData(null);
    };

    const handleRemoveBookClick = (bookName) => {
        handleConfirmAction(
            onRemoveBook,
            bookName,
            t('ai_remove_book') || 'Eliminar libro',
            `${t('ai_remove_book_confirm') || '¿Estás seguro de que quieres eliminar todos los versículos de'} ${bookName}?`
        );
    };

    const handleRemoveVerseClick = (verse) => {
        handleConfirmAction(
            onRemoveVerse,
            verse,
            t('ai_remove_verse') || 'Eliminar versículo',
            `${t('ai_remove_verse_confirm') || '¿Estás seguro de que quieres eliminar'} ${verse.bookName} ${verse.chapterNumber}:${verse.verseNumber}?`
        );
    };

    const handleClearAllClick = () => {
        handleConfirmAction(
            onClearAll,
            null,
            t('ai_clear_all') || 'Limpiar todo',
            t('ai_clear_all_confirm') || '¿Estás seguro de que quieres eliminar todos los versículos del contexto?'
        );
    };
    
    // Auto-seleccionar la primera tab si no hay ninguna activa o si la activa ya no existe
    if ((!activeTab || !groupedVerses[activeTab]) && bookNames.length > 0) {
        setActiveTab(bookNames[0]);
    } else if (bookNames.length === 0 && activeTab) {
        setActiveTab(null);
    }

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {t('ai_selected_verses') || 'Versículos Seleccionados'}
                    </h2>
                    <div className={styles.headerActions}>
                        {verses && verses.length > 0 && (
                            <button 
                                className={styles.clearAllButton}
                                onClick={handleClearAllClick}
                                title={t('ai_clear')}
                            >
                                <Icon icon={<Trash2 />} size="small" />
                            </button>
                        )}
                        <button className={styles.closeButton} onClick={onClose} title={t('close_button')}>
                            <Icon icon={<X />} size="small" />
                        </button>
                    </div>
                </div>

                <div className={styles.content}>
                    {verses && verses.length > 0 ? (
                        <div className={styles.tabsContainer}>
                            {/* Tabs Navigation */}
                            <div className={styles.tabsNavigationContainer}>
                                {showLeftArrow && (
                                    <button 
                                        className={styles.tabScrollButton}
                                        onClick={scrollTabsLeft}
                                    >
                                        <Icon icon={<ChevronLeft />} size="tiny" />
                                    </button>
                                )}
                                
                                <div className={styles.tabsNavigation} ref={tabsContainerRef}>
                                    {bookNames.map(bookName => (
                                        <button
                                            key={bookName}
                                            className={`${styles.tabButton} ${activeTab === bookName ? styles.tabActive : ''}`}
                                            onClick={() => setActiveTab(bookName)}
                                        >
                                            <div className={styles.tabButtonContent}>
                                                {bookName}
                                                <div
                                                    className={styles.tabCloseButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // ✅ Cambiar tab ANTES de eliminar
                                                        if (activeTab === bookName) {
                                                            const remainingBooks = bookNames.filter(name => name !== bookName);
                                                            setActiveTab(remainingBooks.length > 0 ? remainingBooks[0] : null);
                                                        }
                                                        handleRemoveBookClick(bookName);
                                                    }}
                                                    title={t('ai_remove_book') + ' ' + bookName}
                                                >
                                                    <Icon icon={<X />} size="tiny" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {showRightArrow && (
                                    <button 
                                        className={styles.tabScrollButton}
                                        onClick={scrollTabsRight}
                                    >
                                        <Icon icon={<ChevronRight />} size="tiny" />
                                    </button>
                                )}
                            </div>

                            {/* Tab Content */}
                            {activeTab && groupedVerses[activeTab] && (
                                <div className={styles.tabContent}>
                                    <div className={styles.bookHeader}>
                                        <div className={styles.bookInfo}>
                                            <Icon icon={<BookOpen />} size="small" />
                                            <h3 className={styles.bookName}>{activeTab}</h3>
                                             <span className={styles.verseCount}>
                                                {getVerseRange(
                                                    Object.values(groupedVerses[activeTab]).flat(),
                                                    false
                                                )}
                                            </span> 
                                            <span className={styles.verseCount}>
                                                {Object.values(groupedVerses[activeTab]).reduce((total, chapter) => 
                                                    total + chapter.length, 0
                                                )} {t('ai_verses')}
                                            </span> 
                                        </div>
                                    </div>
                                    
                                    {Object.keys(groupedVerses[activeTab])
                                        .sort((a, b) => parseInt(a) - parseInt(b))
                                        .map(chapterNumber => (
                                            <div key={chapterNumber} className={styles.chapterSection}>
                                                <h4 className={styles.chapterTitle}>
                                                    {t('chapter') || 'Capítulo'} {chapterNumber}
                                                </h4>
                                                <div className={styles.versesList}>
                                                    {groupedVerses[activeTab][chapterNumber]
                                                        .sort((a, b) => a.verseNumber - b.verseNumber)
                                                        .map(verse => {
                                                            const BookId = (verse.bookId).toLowerCase()
                                                            return (
                                                            
                                                                <div key={`${verse.chapterNumber}-${verse.verseNumber}`} className={styles.verseItem}>
                                                                    <div className={styles.verseContent}>
                                                                        <span className={styles.verseNumber}>
                                                                            {verse.verseNumber}
                                                                        </span>
                                                                        <span className={styles.verseText}>
                                                                            {verse.content}
                                                                        </span>
                                                                    </div>
                                                                    <Link
                                                                        className={styles.verseLink}
                                                                        title={t('ai_go_to_verse') + ' ' + `${verse.bookName}` + ' ' + `${verse.chapterNumber}:${verse.verseNumber}`}
                                                                        to={`/books/${BookId}/${verse.chapterNumber}?translation=${verse.translationValue}#${BookId}-${verse.chapterNumber}-${verse.verseNumber}-${verse.translationValue}`}
                                                                    >
                                                                        <Icon icon={<Eye />} size="tiny"  />
                                                                    </Link>
                                                                    <button 
                                                                        className={styles.removeVerseButton}
                                                                        onClick={() => handleRemoveVerseClick(verse)}
                                                                        title={t('ai_remove_verse') + ' ' + `${activeTab} ${chapterNumber}:${verse.verseNumber}`}
                                                                    >
                                                                        <Icon icon={<X />} size="tiny" />
                                                                    </button>
                                                                </div>
                                                            )
                                                        })}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <Icon icon={<BookOpen />} size="large" />
                            <p className={styles.noVerses}>
                                {t('ai_no_verses_selected') || 'No hay versículos seleccionados'}
                            </p>
                            <p className={styles.helperText}>
                                {t('ai_placeholder_no_verses') || 'Selecciona versículos desde la página de la Biblia para agregarlos al contexto'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={executeConfirmedAction}
                title={confirmationData?.title}
                message={confirmationData?.message}
                confirmText={t('confirm')}
                cancelText={t('cancel')}
                variant="danger"
            />
        </>
    );
}

export default ContextModal;
