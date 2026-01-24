import { X } from "lucide-react";
import Icon from "../ui/Icon";
import { useTranslation } from "../../hooks/useTranslation";
import styles from './ContextModal.module.css';

function ContextModal({ isOpen, onClose, verses }) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    // Función para generar el rango de versículos
    function getVerseRange() {
        if (!verses || verses.length === 0) return '';
        
        const first = verses[0];
        const last = verses[verses.length - 1];
        
        if (verses.length === 1) {
            return `${first.bookName} ${first.chapterNumber}:${first.verseNumber}`;
        }
        
        return `${first.bookName} ${first.chapterNumber}:${first.verseNumber}-${last.verseNumber}`;
    }

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {t('ai_selected_verses')}
                    </h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <Icon icon={<X />} size="small" />
                    </button>
                </div>

                <div className={styles.content}>
                    {verses && verses.length > 0 ? (
                        <>
                            <div className={styles.verseHeader}>
                                <span className={styles.verseBadge}>{getVerseRange()}</span>
                                <span className={styles.translationBadge}>{verses[0]?.translation}</span>
                            </div>
                            
                            <div className={styles.verseContent}>
                                {verses.length === 1 ? (
                                    <p className={styles.singleVerse}>"{verses[0].content}"</p>
                                ) : (
                                    verses.map((verse, index) => (
                                        <p key={index} className={styles.verse}>
                                            <sup className={styles.verseNumber}>{verse.verseNumber}</sup>
                                            {verse.content}
                                        </p>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <p className={styles.noVerses}>{t('ai_no_verses_selected')}</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default ContextModal;
