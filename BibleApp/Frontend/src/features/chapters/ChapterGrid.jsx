import { Link } from "react-router-dom";
import { useBooksStore } from "../../store/BooksStore";
import { useParams } from "react-router-dom";
import FetchError from "../../components/ui/FetchError";
import Loading from "../../components/ui/Loading";
import Icon from "../../components/ui/Icon";
import BookProgress from "../books/BookProgress";
import styles from "../../styles/ChapterGrid.module.css";
import { CircleCheckBig } from "lucide-react";
import { useTrackingBookStore } from "../../store/TrackingBookStore";
import ContinueReadingButton from "../../components/ui/ContinueReadingButton";
import { useTranslation } from '../../hooks/useTranslation';
import NoResults from "../../components/ui/NoResults";

function ChapterGrid() {
    const { t } = useTranslation();
    let { bookId } = useParams();
    const books = useBooksStore(state => state.books);
    const loading = useBooksStore(state => state.loading)
    const error = useBooksStore(state => state.error)
    const selectedTranslation = useBooksStore(state => state.selectedTranslation)
    const isChapterCompleted = useTrackingBookStore(state => state.isChapterCompleted)
    const CompleteLoading = useTrackingBookStore(state => state.CompleteLoading)
    bookId = bookId.toUpperCase();

    const book = books.find(b => b.id === bookId) || {};
    
    const chapters = Array.from({ length: book.numberOfChapters || 0 }, (_, i) => ({
        id: i + 1,
        order: i + 1,
        chapterID: `${bookId}-${i + 1}-${selectedTranslation.value}`
    }));

    const hasChapters = chapters.length > 0;
    
    return (
        <div className={styles.ctn_chapter_grid}>
            <header className={styles.header}>
                <div className={styles.chapter_info}>
                    <h1>{book.commonName ? book.commonName.toLowerCase() : (t('book_not_found'))}</h1>
                    <div className={styles.sub_info}>
                        <p className={styles.translation}>{selectedTranslation.label}</p>
                        {book.numberOfChapters ? <span>|</span> : null}
                        {book.numberOfChapters ? <p>{book.numberOfChapters} {t('chapters')}</p> : null}
                    </div>
                </div>
                <div>
                    <ContinueReadingButton filterBookId={bookId} />
                </div>
            </header>

            <BookProgress 
                bookId={bookId}
                translationValue={selectedTranslation.value}
                fontSize="medium"
                iconSize="small"
                hasChapters={hasChapters}   
            />

            <div className={hasChapters ? styles.chapter_grid : styles.no_chapters}>
                {loading ? (
                    <Loading />
                ) : error ? (
                    <FetchError />
                ) : hasChapters ? (
                    chapters.map(chapter => {
                        const isCompleted = isChapterCompleted(chapter.chapterID);
                        return (
                            <Link 
                                className={`${styles.chapter_link} ${isCompleted ? styles.completed : ''}`}
                                key={chapter.id} 
                                to={`/books/${(bookId).toLowerCase()}/${chapter.order}?translation=${selectedTranslation.value}`}
                                style={{
                                    position: 'relative'
                                }}
                            >   
                                {chapter.order}
                                {CompleteLoading ? (
                                    <div className={styles.completed_container}>
                                        <Loading />
                                    </div>
                                ) : (
                                    <div className={styles.completed_container}>
                                        {isCompleted && 
                                            <Icon
                                                icon={<CircleCheckBig />}
                                                size="small"
                                                color="green"
                                            />
                                        }
                                    </div>
                                )}
                            </Link>
                        );
                    })
                ) : (
                    <NoResults 
                        text={t('sorry_book_not_found')}
                        subText={t('try_another_translation')}
                        link={true}
                        linkText={t('or_select_another_book')}
                        linkURL={`/books`}
                    />
                )}
            </div>
        </div>
    );
}

export default ChapterGrid;
