import { X, Trash2, BookOpen, Plus } from "lucide-react";
import Icon from "../ui/Icon";
import { useTranslation } from "../../hooks/useTranslation";
import { useState } from "react";
import styles from './ContextModal.module.css';

function ContextModal({ isOpen, onClose, verses, onRemoveVerse, onRemoveBook, onClearAll }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(null);

    if (!isOpen) return null;

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
    
    // Auto-seleccionar la primera tab si no hay ninguna activa
    if (!activeTab && bookNames.length > 0) {
        setActiveTab(bookNames[0]);
    }

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
                                onClick={() => onClearAll && onClearAll()}
                                title="Limpiar todo el contexto"
                            >
                                <Icon icon={<Trash2 />} size="small" />
                                {t('ai_clear') || 'Limpiar'}
                            </button>
                        )}
                        <button className={styles.closeButton} onClick={onClose}>
                            <Icon icon={<X />} size="small" />
                        </button>
                    </div>
                </div>

                <div className={styles.content}>
                    {verses && verses.length > 0 ? (
                        <div className={styles.tabsContainer}>
                            {/* Tabs Navigation */}
                            <div className={styles.tabsNavigation}>
                                {bookNames.map(bookName => (
                                    <button
                                        key={bookName}
                                        className={`${styles.tabButton} ${activeTab === bookName ? styles.tabActive : ''}`}
                                        onClick={() => setActiveTab(bookName)}
                                    >
                                        <Icon icon={<BookOpen />} size="tiny" />
                                        {bookName}
                                        <span className={styles.tabVerseCount}>
                                            {Object.values(groupedVerses[bookName]).reduce((total, chapter) => 
                                                total + chapter.length, 0
                                            )}
                                        </span>
                                        <div
                                            className={styles.tabCloseButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveBook && onRemoveBook(bookName);
                                                if (activeTab === bookName && bookNames.length > 1) {
                                                    setActiveTab(bookNames.find(name => name !== bookName));
                                                }
                                            }}
                                            title={`Eliminar ${bookName}`}
                                        >
                                            <Icon icon={<X />} size="tiny" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            {activeTab && (
                                <div className={styles.tabContent}>
                                    <div className={styles.bookHeader}>
                                        <div className={styles.bookInfo}>
                                            <Icon icon={<BookOpen />} size="small" />
                                            <h3 className={styles.bookName}>{activeTab}</h3>
                                            <span className={styles.verseCount}>
                                                {Object.values(groupedVerses[activeTab]).reduce((total, chapter) => 
                                                    total + chapter.length, 0
                                                )} {t('ai_verses') || 'versículos'}
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
                                                        .map(verse => (
                                                            <div key={`${verse.chapterNumber}-${verse.verseNumber}`} className={styles.verseItem}>
                                                                <div className={styles.verseContent}>
                                                                    <span className={styles.verseNumber}>
                                                                        {verse.verseNumber}
                                                                    </span>
                                                                    <span className={styles.verseText}>
                                                                        {verse.content}
                                                                    </span>
                                                                </div>
                                                                <button 
                                                                    className={styles.removeVerseButton}
                                                                    onClick={() => onRemoveVerse && onRemoveVerse(verse)}
                                                                    title={`Eliminar ${activeTab} ${chapterNumber}:${verse.verseNumber}`}
                                                                >
                                                                    <Icon icon={<Trash2 />} size="tiny" />
                                                                </button>
                                                            </div>
                                                        ))}
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
        </>
    );
}

export default ContextModal;
