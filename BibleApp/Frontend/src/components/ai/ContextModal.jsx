import { X, Trash2, BookOpen, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import MobileSheet from "../ui/MobileSheet";
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
    
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState(null);
    const [confirmationData, setConfirmationData] = useState(null);

    // Group verses by book, translation, and chapter
    const groupVersesByBook = () => {
        const grouped = {};
        verses.forEach(verse => {
            const trLabel = verse.shortName || verse.translation || verse.translationValue;
            const bookKey = `${verse.bookName} (${trLabel})`;
            if (!grouped[bookKey]) grouped[bookKey] = {};
            const chapterKey = verse.chapterNumber;
            if (!grouped[bookKey][chapterKey]) grouped[bookKey][chapterKey] = [];
            grouped[bookKey][chapterKey].push(verse);
        });
        return grouped;
    };

    const groupedVerses = groupVersesByBook();
    const tabKeys = Object.keys(groupedVerses);

    // Tab scroll helpers
    const checkOverflow = () => {
        const container = tabsContainerRef.current;
        if (!container) return;
        const hasOverflow = container.scrollWidth > container.clientWidth;
        const canScrollLeft = container.scrollLeft > 5;
        const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 5;
        setShowLeftArrow(hasOverflow && canScrollLeft);
        setShowRightArrow(hasOverflow && canScrollRight);
    };

    const scrollTabsLeft = () => {
        const container = tabsContainerRef.current;
        if (container) {
            container.style.scrollBehavior = 'smooth';
            container.scrollLeft = Math.max(0, container.scrollLeft - 200);
            setTimeout(checkOverflow, 100);
        }
    };

    const scrollTabsRight = () => {
        const container = tabsContainerRef.current;
        if (container) {
            container.style.scrollBehavior = 'smooth';
            container.scrollLeft = Math.min(
                container.scrollWidth - container.clientWidth,
                container.scrollLeft + 200
            );
            setTimeout(checkOverflow, 100);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                checkOverflow();
                const container = tabsContainerRef.current;
                if (container && container.scrollWidth > container.clientWidth) {
                    container.scrollLeft = 1;
                    setTimeout(() => { container.scrollLeft = 0; checkOverflow(); }, 50);
                }
            }, 200);
        }
    }, [isOpen, verses]);

    useEffect(() => {
        const container = tabsContainerRef.current;
        if (!container) return;
        container.addEventListener('scroll', checkOverflow);
        return () => container.removeEventListener('scroll', checkOverflow);
    }, [verses]);

    // Confirmation dialog helpers
    const handleConfirmAction = (action, data, title, message) => {
        setConfirmationAction(() => action);
        setConfirmationData({ title, message, data });
        setShowConfirmation(true);
    };

    const executeConfirmedAction = () => {
        if (confirmationAction && confirmationData) confirmationAction(confirmationData.data);
        setShowConfirmation(false);
        setConfirmationAction(null);
        setConfirmationData(null);
    };

    const handleRemoveBookClick = (tabKey) => {
        const firstChapter = Object.keys(groupedVerses[tabKey])[0];
        const firstVerse = groupedVerses[tabKey][firstChapter][0];
        
        handleConfirmAction(
            onRemoveBook, { bookName: firstVerse.bookName, translationValue: firstVerse.translationValue || firstVerse.translation },
            t('ai_remove_book') || 'Eliminar libro',
            `${t('ai_remove_book_confirm') || '¿Estás seguro de que quieres eliminar todos los versículos de'} ${tabKey}?`
        );
    };

    const handleRemoveVerseClick = (verse) => {
        handleConfirmAction(
            onRemoveVerse, verse,
            t('ai_remove_verse') || 'Eliminar versículo',
            `${t('ai_remove_verse_confirm') || '¿Estás seguro de que quieres eliminar'} ${verse.bookName} ${verse.chapterNumber}:${verse.verseNumber}?`
        );
    };

    const handleClearAllClick = () => {
        handleConfirmAction(
            onClearAll, null,
            t('ai_clear_all') || 'Limpiar todo',
            t('ai_clear_all_confirm') || '¿Estás seguro de que quieres eliminar todos los versículos del contexto?'
        );
    };

    // Auto-select first tab
    if ((!activeTab || !groupedVerses[activeTab]) && tabKeys.length > 0) {
        setActiveTab(tabKeys[0]);
    } else if (tabKeys.length === 0 && activeTab) {
        setActiveTab(null);
    }

    if (!isOpen) return null;

    // ── Shared header (actions bar) ──────────────────────────────────
    const HeaderBar = () => (
        <div className={styles.header}>
            <h2 className={styles.title}>
                {t('ai_selected_verses') || 'Versículos Seleccionados'}
            </h2>
            <div className={styles.headerActions}>
                {verses && verses.length > 0 && (
                    <button className={styles.clearAllButton} onClick={handleClearAllClick} title={t('ai_clear')}>
                        <Icon icon={<Trash2 />} size="small" />
                    </button>
                )}
                <button className={styles.closeButton} onClick={onClose} title={t('close_button')}>
                    <Icon icon={<X />} size="small" />
                </button>
            </div>
        </div>
    );

    // ── Shared verse content ─────────────────────────────────────────
    const VerseContent = () => (
        <div className={styles.content}>
            {verses && verses.length > 0 ? (
                <div className={styles.tabsContainer}>
                    {/* Tabs navigation */}
                    <div className={styles.tabsNavigationContainer}>
                        {showLeftArrow && (
                            <button className={styles.tabScrollButton} onClick={scrollTabsLeft}>
                                <Icon icon={<ChevronLeft />} size="tiny" color="black" />
                            </button>
                        )}
                        <div className={styles.tabsNavigation} ref={tabsContainerRef}>
                            {tabKeys.map(tabKey => (
                                <button
                                    key={tabKey}
                                    className={`${styles.tabButton} ${activeTab === tabKey ? styles.tabActive : ''}`}
                                    onClick={() => setActiveTab(tabKey)}
                                >
                                    <div className={styles.tabButtonContent}>
                                        {tabKey}
                                        <div
                                            className={styles.tabCloseButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (activeTab === tabKey) {
                                                    const remaining = tabKeys.filter(n => n !== tabKey);
                                                    setActiveTab(remaining.length > 0 ? remaining[0] : null);
                                                }
                                                handleRemoveBookClick(tabKey);
                                            }}
                                            title={t('ai_remove_book') + ' ' + tabKey}
                                        >
                                            <Icon icon={<X />} size="tiny" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {showRightArrow && (
                            <button className={styles.tabScrollButton} onClick={scrollTabsRight}>
                                <Icon icon={<ChevronRight />} size="tiny" color="black" />
                            </button>
                        )}
                    </div>

                    {/* Tab content */}
                    {activeTab && groupedVerses[activeTab] && (
                        <div className={styles.tabContent}>
                            <div className={styles.bookHeader}>
                                <div className={styles.bookInfo}>
                                    <Icon icon={<BookOpen />} size="small" />
                                    <h3 className={styles.bookName}>
                                        {Object.values(groupedVerses[activeTab])[0][0].bookName} - {Object.values(groupedVerses[activeTab])[0][0].translation}
                                    </h3>
                                    <span className={styles.verseCount}>
                                        {getVerseRange(Object.values(groupedVerses[activeTab]).flat(), false)}
                                    </span>
                                    <span className={styles.verseCount}>
                                        {Object.values(groupedVerses[activeTab]).reduce((t, ch) => t + ch.length, 0)} {t('ai_verses')}
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
                                                    const BookId = verse.bookId.toLowerCase();
                                                    return (
                                                        <div key={`${verse.chapterNumber}-${verse.verseNumber}-${verse.translationValue || verse.translation}`} className={styles.verseItem}>
                                                            <div className={styles.verseContent}>
                                                                <span className={styles.verseNumber}>{verse.verseNumber}</span>
                                                                <span className={styles.verseText}>{verse.content}</span>
                                                            </div>
                                                            <Link
                                                                className={styles.verseLink}
                                                                title={`${t('ai_go_to_verse')} ${verse.bookName} ${verse.chapterNumber}:${verse.verseNumber}`}
                                                                to={`/books/${BookId}/${verse.chapterNumber}?translation=${verse.translationValue}#${BookId}-${verse.chapterNumber}-${verse.verseNumber}-${verse.translationValue}`}
                                                            >
                                                                <Icon icon={<Eye />} size="tiny" />
                                                            </Link>
                                                            <button
                                                                className={styles.removeVerseButton}
                                                                onClick={() => handleRemoveVerseClick(verse)}
                                                                title={`${t('ai_remove_verse')} ${activeTab} ${chapterNumber}:${verse.verseNumber}`}
                                                            >
                                                                <Icon icon={<X />} size="tiny" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIconWrapper}>
                        <div className={styles.iconCircle}>
                            <Icon icon={<BookOpen />} size="large" />
                        </div>
                        <div className={styles.iconRing} />
                    </div>
                    <h3 className={styles.noVerses}>
                        {t('ai_no_verses_selected') || 'Tu contexto de estudio está vacío'}
                    </h3>
                    <p className={styles.helperText}>
                        {t('ai_placeholder_no_verses_desc') || 'Agrega versículos desde la Biblia para que la IA pueda analizarlos.'}
                    </p>
                    <Link to="/books" className={styles.ctaButton} onClick={onClose}>
                        <Icon icon={<BookOpen />} size="small" />
                        {t('go_to_bible') || 'Ir a la Biblia ahora'}
                    </Link>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* ── Desktop: centered modal ─────────────────────────── */}
            <div className={styles.desktopOnly}>
                <div className={styles.overlay} onClick={onClose} />
                <div className={styles.modal}>
                    <HeaderBar />
                    <VerseContent />
                </div>
            </div>

            {/* ── Mobile: MobileSheet bottom sheet ───────────────── */}
            <MobileSheet isOpen={isOpen} onClose={onClose} maxHeight="70vh">
                <div className={styles.sheetHeader}>
                    <HeaderBar />
                </div>
                <VerseContent />
            </MobileSheet>

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
