import { useEffect, useState, useMemo } from "react";
import Select from 'react-select';
import { useTrackingBookStore } from "../../store/TrackingBookStore";
import { useBooksStore } from "../../store/BooksStore";
import { useAuthStore } from "../../store/AuthStore";
import Loading from "../ui/Loading";
import FetchError from "../ui/FetchError";
import Icon from "../../components/ui/Icon";
import { BookOpenCheck, BookOpenText, CircleCheckBig } from "lucide-react";
import styles from "../../styles/DisplayBooksMetrics.module.css";

function DisplayBooksMetrics() {
    const CompleteChapter = useTrackingBookStore(state => state.CompleteChapter);
    const CompleteLoading = useTrackingBookStore(state => state.CompleteLoading);
    const translations = useBooksStore(state => state.translations);
    const books = useBooksStore(state => state.books);
    const getBooks = useBooksStore(state => state.getBooks);
    const booksLoading = useBooksStore(state => state.loading);
    const user = useAuthStore(state => state.user);
    const authLoading = useAuthStore(state => state.loading);
    const CompleteError = useTrackingBookStore(state => state.CompleteError);
    
    const [selectedTranslation, setSelectedTranslation] = useState({ 
        value: "spa_r09", 
        label: "Santa Biblia — Reina Valera 1909"
    });

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
        if (!authLoading && user && selectedTranslation.value) {
            getBooks(selectedTranslation.value).finally(() => {
                // Esto ya no se llamará múltiples veces
                useTrackingBookStore.getState().getCompleteChapter();
            });
        }
    }, [selectedTranslation.value, authLoading, user, getBooks]);

    const translationOptions = useMemo(() => 
        translations.map(t => ({ value: t.id, label: t.name })), 
        [translations]
    );

    const isLoading = authLoading || booksLoading || CompleteLoading || books.length === 0;

    if (CompleteError) {
        return <FetchError />;
    }
    
    return (
        <div className={styles.ctn_metrics}>
            <header className={styles.header}>
                <h3 className={styles.title}>Reading Progress</h3>
                <Select
                    options={translationOptions}
                    value={selectedTranslation}
                    onChange={setSelectedTranslation}
                    placeholder="Select a translation"
                    className="custom-select-translation"
                />
            </header>
            <div className={styles.ctn_content}>
                <div className={styles.metrics}>
                    <div className={styles.metrics_title}>
                        <Icon icon={<BookOpenCheck />} size="small" color="primary" />
                        <p className={styles.metrics_text} aria-label="Chapters Completed">
                            Chapters Completed
                        </p>
                    </div>

                    {isLoading ? (
                        <Loading />
                    ) : (
                        <p className={styles.metrics_count} aria-label="Chapters Completed Count">
                            {filteredCompleteChapter.length}
                        </p>
                    )}
                </div>
                <div className={styles.metrics}>
                    <div className={styles.metrics_title}>
                        <Icon icon={<BookOpenText />} size="small" color="primary" />
                        <p className={styles.metrics_text} aria-label="Books In Progress">
                            Books In Progress
                        </p>
                    </div>

                    {isLoading ? (
                        <Loading />
                    ) : (
                        <p className={styles.metrics_count} aria-label="Books In Progress Count">
                            {booksInProgress}
                        </p>
                    )}
                </div>
                <div className={styles.metrics}>
                    <div className={styles.metrics_title}>
                        <Icon icon={<CircleCheckBig />} size="small" color="primary" />
                        <p className={styles.metrics_text} aria-label="Books Completed">
                            Books Completed
                        </p>
                    </div>

                    {isLoading ? (
                        <Loading />
                    ) : (
                        <p className={styles.metrics_count} aria-label="Books Completed Count">
                            {booksCompleted}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DisplayBooksMetrics;