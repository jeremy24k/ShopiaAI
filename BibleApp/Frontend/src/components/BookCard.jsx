import { Link } from "react-router-dom";
import calculateReadTime from "../utils/useReadTime";
import BookProgress from "./BookProgress";
import { BookOpenText, Timer } from "lucide-react";
import styles from "../styles/BookCard.module.css";
import SkeletonLoader from "./ui/SkeletonLoader";

const BookCard = ({ book, selectedTranslation, loading }) => {
    const time = calculateReadTime(book);

    const testament = 
        book.testament === "old" 
            ? "Antiguo Testamento" 
        : book.testament === "new" 
            ? "Nuevo Testamento" 
        : "Otros";

    const category = 
        book.category === "pentateuco" 
            ? "Pentateuco" 
        : book.category === "historicos" 
            ? "Histórico" 
        : book.category === "poeticos" 
            ? "Poético" 
        : book.category === "profetas_mayores" 
            ? "Profeta Mayor" 
        : book.category === "profetas_menores" 
            ? "Profeta Menor" 
        : book.category === "evangelios" 
            ? "Evangelio" 
        : book.category === "hechos" 
            ? "Hechos" 
        : book.category === "profeticos" 
            ? "Profético" 
        : book.category === "cartas_de_pablo" 
            ? "Carta de Pablo" 
        : book.category === "cartas_universales" 
            ? "Carta Universal" 
        : "Libros Apócrifos";

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
                    
                    <SkeletonLoader 
                        variant="rectangular"
                        width="100%"
                        height="40px"
                    />

                    <SkeletonLoader 
                        variant="rectangular"
                        width="100%"
                        height="40px"
                    />
                </div>
            ) : (
                <div className={styles.ctn_book_card}>

                    <p className={styles.book_name.toLowerCase()}>
                        {book.name}
                    </p>

                    <div className={styles.filters}>
                        <p>{testament}</p>
                        <p>{category}</p>
                    </div>

                    <p className={styles.book_chapters}>
                        <BookOpenText />
                        {book.numberOfChapters} Cap
                    </p>

                    <p className={styles.book_time}>
                        <Timer />
                        ~{time.formattedTime}
                    </p>
                    
                    <BookProgress 
                        bookId={book.id}
                        translationValue={selectedTranslation.value}
                    />

                    <Link className={styles.read_button} to={`/books/${(book.id).toLowerCase()}?translation=${selectedTranslation.value}`} key={book.id}>
                        Read
                    </Link>
                </div>
            )}
        </>
    );
};

export default BookCard;