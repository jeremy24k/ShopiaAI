import { useEffect, useMemo } from "react";
import Select from 'react-select';
import { useTrackingBookStore } from "../../store/TrackingBookStore";
import { useBooksStore } from "../../store/BooksStore";
import { useAuthStore } from "../../store/AuthStore";
import { useTranslation } from "../../hooks/useTranslation";
import FetchError from "../../components/ui/FetchError";
import NumberLoader from "../../components/ui/NumberLoader";
import Icon from "../../components/ui/Icon";
import { BookOpenCheck, BookOpenText, CircleCheckBig } from "lucide-react";
import styles from "../../styles/DisplayBooksMetrics.module.css";
import CustomSelect from "../../components/ui/CustomSelect";
import getTranslationOptions from "../../utils/TranslationOptions";

function DisplayBooksMetrics() {
    const { t, language } = useTranslation();
    const CompleteChapter = useTrackingBookStore(state => state.CompleteChapter);
    const CompleteLoading = useTrackingBookStore(state => state.CompleteLoading);
    const translations = useBooksStore(state => state.translations);
    const books = useBooksStore(state => state.books);
    const selectedTranslation = useBooksStore(state => state.selectedTranslation);
    const setSelectedTranslation = useBooksStore(state => state.setSelectedTranslation);
    const booksLoading = useBooksStore(state => state.loading);
    const user = useAuthStore(state => state.user);
    const authLoading = useAuthStore(state => state.loading);
    const CompleteError = useTrackingBookStore(state => state.CompleteError);

    const filteredCompleteChapter = useMemo(() => 
        CompleteChapter.filter(chapter => 
            chapter.book_data.translationValue === selectedTranslation.value
        ), 
        [CompleteChapter, selectedTranslation.value]
    );

    const booksInProgress = useMemo(() => 
        [...new Set(filteredCompleteChapter.map(chapter => chapter.book_data.bookId))].length,
        [filteredCompleteChapter]
    );

    const booksCompleted = useMemo(() => 
        books.filter(book => {
            const completedChaptersCount = filteredCompleteChapter.filter(
                chapter => chapter.book_data.bookId === book.id
            ).length;
            return completedChaptersCount === book.numberOfChapters && completedChaptersCount > 0;
        }).length,
        [books, filteredCompleteChapter]
    );

    useEffect(() => {
        if (!authLoading && user) {
            useTrackingBookStore.getState().getCompleteChapter();
        }
    }, [authLoading, user]);

    const translationOptions = getTranslationOptions(translations, language);

    const handleTranslationChange = (newTranslation) => {
        if (newTranslation) {
            setSelectedTranslation({
                value: newTranslation.value,
                label: newTranslation.label,
                shortName: newTranslation.shortName
            });
        }
    }

    const isLoading = authLoading || booksLoading || CompleteLoading || books.length === 0;

    if (CompleteError) {
        return <FetchError />;
    }
    
    return (
        <div className={styles.ctn_metrics} aria-label={t('aria_reading_progress')}>
            <header className={styles.header}>
                <h3 className={styles.title}>{t('reading_progress')}</h3>
                <CustomSelect
                    key={`metrics-select-${language}`}
                    options={translationOptions}
                    value={selectedTranslation}
                    onChange={handleTranslationChange}
                    placeholder={t('select_translation_placeholder')}
                    aria-label={t('select_translation_placeholder')}
                    generalPadding="4px 8px"
                    width="280px"
                    fixedMenuWidth={true}
                />
            </header>

            <div className={styles.ctn_content} role="list">
                <div className={styles.metrics} role="listitem">
                    <div className={styles.metrics_title}>
                        <Icon icon={<BookOpenCheck />} size="small" color="primary" />
                        <p className={styles.metrics_text}>
                            {t('chapters_completed')}
                        </p>
                    </div>

                    {isLoading ? (
                        <p className={styles.metrics_count} aria-live="polite" aria-busy="true">
                            <NumberLoader />
                        </p>
                    ) : (
                        <p className={styles.metrics_count} aria-label={t('aria_chapters_completed')}>
                            {filteredCompleteChapter.length}
                        </p>
                    )}
                </div>
                <div className={styles.metrics} role="listitem">
                    <div className={styles.metrics_title}>
                        <Icon icon={<BookOpenText />} size="small" color="primary" />
                        <p className={styles.metrics_text}>
                            {t('books_in_progress')}
                        </p>
                    </div>

                    {isLoading ? (
                        <p className={styles.metrics_count} aria-live="polite" aria-busy="true">
                            <NumberLoader />
                        </p>
                    ) : (
                        <p className={styles.metrics_count} aria-label={t('aria_books_in_progress')}>
                            {booksInProgress}
                        </p>
                    )}
                </div>
                <div className={styles.metrics} role="listitem">
                    <div className={styles.metrics_title}>
                        <Icon icon={<CircleCheckBig />} size="small" color="primary" />
                        <p className={styles.metrics_text}>
                            {t('books_completed')}
                        </p>
                    </div>

                    {isLoading ? (
                        <p className={styles.metrics_count} aria-live="polite" aria-busy="true">
                            <NumberLoader />
                        </p>
                    ) : (
                        <p className={styles.metrics_count} aria-label={t('aria_books_completed')}>
                            {booksCompleted}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DisplayBooksMetrics;