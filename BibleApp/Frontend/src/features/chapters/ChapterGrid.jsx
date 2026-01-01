import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
    const { books, loading, error, selectedTranslation } = useBooksStore();
    const [chapters, setChapters] = useState([]);
    const [hasChapters, setHasChapters] = useState(false);
    const [book, setBook] = useState({});
    const { isChapterCompleted, CompleteLoading, CompleteError } = useTrackingBookStore();
    bookId = bookId.toUpperCase();

    const filteredBook = books.find(book => book.id === bookId);

    useEffect(() => {
        if (books.length > 0) {
            if (filteredBook) {
                setBook(filteredBook);
                const limit = filteredBook.numberOfChapters;
                const chaptersArray = Array.from({ length: limit }, (_, i) => ({
                    id: i + 1,
                    order: i + 1,
                    chapterID: `${bookId}-${i + 1}-${selectedTranslation.value}`
                }));
                setChapters(chaptersArray); 
                setHasChapters(chaptersArray.length > 0);
            }
        }
    }, [books, bookId]);
    
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
