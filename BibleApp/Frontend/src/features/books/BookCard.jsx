import { Link } from "react-router-dom";
import calculateReadTime from "../../utils/useReadTime";
import BookProgress from "../../features/books/BookProgress";
import { BookOpenText, Timer } from "lucide-react";
import styles from "../../styles/BookCard.module.css";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { useTranslation } from '../../hooks/useTranslation';

const BookCard = ({ book, selectedTranslation, loading }) => {
    const { t } = useTranslation();
    const time = calculateReadTime(book);

    const testament = 
        book.testament === "old" 
            ? t('old_testament')
        : book.testament === "new" 
            ? t('new_testament')
        : t('others');

    const category = 
        book.category === "pentateuco" 
            ? t('pentateuco')
        : book.category === "historicos" 
            ? t('historico')
        : book.category === "poeticos" 
            ? t('poetico')
        : book.category === "profetas_mayores" 
            ? t('profeta_mayor')
        : book.category === "profetas_menores" 
            ? t('profeta_menor')
        : book.category === "evangelios" 
            ? t('evangelio')
        : book.category === "hechos" 
            ? t('hechos')
        : book.category === "profeticos" 
            ? t('profeticos')
        : book.category === "cartas_de_pablo" 
            ? t('cartas_pablo')
        : book.category === "cartas_universales" 
            ? t('cartas_universales')
        : t('apocrifos');

    return (
        <>
            {loading ? (
                <div className={styles.ctn_book_card}>

                    <p className={styles.book_name}>
                        <SkeletonLoader
                            variant="text"
                            width="100%"
                            height="32px"
                        />
                    </p>

                    <div className={styles.filters}>
                        <SkeletonLoader
                            variant="text"
                            width="100px"
                            height="20px"
                        />
                        <SkeletonLoader
                            variant="text"
                            width="70px"
                            height="20px"
                        />
                    </div>

                    <div className={styles.book_data}>
                        <p className={styles.book_chapters}>
                            <SkeletonLoader
                                variant="text"
                                width="100%"
                                height="20px"
                            />
                        </p>

                        <p className={styles.book_time}>
                            <SkeletonLoader
                                variant="text"
                                width="100%"
                                height="20px"
                            />
                        </p>
                    </div>
                    
                    <SkeletonLoader 
                        variant="rectangular"
                        width="100%"
                        height="40px"
                    />
                    
                    <SkeletonLoader 
                        variant="rectangular"
                        width="100%"
                        height="40px"
                        margin="12px 0 0 0"
                    />
                </div>
            ) : (
                <div className={`${styles.ctn_book_card} fadeIn`}>

                    <p className={styles.book_name}>
                        {book.name.toLowerCase()}
                    </p>

                    <div className={styles.filters}>
                        <p>{testament}</p>
                        <p>{category}</p>
                    </div>

                    <div className={styles.book_data}>
                        <p className={styles.book_chapters}>
                            <BookOpenText />
                            {book.numberOfChapters} {t('chapters')}
                        </p>

                        <p className={styles.book_time}>
                            <Timer />
                            ~{time.formattedTime}
                        </p>
                    </div>

                    <BookProgress 
                        bookId={book.id}
                        translationValue={selectedTranslation.value}
                        hasChapters={true}
                    />

                    <Link className={styles.read_button} to={`/books/${(book.id).toLowerCase()}?translation=${selectedTranslation.value}`} key={book.id}>
                        {t('read_button')}
                    </Link>
                </div>
            )}
        </>
    );
};

export default BookCard;